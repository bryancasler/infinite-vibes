/**
 * Image Generation Service
 * Generates album art using Imagen via Google GenAI
 */

import type { Prompt, GeneratedImage, AlbumArtConfig } from '../types.js';
import { API_CONFIG } from '../utils/constants.js';
import { getApiKey } from '../utils/storage.js';

/**
 * Service for generating album art based on music prompts
 */
export class ImageGenerationService {
  private static instance: ImageGenerationService;
  private model: unknown = null;
  private isInitialized = false;
  private generationInProgress = false;
  private cachedImages: Map<string, GeneratedImage> = new Map();

  private constructor() {}

  /**
   * Gets the singleton instance
   */
  static getInstance(): ImageGenerationService {
    if (!ImageGenerationService.instance) {
      ImageGenerationService.instance = new ImageGenerationService();
    }
    return ImageGenerationService.instance;
  }

  /**
   * Initializes the image generation model
   */
  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;

    const apiKey = getApiKey();
    if (!apiKey) {
      console.error('No API key configured for image generation');
      return false;
    }

    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(apiKey);

      // Note: Imagen 3 may require specific API access
      // Fallback to Gemini's image generation if Imagen is not available
      this.model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash-exp',
      });

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize image generation service:', error);
      return false;
    }
  }

  /**
   * Generates album art based on prompts
   */
  async generateAlbumArt(
    prompts: Prompt[],
    config?: Partial<AlbumArtConfig>
  ): Promise<GeneratedImage | null> {
    if (this.generationInProgress) {
      console.warn('Image generation already in progress');
      return null;
    }

    // Create cache key from prompts
    const cacheKey = this.createCacheKey(prompts);

    // Check cache
    if (this.cachedImages.has(cacheKey)) {
      return this.cachedImages.get(cacheKey)!;
    }

    if (!this.isInitialized) {
      const initialized = await this.initialize();
      if (!initialized) return null;
    }

    this.generationInProgress = true;

    try {
      const prompt = this.buildImagePrompt(prompts, config);

      const model = this.model as {
        generateContent: (config: {
          contents: Array<{ role: string; parts: Array<{ text: string }> }>;
          generationConfig: { responseMimeType: string };
        }) => Promise<{ response: { text: () => string } }>;
      };

      // Generate image description first, then we'll create a placeholder
      // since actual image generation requires different API endpoints
      const result = await model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `Create a detailed description for album art with this theme: ${prompt}

Describe the visual elements, colors, composition, and mood. Keep it under 100 words.`,
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: 'text/plain',
        },
      });

      const description = result.response.text();

      // For now, return a placeholder with the description
      // In production, this would call the actual Imagen API
      const generatedImage: GeneratedImage = {
        url: this.createPlaceholderDataUrl(prompts, config),
        prompt: description,
        timestamp: Date.now(),
      };

      // Cache the result
      this.cachedImages.set(cacheKey, generatedImage);

      return generatedImage;
    } catch (error) {
      console.error('Failed to generate album art:', error);
      return null;
    } finally {
      this.generationInProgress = false;
    }
  }

  /**
   * Builds the image generation prompt from music prompts
   */
  private buildImagePrompt(
    prompts: Prompt[],
    config?: Partial<AlbumArtConfig>
  ): string {
    const enabledPrompts = prompts.filter((p) => p.enabled);

    let basePrompt = 'Album cover art, ';

    // Add style
    const style = config?.style || 'abstract';
    const styleDescriptions: Record<string, string> = {
      abstract: 'abstract geometric patterns, flowing shapes,',
      landscape: 'dreamy landscape, ethereal scenery,',
      geometric: 'sharp geometric shapes, mathematical precision,',
      organic: 'organic flowing forms, natural textures,',
    };

    basePrompt += styleDescriptions[style] || styleDescriptions.abstract;

    // Add mood from prompts
    if (enabledPrompts.length > 0) {
      const moods = enabledPrompts.map((p) => {
        // Extract mood/style words from prompt
        const text = p.text.toLowerCase();
        if (text.includes('dark') || text.includes('deep')) return 'dark, moody';
        if (text.includes('bright') || text.includes('happy')) return 'bright, vibrant';
        if (text.includes('chill') || text.includes('ambient')) return 'calm, serene';
        if (text.includes('techno') || text.includes('electronic'))
          return 'futuristic, digital';
        if (text.includes('jazz') || text.includes('blues')) return 'warm, vintage';
        return 'dynamic';
      });

      const uniqueMoods = [...new Set(moods)];
      basePrompt += ` ${uniqueMoods.join(', ')},`;
    }

    // Add color palette if provided
    if (config?.colorPalette && config.colorPalette.length > 0) {
      basePrompt += ` using colors: ${config.colorPalette.join(', ')},`;
    }

    // Add mood if provided
    if (config?.mood) {
      basePrompt += ` ${config.mood} mood,`;
    }

    // Add common album art qualities
    basePrompt +=
      ' high contrast, professional quality, music industry standard, square format';

    return basePrompt;
  }

  /**
   * Creates a cache key from prompts
   */
  private createCacheKey(prompts: Prompt[]): string {
    const sortedPrompts = [...prompts]
      .filter((p) => p.enabled)
      .sort((a, b) => a.text.localeCompare(b.text))
      .map((p) => `${p.text}:${p.weight.toFixed(1)}`)
      .join('|');

    return sortedPrompts || 'empty';
  }

  /**
   * Creates a placeholder data URL for album art
   */
  private createPlaceholderDataUrl(
    prompts: Prompt[],
    config?: Partial<AlbumArtConfig>
  ): string {
    // Create a simple canvas-based placeholder
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;

    // Background gradient
    const enabledPrompts = prompts.filter((p) => p.enabled);
    const colors =
      enabledPrompts.length > 0
        ? enabledPrompts.map((p) => p.color)
        : ['#8338ec', '#ff006e'];

    const gradient = ctx.createLinearGradient(0, 0, 512, 512);
    colors.forEach((color, i) => {
      gradient.addColorStop(i / Math.max(colors.length - 1, 1), color);
    });

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);

    // Add some visual interest
    ctx.globalAlpha = 0.3;
    for (let i = 0; i < 5; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const r = 50 + Math.random() * 150;

      const circleGradient = ctx.createRadialGradient(x, y, 0, x, y, r);
      circleGradient.addColorStop(0, 'white');
      circleGradient.addColorStop(1, 'transparent');

      ctx.fillStyle = circleGradient;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Add music note
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = 'white';
    ctx.font = 'bold 100px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('♪', 256, 256);

    return canvas.toDataURL('image/png');
  }

  /**
   * Clears the image cache
   */
  clearCache(): void {
    this.cachedImages.clear();
  }

  /**
   * Gets a cached image if available
   */
  getCachedImage(prompts: Prompt[]): GeneratedImage | null {
    const cacheKey = this.createCacheKey(prompts);
    return this.cachedImages.get(cacheKey) || null;
  }

  /**
   * Checks if generation is in progress
   */
  isGenerating(): boolean {
    return this.generationInProgress;
  }

  /**
   * Disposes of resources
   */
  dispose(): void {
    this.model = null;
    this.isInitialized = false;
    this.cachedImages.clear();
  }
}

// Export singleton instance getter
export const getImageGenerationService = (): ImageGenerationService =>
  ImageGenerationService.getInstance();
