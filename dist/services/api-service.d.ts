/**
 * API Service
 * Manages WebSocket connection to Gemini Live API
 */
import type { ApiConnectionState, LiveApiConfig, GenerationSettings, Prompt } from '../types.js';
export type ApiEventType = 'connected' | 'disconnected' | 'audio' | 'text' | 'error' | 'setup-complete';
export interface ApiEvent {
    type: ApiEventType;
    data?: string;
    error?: string;
}
type ApiEventCallback = (event: ApiEvent) => void;
/**
 * Singleton service for managing Gemini Live API connection via WebSocket
 */
export declare class ApiService {
    private static instance;
    private ws;
    private connectionState;
    private reconnectAttempts;
    private reconnectTimeout;
    private heartbeatInterval;
    private eventListeners;
    private setupComplete;
    private currentConfig;
    private constructor();
    /**
     * Gets the singleton instance
     */
    static getInstance(): ApiService;
    /**
     * Gets current connection state
     */
    getConnectionState(): ApiConnectionState;
    /**
     * Adds an event listener
     */
    on(eventType: ApiEventType, callback: ApiEventCallback): void;
    /**
     * Removes an event listener
     */
    off(eventType: ApiEventType, callback: ApiEventCallback): void;
    /**
     * Emits an event to all listeners
     */
    private emit;
    /**
     * Connects to the Gemini Live API via WebSocket
     */
    connect(config?: Partial<LiveApiConfig>): Promise<boolean>;
    /**
     * Sends the initial setup message to configure the session
     */
    private sendSetupMessage;
    /**
     * Handles incoming WebSocket messages
     */
    private handleWebSocketMessage;
    /**
     * Handles binary Blob messages (raw audio data)
     */
    private handleBlobMessage;
    /**
     * Converts ArrayBuffer to base64 string
     */
    private arrayBufferToBase64;
    /**
     * Handles disconnection
     */
    private handleDisconnect;
    /**
     * Schedules a reconnection attempt
     */
    private scheduleReconnect;
    /**
     * Starts the heartbeat interval
     */
    private startHeartbeat;
    /**
     * Stops the heartbeat interval
     */
    private stopHeartbeat;
    /**
     * Sends client content to the API
     */
    private sendClientContent;
    /**
     * Sends text input to the API
     */
    sendText(text: string): Promise<boolean>;
    /**
     * Sends prompt updates to change the music style
     */
    sendPromptUpdate(prompts: Prompt[], settings?: Partial<GenerationSettings>): Promise<boolean>;
    /**
     * Disconnects from the API
     */
    disconnect(): Promise<void>;
    /**
     * Performs a hard reset of the service
     */
    hardReset(): Promise<void>;
}
export declare const getApiService: () => ApiService;
export {};
//# sourceMappingURL=api-service.d.ts.map