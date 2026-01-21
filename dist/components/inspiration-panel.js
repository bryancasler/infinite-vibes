/**
 * Inspiration Panel Component
 * Browse and apply preset vibes
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { getOrchestrator } from '../core/prompt-dj-orchestrator.js';
import { getInspirationService } from '../services/inspiration-service.js';
import { withAlpha } from '../utils/color.js';
let InspirationPanel = class InspirationPanel extends LitElement {
    constructor() {
        super(...arguments);
        this.presets = [];
        this.orchestrator = getOrchestrator();
        this.inspirationService = getInspirationService();
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
      display: flex;
      align-items: center;
      gap: 0.5rem;
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
      padding: 1rem;
    }

    /* Quick actions */
    .quick-actions {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
    }

    .quick-btn {
      flex: 1;
      padding: 0.75rem;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      color: #fff;
      font-size: 0.8rem;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
    }

    .quick-btn:hover {
      background: rgba(255, 255, 255, 0.15);
      border-color: rgba(255, 255, 255, 0.3);
    }

    .quick-btn .icon {
      font-size: 1.25rem;
    }

    /* Preset cards */
    .presets-grid {
      display: grid;
      gap: 1rem;
    }

    .preset-card {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 1rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .preset-card:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.2);
      transform: translateY(-2px);
    }

    .preset-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.5rem;
    }

    .preset-name {
      font-size: 1rem;
      font-weight: 600;
    }

    .preset-bpm {
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.5);
      background: rgba(255, 255, 255, 0.1);
      padding: 0.25rem 0.5rem;
      border-radius: 10px;
    }

    .preset-description {
      font-size: 0.8rem;
      color: rgba(255, 255, 255, 0.7);
      margin-bottom: 0.75rem;
    }

    .preset-prompts {
      display: flex;
      flex-wrap: wrap;
      gap: 0.375rem;
    }

    .preset-prompt-tag {
      font-size: 0.7rem;
      padding: 0.25rem 0.5rem;
      border-radius: 10px;
      white-space: nowrap;
    }

    /* Section title */
    .section-title {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: rgba(255, 255, 255, 0.5);
      margin-bottom: 1rem;
    }
  `; }
    connectedCallback() {
        super.connectedCallback();
        this.presets = this.inspirationService.getPresets();
    }
    handleClosePanel() {
        this.orchestrator.updateUIState({ showInspiration: false });
    }
    handleApplyPreset(presetId) {
        this.orchestrator.applyPreset(presetId);
    }
    handleAddRandom() {
        this.orchestrator.addRandomPrompt();
    }
    handleAddComplement() {
        this.orchestrator.addComplementPrompt();
    }
    handleRandomPreset() {
        const preset = this.inspirationService.getRandomPreset();
        this.orchestrator.applyPreset(preset.id);
    }
    render() {
        return html `
      <div class="header">
        <h2>
          <span>✨</span>
          Inspiration
        </h2>
        <button class="close-btn" @click=${this.handleClosePanel}>✕</button>
      </div>

      <div class="content">
        <!-- Quick Actions -->
        <div class="quick-actions">
          <button class="quick-btn" @click=${this.handleAddRandom}>
            <span class="icon">🎲</span>
            <span>Random Prompt</span>
          </button>
          <button class="quick-btn" @click=${this.handleAddComplement}>
            <span class="icon">➕</span>
            <span>Add Complement</span>
          </button>
          <button class="quick-btn" @click=${this.handleRandomPreset}>
            <span class="icon">🎰</span>
            <span>Random Vibe</span>
          </button>
        </div>

        <!-- Presets -->
        <div class="section-title">Preset Vibes</div>
        <div class="presets-grid">
          ${this.presets.map((preset) => html `
              <div
                class="preset-card"
                @click=${() => this.handleApplyPreset(preset.id)}
              >
                <div class="preset-header">
                  <span class="preset-name">${preset.name}</span>
                  ${preset.settings?.bpm
            ? html `<span class="preset-bpm">${preset.settings.bpm} BPM</span>`
            : null}
                </div>
                <div class="preset-description">${preset.description}</div>
                <div class="preset-prompts">
                  ${preset.prompts.slice(0, 4).map((p) => html `
                      <span
                        class="preset-prompt-tag"
                        style="background: ${withAlpha(p.color, 0.3)}; border: 1px solid ${withAlpha(p.color, 0.5)}"
                      >
                        ${p.text}
                      </span>
                    `)}
                </div>
              </div>
            `)}
        </div>
      </div>
    `;
    }
};
__decorate([
    state()
], InspirationPanel.prototype, "presets", void 0);
InspirationPanel = __decorate([
    customElement('inspiration-panel')
], InspirationPanel);
export { InspirationPanel };
//# sourceMappingURL=inspiration-panel.js.map