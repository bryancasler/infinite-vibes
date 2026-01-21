/**
 * Settings Dialog Component
 * Controls for generation parameters and visualizer
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { getOrchestrator } from '../core/prompt-dj-orchestrator.js';
import { getVisualizerService } from '../services/visualizer-service.js';
import { MUSICAL_KEYS, MUSICAL_SCALES } from '../utils/constants.js';
let SettingsDialog = class SettingsDialog extends LitElement {
    constructor() {
        super(...arguments);
        this.settings = null;
        this.visualizerConfig = null;
        this.apiKey = '';
        this.showApiKey = false;
        this.orchestrator = getOrchestrator();
        this.visualizerService = getVisualizerService();
    }
    static { this.styles = css `
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.5rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .header h2 {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 600;
    }

    .close-btn {
      background: none;
      border: none;
      color: rgba(255, 255, 255, 0.7);
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 6px;
      font-size: 1.25rem;
      transition: all 0.2s;
    }

    .close-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
    }

    .content {
      flex: 1;
      overflow-y: auto;
      padding: 1.5rem;
    }

    .section {
      margin-bottom: 2rem;
    }

    .section-title {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: rgba(255, 255, 255, 0.5);
      margin-bottom: 1rem;
    }

    .setting-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 1rem;
    }

    .setting-label {
      font-size: 0.9rem;
    }

    .setting-value {
      font-size: 0.8rem;
      color: rgba(255, 255, 255, 0.7);
      min-width: 40px;
      text-align: right;
    }

    /* Slider styles */
    .slider-row {
      margin-bottom: 1.25rem;
    }

    .slider-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
    }

    .slider {
      width: 100%;
      height: 4px;
      -webkit-appearance: none;
      appearance: none;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 2px;
      outline: none;
    }

    .slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: #8338ec;
      cursor: pointer;
    }

    .slider::-moz-range-thumb {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: #8338ec;
      cursor: pointer;
      border: none;
    }

    /* Select styles */
    .select {
      padding: 0.5rem 0.75rem;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 6px;
      color: #fff;
      font-size: 0.875rem;
      outline: none;
      cursor: pointer;
    }

    .select:focus {
      border-color: #8338ec;
    }

    .select option {
      background: #1a1a2e;
      color: #fff;
    }

    /* Toggle styles */
    .toggle {
      position: relative;
      width: 48px;
      height: 24px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      cursor: pointer;
      transition: background 0.2s;
    }

    .toggle.active {
      background: #8338ec;
    }

    .toggle-knob {
      position: absolute;
      top: 2px;
      left: 2px;
      width: 20px;
      height: 20px;
      background: #fff;
      border-radius: 50%;
      transition: transform 0.2s;
    }

    .toggle.active .toggle-knob {
      transform: translateX(24px);
    }

    /* Button group */
    .button-group {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .mode-btn {
      padding: 0.5rem 1rem;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 20px;
      color: #fff;
      font-size: 0.8rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .mode-btn:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    .mode-btn.active {
      background: rgba(131, 56, 236, 0.3);
      border-color: #8338ec;
    }

    /* Actions */
    .actions {
      padding: 1rem 1.5rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .action-btn {
      width: 100%;
      padding: 0.75rem;
      background: rgba(255, 0, 84, 0.2);
      border: 1px solid rgba(255, 0, 84, 0.3);
      border-radius: 8px;
      color: #ff006e;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .action-btn:hover {
      background: rgba(255, 0, 84, 0.3);
    }

    /* API Key section */
    .api-key-input {
      width: 100%;
      padding: 0.75rem;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      color: #fff;
      font-size: 0.875rem;
      margin-bottom: 0.5rem;
      box-sizing: border-box;
    }

    .api-key-input:focus {
      outline: none;
      border-color: #8338ec;
    }

    .save-key-btn {
      width: 100%;
      padding: 0.5rem;
      background: linear-gradient(135deg, #8338ec, #ff006e);
      border: none;
      border-radius: 6px;
      color: #fff;
      font-size: 0.875rem;
      cursor: pointer;
    }
  `; }
    connectedCallback() {
        super.connectedCallback();
        // Load API key
        this.apiKey = localStorage.getItem('infinite-vibes-api-key') || '';
    }
    handleClosePanel() {
        this.orchestrator.updateUIState({ showSettings: false });
    }
    handleSettingChange(key, value) {
        if (this.settings) {
            this.orchestrator.updateSettings({ [key]: value });
        }
    }
    handleVisualizerChange(key, value) {
        if (this.visualizerConfig) {
            this.orchestrator.updateVisualizerConfig({ [key]: value });
        }
    }
    handleResetSettings() {
        this.orchestrator.resetSettings();
    }
    handleSaveApiKey() {
        localStorage.setItem('infinite-vibes-api-key', this.apiKey);
        this.showApiKey = false;
    }
    getVisualizationModes() {
        return [
            { value: 'gradient-pulse', label: 'Gradient Pulse' },
            { value: 'particles', label: 'Particles' },
            { value: 'spectrogram', label: 'Spectrogram' },
            { value: 'warp', label: 'Warp' },
            { value: 'album-art', label: 'Album Art' },
        ];
    }
    render() {
        if (!this.settings || !this.visualizerConfig) {
            return html `<div class="content">Loading...</div>`;
        }
        return html `
      <div class="header">
        <h2>Settings</h2>
        <button class="close-btn" @click=${this.handleClosePanel}>✕</button>
      </div>

      <div class="content">
        <!-- Generation Settings -->
        <div class="section">
          <div class="section-title">Generation</div>

          <div class="slider-row">
            <div class="slider-header">
              <span class="setting-label">Temperature</span>
              <span class="setting-value">${this.settings.temperature.toFixed(2)}</span>
            </div>
            <input
              type="range"
              class="slider"
              min="0.1"
              max="2.0"
              step="0.1"
              .value=${String(this.settings.temperature)}
              @input=${(e) => this.handleSettingChange('temperature', parseFloat(e.target.value))}
            />
          </div>

          <div class="slider-row">
            <div class="slider-header">
              <span class="setting-label">BPM</span>
              <span class="setting-value">${this.settings.bpm}</span>
            </div>
            <input
              type="range"
              class="slider"
              min="60"
              max="200"
              step="1"
              .value=${String(this.settings.bpm)}
              @input=${(e) => this.handleSettingChange('bpm', parseInt(e.target.value))}
            />
          </div>

          <div class="setting-row">
            <span class="setting-label">Key</span>
            <select
              class="select"
              .value=${this.settings.key}
              @change=${(e) => this.handleSettingChange('key', e.target.value)}
            >
              ${MUSICAL_KEYS.map((key) => html `<option value=${key}>${key}</option>`)}
            </select>
          </div>

          <div class="setting-row">
            <span class="setting-label">Scale</span>
            <select
              class="select"
              .value=${this.settings.scale}
              @change=${(e) => this.handleSettingChange('scale', e.target.value)}
            >
              ${MUSICAL_SCALES.map((scale) => html `<option value=${scale.value}>${scale.label}</option>`)}
            </select>
          </div>

          <div class="slider-row">
            <div class="slider-header">
              <span class="setting-label">Density</span>
              <span class="setting-value">${(this.settings.density * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              class="slider"
              min="0"
              max="1"
              step="0.05"
              .value=${String(this.settings.density)}
              @input=${(e) => this.handleSettingChange('density', parseFloat(e.target.value))}
            />
          </div>

          <div class="slider-row">
            <div class="slider-header">
              <span class="setting-label">Brightness</span>
              <span class="setting-value">${(this.settings.brightness * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              class="slider"
              min="0"
              max="1"
              step="0.05"
              .value=${String(this.settings.brightness)}
              @input=${(e) => this.handleSettingChange('brightness', parseFloat(e.target.value))}
            />
          </div>

          <div class="setting-row">
            <span class="setting-label">Mute Bass</span>
            <div
              class="toggle ${this.settings.muteBass ? 'active' : ''}"
              @click=${() => this.handleSettingChange('muteBass', !this.settings.muteBass)}
            >
              <div class="toggle-knob"></div>
            </div>
          </div>

          <div class="setting-row">
            <span class="setting-label">Mute Drums</span>
            <div
              class="toggle ${this.settings.muteDrums ? 'active' : ''}"
              @click=${() => this.handleSettingChange('muteDrums', !this.settings.muteDrums)}
            >
              <div class="toggle-knob"></div>
            </div>
          </div>
        </div>

        <!-- Visualizer Settings -->
        <div class="section">
          <div class="section-title">Visualizer</div>

          <div class="setting-row">
            <span class="setting-label">Mode</span>
          </div>
          <div class="button-group" style="margin-bottom: 1rem;">
            ${this.getVisualizationModes().map((mode) => html `
                <button
                  class="mode-btn ${this.visualizerConfig.mode === mode.value
            ? 'active'
            : ''}"
                  @click=${() => this.handleVisualizerChange('mode', mode.value)}
                >
                  ${mode.label}
                </button>
              `)}
          </div>

          <div class="slider-row">
            <div class="slider-header">
              <span class="setting-label">Sensitivity</span>
              <span class="setting-value">${(this.visualizerConfig.sensitivity * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              class="slider"
              min="0.1"
              max="2"
              step="0.1"
              .value=${String(this.visualizerConfig.sensitivity)}
              @input=${(e) => this.handleVisualizerChange('sensitivity', parseFloat(e.target.value))}
            />
          </div>

          <div class="setting-row">
            <span class="setting-label">Color Scheme</span>
            <select
              class="select"
              .value=${this.visualizerConfig.colorScheme}
              @change=${(e) => this.handleVisualizerChange('colorScheme', e.target.value)}
            >
              <option value="neon">Neon</option>
              <option value="warm">Warm</option>
              <option value="cool">Cool</option>
              <option value="monochrome">Monochrome</option>
            </select>
          </div>
        </div>

        <!-- API Key -->
        <div class="section">
          <div class="section-title">API Configuration</div>

          <input
            type="${this.showApiKey ? 'text' : 'password'}"
            class="api-key-input"
            placeholder="Google AI API Key"
            .value=${this.apiKey}
            @input=${(e) => (this.apiKey = e.target.value)}
          />
          <button class="save-key-btn" @click=${this.handleSaveApiKey}>
            Save API Key
          </button>
        </div>
      </div>

      <div class="actions">
        <button class="action-btn" @click=${this.handleResetSettings}>
          Reset to Defaults
        </button>
      </div>
    `;
    }
};
__decorate([
    property({ type: Object })
], SettingsDialog.prototype, "settings", void 0);
__decorate([
    property({ type: Object })
], SettingsDialog.prototype, "visualizerConfig", void 0);
__decorate([
    state()
], SettingsDialog.prototype, "apiKey", void 0);
__decorate([
    state()
], SettingsDialog.prototype, "showApiKey", void 0);
SettingsDialog = __decorate([
    customElement('settings-dialog')
], SettingsDialog);
export { SettingsDialog };
//# sourceMappingURL=settings-dialog.js.map