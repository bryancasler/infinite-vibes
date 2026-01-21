/**
 * Inspiration Panel Component
 * Browse and apply preset vibes
 */
import { LitElement } from 'lit';
export declare class InspirationPanel extends LitElement {
    static styles: import("lit").CSSResult;
    private presets;
    private orchestrator;
    private inspirationService;
    connectedCallback(): void;
    private handleClosePanel;
    private handleApplyPreset;
    private handleAddRandom;
    private handleAddComplement;
    private handleRandomPreset;
    render(): import("lit-html").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'inspiration-panel': InspirationPanel;
    }
}
//# sourceMappingURL=inspiration-panel.d.ts.map