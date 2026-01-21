/**
 * Visualizer Canvas Component
 */

import { LitElement, html, css } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';

import type { VisualizerConfig } from '../types.js';
import { getVisualizerService } from '../services/visualizer-service.js';

@customElement('visualizer-canvas')
export class VisualizerCanvas extends LitElement {
  static override styles = css`
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
  `;

  @property({ type: Object }) config: VisualizerConfig | null = null;
  @query('canvas') private canvas!: HTMLCanvasElement;

  private visualizerService = getVisualizerService();
  private resizeObserver: ResizeObserver | null = null;

  override firstUpdated(): void {
    if (this.canvas) {
      this.visualizerService.setCanvas(this.canvas);

      // Handle resize
      this.resizeObserver = new ResizeObserver(() => {
        this.visualizerService.handleResize();
      });
      this.resizeObserver.observe(this.canvas);
    }
  }

  override updated(changedProperties: Map<string, unknown>): void {
    if (changedProperties.has('config') && this.config) {
      this.visualizerService.setConfig(this.config);
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
  }

  override render() {
    return html`<canvas></canvas>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'visualizer-canvas': VisualizerCanvas;
  }
}
