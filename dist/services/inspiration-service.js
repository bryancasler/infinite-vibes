/**
 * Inspiration Service
 * Manages inspiration presets and random prompt generation
 */
import { INSPIRATION_PRESETS, DEFAULT_GENERATION_SETTINGS } from '../utils/constants.js';
import { getUniqueColor } from '../utils/color.js';
/**
 * Generates a unique ID
 */
function generateId() {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
/**
 * Service for inspiration presets and random prompt generation
 */
export class InspirationService {
    constructor() {
        this.presets = [...INSPIRATION_PRESETS];
    }
    /**
     * Gets the singleton instance
     */
    static getInstance() {
        if (!InspirationService.instance) {
            InspirationService.instance = new InspirationService();
        }
        return InspirationService.instance;
    }
    /**
     * Gets all available presets
     */
    getPresets() {
        return [...this.presets];
    }
    /**
     * Gets a preset by ID
     */
    getPreset(id) {
        return this.presets.find((p) => p.id === id) || null;
    }
    /**
     * Applies a preset and returns prompts and settings
     */
    applyPreset(presetId) {
        const preset = this.getPreset(presetId);
        if (!preset) {
            return null;
        }
        const prompts = preset.prompts.map((p) => ({
            id: generateId(),
            text: p.text,
            weight: p.weight,
            color: p.color,
            enabled: p.enabled,
            createdAt: Date.now(),
        }));
        const settings = {
            ...DEFAULT_GENERATION_SETTINGS,
            ...preset.settings,
        };
        return { prompts, settings };
    }
    /**
     * Gets a random preset
     */
    getRandomPreset() {
        const index = Math.floor(Math.random() * this.presets.length);
        return this.presets[index];
    }
    /**
     * Generates a random prompt
     */
    generateRandomPrompt(existingColors = []) {
        const prompts = [
            // Drums & Percussion
            'Punchy kick drum',
            'Crisp hi-hats',
            'Rolling snare',
            'Tribal percussion',
            'Breakbeat patterns',
            '808 bass hits',
            'Claps and snaps',
            'Shaker rhythm',
            // Bass
            'Deep sub bass',
            'Funky bass groove',
            'Acid bassline',
            'Wobbly dubstep bass',
            'Smooth upright bass',
            'Synth bass pulse',
            'Reese bass',
            // Melodic Elements
            'Ethereal pad textures',
            'Bright synth arpeggios',
            'Warm analog chords',
            'Plucky synth melody',
            'Dreamy piano keys',
            'Glitchy lead sounds',
            'Choir vocal textures',
            'Bell-like tones',
            // Atmosphere
            'Ambient drone',
            'Rain and thunder',
            'Vinyl crackle noise',
            'Space reverb wash',
            'Wind sounds',
            'Ocean waves',
            'City ambience',
            'Forest sounds',
            // Style modifiers
            'Lo-fi warmth',
            'Crisp and bright',
            'Dark and moody',
            'Uplifting energy',
            'Minimal and sparse',
            'Dense and layered',
            'Retro 80s vibe',
            'Modern electronic',
        ];
        const text = prompts[Math.floor(Math.random() * prompts.length)];
        const weight = 0.5 + Math.random() * 1.0; // Random weight between 0.5 and 1.5
        return {
            id: generateId(),
            text,
            weight: Math.round(weight * 10) / 10, // Round to 1 decimal
            color: getUniqueColor(existingColors),
            enabled: true,
            createdAt: Date.now(),
        };
    }
    /**
     * Generates a complement prompt based on existing prompts
     */
    generateComplementPrompt(existingPrompts, existingColors = []) {
        // Analyze existing prompts
        const existingTexts = existingPrompts.map((p) => p.text.toLowerCase());
        const hasBass = existingTexts.some((t) => t.includes('bass') || t.includes('sub'));
        const hasDrums = existingTexts.some((t) => t.includes('drum') ||
            t.includes('kick') ||
            t.includes('hi-hat') ||
            t.includes('snare'));
        const hasMelody = existingTexts.some((t) => t.includes('melody') ||
            t.includes('synth') ||
            t.includes('piano') ||
            t.includes('arpeggio'));
        const hasAtmosphere = existingTexts.some((t) => t.includes('ambient') ||
            t.includes('pad') ||
            t.includes('atmosphere') ||
            t.includes('drone'));
        // Determine what's missing
        const suggestions = [];
        if (!hasBass) {
            suggestions.push('Deep sub bass', 'Smooth bass groove', 'Punchy bass hits');
        }
        if (!hasDrums) {
            suggestions.push('Tight drum groove', 'Crisp percussion', 'Rhythmic patterns');
        }
        if (!hasMelody) {
            suggestions.push('Sparkling melody', 'Synth lead line', 'Melodic hooks');
        }
        if (!hasAtmosphere) {
            suggestions.push('Atmospheric textures', 'Ambient wash', 'Background pads');
        }
        // If nothing specific is missing, add general enhancements
        if (suggestions.length === 0) {
            suggestions.push('Extra sparkle and shine', 'Subtle variation', 'Dynamic fills', 'Textural depth');
        }
        const text = suggestions[Math.floor(Math.random() * suggestions.length)];
        return {
            id: generateId(),
            text,
            weight: 0.8,
            color: getUniqueColor(existingColors),
            enabled: true,
            createdAt: Date.now(),
        };
    }
    /**
     * Adds a custom preset
     */
    addPreset(preset) {
        if (!this.presets.find((p) => p.id === preset.id)) {
            this.presets.push(preset);
        }
    }
    /**
     * Removes a preset by ID
     */
    removePreset(id) {
        const index = this.presets.findIndex((p) => p.id === id);
        if (index > -1) {
            this.presets.splice(index, 1);
            return true;
        }
        return false;
    }
    /**
     * Creates a preset from current prompts
     */
    createPresetFromPrompts(name, description, prompts, settings) {
        return {
            id: generateId(),
            name,
            description,
            prompts: prompts.map((p) => ({
                text: p.text,
                weight: p.weight,
                color: p.color,
                enabled: p.enabled,
            })),
            settings,
        };
    }
}
// Export singleton instance getter
export const getInspirationService = () => InspirationService.getInstance();
//# sourceMappingURL=inspiration-service.js.map