/**
 * Prompt DJ - Main Container Component
 */
import { LitElement } from 'lit';
import './visualizer-canvas.js';
import './prompt-controller.js';
import './playback-controls.js';
import './chat-conductor.js';
import './settings-dialog.js';
import './inspiration-panel.js';
import './api-key-dialog.js';
export declare class PromptDJ extends LitElement {
    static styles: import("lit").CSSResult;
    private prompts;
    private playbackState;
    private apiConnected;
    private uiState;
    private settings;
    private visualizerConfig;
    private showAddPromptDialog;
    private showApiKeyDialog;
    private newPromptText;
    private addPromptInput;
    private orchestrator;
    connectedCallback(): void;
    disconnectedCallback(): void;
    private checkApiKey;
    private handlePromptsChanged;
    private handlePlaybackChanged;
    private handleConnectionChanged;
    private handleUIStateChanged;
    private handleSettingsChanged;
    private handleVisualizerChanged;
    private handleError;
    private handleToggleChat;
    private handleToggleSettings;
    private handleToggleInspiration;
    private handleClosePanel;
    private handleShowAddPrompt;
    private handleAddPrompt;
    private handleAddPromptKeydown;
    private handleAddRandomPrompt;
    private handlePromptUpdate;
    private handlePromptRemove;
    private handleApiKeySaved;
    private getConnectionStatus;
    private getConnectionClass;
    render(): import("lit-html").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'prompt-dj': PromptDJ;
    }
}
//# sourceMappingURL=prompt-dj.d.ts.map