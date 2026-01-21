/**
 * Visualizer Canvas Component
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html, css } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { getVisualizerService } from '../services/visualizer-service.js';
let VisualizerCanvas = class VisualizerCanvas extends LitElement {
    constructor() {
        super(...arguments);
        this.config = null;
        this.visualizerService = getVisualizerService();
        this.resizeObserver = null;
    }
    static { this.styles = css `
    :host {
      display: block;
      width: 100%;
      height: 100%;
      position: absolute;
      inset: 0;
    }

    canvas {
      width: 100%;
      height: 100%;
      display: block;
    }
  `; }
    firstUpdated() {
        if (this.canvas) {
            this.visualizerService.setCanvas(this.canvas);
            // Handle resize
            this.resizeObserver = new ResizeObserver(() => {
                this.visualizerService.handleResize();
            });
            this.resizeObserver.observe(this.canvas);
        }
    }
    updated(changedProperties) {
        if (changedProperties.has('config') && this.config) {
            this.visualizerService.setConfig(this.config);
        }
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
            this.resizeObserver = null;
        }
    }
    render() {
        return html `<canvas></canvas>`;
    }
};
__decorate([
    property({ type: Object })
], VisualizerCanvas.prototype, "config", void 0);
__decorate([
    query('canvas')
], VisualizerCanvas.prototype, "canvas", void 0);
VisualizerCanvas = __decorate([
    customElement('visualizer-canvas')
], VisualizerCanvas);
export { VisualizerCanvas };
//# sourceMappingURL=visualizer-canvas.js.map