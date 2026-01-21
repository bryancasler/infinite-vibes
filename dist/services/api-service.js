/**
 * API Service
 * Manages WebSocket connection to Gemini Live API
 */
import { API_CONFIG, SYSTEM_INSTRUCTION } from '../utils/constants.js';
import { getApiKey } from '../utils/storage.js';
/**
 * Singleton service for managing Gemini Live API connection
 */
export class ApiService {
    constructor() {
        this.client = null;
        this.session = null;
        this.connectionState = {
            connected: false,
            connecting: false,
            error: null,
            sessionId: null,
        };
        this.reconnectAttempts = 0;
        this.reconnectTimeout = null;
        this.heartbeatInterval = null;
        this.eventListeners = new Map();
        // Initialize event listener sets
        const eventTypes = [
            'connected',
            'disconnected',
            'audio',
            'text',
            'error',
            'setup-complete',
        ];
        eventTypes.forEach((type) => {
            this.eventListeners.set(type, new Set());
        });
    }
    /**
     * Gets the singleton instance
     */
    static getInstance() {
        if (!ApiService.instance) {
            ApiService.instance = new ApiService();
        }
        return ApiService.instance;
    }
    /**
     * Gets current connection state
     */
    getConnectionState() {
        return { ...this.connectionState };
    }
    /**
     * Adds an event listener
     */
    on(eventType, callback) {
        this.eventListeners.get(eventType)?.add(callback);
    }
    /**
     * Removes an event listener
     */
    off(eventType, callback) {
        this.eventListeners.get(eventType)?.delete(callback);
    }
    /**
     * Emits an event to all listeners
     */
    emit(event) {
        this.eventListeners.get(event.type)?.forEach((callback) => {
            try {
                callback(event);
            }
            catch (error) {
                console.error('Error in API event listener:', error);
            }
        });
    }
    /**
     * Connects to the Gemini Live API
     */
    async connect(config) {
        if (this.connectionState.connected || this.connectionState.connecting) {
            console.warn('Already connected or connecting');
            return false;
        }
        const apiKey = getApiKey();
        if (!apiKey) {
            this.emit({ type: 'error', error: 'No API key configured' });
            return false;
        }
        this.connectionState.connecting = true;
        this.connectionState.error = null;
        try {
            // Dynamically import the Google GenAI SDK
            const { GoogleGenerativeAI } = await import('@google/generative-ai');
            // Create a new client instance each time to pick up latest API key
            this.client = new GoogleGenerativeAI(apiKey);
            // Get the live model
            const model = this.client.live;
            if (!model) {
                throw new Error('Live API not available in this SDK version');
            }
            // Configure the session
            const sessionConfig = {
                model: config?.model || API_CONFIG.MODEL,
                systemInstruction: config?.systemInstruction || SYSTEM_INSTRUCTION,
                generationConfig: {
                    temperature: config?.generationConfig?.temperature ?? 1.0,
                    topK: config?.generationConfig?.topK ?? 40,
                    topP: config?.generationConfig?.topP ?? 0.95,
                    responseModalities: ['AUDIO'],
                },
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: {
                            voiceName: 'Aoede',
                        },
                    },
                },
            };
            // Connect to the live session
            this.session = await model.get(sessionConfig);
            // Set up message handlers
            this.setupSessionHandlers();
            // Start heartbeat
            this.startHeartbeat();
            this.connectionState.connected = true;
            this.connectionState.connecting = false;
            this.connectionState.sessionId = `session-${Date.now()}`;
            this.reconnectAttempts = 0;
            this.emit({ type: 'connected' });
            this.emit({ type: 'setup-complete' });
            return true;
        }
        catch (error) {
            console.error('Failed to connect to Gemini Live API:', error);
            this.connectionState.connecting = false;
            this.connectionState.error =
                error instanceof Error ? error.message : 'Connection failed';
            this.emit({
                type: 'error',
                error: this.connectionState.error,
            });
            // Attempt reconnection
            this.scheduleReconnect();
            return false;
        }
    }
    /**
     * Sets up handlers for session messages
     */
    setupSessionHandlers() {
        if (!this.session)
            return;
        const session = this.session;
        // Handle incoming messages
        const messageHandler = (message) => {
            this.handleMessage(message);
        };
        // Try different event binding methods based on SDK version
        if (typeof session.on === 'function') {
            session.on('message', messageHandler);
            session.on('audio', (data) => {
                if (data && typeof data === 'object' && 'data' in data) {
                    this.emit({ type: 'audio', data: data.data });
                }
            });
            session.on('error', (error) => {
                this.handleError(error);
            });
            session.on('close', () => {
                this.handleDisconnect();
            });
        }
        else if (typeof session.onMessage === 'function') {
            session.onMessage(messageHandler);
        }
    }
    /**
     * Handles incoming messages from the API
     */
    handleMessage(message) {
        if (!message || typeof message !== 'object')
            return;
        const msg = message;
        // Handle audio data
        if (msg.serverContent?.modelTurn?.parts) {
            for (const part of msg.serverContent.modelTurn.parts) {
                if (part.inlineData?.data) {
                    this.emit({ type: 'audio', data: part.inlineData.data });
                }
                if (part.text) {
                    this.emit({ type: 'text', data: part.text });
                }
            }
        }
        // Handle direct audio/text properties
        if (msg.audio?.data) {
            this.emit({ type: 'audio', data: msg.audio.data });
        }
        if (msg.text) {
            this.emit({ type: 'text', data: msg.text });
        }
        if (msg.error) {
            this.emit({ type: 'error', error: msg.error });
        }
    }
    /**
     * Handles errors
     */
    handleError(error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('API Error:', errorMessage);
        this.connectionState.error = errorMessage;
        this.emit({ type: 'error', error: errorMessage });
    }
    /**
     * Handles disconnection
     */
    handleDisconnect() {
        this.connectionState.connected = false;
        this.connectionState.sessionId = null;
        this.stopHeartbeat();
        this.emit({ type: 'disconnected' });
        // Attempt to reconnect
        this.scheduleReconnect();
    }
    /**
     * Schedules a reconnection attempt
     */
    scheduleReconnect() {
        if (this.reconnectAttempts >= API_CONFIG.MAX_RECONNECT_ATTEMPTS) {
            console.error('Max reconnection attempts reached');
            return;
        }
        const delay = API_CONFIG.RECONNECT_DELAY * Math.pow(2, this.reconnectAttempts);
        this.reconnectAttempts++;
        console.log(`Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);
        this.reconnectTimeout = setTimeout(() => {
            this.connect();
        }, delay);
    }
    /**
     * Starts the heartbeat interval
     */
    startHeartbeat() {
        this.stopHeartbeat();
        this.heartbeatInterval = setInterval(() => {
            if (this.connectionState.connected) {
                // Send a keep-alive ping
                this.sendText('');
            }
        }, API_CONFIG.HEARTBEAT_INTERVAL);
    }
    /**
     * Stops the heartbeat interval
     */
    stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }
    /**
     * Sends text input to the API
     */
    async sendText(text) {
        if (!this.session || !this.connectionState.connected) {
            console.warn('Cannot send: not connected');
            return false;
        }
        try {
            const session = this.session;
            // Try different send methods based on SDK version
            if (typeof session.send === 'function') {
                await session.send({ text });
            }
            else if (typeof session.sendRealtimeInput === 'function') {
                await session.sendRealtimeInput({
                    clientContent: {
                        turns: [{ role: 'user', parts: [{ text }] }],
                        turnComplete: true,
                    },
                });
            }
            else if (typeof session.sendClientContent === 'function') {
                await session.sendClientContent({
                    turns: [{ role: 'user', parts: [{ text }] }],
                    turnComplete: true,
                });
            }
            else {
                throw new Error('No compatible send method found');
            }
            return true;
        }
        catch (error) {
            console.error('Failed to send text:', error);
            this.handleError(error);
            return false;
        }
    }
    /**
     * Sends prompt updates to change the music style
     */
    async sendPromptUpdate(prompts, settings) {
        const enabledPrompts = prompts.filter((p) => p.enabled);
        if (enabledPrompts.length === 0) {
            return this.sendText('Continue with ambient background music.');
        }
        // Build the style instruction
        const styleDescription = enabledPrompts
            .map((p) => `${p.text} (intensity: ${p.weight.toFixed(1)})`)
            .join(', ');
        let instruction = `Change style to: ${styleDescription}.`;
        // Add settings if provided
        if (settings) {
            const settingsParts = [];
            if (settings.bpm) {
                settingsParts.push(`BPM: ${settings.bpm}`);
            }
            if (settings.key && settings.scale) {
                settingsParts.push(`Key: ${settings.key} ${settings.scale}`);
            }
            if (settings.density !== undefined) {
                settingsParts.push(`Density: ${settings.density < 0.3 ? 'sparse' : settings.density > 0.7 ? 'dense' : 'medium'}`);
            }
            if (settings.brightness !== undefined) {
                settingsParts.push(`Brightness: ${settings.brightness < 0.3 ? 'dark' : settings.brightness > 0.7 ? 'bright' : 'neutral'}`);
            }
            if (settings.muteBass) {
                settingsParts.push('No bass');
            }
            if (settings.muteDrums) {
                settingsParts.push('No drums');
            }
            if (settingsParts.length > 0) {
                instruction += ` Parameters: ${settingsParts.join(', ')}.`;
            }
        }
        instruction += ' Keep the music flowing continuously.';
        return this.sendText(instruction);
    }
    /**
     * Disconnects from the API
     */
    async disconnect() {
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }
        this.stopHeartbeat();
        if (this.session) {
            try {
                const session = this.session;
                if (typeof session.close === 'function') {
                    await session.close();
                }
            }
            catch (error) {
                console.error('Error closing session:', error);
            }
            this.session = null;
        }
        this.client = null;
        this.connectionState = {
            connected: false,
            connecting: false,
            error: null,
            sessionId: null,
        };
        this.reconnectAttempts = 0;
        this.emit({ type: 'disconnected' });
    }
    /**
     * Performs a hard reset of the service
     */
    async hardReset() {
        await this.disconnect();
        // Clear all event listeners
        this.eventListeners.forEach((set) => set.clear());
        // Re-initialize event listener sets
        const eventTypes = [
            'connected',
            'disconnected',
            'audio',
            'text',
            'error',
            'setup-complete',
        ];
        eventTypes.forEach((type) => {
            this.eventListeners.set(type, new Set());
        });
    }
}
// Export singleton instance getter
export const getApiService = () => ApiService.getInstance();
//# sourceMappingURL=api-service.js.map