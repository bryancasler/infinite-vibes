/**
 * Settings Dialog Component
 * Controls for generation parameters and visualizer
 */
import { LitElement } from 'lit';
import type { GenerationSettings, VisualizerConfig } from '../types.js';
export declare class SettingsDialog extends LitElement {
    static styles: import("lit").CSSResult;
    settings: GenerationSettings | null;
    visualizerConfig: VisualizerConfig | null;
    private apiKey;
    private showApiKey;
    private orchestrator;
    private visualizerService;
    connectedCallback(): void;
    private handleClosePanel;
    private handleSettingChange;
    private handleVisualizerChange;
    private handleResetSettings;
    private handleSaveApiKey;
    private getVisualizationModes;
    render(): import("lit-html").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'settings-dialog': SettingsDialog;
    }
}
//# sourceMappingURL=settings-dialog.d.ts.map