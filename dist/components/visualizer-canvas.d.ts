/**
 * Visualizer Canvas Component
 */
import { LitElement } from 'lit';
import type { VisualizerConfig } from '../types.js';
export declare class VisualizerCanvas extends LitElement {
    static styles: import("lit").CSSResult;
    config: VisualizerConfig | null;
    private canvas;
    private visualizerService;
    private resizeObserver;
    firstUpdated(): void;
    updated(changedProperties: Map<string, unknown>): void;
    disconnectedCallback(): void;
    render(): import("lit-html").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'visualizer-canvas': VisualizerCanvas;
    }
}
//# sourceMappingURL=visualizer-canvas.d.ts.map