/**
 * Prompt Controller Component
 * Individual prompt pill with weight slider
 */
import { LitElement } from 'lit';
import type { Prompt } from '../types.js';
export declare class PromptController extends LitElement {
    static styles: import("lit").CSSResult;
    prompt: Prompt;
    private isExpanded;
    private handleClick;
    private handleToggleEnabled;
    private handleWeightChange;
    private handleRemove;
    render(): import("lit-html").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'prompt-controller': PromptController;
    }
}
//# sourceMappingURL=prompt-controller.d.ts.map