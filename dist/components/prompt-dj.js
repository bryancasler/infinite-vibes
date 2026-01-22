/**
 * Prompt DJ - Main Container Component
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html, css } from 'lit';
import { customElement, state, query } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { getOrchestrator } from '../core/prompt-dj-orchestrator.js';
// Import child components
import './visualizer-canvas.js';
import './prompt-controller.js';
import './playback-controls.js';
import './chat-conductor.js';
import './settings-dialog.js';
import './inspiration-panel.js';
import './api-key-dialog.js';
let PromptDJ = class PromptDJ extends LitElement {
    constructor() {
        super(...arguments);
        this.prompts = [];
        this.playbackState = 'stopped';
        this.apiConnected = false;
        this.uiState = {
            showSettings: false,
            showChat: false,
            showInspiration: false,
            uiVisible: true,
            isDragging: false,
            draggedPromptId: null,
        };
        this.settings = null;
        this.visualizerConfig = null;
        this.showAddPromptDialog = false;
        this.showApiKeyDialog = false;
        this.newPromptText = '';
        this.orchestrator = getOrchestrator();
        this.handlePromptsChanged = (event) => {
            const data = event.data;
            this.prompts = data.prompts;
        };
        this.handlePlaybackChanged = (event) => {
            const data = event.data;
            this.playbackState = data.state;
        };
        this.handleConnectionChanged = (event) => {
            const data = event.data;
            this.apiConnected = data.connected;
        };
        this.handleUIStateChanged = (event) => {
            const data = event.data;
            this.uiState = data.uiState;
        };
        this.handleSettingsChanged = (event) => {
            const data = event.data;
            this.settings = data.settings;
        };
        this.handleVisualizerChanged = (event) => {
            const data = event.data;
            this.visualizerConfig = data.config;
        };
        this.handleError = (event) => {
            const data = event.data;
            console.error('Orchestrator error:', data.error);
            // Could show a toast notification here
        };
    }
    static { this.styles = css `
    :host {
      display: block;
      width: 100%;
      height: 100vh;
      overflow: hidden;
      background: #000;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      color: #fff;
    }

    .container {
      position: relative;
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    /* Visualizer background */
    .visualizer-layer {
      position: absolute;
      inset: 0;
      z-index: 0;
    }

    /* Main UI layer */
    .ui-layer {
      position: relative;
      z-index: 10;
      display: flex;
      flex-direction: column;
      height: 100%;
      transition: opacity 0.5s ease;
    }

    .ui-layer.hidden {
      opacity: 0;
      pointer-events: none;
    }

    .ui-layer.hidden .always-visible {
      opacity: 1;
      pointer-events: auto;
    }

    /* Header */
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 1.5rem;
      background: linear-gradient(to bottom, rgba(0, 0, 0, 0.8), transparent);
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .logo-icon {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #ff006e, #8338ec);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }

    .logo-text {
      font-size: 1.25rem;
      font-weight: 700;
      background: linear-gradient(135deg, #ff006e, #8338ec, #3a86ff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .header-btn {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: #fff;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      cursor: pointer;
      font-size: 0.875rem;
      transition: all 0.2s;
      backdrop-filter: blur(10px);
    }

    .header-btn:hover {
      background: rgba(255, 255, 255, 0.2);
      border-color: rgba(255, 255, 255, 0.3);
    }

    .header-btn.active {
      background: rgba(131, 56, 236, 0.3);
      border-color: #8338ec;
    }

    /* Main content area */
    .main-content {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }

    /* Status display */
    .status-display {
      text-align: center;
      padding: 2rem;
    }

    .status-text {
      font-size: 1.5rem;
      font-weight: 300;
      opacity: 0.7;
      margin-bottom: 1rem;
    }

    .connection-indicator {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      font-size: 0.875rem;
    }

    .connection-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #ff006e;
    }

    .connection-dot.connected {
      background: #06ffa5;
      box-shadow: 0 0 10px #06ffa5;
    }

    .connection-dot.connecting {
      background: #ffbe0b;
      animation: pulse 1s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    /* Bottom controls area */
    .bottom-section {
      padding: 1rem 1.5rem 2rem;
      background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
    }

    /* Prompt pills container */
    .prompts-container {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      justify-content: center;
      margin-bottom: 1.5rem;
      min-height: 60px;
    }

    .add-prompt-btn {
      background: rgba(255, 255, 255, 0.1);
      border: 2px dashed rgba(255, 255, 255, 0.3);
      color: rgba(255, 255, 255, 0.7);
      padding: 0.75rem 1.5rem;
      border-radius: 30px;
      cursor: pointer;
      font-size: 0.875rem;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .add-prompt-btn:hover {
      background: rgba(255, 255, 255, 0.15);
      border-color: rgba(255, 255, 255, 0.5);
      color: #fff;
    }

    /* Playback controls */
    .playback-section {
      display: flex;
      justify-content: center;
    }

    /* Side panels */
    .side-panel {
      position: fixed;
      top: 0;
      bottom: 0;
      width: 400px;
      max-width: 90vw;
      background: rgba(20, 20, 30, 0.95);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      z-index: 100;
      transform: translateX(100%);
      transition: transform 0.3s ease;
      overflow-y: auto;
    }

    .side-panel.left {
      left: 0;
      transform: translateX(-100%);
    }

    .side-panel.right {
      right: 0;
    }

    .side-panel.open {
      transform: translateX(0);
    }

    /* Panel overlay */
    .panel-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 99;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s;
    }

    .panel-overlay.visible {
      opacity: 1;
      visibility: visible;
    }

    /* Empty state */
    .empty-state {
      text-align: center;
      padding: 2rem;
      color: rgba(255, 255, 255, 0.5);
    }

    .empty-state p {
      margin: 0.5rem 0;
    }

    /* Add prompt dialog */
    .add-prompt-dialog {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(20, 20, 30, 0.95);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 16px;
      padding: 2rem;
      z-index: 200;
      min-width: 400px;
      max-width: 90vw;
    }

    .add-prompt-dialog h3 {
      margin: 0 0 1.5rem;
      font-size: 1.25rem;
      font-weight: 600;
    }

    .add-prompt-dialog input {
      width: 100%;
      padding: 0.75rem 1rem;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      color: #fff;
      font-size: 1rem;
      margin-bottom: 1rem;
      box-sizing: border-box;
    }

    .add-prompt-dialog input:focus {
      outline: none;
      border-color: #8338ec;
    }

    .add-prompt-dialog .actions {
      display: flex;
      gap: 0.75rem;
      justify-content: flex-end;
    }

    .add-prompt-dialog button {
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .add-prompt-dialog .cancel-btn {
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.3);
      color: #fff;
    }

    .add-prompt-dialog .submit-btn {
      background: linear-gradient(135deg, #8338ec, #ff006e);
      border: none;
      color: #fff;
      font-weight: 600;
    }

    .add-prompt-dialog .submit-btn:hover {
      transform: scale(1.02);
    }

    .dialog-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.7);
      z-index: 199;
    }
  `; }
    connectedCallback() {
        super.connectedCallback();
        // Load initial state
        this.prompts = this.orchestrator.getPrompts();
        this.playbackState = this.orchestrator.getPlaybackState();
        this.apiConnected = this.orchestrator.getIsConnected();
        this.uiState = this.orchestrator.getUIState();
        this.settings = this.orchestrator.getSettings();
        this.visualizerConfig = this.orchestrator.getVisualizerConfig();
        // Subscribe to orchestrator events
        this.orchestrator.on('prompts-changed', this.handlePromptsChanged);
        this.orchestrator.on('playback-changed', this.handlePlaybackChanged);
        this.orchestrator.on('connection-changed', this.handleConnectionChanged);
        this.orchestrator.on('ui-state-changed', this.handleUIStateChanged);
        this.orchestrator.on('settings-changed', this.handleSettingsChanged);
        this.orchestrator.on('visualizer-changed', this.handleVisualizerChanged);
        this.orchestrator.on('error', this.handleError);
        // Check for API key
        this.checkApiKey();
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        // Unsubscribe from orchestrator events
        this.orchestrator.off('prompts-changed', this.handlePromptsChanged);
        this.orchestrator.off('playback-changed', this.handlePlaybackChanged);
        this.orchestrator.off('connection-changed', this.handleConnectionChanged);
        this.orchestrator.off('ui-state-changed', this.handleUIStateChanged);
        this.orchestrator.off('settings-changed', this.handleSettingsChanged);
        this.orchestrator.off('visualizer-changed', this.handleVisualizerChanged);
        this.orchestrator.off('error', this.handleError);
    }
    checkApiKey() {
        const stored = localStorage.getItem('infinite-vibes-api-key');
        // Check if we have a valid stored API key (JSON encoded string)
        if (!stored) {
            this.showApiKeyDialog = true;
            return;
        }
        try {
            const apiKey = JSON.parse(stored);
            if (!apiKey) {
                this.showApiKeyDialog = true;
            }
        }
        catch {
            // Invalid JSON - clear and show dialog
            localStorage.removeItem('infinite-vibes-api-key');
            this.showApiKeyDialog = true;
        }
    }
    handleToggleChat() {
        this.orchestrator.toggleChat();
    }
    handleToggleSettings() {
        this.orchestrator.toggleSettings();
    }
    handleToggleInspiration() {
        this.orchestrator.toggleInspiration();
    }
    handleClosePanel() {
        this.orchestrator.updateUIState({
            showChat: false,
            showSettings: false,
            showInspiration: false,
        });
    }
    handleShowAddPrompt() {
        this.showAddPromptDialog = true;
        this.newPromptText = '';
        // Focus input after render
        this.updateComplete.then(() => {
            this.addPromptInput?.focus();
        });
    }
    handleAddPrompt() {
        if (this.newPromptText.trim()) {
            this.orchestrator.addPrompt(this.newPromptText.trim());
            this.showAddPromptDialog = false;
            this.newPromptText = '';
        }
    }
    handleAddPromptKeydown(e) {
        if (e.key === 'Enter') {
            this.handleAddPrompt();
        }
        else if (e.key === 'Escape') {
            this.showAddPromptDialog = false;
        }
    }
    handleAddRandomPrompt() {
        this.orchestrator.addRandomPrompt();
    }
    handlePromptUpdate(e) {
        const { id, updates } = e.detail;
        this.orchestrator.updatePrompt(id, updates);
    }
    handlePromptRemove(e) {
        const { id } = e.detail;
        this.orchestrator.removePrompt(id);
    }
    handleApiKeySaved() {
        this.showApiKeyDialog = false;
    }
    getConnectionStatus() {
        if (this.playbackState === 'connecting')
            return 'Connecting...';
        if (this.apiConnected)
            return 'Connected';
        return 'Disconnected';
    }
    getConnectionClass() {
        if (this.playbackState === 'connecting')
            return 'connecting';
        if (this.apiConnected)
            return 'connected';
        return '';
    }
    render() {
        const uiClasses = {
            'ui-layer': true,
            hidden: !this.uiState.uiVisible,
        };
        const anySidePanelOpen = this.uiState.showChat ||
            this.uiState.showSettings ||
            this.uiState.showInspiration;
        return html `
      <div class="container">
        <!-- Visualizer Background -->
        <div class="visualizer-layer">
          <visualizer-canvas
            .config=${this.visualizerConfig}
          ></visualizer-canvas>
        </div>

        <!-- Main UI -->
        <div class=${classMap(uiClasses)}>
          <!-- Header -->
          <header class="header">
            <div class="logo">
              <div class="logo-icon">♪</div>
              <span class="logo-text">Infinite Vibes DJ</span>
            </div>

            <div class="header-actions">
              <button
                class="header-btn ${this.uiState.showInspiration ? 'active' : ''}"
                @click=${this.handleToggleInspiration}
              >
                Inspiration
              </button>
              <button
                class="header-btn ${this.uiState.showChat ? 'active' : ''}"
                @click=${this.handleToggleChat}
              >
                Conductor
              </button>
              <button
                class="header-btn ${this.uiState.showSettings ? 'active' : ''}"
                @click=${this.handleToggleSettings}
              >
                Settings
              </button>
            </div>
          </header>

          <!-- Main Content -->
          <div class="main-content">
            ${this.prompts.length === 0 && this.playbackState === 'stopped'
            ? html `
                  <div class="status-display">
                    <p class="status-text">Add prompts to start your mix</p>
                    <div class="connection-indicator">
                      <span
                        class="connection-dot ${this.getConnectionClass()}"
                      ></span>
                      <span>${this.getConnectionStatus()}</span>
                    </div>
                  </div>
                `
            : html `
                  <div class="connection-indicator always-visible">
                    <span
                      class="connection-dot ${this.getConnectionClass()}"
                    ></span>
                    <span>${this.getConnectionStatus()}</span>
                  </div>
                `}
          </div>

          <!-- Bottom Section -->
          <div class="bottom-section">
            <!-- Prompt Pills -->
            <div class="prompts-container">
              ${this.prompts.map((prompt) => html `
                  <prompt-controller
                    .prompt=${prompt}
                    @prompt-update=${this.handlePromptUpdate}
                    @prompt-remove=${this.handlePromptRemove}
                  ></prompt-controller>
                `)}

              ${this.prompts.length < 8
            ? html `
                    <button
                      class="add-prompt-btn"
                      @click=${this.handleShowAddPrompt}
                    >
                      <span>+</span>
                      <span>Add Prompt</span>
                    </button>
                  `
            : null}
            </div>

            <!-- Playback Controls -->
            <div class="playback-section">
              <playback-controls
                .playbackState=${this.playbackState}
                .isConnected=${this.apiConnected}
              ></playback-controls>
            </div>
          </div>
        </div>

        <!-- Panel Overlay -->
        <div
          class="panel-overlay ${anySidePanelOpen ? 'visible' : ''}"
          @click=${this.handleClosePanel}
        ></div>

        <!-- Chat Panel -->
        <div class="side-panel right ${this.uiState.showChat ? 'open' : ''}">
          <chat-conductor></chat-conductor>
        </div>

        <!-- Settings Panel -->
        <div class="side-panel right ${this.uiState.showSettings ? 'open' : ''}">
          <settings-dialog
            .settings=${this.settings}
            .visualizerConfig=${this.visualizerConfig}
          ></settings-dialog>
        </div>

        <!-- Inspiration Panel -->
        <div class="side-panel left ${this.uiState.showInspiration ? 'open' : ''}">
          <inspiration-panel></inspiration-panel>
        </div>

        <!-- Add Prompt Dialog -->
        ${this.showAddPromptDialog
            ? html `
              <div
                class="dialog-overlay"
                @click=${() => (this.showAddPromptDialog = false)}
              ></div>
              <div class="add-prompt-dialog">
                <h3>Add New Prompt</h3>
                <input
                  id="add-prompt-input"
                  type="text"
                  placeholder="e.g., Deep house bass, Ethereal vocals..."
                  .value=${this.newPromptText}
                  @input=${(e) => (this.newPromptText = e.target.value)}
                  @keydown=${this.handleAddPromptKeydown}
                />
                <div class="actions">
                  <button
                    class="cancel-btn"
                    @click=${() => (this.showAddPromptDialog = false)}
                  >
                    Cancel
                  </button>
                  <button
                    class="header-btn"
                    @click=${this.handleAddRandomPrompt}
                  >
                    Random
                  </button>
                  <button class="submit-btn" @click=${this.handleAddPrompt}>
                    Add Prompt
                  </button>
                </div>
              </div>
            `
            : null}

        <!-- API Key Dialog -->
        ${this.showApiKeyDialog
            ? html `
              <api-key-dialog
                @api-key-saved=${this.handleApiKeySaved}
              ></api-key-dialog>
            `
            : null}
      </div>
    `;
    }
};
__decorate([
    state()
], PromptDJ.prototype, "prompts", void 0);
__decorate([
    state()
], PromptDJ.prototype, "playbackState", void 0);
__decorate([
    state()
], PromptDJ.prototype, "apiConnected", void 0);
__decorate([
    state()
], PromptDJ.prototype, "uiState", void 0);
__decorate([
    state()
], PromptDJ.prototype, "settings", void 0);
__decorate([
    state()
], PromptDJ.prototype, "visualizerConfig", void 0);
__decorate([
    state()
], PromptDJ.prototype, "showAddPromptDialog", void 0);
__decorate([
    state()
], PromptDJ.prototype, "showApiKeyDialog", void 0);
__decorate([
    state()
], PromptDJ.prototype, "newPromptText", void 0);
__decorate([
    query('#add-prompt-input')
], PromptDJ.prototype, "addPromptInput", void 0);
PromptDJ = __decorate([
    customElement('prompt-dj')
], PromptDJ);
export { PromptDJ };
//# sourceMappingURL=prompt-dj.js.map