/**
 * Chat Service
 * Uses Gemini to interpret natural language music control requests
 */
import { API_CONFIG } from '../utils/constants.js';
import { getApiKey } from '../utils/storage.js';
const CHAT_SYSTEM_INSTRUCTION = `You are "The Conductor" - an AI assistant for a music DJ application. Your job is to interpret user requests about the music and convert them into specific actions.

The user controls music through "prompts" or "stems" - text descriptions with intensity weights (0.0 to 2.0).

When the user makes a request, respond with:
1. A brief, friendly acknowledgment of what you're doing
2. A JSON array of actions to perform

Action types:
- {"action": "add", "prompt": "description", "weight": 1.0} - Add a new musical element
- {"action": "remove", "prompt": "description"} - Remove an element (match by similar text)
- {"action": "update", "promptId": "id", "weight": 1.5} - Update weight of existing prompt

Examples:
User: "Make it more energetic"
Response: Let me pump up the energy! 🎵
\`\`\`json
[{"action": "update", "prompt": "drums", "weight": 1.5}, {"action": "add", "prompt": "energetic synth stabs", "weight": 1.2}]
\`\`\`

User: "Add some jazz piano"
Response: Adding some smooth jazz piano vibes!
\`\`\`json
[{"action": "add", "prompt": "jazz piano chords", "weight": 1.0}]
\`\`\`

User: "Drop the bass"
Response: Dropping that bass! 🔊
\`\`\`json
[{"action": "add", "prompt": "heavy bass drop", "weight": 1.8}]
\`\`\`

User: "Remove the drums and make it calmer"
Response: Taking out the drums and mellowing things out...
\`\`\`json
[{"action": "remove", "prompt": "drums"}, {"action": "update", "prompt": "all", "weight": 0.6}]
\`\`\`

Always respond with a short message followed by the JSON block. Be creative and musical in your responses!`;
/**
 * Chat Service for natural language music control
 */
