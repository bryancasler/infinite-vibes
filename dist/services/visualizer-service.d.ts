/**
 * Visualizer Service
 * Renders real-time audio visualizations on Canvas
 */
import type { VisualizationMode, VisualizerConfig } from '../types.js';
/**
 * Singleton Visualizer Service
 */
export declare class VisualizerService {
    private static instance;
    private canvas;
    private ctx;
    private config;
    private animationId;
    private isRunning;
    private strategies;
    private currentStrategy;
    private constructor();
    /**
     * Gets the singleton instance
     */
    static getInstance(): VisualizerService;
    /**
     * Sets the canvas element
     */
    setCanvas(canvas: HTMLCanvasElement): void;
    /**
     * Handles canvas resize
     */
    handleResize(): void;
    /**
     * Gets current configuration
     */
    getConfig(): VisualizerConfig;
    /**
     * Updates configuration
     */
    setConfig(config: Partial<VisualizerConfig>): void;
    /**
     * Starts the visualization loop
     */
    start(): void;
    /**
     * Stops the visualization loop
     */
    stop(): void;
    /**
     * Main render loop
     */
    private render;
    /**
     * Sets the visualization mode
     */
    setMode(mode: VisualizationMode): void;
    /**
     * Gets available visualization modes
     */
    getAvailableModes(): VisualizationMode[];
    /**
     * Clears the canvas
     */
    clear(): void;
    /**
     * Disposes of resources
     */
    dispose(): void;
}
export declare const getVisualizerService: () => VisualizerService;
//# sourceMappingURL=visualizer-service.d.ts.map