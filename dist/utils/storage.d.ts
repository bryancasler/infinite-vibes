/**
 * Storage Utility Functions
 * LocalStorage wrappers with type safety and error handling
 */
import type { AppState, GenerationSettings, Prompt, PromptSnapshot, ChatMessage, VisualizerConfig } from '../types.js';
/**
 * Safely retrieves an item from localStorage
 */
export declare function getStorageItem<T>(key: string, defaultValue: T): T;
/**
 * Safely stores an item in localStorage
 */
export declare function setStorageItem<T>(key: string, value: T): boolean;
/**
 * Removes an item from localStorage
 */
export declare function removeStorageItem(key: string): boolean;
/**
 * Clears all app-related data from localStorage
 */
export declare function clearAppStorage(): boolean;
/**
 * Retrieves the stored API key
 */
export declare function getApiKey(): string | null;
/**
 * Stores the API key
 */
export declare function setApiKey(apiKey: string): boolean;
/**
 * Removes the stored API key
 */
export declare function removeApiKey(): boolean;
/**
 * Gets the default app state
 */
export declare function getDefaultAppState(): AppState;
/**
 * Retrieves the full app state
 */
export declare function getAppState(): AppState;
/**
 * Saves the full app state
 */
export declare function saveAppState(state: AppState): boolean;
/**
 * Updates a partial app state
 */
export declare function updateAppState(partialState: Partial<AppState>): boolean;
/**
 * Retrieves stored prompts
 */
export declare function getPrompts(): Prompt[];
/**
 * Saves prompts
 */
export declare function savePrompts(prompts: Prompt[]): boolean;
/**
 * Adds a new prompt
 */
export declare function addPrompt(prompt: Prompt): boolean;
/**
 * Removes a prompt by ID
 */
export declare function removePrompt(promptId: string): boolean;
/**
 * Updates a prompt
 */
export declare function updatePrompt(promptId: string, updates: Partial<Prompt>): boolean;
/**
 * Retrieves stored settings
 */
export declare function getSettings(): GenerationSettings;
/**
 * Saves settings
 */
export declare function saveSettings(settings: GenerationSettings): boolean;
/**
 * Updates partial settings
 */
export declare function updateSettings(partialSettings: Partial<GenerationSettings>): boolean;
/**
 * Retrieves visualizer configuration
 */
export declare function getVisualizerConfig(): VisualizerConfig;
/**
 * Saves visualizer configuration
 */
export declare function saveVisualizerConfig(config: VisualizerConfig): boolean;
/**
 * Retrieves chat history
 */
export declare function getChatHistory(): ChatMessage[];
/**
 * Saves chat history
 */
export declare function saveChatHistory(messages: ChatMessage[]): boolean;
/**
 * Adds a chat message
 */
export declare function addChatMessage(message: ChatMessage): boolean;
/**
 * Clears chat history
 */
export declare function clearChatHistory(): boolean;
/**
 * Retrieves stored snapshots
 */
export declare function getSnapshots(): PromptSnapshot[];
/**
 * Saves snapshots
 */
export declare function saveSnapshots(snapshots: PromptSnapshot[]): boolean;
/**
 * Adds a new snapshot
 */
export declare function addSnapshot(snapshot: PromptSnapshot): boolean;
/**
 * Removes a snapshot by ID
 */
export declare function removeSnapshot(snapshotId: string): boolean;
/**
 * Gets the approximate size of stored data in bytes
 */
export declare function getStorageSize(): number;
/**
 * Gets storage quota information (if available)
 */
export declare function getStorageQuota(): Promise<{
    usage: number;
    quota: number;
} | null>;
/**
 * Exports app state as JSON string for backup
 */
export declare function exportAppState(): string;
/**
 * Imports app state from JSON string
 */
export declare function importAppState(jsonString: string): boolean;
//# sourceMappingURL=storage.d.ts.map