export class ChatService {
    constructor() {
        this.model = null;
        this.chatSession = null;
        this.isInitialized = false;
    }
    /**
     * Gets the singleton instance
     */
    static getInstance() {
        if (!ChatService.instance) {
            ChatService.instance = new ChatService();
        }
        return ChatService.instance;
    }
    /**
     * Initializes the chat model
     */
    async initialize() {
        if (this.isInitialized)
            return true;
        const apiKey = getApiKey();
        if (!apiKey) {
            console.error('No API key configured for chat service');
            return false;
        }
        try {
            const { GoogleGenerativeAI } = await import('@google/generative-ai');
            const genAI = new GoogleGenerativeAI(apiKey);
            this.model = genAI.getGenerativeModel({
                model: API_CONFIG.CHAT_MODEL,
                systemInstruction: CHAT_SYSTEM_INSTRUCTION,
            });
            // Start a chat session
            this.chatSession = this.model.startChat({
                history: [],
            });
            this.isInitialized = true;
            return true;
        }
        catch (error) {
            console.error('Failed to initialize chat service:', error);
            return false;
        }
    }
    /**
     * Sends a message and gets music control actions
     */
    async sendMessage(userMessage, currentPrompts) {
        if (!this.isInitialized) {
            const initialized = await this.initialize();
            if (!initialized) {
                return {
                    message: 'Chat service not available. Please check your API key.',
                    actions: [],
                };
            }
        }
        try {
            // Build context about current prompts
            const promptContext = currentPrompts.length > 0
                ? `\nCurrent active prompts:\n${currentPrompts
                    .map((p) => `- "${p.text}" (weight: ${p.weight}, id: ${p.id})`)
                    .join('\n')}`
                : '\nNo active prompts currently.';
            const fullMessage = `${userMessage}${promptContext}`;
            // Send to chat session
            const chatSession = this.chatSession;
            const result = await chatSession.sendMessage(fullMessage);
            const responseText = result.response.text();
            // Parse the response
            return this.parseResponse(responseText, currentPrompts);
        }
        catch (error) {
            console.error('Failed to send chat message:', error);
            return {
                message: 'Sorry, I had trouble processing that request. Please try again.',
                actions: [],
            };
        }
    }
    /**
     * Parses the AI response to extract message and actions
     */
    parseResponse(responseText, currentPrompts) {
        // Extract message (everything before the JSON block)
        const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
        let message = responseText;
        let actions = [];
        if (jsonMatch) {
            // Get message part
            message = responseText
                .substring(0, responseText.indexOf('```json'))
                .trim();
            // Parse JSON actions
            try {
                const rawActions = JSON.parse(jsonMatch[1]);
                if (Array.isArray(rawActions)) {
                    actions = rawActions.map((action) => {
                        // If action has a prompt text but no promptId for update/remove,
                        // try to find matching prompt
                        if ((action.action === 'update' || action.action === 'remove') &&
                            action.prompt &&
                            !action.promptId) {
                            const match = this.findMatchingPrompt(action.prompt, currentPrompts);
                            if (match) {
                                return { ...action, promptId: match.id };
                            }
                        }
                        return action;
                    });
                }
            }
            catch (parseError) {
                console.warn('Failed to parse JSON actions:', parseError);
            }
        }
        // Clean up message
        message = message.replace(/```[\s\S]*```/g, '').trim();
        return { message, actions };
    }
    /**
     * Finds a matching prompt by text similarity
     */
    findMatchingPrompt(searchText, prompts) {
        const search = searchText.toLowerCase();
        // Special case: "all" matches nothing specific (used for global adjustments)
        if (search === 'all') {
            return null;
        }
        // Try exact match first
        const exactMatch = prompts.find((p) => p.text.toLowerCase() === search);
        if (exactMatch)
            return exactMatch;
        // Try partial match
        const partialMatch = prompts.find((p) => p.text.toLowerCase().includes(search) ||
            search.includes(p.text.toLowerCase()));
        if (partialMatch)
            return partialMatch;
        // Try word overlap
        const searchWords = search.split(/\s+/);
        let bestMatch = null;
        let bestScore = 0;
        for (const prompt of prompts) {
            const promptWords = prompt.text.toLowerCase().split(/\s+/);
            const overlap = searchWords.filter((w) => promptWords.includes(w)).length;
            const score = overlap / Math.max(searchWords.length, promptWords.length);
            if (score > bestScore && score > 0.3) {
                bestScore = score;
                bestMatch = prompt;
            }
        }
        return bestMatch;
    }
    /**
     * Generates suggestions based on current prompts
     */
    async generateSuggestions(currentPrompts) {
        if (!this.isInitialized) {
            const initialized = await this.initialize();
            if (!initialized)
                return [];
        }
        try {
            const model = this.model;
            const promptList = currentPrompts.length > 0
                ? currentPrompts.map((p) => p.text).join(', ')
                : 'no specific elements';
            const result = await model.generateContent(`Given a music mix with: ${promptList}

Suggest 4 short, creative ways the user might want to modify the music. Return only a JSON array of strings, no explanation.

Example output:
["Add some funk guitar", "Make it more ambient", "Drop the tempo", "Add vinyl crackle"]`);
            const responseText = result.response.text();
            // Extract JSON array
            const jsonMatch = responseText.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            return [];
        }
        catch (error) {
            console.error('Failed to generate suggestions:', error);
            return [];
        }
    }
    /**
     * Resets the chat session
     */
    async reset() {
        if (this.model) {
            this.chatSession = this.model.startChat({
                history: [],
            });
        }
    }
    /**
     * Disposes of resources
     */
    dispose() {
        this.model = null;
        this.chatSession = null;
        this.isInitialized = false;
    }
}
// Export singleton instance getter
export const getChatService = () => ChatService.getInstance();
//# sourceMappingURL=chat-service.js.map