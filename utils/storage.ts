/**
 * Storage Utility Functions
 * LocalStorage wrappers with type safety and error handling
 */

import type { AppState, GenerationSettings, Prompt, PromptSnapshot, ChatMessage, VisualizerConfig } from '../types.js';
import { STORAGE_KEYS, DEFAULT_GENERATION_SETTINGS, DEFAULT_VISUALIZER_CONFIG } from './constants.js';

/**
 * Safely retrieves an item from localStorage
 */
export function getStorageItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);

    if (item === null) {
      return defaultValue;
    }

    return JSON.parse(item) as T;
  } catch (error) {
    console.warn(`Failed to retrieve ${key} from storage:`, error);
    return defaultValue;
  }
}

/**
 * Safely stores an item in localStorage
 */
export function setStorageItem<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn(`Failed to store ${key} in storage:`, error);
    return false;
  }
}

/**
 * Removes an item from localStorage
 */
export function removeStorageItem(key: string): boolean {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.warn(`Failed to remove ${key} from storage:`, error);
    return false;
  }
}

/**
 * Clears all app-related data from localStorage
 */
export function clearAppStorage(): boolean {
  try {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
    return true;
  } catch (error) {
    console.warn('Failed to clear app storage:', error);
    return false;
  }
}

// ============================================================================
// API Key Management
// ============================================================================

/**
 * Retrieves the stored API key
 */
export function getApiKey(): string | null {
  return getStorageItem<string | null>(STORAGE_KEYS.API_KEY, null);
}

/**
 * Stores the API key
 */
export function setApiKey(apiKey: string): boolean {
  return setStorageItem(STORAGE_KEYS.API_KEY, apiKey);
}

/**
 * Removes the stored API key
 */
export function removeApiKey(): boolean {
  return removeStorageItem(STORAGE_KEYS.API_KEY);
}

// ============================================================================
// App State Management
// ============================================================================

/**
 * Gets the default app state
 */
export function getDefaultAppState(): AppState {
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
export function getAppState(): AppState {
  return getStorageItem<AppState>(STORAGE_KEYS.STATE, getDefaultAppState());
}

/**
 * Saves the full app state
 */
export function saveAppState(state: AppState): boolean {
  return setStorageItem(STORAGE_KEYS.STATE, state);
}

/**
 * Updates a partial app state
 */
export function updateAppState(partialState: Partial<AppState>): boolean {
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
export function getPrompts(): Prompt[] {
  const state = getAppState();
  return state.prompts;
}

/**
 * Saves prompts
 */
export function savePrompts(prompts: Prompt[]): boolean {
  return updateAppState({ prompts });
}

/**
 * Adds a new prompt
 */
export function addPrompt(prompt: Prompt): boolean {
  const prompts = getPrompts();
  prompts.push(prompt);
  return savePrompts(prompts);
}

/**
 * Removes a prompt by ID
 */
export function removePrompt(promptId: string): boolean {
  const prompts = getPrompts().filter((p) => p.id !== promptId);
  return savePrompts(prompts);
}

/**
 * Updates a prompt
 */
export function updatePrompt(promptId: string, updates: Partial<Prompt>): boolean {
  const prompts = getPrompts().map((p) =>
    p.id === promptId ? { ...p, ...updates } : p
  );
  return savePrompts(prompts);
}

// ============================================================================
// Settings Management
// ============================================================================

/**
 * Retrieves stored settings
 */
export function getSettings(): GenerationSettings {
  const state = getAppState();
  return state.settings;
}

/**
 * Saves settings
 */
export function saveSettings(settings: GenerationSettings): boolean {
  return updateAppState({ settings });
}

/**
 * Updates partial settings
 */
export function updateSettings(partialSettings: Partial<GenerationSettings>): boolean {
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
export function getVisualizerConfig(): VisualizerConfig {
  const state = getAppState();
  return state.visualizerConfig;
}

/**
 * Saves visualizer configuration
 */
export function saveVisualizerConfig(config: VisualizerConfig): boolean {
  return updateAppState({ visualizerConfig: config });
}

// ============================================================================
// Chat History Management
// ============================================================================

/**
 * Retrieves chat history
 */
export function getChatHistory(): ChatMessage[] {
  const state = getAppState();
  return state.chatHistory;
}

/**
 * Saves chat history
 */
export function saveChatHistory(messages: ChatMessage[]): boolean {
  return updateAppState({ chatHistory: messages });
}

/**
 * Adds a chat message
 */
export function addChatMessage(message: ChatMessage): boolean {
  const messages = getChatHistory();
  messages.push(message);
  return saveChatHistory(messages);
}

/**
 * Clears chat history
 */
export function clearChatHistory(): boolean {
  return saveChatHistory([]);
}

// ============================================================================
// Snapshots Management
// ============================================================================

/**
 * Retrieves stored snapshots
 */
export function getSnapshots(): PromptSnapshot[] {
  const state = getAppState();
  return state.snapshots;
}

/**
 * Saves snapshots
 */
export function saveSnapshots(snapshots: PromptSnapshot[]): boolean {
  return updateAppState({ snapshots });
}

/**
 * Adds a new snapshot
 */
export function addSnapshot(snapshot: PromptSnapshot): boolean {
  const snapshots = getSnapshots();
  snapshots.push(snapshot);
  return saveSnapshots(snapshots);
}

/**
 * Removes a snapshot by ID
 */
export function removeSnapshot(snapshotId: string): boolean {
  const snapshots = getSnapshots().filter((s) => s.id !== snapshotId);
  return saveSnapshots(snapshots);
}

// ============================================================================
// Storage Statistics
// ============================================================================

/**
 * Gets the approximate size of stored data in bytes
 */
export function getStorageSize(): number {
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
export async function getStorageQuota(): Promise<{
  usage: number;
  quota: number;
} | null> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    try {
      const estimate = await navigator.storage.estimate();
      return {
        usage: estimate.usage || 0,
        quota: estimate.quota || 0,
      };
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Exports app state as JSON string for backup
 */
export function exportAppState(): string {
  const state = getAppState();
  return JSON.stringify(state, null, 2);
}

/**
 * Imports app state from JSON string
 */
export function importAppState(jsonString: string): boolean {
  try {
    const state = JSON.parse(jsonString) as AppState;

    // Validate required fields
    if (!state.prompts || !Array.isArray(state.prompts)) {
      throw new Error('Invalid prompts array');
    }

    return saveAppState(state);
  } catch (error) {
    console.error('Failed to import app state:', error);
    return false;
  }
}
