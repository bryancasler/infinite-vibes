/**
 * Inspiration Service
 * Manages inspiration presets and random prompt generation
 */
import type { InspirationPreset, Prompt, GenerationSettings } from '../types.js';
/**
 * Service for inspiration presets and random prompt generation
 */
export declare class InspirationService {
    private static instance;
    private presets;
    private constructor();
    /**
     * Gets the singleton instance
     */
    static getInstance(): InspirationService;
    /**
     * Gets all available presets
     */
    getPresets(): InspirationPreset[];
    /**
     * Gets a preset by ID
     */
    getPreset(id: string): InspirationPreset | null;
    /**
     * Applies a preset and returns prompts and settings
     */
    applyPreset(presetId: string): {
        prompts: Prompt[];
        settings: GenerationSettings;
    } | null;
    /**
     * Gets a random preset
     */
    getRandomPreset(): InspirationPreset;
    /**
     * Generates a random prompt
     */
    generateRandomPrompt(existingColors?: string[]): Prompt;
    /**
     * Generates a complement prompt based on existing prompts
     */
    generateComplementPrompt(existingPrompts: Prompt[], existingColors?: string[]): Prompt;
    /**
     * Adds a custom preset
     */
    addPreset(preset: InspirationPreset): void;
    /**
     * Removes a preset by ID
     */
    removePreset(id: string): boolean;
    /**
     * Creates a preset from current prompts
     */
    createPresetFromPrompts(name: string, description: string, prompts: Prompt[], settings?: Partial<GenerationSettings>): InspirationPreset;
}
export declare const getInspirationService: () => InspirationService;
//# sourceMappingURL=inspiration-service.d.ts.map