/**
 * Storage Utility Functions
 * LocalStorage wrappers with type safety and error handling
 */
import { STORAGE_KEYS, DEFAULT_GENERATION_SETTINGS, DEFAULT_VISUALIZER_CONFIG } from './constants.js';
/**
 * Safely retrieves an item from localStorage
 */
export function getStorageItem(key, defaultValue) {
    try {
        const item = localStorage.getItem(key);
        if (item === null) {
            return defaultValue;
        }
        return JSON.parse(item);
    }
    catch (error) {
        console.warn(`Failed to retrieve ${key} from storage:`, error);
        return defaultValue;
    }
}
/**
 * Safely stores an item in localStorage
 */
export function setStorageItem(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    }
    catch (error) {
        console.warn(`Failed to store ${key} in storage:`, error);
        return false;
    }
}
/**
 * Removes an item from localStorage
 */
export function removeStorageItem(key) {
    try {
        localStorage.removeItem(key);
        return true;
    }
    catch (error) {
        console.warn(`Failed to remove ${key} from storage:`, error);
        return false;
    }
}
/**
 * Clears all app-related data from localStorage
 */
export function clearAppStorage() {
    try {
        Object.values(STORAGE_KEYS).forEach((key) => {
            localStorage.removeItem(key);
        });
        return true;
    }
    catch (error) {
        console.warn('Failed to clear app storage:', error);
        return false;
    }
}
// ============================================================================
// API Key Management
// ============================================================================
/**
 * Retrieves the stored API key
 * Handles both raw strings (legacy) and JSON-encoded strings
 */
export function getApiKey() {
    try {
        const stored = localStorage.getItem(STORAGE_KEYS.API_KEY);
        if (!stored)
            return null;
        // Try parsing as JSON first (new format)
        try {
            return JSON.parse(stored);
        }
        catch {
            // If JSON parse fails, it's a raw string (legacy format)
            // Re-save it properly encoded for future use
            setApiKey(stored);
            return stored;
        }
    }
    catch (error) {
        console.warn('Failed to retrieve API key:', error);
        return null;
    }
}
/**
 * Stores the API key
 */
export function setApiKey(apiKey) {
    return setStorageItem(STORAGE_KEYS.API_KEY, apiKey);
}
/**
 * Removes the stored API key
 */
export function removeApiKey() {
    return removeStorageItem(STORAGE_KEYS.API_KEY);
}
// ============================================================================
// App State Management
// ============================================================================
/**
 * Gets the default app state
 */
export function getDefaultAppState() {
    return {
        prompts: [],
        settings: DEFAULT_GENERATION_SETTINGS,
        visualizerConfig: DEFAULT_VISUALIZER_CONFIG,
        chatHistory: [],
        snapshots: [],
    };
}
/**
 * Retrieves the full app state
 */
export function getAppState() {
    return getStorageItem(STORAGE_KEYS.STATE, getDefaultAppState());
}
/**
 * Saves the full app state
 */
export function saveAppState(state) {
    return setStorageItem(STORAGE_KEYS.STATE, state);
}
/**
 * Updates a partial app state
 */
export function updateAppState(partialState) {
    const currentState = getAppState();
    const newState = { ...currentState, ...partialState };
    return saveAppState(newState);
}
// ============================================================================
// Prompts Management
// ============================================================================
/**
 * Retrieves stored prompts
 */
export function getPrompts() {
    const state = getAppState();
    return state.prompts;
}
/**
 * Saves prompts
 */
export function savePrompts(prompts) {
    return updateAppState({ prompts });
}
/**
 * Adds a new prompt
 */
export function addPrompt(prompt) {
    const prompts = getPrompts();
    prompts.push(prompt);
    return savePrompts(prompts);
}
/**
 * Removes a prompt by ID
 */
export function removePrompt(promptId) {
    const prompts = getPrompts().filter((p) => p.id !== promptId);
    return savePrompts(prompts);
}
/**
 * Updates a prompt
 */
export function updatePrompt(promptId, updates) {
    const prompts = getPrompts().map((p) => p.id === promptId ? { ...p, ...updates } : p);
    return savePrompts(prompts);
}
// ============================================================================
// Settings Management
// ============================================================================
/**
 * Retrieves stored settings
 */
export function getSettings() {
    const state = getAppState();
    return state.settings;
}
/**
 * Saves settings
 */
export function saveSettings(settings) {
    return updateAppState({ settings });
}
/**
 * Updates partial settings
 */
export function updateSettings(partialSettings) {
    const currentSettings = getSettings();
    const newSettings = { ...currentSettings, ...partialSettings };
    return saveSettings(newSettings);
}
// ============================================================================
// Visualizer Config Management
// ============================================================================
/**
 * Retrieves visualizer configuration
 */
export function getVisualizerConfig() {
    const state = getAppState();
    return state.visualizerConfig;
}
/**
 * Saves visualizer configuration
 */
export function saveVisualizerConfig(config) {
    return updateAppState({ visualizerConfig: config });
}
// ============================================================================
// Chat History Management
// ============================================================================
/**
 * Retrieves chat history
 */
export function getChatHistory() {
    const state = getAppState();
    return state.chatHistory;
}
/**
 * Saves chat history
 */
export function saveChatHistory(messages) {
    return updateAppState({ chatHistory: messages });
}
/**
 * Adds a chat message
 */
export function addChatMessage(message) {
    const messages = getChatHistory();
    messages.push(message);
    return saveChatHistory(messages);
}
/**
 * Clears chat history
 */
export function clearChatHistory() {
    return saveChatHistory([]);
}
// ============================================================================
// Snapshots Management
// ============================================================================
/**
 * Retrieves stored snapshots
 */
export function getSnapshots() {
    const state = getAppState();
    return state.snapshots;
}
/**
 * Saves snapshots
 */
export function saveSnapshots(snapshots) {
    return updateAppState({ snapshots });
}
/**
 * Adds a new snapshot
 */
export function addSnapshot(snapshot) {
    const snapshots = getSnapshots();
    snapshots.push(snapshot);
    return saveSnapshots(snapshots);
}
/**
 * Removes a snapshot by ID
 */
export function removeSnapshot(snapshotId) {
    const snapshots = getSnapshots().filter((s) => s.id !== snapshotId);
    return saveSnapshots(snapshots);
}
// ============================================================================
// Storage Statistics
// ============================================================================
/**
 * Gets the approximate size of stored data in bytes
 */
export function getStorageSize() {
    let totalSize = 0;
    Object.values(STORAGE_KEYS).forEach((key) => {
        const item = localStorage.getItem(key);
        if (item) {
            totalSize += item.length * 2; // UTF-16 characters = 2 bytes each
        }
    });
    return totalSize;
}
/**
 * Gets storage quota information (if available)
 */
export async function getStorageQuota() {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
        try {
            const estimate = await navigator.storage.estimate();
            return {
                usage: estimate.usage || 0,
                quota: estimate.quota || 0,
            };
        }
        catch {
            return null;
        }
    }
    return null;
}
/**
 * Exports app state as JSON string for backup
 */
export function exportAppState() {
    const state = getAppState();
    return JSON.stringify(state, null, 2);
}
/**
 * Imports app state from JSON string
 */
export function importAppState(jsonString) {
    try {
        const state = JSON.parse(jsonString);
        // Validate required fields
        if (!state.prompts || !Array.isArray(state.prompts)) {
            throw new Error('Invalid prompts array');
        }
        return saveAppState(state);
    }
    catch (error) {
        console.error('Failed to import app state:', error);
        return false;
    }
}
//# sourceMappingURL=storage.js.map