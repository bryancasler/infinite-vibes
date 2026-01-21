/**
 * Prompt DJ Orchestrator
 * The brain that connects UI events to services
 */

import type {
  Prompt,
  PromptSnapshot,
  ChatMessage,
  ChatAction,
  GenerationSettings,
  VisualizerConfig,
  PlaybackState,
  UIState,
} from '../types.js';
import { getApiService, type ApiEvent } from '../services/api-service.js';
import { getAudioService, type AudioEvent } from '../services/audio-service.js';
import { getVisualizerService } from '../services/visualizer-service.js';
import { getChatService } from '../services/chat-service.js';
import { getImageGenerationService } from '../services/image-generation-service.js';
import { getInspirationService } from '../services/inspiration-service.js';
import { getInactivityService, type InactivityEvent } from '../services/inactivity-service.js';
import {
  getAppState,
  saveAppState,
  getSettings,
  saveSettings,
  addSnapshot,
} from '../utils/storage.js';
import {
  DEFAULT_GENERATION_SETTINGS,
  DEFAULT_VISUALIZER_CONFIG,
  UI_CONFIG,
} from '../utils/constants.js';
import { getUniqueColor } from '../utils/color.js';
import { debounce } from '../utils/throttle.js';

// Orchestrator event types
export type OrchestratorEventType =
  | 'prompts-changed'
  | 'settings-changed'
  | 'playback-changed'
  | 'connection-changed'
  | 'chat-message'
  | 'ui-state-changed'
  | 'visualizer-changed'
  | 'error';

export interface OrchestratorEvent {
  type: OrchestratorEventType;
  data?: unknown;
}

type OrchestratorEventCallback = (event: OrchestratorEvent) => void;

/**
 * Generates a unique ID
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Central orchestrator for the Prompt DJ application
 */
export class PromptDJOrchestrator {
  private static instance: PromptDJOrchestrator;

  // State
  private prompts: Prompt[] = [];
  private settings: GenerationSettings = { ...DEFAULT_GENERATION_SETTINGS };
  private visualizerConfig: VisualizerConfig = { ...DEFAULT_VISUALIZER_CONFIG };
  private chatHistory: ChatMessage[] = [];
  private snapshots: PromptSnapshot[] = [];
  private playbackState: PlaybackState = 'stopped';
  private isConnected = false;

  private uiState: UIState = {
    showSettings: false,
    showChat: false,
    showInspiration: false,
    uiVisible: true,
    isDragging: false,
    draggedPromptId: null,
  };

  // Event listeners
  private eventListeners: Map<OrchestratorEventType, Set<OrchestratorEventCallback>> =
    new Map();

  // Debounced functions
  private debouncedSendPromptUpdate: () => void;
  private debouncedSaveState: () => void;

  private constructor() {
    // Initialize event listener sets
    const eventTypes: OrchestratorEventType[] = [
      'prompts-changed',
      'settings-changed',
      'playback-changed',
      'connection-changed',
      'chat-message',
      'ui-state-changed',
      'visualizer-changed',
      'error',
    ];
    eventTypes.forEach((type) => {
      this.eventListeners.set(type, new Set());
    });

    // Create debounced functions
    this.debouncedSendPromptUpdate = debounce(() => {
      this.sendPromptUpdateToApi();
    }, 300);

    this.debouncedSaveState = debounce(() => {
      this.saveState();
    }, 1000);

    // Load saved state
    this.loadState();

    // Set up service event handlers
    this.setupServiceHandlers();
  }

  /**
   * Gets the singleton instance
   */
  static getInstance(): PromptDJOrchestrator {
    if (!PromptDJOrchestrator.instance) {
      PromptDJOrchestrator.instance = new PromptDJOrchestrator();
    }
    return PromptDJOrchestrator.instance;
  }

