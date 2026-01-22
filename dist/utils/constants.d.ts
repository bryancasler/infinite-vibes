/**
 * Application Constants
 */
import type { GenerationSettings, VisualizerConfig, StorageKeys, InspirationPreset, MusicalKey, MusicalScale } from '../types.js';
export declare const API_CONFIG: {
    readonly MODEL: "gemini-2.0-flash-exp";
    readonly AUDIO_MODEL: "gemini-2.0-flash-exp";
    readonly CHAT_MODEL: "gemini-2.0-flash";
    readonly IMAGE_MODEL: "imagen-3.0-generate-002";
    readonly RECONNECT_DELAY: 2000;
    readonly MAX_RECONNECT_ATTEMPTS: 5;
    readonly HEARTBEAT_INTERVAL: 30000;
};
export declare const SYSTEM_INSTRUCTION = "You are an advanced AI music synthesizer and DJ. Your ONLY job is to generate continuous, rhythmic, and melodic audio using your voice capabilities - beatboxing, humming, singing non-verbal sounds, creating percussion, basslines, melodies, and atmospheric textures.\n\nCRITICAL RULES:\n1. DO NOT speak words or sentences. Only produce musical sounds.\n2. Keep audio flowing continuously without gaps.\n3. Respond to style prompts by adjusting your musical output accordingly.\n4. Maintain consistent tempo and rhythm.\n5. Layer different sounds (bass, drums, melody, atmosphere) based on the provided prompts.\n6. React to intensity/weight values by making sounds more or less prominent.\n\nYou are the instrument. Generate music now.";
export declare const AUDIO_CONFIG: {
    readonly SAMPLE_RATE: 24000;
    readonly CHANNELS: 1;
    readonly BIT_DEPTH: 16;
    readonly BUFFER_SIZE: 4096;
    readonly LOOKAHEAD_TIME: 0.1;
    readonly UNDERRUN_THRESHOLD: 0.05;
    readonly FADE_DURATION: 0.05;
};
export declare const DEFAULT_GENERATION_SETTINGS: GenerationSettings;
export declare const DEFAULT_VISUALIZER_CONFIG: VisualizerConfig;
export declare const STORAGE_KEYS: StorageKeys;
export declare const MUSICAL_KEYS: MusicalKey[];
export declare const MUSICAL_SCALES: {
    value: MusicalScale;
    label: string;
}[];
export declare const INSPIRATION_PRESETS: InspirationPreset[];
export declare const UI_CONFIG: {
    readonly INACTIVITY_TIMEOUT: 3000;
    readonly FADE_DURATION: 500;
    readonly TOAST_DURATION: 3000;
    readonly MAX_PROMPTS: 8;
    readonly MIN_WEIGHT: 0;
    readonly MAX_WEIGHT: 2;
    readonly WEIGHT_STEP: 0.1;
};
export declare const NEON_COLORS: string[];
export declare const COLOR_SCHEMES: {
    neon: string[];
    warm: string[];
    cool: string[];
    monochrome: string[];
};
//# sourceMappingURL=constants.d.ts.map