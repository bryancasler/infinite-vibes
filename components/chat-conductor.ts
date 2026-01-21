/**
 * Chat Conductor Component
 * Natural language interface for controlling the music
 */

import { LitElement, html, css } from 'lit';
import { customElement, state, query } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

import type { ChatMessage, PromptSnapshot } from '../types.js';
import { getOrchestrator, type OrchestratorEvent } from '../core/prompt-dj-orchestrator.js';

@customElement('chat-conductor')
export class ChatConductor extends LitElement {
  static override styles = css`
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

    .header-actions {
      display: flex;
      gap: 0.5rem;
    }

    .header-btn {
      background: none;
      border: none;
      color: rgba(255, 255, 255, 0.7);
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 6px;
      transition: all 0.2s;
    }

    .header-btn:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
    }

    .messages-container {
      flex: 1;
      overflow-y: auto;
      padding: 1rem;
    }

    .message {
      margin-bottom: 1rem;
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .message.user {
      text-align: right;
    }

    .message.assistant {
      text-align: left;
    }

    .message-content {
      display: inline-block;
      max-width: 85%;
      padding: 0.75rem 1rem;
      border-radius: 16px;
      font-size: 0.9rem;
      line-height: 1.5;
    }

    .message.user .message-content {
      background: linear-gradient(135deg, #8338ec, #ff006e);
      border-bottom-right-radius: 4px;
    }

    .message.assistant .message-content {
      background: rgba(255, 255, 255, 0.1);
      border-bottom-left-radius: 4px;
    }

    .message-time {
      font-size: 0.7rem;
      opacity: 0.5;
      margin-top: 0.25rem;
    }

    /* Snapshot badge */
    .snapshot-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      margin-top: 0.5rem;
      padding: 0.375rem 0.75rem;
      background: rgba(6, 255, 165, 0.2);
      border: 1px solid rgba(6, 255, 165, 0.3);
      border-radius: 20px;
      font-size: 0.75rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .snapshot-badge:hover {
      background: rgba(6, 255, 165, 0.3);
    }

    /* Input area */
    .input-container {
      padding: 1rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .input-wrapper {
      display: flex;
      gap: 0.5rem;
    }

    .chat-input {
      flex: 1;
      padding: 0.75rem 1rem;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 24px;
      color: #fff;
      font-size: 0.9rem;
      outline: none;
      transition: border-color 0.2s;
    }

    .chat-input:focus {
      border-color: #8338ec;
    }

    .chat-input::placeholder {
      color: rgba(255, 255, 255, 0.5);
    }

    .send-btn {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      border: none;
      background: linear-gradient(135deg, #8338ec, #ff006e);
      color: #fff;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      transition: transform 0.2s;
    }

    .send-btn:hover {
      transform: scale(1.05);
    }

    .send-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    /* Suggestions */
    .suggestions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      padding: 0.75rem 1rem 0;
    }

    .suggestion-chip {
      padding: 0.375rem 0.75rem;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 20px;
      font-size: 0.75rem;
      cursor: pointer;
      transition: all 0.2s;
    }

    .suggestion-chip:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    /* Empty state */
    .empty-state {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 2rem;
      color: rgba(255, 255, 255, 0.5);
    }

    .empty-state h3 {
      margin: 0 0 0.5rem;
      font-size: 1.25rem;
      color: #fff;
    }

    .empty-state p {
      margin: 0 0 1rem;
      font-size: 0.9rem;
    }
  `;

  @state() private messages: ChatMessage[] = [];
  @state() private inputValue = '';
  @state() private isLoading = false;
  @state() private suggestions: string[] = [
    'Make it more energetic',
    'Add some jazz',
    'Drop the bass',
    'Make it calmer',
  ];

  @query('.messages-container') private messagesContainer!: HTMLDivElement;
  @query('.chat-input') private chatInput!: HTMLInputElement;

  private orchestrator = getOrchestrator();

  override connectedCallback(): void {
    super.connectedCallback();
    this.messages = this.orchestrator.getChatHistory();
    this.orchestrator.on('chat-message', this.handleChatMessage);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.orchestrator.off('chat-message', this.handleChatMessage);
  }