  /**
   * Sets up handlers for service events
   */
  private setupServiceHandlers(): void {
    const apiService = getApiService();
    const audioService = getAudioService();
    const inactivityService = getInactivityService();

    // API events
    apiService.on('connected', () => {
      this.isConnected = true;
      this.emit({ type: 'connection-changed', data: { connected: true } });

      // Send current prompts on connect
      if (this.prompts.length > 0) {
        this.sendPromptUpdateToApi();
      }
    });

    apiService.on('disconnected', () => {
      this.isConnected = false;
      this.emit({ type: 'connection-changed', data: { connected: false } });
    });

    apiService.on('audio', (event: ApiEvent) => {
      if (event.data) {
        audioService.queueAudioChunk(event.data);
      }
    });

    apiService.on('error', (event: ApiEvent) => {
      this.emit({ type: 'error', data: { error: event.error } });
    });

    // Audio events
    audioService.on('state-change', (event: AudioEvent) => {
      if (event.state) {
        this.playbackState = event.state;
        this.emit({ type: 'playback-changed', data: { state: event.state } });
      }
    });

    // Inactivity events
    inactivityService.on((event: InactivityEvent) => {
      this.updateUIState({ uiVisible: event.type === 'active' });
    });
  }

  /**
   * Loads state from storage
   */
  private loadState(): void {
    const state = getAppState();

    this.prompts = state.prompts || [];
    this.settings = state.settings || { ...DEFAULT_GENERATION_SETTINGS };
    this.visualizerConfig = state.visualizerConfig || { ...DEFAULT_VISUALIZER_CONFIG };
    this.chatHistory = state.chatHistory || [];
    this.snapshots = state.snapshots || [];
  }

  /**
   * Saves state to storage
   */
  private saveState(): void {
    saveAppState({
      prompts: this.prompts,
      settings: this.settings,
      visualizerConfig: this.visualizerConfig,
      chatHistory: this.chatHistory,
      snapshots: this.snapshots,
    });
  }

  /**
   * Adds an event listener
   */
  on(eventType: OrchestratorEventType, callback: OrchestratorEventCallback): void {
    this.eventListeners.get(eventType)?.add(callback);
  }

  /**
   * Removes an event listener
   */
  off(eventType: OrchestratorEventType, callback: OrchestratorEventCallback): void {
    this.eventListeners.get(eventType)?.delete(callback);
  }

  /**
   * Emits an event to all listeners
   */
  private emit(event: OrchestratorEvent): void {
    this.eventListeners.get(event.type)?.forEach((callback) => {
      try {
        callback(event);
      } catch (error) {
        console.error('Error in orchestrator event listener:', error);
      }
    });
  }

  // ==========================================================================
  // Prompt Management
  // ==========================================================================

  /**
   * Gets all prompts
   */
  getPrompts(): Prompt[] {
    return [...this.prompts];
  }

  /**
   * Adds a new prompt
   */
  addPrompt(text: string, weight: number = 1.0): Prompt {
    const existingColors = this.prompts.map((p) => p.color);
    const newPrompt: Prompt = {
      id: generateId(),
      text,
      weight,
      color: getUniqueColor(existingColors),
      enabled: true,
      createdAt: Date.now(),
    };

    this.prompts.push(newPrompt);
    this.emit({ type: 'prompts-changed', data: { prompts: this.prompts } });

    this.debouncedSendPromptUpdate();
    this.debouncedSaveState();

    return newPrompt;
  }

  /**
   * Updates a prompt
   */
  updatePrompt(id: string, updates: Partial<Prompt>): void {
    const index = this.prompts.findIndex((p) => p.id === id);
    if (index === -1) return;

    this.prompts[index] = { ...this.prompts[index], ...updates };
    this.emit({ type: 'prompts-changed', data: { prompts: this.prompts } });

    this.debouncedSendPromptUpdate();
    this.debouncedSaveState();
  }

