/**
 * Chat Conductor Component
 * Natural language interface for controlling the music
 */
import { LitElement } from 'lit';
export declare class ChatConductor extends LitElement {
    static styles: import("lit").CSSResult;
    private messages;
    private inputValue;
    private isLoading;
    private suggestions;
    private messagesContainer;
    private chatInput;
    private orchestrator;
    connectedCallback(): void;
    disconnectedCallback(): void;
    private handleChatMessage;
    private scrollToBottom;
    private handleSend;
    private handleKeydown;
    private handleSuggestionClick;
    private handleRestoreSnapshot;
    private handleClearChat;
    private handleClosePanel;
    private formatTime;
    render(): import("lit-html").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'chat-conductor': ChatConductor;
    }
}
//# sourceMappingURL=chat-conductor.d.ts.map