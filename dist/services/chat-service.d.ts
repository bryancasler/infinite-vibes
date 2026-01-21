/**
 * Chat Service
 * Uses Gemini to interpret natural language music control requests
 */
import type { ChatResponse, Prompt } from '../types.js';
/**
 * Chat Service for natural language music control
 */
export declare class ChatService {
    private static instance;
    private model;
    private chatSession;
    private isInitialized;
    private constructor();
    /**
     * Gets the singleton instance
     */
    static getInstance(): ChatService;
    /**
     * Initializes the chat model
     */
    initialize(): Promise<boolean>;
    /**
     * Sends a message and gets music control actions
     */
    sendMessage(userMessage: string, currentPrompts: Prompt[]): Promise<ChatResponse>;
    /**
     * Parses the AI response to extract message and actions
     */
    private parseResponse;
    /**
     * Finds a matching prompt by text similarity
     */
    private findMatchingPrompt;
    /**
     * Generates suggestions based on current prompts
     */
    generateSuggestions(currentPrompts: Prompt[]): Promise<string[]>;
    /**
     * Resets the chat session
     */
    reset(): Promise<void>;
    /**
     * Disposes of resources
     */
    dispose(): void;
}
export declare const getChatService: () => ChatService;
//# sourceMappingURL=chat-service.d.ts.map