  /**
   * Removes a prompt
   */
  removePrompt(id: string): void {
    this.prompts = this.prompts.filter((p) => p.id !== id);
    this.emit({ type: 'prompts-changed', data: { prompts: this.prompts } });

    this.debouncedSendPromptUpdate();
    this.debouncedSaveState();
  }

  /**
   * Reorders prompts
   */
  reorderPrompts(fromIndex: number, toIndex: number): void {
    const [removed] = this.prompts.splice(fromIndex, 1);
    this.prompts.splice(toIndex, 0, removed);

    this.emit({ type: 'prompts-changed', data: { prompts: this.prompts } });
    this.debouncedSaveState();
  }

  /**
   * Sets all prompts at once
   */
  setPrompts(prompts: Prompt[]): void {
    this.prompts = prompts;
    this.emit({ type: 'prompts-changed', data: { prompts: this.prompts } });

    this.debouncedSendPromptUpdate();
    this.debouncedSaveState();
  }

  /**
   * Clears all prompts
   */
  clearPrompts(): void {
    this.prompts = [];
    this.emit({ type: 'prompts-changed', data: { prompts: this.prompts } });

    this.debouncedSendPromptUpdate();
    this.debouncedSaveState();
  }

  // ==========================================================================
  // Settings Management
  // ==========================================================================

  /**
   * Gets current settings
   */
  getSettings(): GenerationSettings {
    return { ...this.settings };
  }

  /**
   * Updates settings
   */
  updateSettings(updates: Partial<GenerationSettings>): void {
    this.settings = { ...this.settings, ...updates };
    this.emit({ type: 'settings-changed', data: { settings: this.settings } });

    this.debouncedSendPromptUpdate();
    this.debouncedSaveState();
  }

  /**
   * Resets settings to defaults
   */
  resetSettings(): void {
    this.settings = { ...DEFAULT_GENERATION_SETTINGS };
    this.emit({ type: 'settings-changed', data: { settings: this.settings } });
    this.debouncedSaveState();
  }

  // ==========================================================================
  // Visualizer Management
  // ==========================================================================

  /**
   * Gets visualizer config
   */
  getVisualizerConfig(): VisualizerConfig {
    return { ...this.visualizerConfig };
  }

  /**
   * Updates visualizer config
   */
  updateVisualizerConfig(updates: Partial<VisualizerConfig>): void {
    this.visualizerConfig = { ...this.visualizerConfig, ...updates };

    const visualizerService = getVisualizerService();
    visualizerService.setConfig(this.visualizerConfig);

    this.emit({ type: 'visualizer-changed', data: { config: this.visualizerConfig } });
    this.debouncedSaveState();
  }

  // ==========================================================================
  // Playback Control
  // ==========================================================================

  /**
   * Gets current playback state
   */
  getPlaybackState(): PlaybackState {
    return this.playbackState;
  }

  /**
   * Gets connection state
   */
  getIsConnected(): boolean {
    return this.isConnected;
  }

  /**
   * Starts playback
   */
  async play(): Promise<void> {
    const audioService = getAudioService();
    const apiService = getApiService();
    const visualizerService = getVisualizerService();

    // Initialize audio
    await audioService.initialize();

    // Connect to API if not connected
    if (!this.isConnected) {
      this.playbackState = 'connecting';
      this.emit({ type: 'playback-changed', data: { state: 'connecting' } });

      const connected = await apiService.connect();
      if (!connected) {
        this.playbackState = 'stopped';
        this.emit({ type: 'playback-changed', data: { state: 'stopped' } });
        return;
      }
    }

    // Start audio playback
    await audioService.play();

    // Start visualizer
    visualizerService.start();

    // Start inactivity monitoring
    getInactivityService().start();

    // Send current prompts
    this.sendPromptUpdateToApi();
  }

  /**
   * Pauses playback
   */
  async pause(): Promise<void> {
    const audioService = getAudioService();

    await audioService.pause();
    this.playbackState = 'paused';
    this.emit({ type: 'playback-changed', data: { state: 'paused' } });
  }

