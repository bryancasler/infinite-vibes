/**
 * Image Generation Service
 * Generates album art using Imagen via Google GenAI
 */
import type { Prompt, GeneratedImage, AlbumArtConfig } from '../types.js';
/**
 * Service for generating album art based on music prompts
 */
export declare class ImageGenerationService {
    private static instance;
    private model;
    private isInitialized;
    private generationInProgress;
    private cachedImages;
    private constructor();
    /**
     * Gets the singleton instance
     */
    static getInstance(): ImageGenerationService;
    /**
     * Initializes the image generation model
     */
    initialize(): Promise<boolean>;
    /**
     * Generates album art based on prompts
     */
    generateAlbumArt(prompts: Prompt[], config?: Partial<AlbumArtConfig>): Promise<GeneratedImage | null>;
    /**
     * Builds the image generation prompt from music prompts
     */
    private buildImagePrompt;
    /**
     * Creates a cache key from prompts
     */
    private createCacheKey;
    /**
     * Creates a placeholder data URL for album art
     */
    private createPlaceholderDataUrl;
    /**
     * Clears the image cache
     */
    clearCache(): void;
    /**
     * Gets a cached image if available
     */
    getCachedImage(prompts: Prompt[]): GeneratedImage | null;
    /**
     * Checks if generation is in progress
     */
    isGenerating(): boolean;
    /**
     * Disposes of resources
     */
    dispose(): void;
}
export declare const getImageGenerationService: () => ImageGenerationService;
//# sourceMappingURL=image-generation-service.d.ts.map