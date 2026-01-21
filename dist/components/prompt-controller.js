/**
 * Prompt Controller Component
 * Individual prompt pill with weight slider
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { styleMap } from 'lit/directives/style-map.js';
import { classMap } from 'lit/directives/class-map.js';
import { withAlpha } from '../utils/color.js';
import { UI_CONFIG } from '../utils/constants.js';
let PromptController = class PromptController extends LitElement {
    constructor() {
        super(...arguments);
        this.isExpanded = false;
    }
    static { this.styles = css `
    :host {
      display: inline-block;
    }

    .prompt-pill {
      position: relative;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border-radius: 30px;
      cursor: pointer;
      transition: all 0.2s;
      user-select: none;
    }

    .prompt-pill:hover {
      transform: scale(1.02);
    }

    .prompt-pill.expanded {
      border-radius: 16px;
    }

    .prompt-pill.disabled {
      opacity: 0.5;
    }

    .prompt-text {
      font-size: 0.875rem;
      font-weight: 500;
      white-space: nowrap;
      max-width: 150px;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .weight-badge {
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.125rem 0.375rem;
      border-radius: 10px;
      background: rgba(0, 0, 0, 0.3);
    }

    .toggle-btn {
      background: none;
      border: none;
      color: inherit;
      cursor: pointer;
      padding: 0.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0.7;
      transition: opacity 0.2s;
    }

    .toggle-btn:hover {
      opacity: 1;
    }

    .remove-btn {
      background: none;
      border: none;
      color: inherit;
      cursor: pointer;
      padding: 0.25rem;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.2s;
      font-size: 1.25rem;
      line-height: 1;
    }

    .prompt-pill:hover .remove-btn {
      opacity: 0.7;
    }

    .remove-btn:hover {
      opacity: 1 !important;
    }

    /* Expanded state with slider */
    .expanded-content {
      display: none;
      flex-direction: column;
      gap: 0.5rem;
      padding-top: 0.5rem;
      width: 100%;
    }

    .prompt-pill.expanded .expanded-content {
      display: flex;
    }

    .slider-container {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .weight-slider {
      flex: 1;
      -webkit-appearance: none;
      appearance: none;
      height: 4px;
      border-radius: 2px;
      background: rgba(255, 255, 255, 0.2);
      outline: none;
    }

    .weight-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      cursor: pointer;
      transition: transform 0.1s;
    }

    .weight-slider::-webkit-slider-thumb:hover {
      transform: scale(1.2);
    }

    .weight-slider::-moz-range-thumb {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      cursor: pointer;
      border: none;
    }

    .weight-value {
      font-size: 0.75rem;
      font-weight: 600;
      min-width: 2.5rem;
      text-align: right;
    }

    /* Action buttons in expanded view */
    .action-buttons {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
    }

    .action-btn {
      background: rgba(0, 0, 0, 0.3);
      border: none;
      color: inherit;
      padding: 0.375rem 0.75rem;
      border-radius: 6px;
      font-size: 0.75rem;
      cursor: pointer;
      transition: background 0.2s;
    }

    .action-btn:hover {
      background: rgba(0, 0, 0, 0.5);
    }

    .action-btn.danger:hover {
      background: rgba(255, 0, 84, 0.5);
    }
  `; }
    handleClick() {
        this.isExpanded = !this.isExpanded;
    }
    handleToggleEnabled(e) {
        e.stopPropagation();
        this.dispatchEvent(new CustomEvent('prompt-update', {
            detail: { id: this.prompt.id, updates: { enabled: !this.prompt.enabled } },
            bubbles: true,
            composed: true,
        }));
    }
    handleWeightChange(e) {
        const target = e.target;
        const weight = parseFloat(target.value);
        this.dispatchEvent(new CustomEvent('prompt-update', {
            detail: { id: this.prompt.id, updates: { weight } },
            bubbles: true,
            composed: true,
        }));
    }
    handleRemove(e) {
        e.stopPropagation();
        this.dispatchEvent(new CustomEvent('prompt-remove', {
            detail: { id: this.prompt.id },
            bubbles: true,
            composed: true,
        }));
    }
    render() {
        const pillStyles = {
            background: withAlpha(this.prompt.color, 0.3),
            border: `1px solid ${withAlpha(this.prompt.color, 0.5)}`,
            color: '#fff',
        };
        const sliderThumbStyle = `
      .weight-slider::-webkit-slider-thumb {
        background: ${this.prompt.color};
      }
      .weight-slider::-moz-range-thumb {
        background: ${this.prompt.color};
      }
    `;
        const pillClasses = {
            'prompt-pill': true,
            expanded: this.isExpanded,
            disabled: !this.prompt.enabled,
        };
        return html `
      <style>
        ${sliderThumbStyle}
      </style>
      <div
        class=${classMap(pillClasses)}
        style=${styleMap(pillStyles)}
        @click=${this.handleClick}
      >
        <button
          class="toggle-btn"
          @click=${this.handleToggleEnabled}
          title=${this.prompt.enabled ? 'Disable' : 'Enable'}
        >
          ${this.prompt.enabled ? '●' : '○'}
        </button>

        <span class="prompt-text" title=${this.prompt.text}>
          ${this.prompt.text}
        </span>

        ${!this.isExpanded
            ? html `
              <span class="weight-badge">${this.prompt.weight.toFixed(1)}</span>
            `
            : null}

        <button
          class="remove-btn"
          @click=${this.handleRemove}
          title="Remove prompt"
        >
          ×
        </button>

        ${this.isExpanded
            ? html `
              <div class="expanded-content" @click=${(e) => e.stopPropagation()}>
                <div class="slider-container">
                  <input
                    type="range"
                    class="weight-slider"
                    min=${UI_CONFIG.MIN_WEIGHT}
                    max=${UI_CONFIG.MAX_WEIGHT}
                    step=${UI_CONFIG.WEIGHT_STEP}
                    .value=${String(this.prompt.weight)}
                    @input=${this.handleWeightChange}
                  />
                  <span class="weight-value">${this.prompt.weight.toFixed(1)}</span>
                </div>
              </div>
            `
            : null}
      </div>
    `;
    }
};
__decorate([
    property({ type: Object })
], PromptController.prototype, "prompt", void 0);
__decorate([
    state()
], PromptController.prototype, "isExpanded", void 0);
PromptController = __decorate([
    customElement('prompt-controller')
], PromptController);
export { PromptController };
//# sourceMappingURL=prompt-controller.js.map