  /**
   * Stops playback
   */
  async stop(): Promise<void> {
    const audioService = getAudioService();
    const visualizerService = getVisualizerService();

    await audioService.stop();
    visualizerService.stop();
    visualizerService.clear();

    this.playbackState = 'stopped';
    this.emit({ type: 'playback-changed', data: { state: 'stopped' } });
  }

  /**
   * Performs a hard reset
   */
  async hardReset(): Promise<void> {
    const apiService = getApiService();
    const audioService = getAudioService();
    const visualizerService = getVisualizerService();
    const inactivityService = getInactivityService();

    await apiService.hardReset();
    await audioService.stop();
    visualizerService.stop();
    visualizerService.clear();
    inactivityService.stop();

    this.isConnected = false;
    this.playbackState = 'stopped';

    this.emit({ type: 'connection-changed', data: { connected: false } });
    this.emit({ type: 'playback-changed', data: { state: 'stopped' } });
  }

  /**
   * Sends prompt update to the API
   */
  private async sendPromptUpdateToApi(): Promise<void> {
    if (!this.isConnected) return;

    const apiService = getApiService();
    await apiService.sendPromptUpdate(this.prompts, this.settings);
  }

  // ==========================================================================
  // Chat / Conductor
  // ==========================================================================

  /**
   * Gets chat history
   */
  getChatHistory(): ChatMessage[] {
    return [...this.chatHistory];
  }

  /**
   * Sends a chat message
   */
  async sendChatMessage(content: string): Promise<void> {
    const chatService = getChatService();

    // Add user message to history
    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };
    this.chatHistory.push(userMessage);
    this.emit({ type: 'chat-message', data: { message: userMessage } });

    // Get response from chat service
    const response = await chatService.sendMessage(content, this.prompts);

    // Apply actions
    if (response.actions.length > 0) {
      this.applyChatActions(response.actions);
    }

    // Create snapshot for this vibe change
    const snapshot = this.createSnapshot(`After: "${content.substring(0, 30)}..."`);

    // Add assistant message with snapshot
    const assistantMessage: ChatMessage = {
      id: generateId(),
      role: 'assistant',
      content: response.message,
      timestamp: Date.now(),
      snapshot,
    };
    this.chatHistory.push(assistantMessage);
    this.emit({ type: 'chat-message', data: { message: assistantMessage } });

