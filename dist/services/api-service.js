/**
 * API Service
 * Manages WebSocket connection to Gemini Live API
 */
import { API_CONFIG, SYSTEM_INSTRUCTION } from '../utils/constants.js';
import { getApiKey } from '../utils/storage.js';
// Gemini Live API WebSocket endpoint
const GEMINI_LIVE_WS_URL = 'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent';
/**
 * Singleton service for managing Gemini Live API connection via WebSocket
 */
export class ApiService {
    constructor() {
        this.ws = null;
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
        this.setupComplete = false;
        this.currentConfig = null;
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
     * Connects to the Gemini Live API via WebSocket
     */
    async connect(config) {
        if (this.connectionState.connected || this.connectionState.connecting) {
            console.warn('Already connected or connecting');
            return this.connectionState.connected;
        }
        const apiKey = getApiKey();
        if (!apiKey) {
            this.emit({ type: 'error', error: 'No API key configured' });
            return false;
        }
        this.connectionState.connecting = true;
        this.connectionState.error = null;
        this.setupComplete = false;
        this.currentConfig = config || null;
        return new Promise((resolve) => {
            try {
                // Connect to WebSocket with API key
                const wsUrl = `${GEMINI_LIVE_WS_URL}?key=${apiKey}`;
                this.ws = new WebSocket(wsUrl);
                this.ws.onopen = () => {
                    console.log('WebSocket connected to Gemini Live API');
                    this.connectionState.connecting = false;
                    this.connectionState.connected = true;
                    this.connectionState.sessionId = `session-${Date.now()}`;
                    this.reconnectAttempts = 0;
                    // Send setup message
                    this.sendSetupMessage(config);
                };
                this.ws.onmessage = (event) => {
                    this.handleWebSocketMessage(event);
                    // Resolve on first successful message (setup complete)
                    if (!this.setupComplete) {
                        this.setupComplete = true;
                        this.emit({ type: 'connected' });
                        this.emit({ type: 'setup-complete' });
                        this.startHeartbeat();
                        resolve(true);
                    }
                };
                this.ws.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    this.connectionState.error = 'WebSocket connection error';
                    this.emit({ type: 'error', error: 'WebSocket connection error' });
                    if (!this.setupComplete) {
                        resolve(false);
                    }
                };
                this.ws.onclose = (event) => {
                    console.log('WebSocket closed:', event.code, event.reason);
                    this.handleDisconnect();
                    if (!this.setupComplete) {
                        resolve(false);
                    }
                };
                // Timeout for connection
                setTimeout(() => {
                    if (!this.setupComplete && this.connectionState.connecting) {
                        console.error('Connection timeout');
                        this.ws?.close();
                        this.connectionState.connecting = false;
                        this.emit({ type: 'error', error: 'Connection timeout' });
                        resolve(false);
                    }
                }, 30000);
            }
            catch (error) {
                console.error('Failed to connect to Gemini Live API:', error);
                this.connectionState.connecting = false;
                this.connectionState.error = error instanceof Error ? error.message : 'Connection failed';
                this.emit({ type: 'error', error: this.connectionState.error });
                this.scheduleReconnect();
                resolve(false);
            }
        });
    }
    /**
     * Sends the initial setup message to configure the session
     */
    sendSetupMessage(config) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN)
            return;
        const setupMessage = {
            setup: {
                model: `models/${config?.model || API_CONFIG.MODEL}`,
                generationConfig: {
                    responseModalities: ['AUDIO'],
                    speechConfig: {
                        voiceConfig: {
                            prebuiltVoiceConfig: {
                                voiceName: 'Aoede',
                            },
                        },
                    },
                },
                systemInstruction: {
                    parts: [{ text: config?.systemInstruction || SYSTEM_INSTRUCTION }],
                },
            },
        };
        this.ws.send(JSON.stringify(setupMessage));
        console.log('Sent setup message:', setupMessage);
    }
    /**
     * Handles incoming WebSocket messages
     */
    handleWebSocketMessage(event) {
        // Handle binary Blob data (audio)
        if (event.data instanceof Blob) {
            this.handleBlobMessage(event.data);
            return;
        }
        // Handle text JSON messages
        try {
            const message = JSON.parse(event.data);
            // Handle setup complete
            if (message.setupComplete) {
                console.log('Gemini Live API setup complete');
                return;
            }
            // Handle server content (audio/text responses)
            if (message.serverContent) {
                const { modelTurn, turnComplete } = message.serverContent;
                if (modelTurn?.parts) {
                    for (const part of modelTurn.parts) {
                        // Handle inline audio data (base64 encoded)
                        if (part.inlineData) {
                            const { mimeType, data } = part.inlineData;
                            if (mimeType?.startsWith('audio/')) {
                                this.emit({ type: 'audio', data });
                            }
                        }
                        // Handle text
                        if (part.text) {
                            this.emit({ type: 'text', data: part.text });
                        }
                    }
                }
                if (turnComplete) {
                    console.log('Model turn complete');
                }
            }
            // Handle tool calls (if any)
            if (message.toolCall) {
                console.log('Received tool call:', message.toolCall);
            }
            // Handle errors
            if (message.error) {
                console.error('API error:', message.error);
                this.emit({ type: 'error', error: message.error.message || 'Unknown API error' });
            }
        }
        catch (error) {
            console.error('Failed to parse WebSocket message:', error, event.data);
        }
    }
    /**
     * Handles binary Blob messages (raw audio data)
     */
    async handleBlobMessage(blob) {
        try {
            // Try to read as text first (might be JSON wrapped in Blob)
            const text = await blob.text();
            try {
                const message = JSON.parse(text);
                // Handle setup complete
                if (message.setupComplete) {
                    console.log('Gemini Live API setup complete');
                    return;
                }
                // Handle server content
                if (message.serverContent) {
                    const { modelTurn, turnComplete } = message.serverContent;
                    if (modelTurn?.parts) {
                        for (const part of modelTurn.parts) {
                            if (part.inlineData) {
                                const { mimeType, data } = part.inlineData;
                                if (mimeType?.startsWith('audio/')) {
                                    this.emit({ type: 'audio', data });
                                }
                            }
                            if (part.text) {
                                this.emit({ type: 'text', data: part.text });
                            }
                        }
                    }
                    if (turnComplete) {
                        console.log('Model turn complete');
                    }
                }
                if (message.error) {
                    console.error('API error:', message.error);
                    this.emit({ type: 'error', error: message.error.message || 'Unknown API error' });
                }
            }
            catch {
                // Not JSON - treat as raw PCM audio data
                const arrayBuffer = await blob.arrayBuffer();
                const base64 = this.arrayBufferToBase64(arrayBuffer);
                this.emit({ type: 'audio', data: base64 });
            }
        }
        catch (error) {
            console.error('Failed to handle blob message:', error);
        }
    }
    /**
     * Converts ArrayBuffer to base64 string
     */
    arrayBufferToBase64(buffer) {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }
    /**
     * Handles disconnection
     */
    handleDisconnect() {
        this.connectionState.connected = false;
        this.connectionState.connecting = false;
        this.connectionState.sessionId = null;
        this.stopHeartbeat();
        this.ws = null;
        this.emit({ type: 'disconnected' });
        // Attempt to reconnect if we were previously connected
        if (this.setupComplete) {
            this.scheduleReconnect();
        }
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
            this.setupComplete = false;
            this.connect(this.currentConfig || undefined);
        }, delay);
    }
    /**
     * Starts the heartbeat interval
     */
    startHeartbeat() {
        this.stopHeartbeat();
        this.heartbeatInterval = setInterval(() => {
            if (this.connectionState.connected && this.ws?.readyState === WebSocket.OPEN) {
                // Send empty client content as keep-alive
                this.sendClientContent('', false);
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
     * Sends client content to the API
     */
    sendClientContent(text, turnComplete = true) {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            console.warn('Cannot send: WebSocket not connected');
            return false;
        }
        try {
            const message = {
                clientContent: {
                    turns: [
                        {
                            role: 'user',
                            parts: [{ text }],
                        },
                    ],
                    turnComplete,
                },
            };
            this.ws.send(JSON.stringify(message));
            return true;
        }
        catch (error) {
            console.error('Failed to send client content:', error);
            return false;
        }
    }
    /**
     * Sends text input to the API
     */
    async sendText(text) {
        if (!this.connectionState.connected) {
            console.warn('Cannot send: not connected');
            return false;
        }
        return this.sendClientContent(text, true);
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
        if (this.ws) {
            try {
                this.ws.close(1000, 'Client disconnect');
            }
            catch (error) {
                console.error('Error closing WebSocket:', error);
            }
            this.ws = null;
        }
        this.connectionState = {
            connected: false,
            connecting: false,
            error: null,
            sessionId: null,
        };
        this.reconnectAttempts = 0;
        this.setupComplete = false;
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