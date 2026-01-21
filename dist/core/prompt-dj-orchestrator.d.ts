/**
 * Prompt DJ Orchestrator
 * The brain that connects UI events to services
 */
import type { Prompt, PromptSnapshot, ChatMessage, GenerationSettings, VisualizerConfig, PlaybackState, UIState } from '../types.js';
export type OrchestratorEventType = 'prompts-changed' | 'settings-changed' | 'playback-changed' | 'connection-changed' | 'chat-message' | 'ui-state-changed' | 'visualizer-changed' | 'error';
export interface OrchestratorEvent {
    type: OrchestratorEventType;
    data?: unknown;
}
type OrchestratorEventCallback = (event: OrchestratorEvent) => void;
/**
 * Central orchestrator for the Prompt DJ application
 */
export declare class PromptDJOrchestrator {
    private static instance;
    private prompts;
    private settings;
    private visualizerConfig;
    private chatHistory;
    private snapshots;
    private playbackState;
    private isConnected;
    private uiState;
    private eventListeners;
    private debouncedSendPromptUpdate;
    private debouncedSaveState;
    private constructor();
    /**
     * Gets the singleton instance
     */
    static getInstance(): PromptDJOrchestrator;
    /**
     * Sets up handlers for service events
     */
    private setupServiceHandlers;
    /**
     * Loads state from storage
     */
    private loadState;
    /**
     * Saves state to storage
     */
    private saveState;
    /**
     * Adds an event listener
     */
    on(eventType: OrchestratorEventType, callback: OrchestratorEventCallback): void;
    /**
     * Removes an event listener
     */
    off(eventType: OrchestratorEventType, callback: OrchestratorEventCallback): void;
    /**
     * Emits an event to all listeners
     */
    private emit;
    /**
     * Gets all prompts
     */
    getPrompts(): Prompt[];
    /**
     * Adds a new prompt
     */
    addPrompt(text: string, weight?: number): Prompt;
    /**
     * Updates a prompt
     */
    updatePrompt(id: string, updates: Partial<Prompt>): void;
    /**
     * Removes a prompt
     */
    removePrompt(id: string): void;
    /**
     * Reorders prompts
     */
    reorderPrompts(fromIndex: number, toIndex: number): void;
    /**
     * Sets all prompts at once
     */
    setPrompts(prompts: Prompt[]): void;
    /**
     * Clears all prompts
     */
    clearPrompts(): void;
    /**
     * Gets current settings
     */
    getSettings(): GenerationSettings;
    /**
     * Updates settings
     */
    updateSettings(updates: Partial<GenerationSettings>): void;
    /**
     * Resets settings to defaults
     */
    resetSettings(): void;
    /**
     * Gets visualizer config
     */
    getVisualizerConfig(): VisualizerConfig;
    /**
     * Updates visualizer config
     */
    updateVisualizerConfig(updates: Partial<VisualizerConfig>): void;
    /**
     * Gets current playback state
     */
    getPlaybackState(): PlaybackState;
    /**
     * Gets connection state
     */
    getIsConnected(): boolean;
    /**
     * Starts playback
     */
    play(): Promise<void>;
    /**
     * Pauses playback
     */
    pause(): Promise<void>;
    /**
     * Stops playback
     */
    stop(): Promise<void>;
    /**
     * Performs a hard reset
     */
    hardReset(): Promise<void>;
    /**
     * Sends prompt update to the API
     */
    private sendPromptUpdateToApi;
    /**
     * Gets chat history
     */
    getChatHistory(): ChatMessage[];
    /**
     * Sends a chat message
     */
    sendChatMessage(content: string): Promise<void>;
    /**
     * Applies chat actions to prompts
     */
    private applyChatActions;
    /**
     * Clears chat history
     */
    clearChatHistory(): void;
    /**
     * Gets all snapshots
     */
    getSnapshots(): PromptSnapshot[];
    /**
     * Creates a snapshot of current state
     */
    createSnapshot(label?: string): PromptSnapshot;
    /**
     * Restores a snapshot
     */
    restoreSnapshot(snapshotId: string): void;
    /**
     * Deletes a snapshot
     */
    deleteSnapshot(snapshotId: string): void;
    /**
     * Applies an inspiration preset
     */
    applyPreset(presetId: string): void;
    /**
     * Adds a random prompt
     */
    addRandomPrompt(): Prompt;
    /**
     * Adds a complementary prompt
     */
    addComplementPrompt(): Prompt;
    /**
     * Gets UI state
     */
    getUIState(): UIState;
    /**
     * Updates UI state
     */
    updateUIState(updates: Partial<UIState>): void;
    /**
     * Toggles settings panel
     */
    toggleSettings(): void;
    /**
     * Toggles chat panel
     */
    toggleChat(): void;
    /**
     * Toggles inspiration panel
     */
    toggleInspiration(): void;
    /**
     * Gets current volume
     */
    getVolume(): number;
    /**
     * Sets volume
     */
    setVolume(volume: number): void;
    /**
     * Disposes of all resources
     */
    dispose(): Promise<void>;
}
export declare const getOrchestrator: () => PromptDJOrchestrator;
export {};
//# sourceMappingURL=prompt-dj-orchestrator.d.ts.map