    this.debouncedSaveState();
  }

  /**
   * Applies chat actions to prompts
   */
  private applyChatActions(actions: ChatAction[]): void {
    for (const action of actions) {
      switch (action.action) {
        case 'add':
          this.addPrompt(action.prompt, action.weight ?? 1.0);
          break;

        case 'remove':
          if (action.promptId) {
            this.removePrompt(action.promptId);
          } else {
            // Try to find matching prompt
            const match = this.prompts.find((p) =>
              p.text.toLowerCase().includes(action.prompt.toLowerCase())
            );
            if (match) {
              this.removePrompt(match.id);
            }
          }
          break;

        case 'update':
          if (action.promptId && action.weight !== undefined) {
            this.updatePrompt(action.promptId, { weight: action.weight });
          } else if (action.prompt === 'all' && action.weight !== undefined) {
            // Update all prompts
            this.prompts.forEach((p) => {
              this.updatePrompt(p.id, {
                weight: Math.max(0, Math.min(2, p.weight * action.weight!)),
              });
            });
          }
          break;
      }
    }
  }

  /**
   * Clears chat history
   */
  clearChatHistory(): void {
    this.chatHistory = [];
    this.emit({ type: 'chat-message', data: { cleared: true } });
    this.debouncedSaveState();

    // Reset chat service session
    getChatService().reset();
  }

  // ==========================================================================
  // Snapshots
  // ==========================================================================

  /**
   * Gets all snapshots
   */
  getSnapshots(): PromptSnapshot[] {
    return [...this.snapshots];
  }

  /**
   * Creates a snapshot of current state
   */
  createSnapshot(label?: string): PromptSnapshot {
    const snapshot: PromptSnapshot = {
      id: generateId(),
      prompts: this.prompts.map((p) => ({ ...p })),
      timestamp: Date.now(),
      label,
    };

    this.snapshots.push(snapshot);
    this.debouncedSaveState();

    return snapshot;
  }

  /**
   * Restores a snapshot
   */
  restoreSnapshot(snapshotId: string): void {
    const snapshot = this.snapshots.find((s) => s.id === snapshotId);
    if (!snapshot) return;

    this.setPrompts(snapshot.prompts.map((p) => ({ ...p })));
  }

  /**
   * Deletes a snapshot
   */
  deleteSnapshot(snapshotId: string): void {
    this.snapshots = this.snapshots.filter((s) => s.id !== snapshotId);
    this.debouncedSaveState();
  }

  // ==========================================================================
  // Inspiration
  // ==========================================================================

  /**
   * Applies an inspiration preset
   */
  applyPreset(presetId: string): void {
    const inspirationService = getInspirationService();
    const result = inspirationService.applyPreset(presetId);

    if (result) {
      this.setPrompts(result.prompts);
      this.updateSettings(result.settings);
    }
  }

  /**
   * Adds a random prompt
   */
  addRandomPrompt(): Prompt {
    const inspirationService = getInspirationService();
    const existingColors = this.prompts.map((p) => p.color);
    const randomPrompt = inspirationService.generateRandomPrompt(existingColors);

    this.prompts.push(randomPrompt);
    this.emit({ type: 'prompts-changed', data: { prompts: this.prompts } });

    this.debouncedSendPromptUpdate();
    this.debouncedSaveState();

    return randomPrompt;
  }

  /**
   * Adds a complementary prompt
   */
  addComplementPrompt(): Prompt {
    const inspirationService = getInspirationService();
    const existingColors = this.prompts.map((p) => p.color);
    const complementPrompt = inspirationService.generateComplementPrompt(
      this.prompts,
      existingColors
    );

    this.prompts.push(complementPrompt);
    this.emit({ type: 'prompts-changed', data: { prompts: this.prompts } });

    this.debouncedSendPromptUpdate();
    this.debouncedSaveState();

    return complementPrompt;
  }

  // ==========================================================================
  // UI State
  // ==========================================================================

  /**
   * Gets UI state
   */
  getUIState(): UIState {
    return { ...this.uiState };
  }

  /**
   * Updates UI state
   */
  updateUIState(updates: Partial<UIState>): void {
    this.uiState = { ...this.uiState, ...updates };
    this.emit({ type: 'ui-state-changed', data: { uiState: this.uiState } });
  }

  /**
   * Toggles settings panel
   */
  toggleSettings(): void {
    this.updateUIState({ showSettings: !this.uiState.showSettings });
  }

  /**
   * Toggles chat panel
   */
  toggleChat(): void {
    this.updateUIState({ showChat: !this.uiState.showChat });
  }

  /**
   * Toggles inspiration panel
   */
  toggleInspiration(): void {
    this.updateUIState({ showInspiration: !this.uiState.showInspiration });
  }

  // ==========================================================================
  // Volume Control
  // ==========================================================================

  /**
   * Gets current volume
   */
  getVolume(): number {
    return getAudioService().getVolume();
  }

  /**
   * Sets volume
   */
  setVolume(volume: number): void {
    getAudioService().setVolume(volume);
  }

  // ==========================================================================
  // Cleanup
  // ==========================================================================

  /**
   * Disposes of all resources
   */
  async dispose(): Promise<void> {
    await this.hardReset();

    // Save final state
    this.saveState();

    // Clear event listeners
    this.eventListeners.forEach((set) => set.clear());
  }
}

// Export singleton instance getter
export const getOrchestrator = (): PromptDJOrchestrator =>
  PromptDJOrchestrator.getInstance();