  private handleChatMessage = (event: OrchestratorEvent): void => {
    const data = event.data as { message?: ChatMessage; cleared?: boolean };

    if (data.cleared) {
      this.messages = [];
    } else if (data.message) {
      this.messages = [...this.messages, data.message];
      this.isLoading = data.message.role === 'user';

      // Scroll to bottom after render
      this.updateComplete.then(() => {
        this.scrollToBottom();
      });
    }
  };

  private scrollToBottom(): void {
    if (this.messagesContainer) {
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
  }

  private async handleSend(): Promise<void> {
    const message = this.inputValue.trim();
    if (!message || this.isLoading) return;

    this.inputValue = '';
    this.isLoading = true;

    try {
      await this.orchestrator.sendChatMessage(message);
    } finally {
      this.isLoading = false;
    }
  }

  private handleKeydown(e: KeyboardEvent): void {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.handleSend();
    }
  }

  private handleSuggestionClick(suggestion: string): void {
    this.inputValue = suggestion;
    this.chatInput?.focus();
  }

  private handleRestoreSnapshot(snapshot: PromptSnapshot): void {
    this.orchestrator.restoreSnapshot(snapshot.id);
  }

  private handleClearChat(): void {
    this.orchestrator.clearChatHistory();
  }

  private handleClosePanel(): void {
    this.orchestrator.updateUIState({ showChat: false });
  }

  private formatTime(timestamp: number): string {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  override render() {
    return html`
      <div class="header">
        <h2>
          <span>🎵</span>
          The Conductor
        </h2>
        <div class="header-actions">
          <button
            class="header-btn"
            @click=${this.handleClearChat}
            title="Clear chat"
          >
            🗑️
          </button>
          <button
            class="header-btn"
            @click=${this.handleClosePanel}
            title="Close"
          >
            ✕
          </button>
        </div>
      </div>

      ${this.messages.length === 0
        ? html`
            <div class="empty-state">
              <h3>Welcome to The Conductor</h3>
              <p>
                Tell me how you want the music to change using natural language.
                Try something like:
              </p>
              <div class="suggestions">
                ${this.suggestions.map(
                  (s) => html`
                    <button
                      class="suggestion-chip"
                      @click=${() => this.handleSuggestionClick(s)}
                    >
                      ${s}
                    </button>
                  `
                )}
              </div>
            </div>
          `
        : html`
            <div class="messages-container">
              ${this.messages.map(
                (msg) => html`
                  <div class="message ${msg.role}">
                    <div class="message-content">${msg.content}</div>
                    ${msg.snapshot
                      ? html`
                          <div
                            class="snapshot-badge"
                            @click=${() =>
                              this.handleRestoreSnapshot(msg.snapshot!)}
                          >
                            📸 Restore this vibe
                          </div>
                        `
                      : null}
                    <div class="message-time">${this.formatTime(msg.timestamp)}</div>
                  </div>
                `
              )}
            </div>
          `}

      <div class="input-container">
        ${this.messages.length > 0
          ? html`
              <div class="suggestions">
                ${this.suggestions.map(
                  (s) => html`
                    <button
                      class="suggestion-chip"
                      @click=${() => this.handleSuggestionClick(s)}
                    >
                      ${s}
                    </button>
                  `
                )}
              </div>
            `
          : null}
        <div class="input-wrapper">
          <input
            class="chat-input"
            type="text"
            placeholder="Tell me how to change the music..."
            .value=${this.inputValue}
            @input=${(e: InputEvent) =>
              (this.inputValue = (e.target as HTMLInputElement).value)}
            @keydown=${this.handleKeydown}
            ?disabled=${this.isLoading}
          />
          <button
            class="send-btn"
            @click=${this.handleSend}
            ?disabled=${!this.inputValue.trim() || this.isLoading}
          >
            ${this.isLoading ? '⏳' : '→'}
          </button>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'chat-conductor': ChatConductor;
  }
}
