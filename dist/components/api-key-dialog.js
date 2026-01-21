/**
 * API Key Dialog Component
 * Initial setup dialog for API key configuration
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';
let ApiKeyDialog = class ApiKeyDialog extends LitElement {
    constructor() {
        super(...arguments);
        this.apiKey = '';
        this.showKey = false;
        this.error = '';
    }
    static { this.styles = css `
    :host {
      display: block;
    }

    .overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.9);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }

    .dialog {
      background: linear-gradient(
        135deg,
        rgba(30, 30, 50, 0.95),
        rgba(20, 20, 35, 0.98)
      );
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 24px;
      padding: 2.5rem;
      max-width: 480px;
      width: 100%;
      animation: slideUp 0.3s ease;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .logo {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }

    .logo-icon {
      width: 56px;
      height: 56px;
      background: linear-gradient(135deg, #ff006e, #8338ec);
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
    }

    .logo-text {
      font-size: 1.75rem;
      font-weight: 700;
      background: linear-gradient(135deg, #ff006e, #8338ec, #3a86ff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    h2 {
      margin: 0 0 0.5rem;
      font-size: 1.5rem;
      font-weight: 600;
      text-align: center;
    }

    .subtitle {
      text-align: center;
      color: rgba(255, 255, 255, 0.6);
      margin-bottom: 2rem;
      font-size: 0.9rem;
      line-height: 1.5;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    label {
      display: block;
      font-size: 0.875rem;
      color: rgba(255, 255, 255, 0.7);
      margin-bottom: 0.5rem;
    }

    .input-wrapper {
      position: relative;
    }

    input {
      width: 100%;
      padding: 0.875rem 1rem;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      color: #fff;
      font-size: 1rem;
      outline: none;
      transition: all 0.2s;
      box-sizing: border-box;
    }

    input:focus {
      border-color: #8338ec;
      box-shadow: 0 0 0 3px rgba(131, 56, 236, 0.2);
    }

    input::placeholder {
      color: rgba(255, 255, 255, 0.4);
    }

    .toggle-visibility {
      position: absolute;
      right: 1rem;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: rgba(255, 255, 255, 0.5);
      cursor: pointer;
      font-size: 1rem;
      padding: 0;
    }

    .toggle-visibility:hover {
      color: #fff;
    }

    .error-message {
      color: #ff006e;
      font-size: 0.8rem;
      margin-top: 0.5rem;
    }

    .help-text {
      font-size: 0.8rem;
      color: rgba(255, 255, 255, 0.5);
      margin-top: 0.5rem;
    }

    .help-text a {
      color: #8338ec;
      text-decoration: none;
    }

    .help-text a:hover {
      text-decoration: underline;
    }

    .submit-btn {
      width: 100%;
      padding: 1rem;
      background: linear-gradient(135deg, #8338ec, #ff006e);
      border: none;
      border-radius: 12px;
      color: #fff;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .submit-btn:hover {
      transform: scale(1.02);
      box-shadow: 0 4px 20px rgba(131, 56, 236, 0.4);
    }

    .submit-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }

    .features {
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .features-title {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: rgba(255, 255, 255, 0.5);
      margin-bottom: 1rem;
      text-align: center;
    }

    .features-list {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.75rem;
    }

    .feature-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.8rem;
      color: rgba(255, 255, 255, 0.7);
    }

    .feature-icon {
      width: 24px;
      height: 24px;
      background: rgba(131, 56, 236, 0.2);
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
    }
  `; }
    handleSubmit() {
        if (!this.apiKey.trim()) {
            this.error = 'Please enter your API key';
            return;
        }
        // Basic validation
        if (this.apiKey.length < 20) {
            this.error = 'This doesn\'t look like a valid API key';
            return;
        }
        // Save to localStorage
        localStorage.setItem('infinite-vibes-api-key', this.apiKey.trim());
        // Dispatch event
        this.dispatchEvent(new CustomEvent('api-key-saved', {
            bubbles: true,
            composed: true,
        }));
    }
    handleKeydown(e) {
        if (e.key === 'Enter') {
            this.handleSubmit();
        }
    }
    render() {
        return html `
      <div class="overlay">
        <div class="dialog">
          <div class="logo">
            <div class="logo-icon">♪</div>
            <span class="logo-text">Infinite Vibes</span>
          </div>

          <h2>Welcome to the DJ</h2>
          <p class="subtitle">
            Enter your Google AI API key to start generating unlimited
            AI-powered music mixes.
          </p>

          <div class="form-group">
            <label for="api-key">Google AI API Key</label>
            <div class="input-wrapper">
              <input
                id="api-key"
                type="${this.showKey ? 'text' : 'password'}"
                placeholder="AIza..."
                .value=${this.apiKey}
                @input=${(e) => (this.apiKey = e.target.value)}
                @keydown=${this.handleKeydown}
              />
              <button
                class="toggle-visibility"
                @click=${() => (this.showKey = !this.showKey)}
                type="button"
              >
                ${this.showKey ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            ${this.error
            ? html `<div class="error-message">${this.error}</div>`
            : null}
            <p class="help-text">
              Get your API key from
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noopener"
                >Google AI Studio</a
              >
            </p>
          </div>

          <button
            class="submit-btn"
            @click=${this.handleSubmit}
            ?disabled=${!this.apiKey.trim()}
          >
            Start Creating Music
          </button>

          <div class="features">
            <div class="features-title">What you'll get</div>
            <div class="features-list">
              <div class="feature-item">
                <span class="feature-icon">🎵</span>
                <span>AI-generated music</span>
              </div>
              <div class="feature-item">
                <span class="feature-icon">🎨</span>
                <span>Dynamic visuals</span>
              </div>
              <div class="feature-item">
                <span class="feature-icon">🎚️</span>
                <span>Live mixing controls</span>
              </div>
              <div class="feature-item">
                <span class="feature-icon">💬</span>
                <span>Natural language control</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    }
};
__decorate([
    state()
], ApiKeyDialog.prototype, "apiKey", void 0);
__decorate([
    state()
], ApiKeyDialog.prototype, "showKey", void 0);
__decorate([
    state()
], ApiKeyDialog.prototype, "error", void 0);
ApiKeyDialog = __decorate([
    customElement('api-key-dialog')
], ApiKeyDialog);
export { ApiKeyDialog };
//# sourceMappingURL=api-key-dialog.js.map