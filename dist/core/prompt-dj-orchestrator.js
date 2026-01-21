/**
 * Prompt DJ Orchestrator
 * The brain that connects UI events to services
 */
import { getApiService } from '../services/api-service.js';
import { getAudioService } from '../services/audio-service.js';
import { getVisualizerService } from '../services/visualizer-service.js';
import { getChatService } from '../services/chat-service.js';
import { getInspirationService } from '../services/inspiration-service.js';
import { getInactivityService } from '../services/inactivity-service.js';
import { getAppState, saveAppState, } from '../utils/storage.js';
import { DEFAULT_GENERATION_SETTINGS, DEFAULT_VISUALIZER_CONFIG, } from '../utils/constants.js';
import { getUniqueColor } from '../utils/color.js';
import { debounce } from '../utils/throttle.js';
/**
 * Generates a unique ID
 */
function generateId() {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
/**
 * Central orchestrator for the Prompt DJ application
 */
export class PromptDJOrchestrator {
    constructor() {
        // State
        this.prompts = [];
        this.settings = { ...DEFAULT_GENERATION_SETTINGS };
        this.visualizerConfig = { ...DEFAULT_VISUALIZER_CONFIG };
        this.chatHistory = [];
        this.snapshots = [];
        this.playbackState = 'stopped';
        this.isConnected = false;
        this.uiState = {
            showSettings: false,
            showChat: false,
            showInspiration: false,
            uiVisible: true,
            isDragging: false,
            draggedPromptId: null,
        };
        // Event listeners
        this.eventListeners = new Map();
        // Initialize event listener sets
        const eventTypes = [
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
    static getInstance() {
        if (!PromptDJOrchestrator.instance) {
            PromptDJOrchestrator.instance = new PromptDJOrchestrator();
        }
        return PromptDJOrchestrator.instance;
    }
    /**
     * Sets up handlers for service events
     */
    setupServiceHandlers() {
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
        apiService.on('audio', (event) => {
            if (event.data) {
                audioService.queueAudioChunk(event.data);
            }
        });
        apiService.on('error', (event) => {
            this.emit({ type: 'error', data: { error: event.error } });
        });
        // Audio events
        audioService.on('state-change', (event) => {
            if (event.state) {
                this.playbackState = event.state;
                this.emit({ type: 'playback-changed', data: { state: event.state } });
            }
        });
        // Inactivity events
        inactivityService.on((event) => {
            this.updateUIState({ uiVisible: event.type === 'active' });
        });
    }
    /**
     * Loads state from storage
     */
    loadState() {
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
    saveState() {
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
    getPrompts() {
        return [...this.prompts];
    }
    /**
     * Adds a new prompt
     */
    addPrompt(text, weight = 1.0) {
        const existingColors = this.prompts.map((p) => p.color);
        const newPrompt = {
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
    updatePrompt(id, updates) {
        const index = this.prompts.findIndex((p) => p.id === id);
        if (index === -1)
            return;
        this.prompts[index] = { ...this.prompts[index], ...updates };
        this.emit({ type: 'prompts-changed', data: { prompts: this.prompts } });
        this.debouncedSendPromptUpdate();
        this.debouncedSaveState();
    }
    /**
     * Removes a prompt
     */
    removePrompt(id) {
        this.prompts = this.prompts.filter((p) => p.id !== id);
        this.emit({ type: 'prompts-changed', data: { prompts: this.prompts } });
        this.debouncedSendPromptUpdate();
        this.debouncedSaveState();
    }
    /**
     * Reorders prompts
     */
    reorderPrompts(fromIndex, toIndex) {
        const [removed] = this.prompts.splice(fromIndex, 1);
        this.prompts.splice(toIndex, 0, removed);
        this.emit({ type: 'prompts-changed', data: { prompts: this.prompts } });
        this.debouncedSaveState();
    }
    /**
     * Sets all prompts at once
     */
    setPrompts(prompts) {
        this.prompts = prompts;
        this.emit({ type: 'prompts-changed', data: { prompts: this.prompts } });
        this.debouncedSendPromptUpdate();
        this.debouncedSaveState();
    }
    /**
     * Clears all prompts
     */
    clearPrompts() {
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
    getSettings() {
        return { ...this.settings };
    }
    /**
     * Updates settings
     */
    updateSettings(updates) {
        this.settings = { ...this.settings, ...updates };
        this.emit({ type: 'settings-changed', data: { settings: this.settings } });
        this.debouncedSendPromptUpdate();
        this.debouncedSaveState();
    }
    /**
     * Resets settings to defaults
     */
    resetSettings() {
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
    getVisualizerConfig() {
        return { ...this.visualizerConfig };
    }
    /**
     * Updates visualizer config
     */
    updateVisualizerConfig(updates) {
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
    getPlaybackState() {
        return this.playbackState;
    }
    /**
     * Gets connection state
     */
    getIsConnected() {
        return this.isConnected;
    }
    /**
     * Starts playback
     */
    async play() {
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
    async pause() {
        const audioService = getAudioService();
        await audioService.pause();
        this.playbackState = 'paused';
        this.emit({ type: 'playback-changed', data: { state: 'paused' } });
    }
    /**
     * Stops playback
     */
    async stop() {
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
    async hardReset() {
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
    async sendPromptUpdateToApi() {
        if (!this.isConnected)
            return;
        const apiService = getApiService();
        await apiService.sendPromptUpdate(this.prompts, this.settings);
    }
    // ==========================================================================
    // Chat / Conductor
    // ==========================================================================
    /**
     * Gets chat history
     */
    getChatHistory() {
        return [...this.chatHistory];
    }
    /**
     * Sends a chat message
     */
    async sendChatMessage(content) {
        const chatService = getChatService();
        // Add user message to history
        const userMessage = {
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
        const assistantMessage = {
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
    applyChatActions(actions) {
        for (const action of actions) {
            switch (action.action) {
                case 'add':
                    this.addPrompt(action.prompt, action.weight ?? 1.0);
                    break;
                case 'remove':
                    if (action.promptId) {
                        this.removePrompt(action.promptId);
                    }
                    else {
                        // Try to find matching prompt
                        const match = this.prompts.find((p) => p.text.toLowerCase().includes(action.prompt.toLowerCase()));
                        if (match) {
                            this.removePrompt(match.id);
                        }
                    }
                    break;
                case 'update':
                    if (action.promptId && action.weight !== undefined) {
                        this.updatePrompt(action.promptId, { weight: action.weight });
                    }
                    else if (action.prompt === 'all' && action.weight !== undefined) {
                        // Update all prompts
                        this.prompts.forEach((p) => {
                            this.updatePrompt(p.id, {
                                weight: Math.max(0, Math.min(2, p.weight * action.weight)),
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
    clearChatHistory() {
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
    getSnapshots() {
        return [...this.snapshots];
    }
    /**
     * Creates a snapshot of current state
     */
    createSnapshot(label) {
        const snapshot = {
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
    restoreSnapshot(snapshotId) {
        const snapshot = this.snapshots.find((s) => s.id === snapshotId);
        if (!snapshot)
            return;
        this.setPrompts(snapshot.prompts.map((p) => ({ ...p })));
    }
    /**
     * Deletes a snapshot
     */
    deleteSnapshot(snapshotId) {
        this.snapshots = this.snapshots.filter((s) => s.id !== snapshotId);
        this.debouncedSaveState();
    }
    // ==========================================================================
    // Inspiration
    // ==========================================================================
    /**
     * Applies an inspiration preset
     */
    applyPreset(presetId) {
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
    addRandomPrompt() {
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
    addComplementPrompt() {
        const inspirationService = getInspirationService();
        const existingColors = this.prompts.map((p) => p.color);
        const complementPrompt = inspirationService.generateComplementPrompt(this.prompts, existingColors);
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
    getUIState() {
        return { ...this.uiState };
    }
    /**
     * Updates UI state
     */
    updateUIState(updates) {
        this.uiState = { ...this.uiState, ...updates };
        this.emit({ type: 'ui-state-changed', data: { uiState: this.uiState } });
    }
    /**
     * Toggles settings panel
     */
    toggleSettings() {
        this.updateUIState({ showSettings: !this.uiState.showSettings });
    }
    /**
     * Toggles chat panel
     */
    toggleChat() {
        this.updateUIState({ showChat: !this.uiState.showChat });
    }
    /**
     * Toggles inspiration panel
     */
    toggleInspiration() {
        this.updateUIState({ showInspiration: !this.uiState.showInspiration });
    }
    // ==========================================================================
    // Volume Control
    // ==========================================================================
    /**
     * Gets current volume
     */
    getVolume() {
        return getAudioService().getVolume();
    }
    /**
     * Sets volume
     */
    setVolume(volume) {
        getAudioService().setVolume(volume);
    }
    // ==========================================================================
    // Cleanup
    // ==========================================================================
    /**
     * Disposes of all resources
     */
    async dispose() {
        await this.hardReset();
        // Save final state
        this.saveState();
        // Clear event listeners
        this.eventListeners.forEach((set) => set.clear());
    }
}
// Export singleton instance getter
export const getOrchestrator = () => PromptDJOrchestrator.getInstance();
//# sourceMappingURL=prompt-dj-orchestrator.js.map