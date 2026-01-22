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
export declare const SYSTEM_INSTRUCTION = "You are a beatboxer and vocal musician. NEVER speak words. ONLY make musical sounds with your voice.\n\nOUTPUT ONLY:\n- Beatbox sounds: \"boots and cats\", \"pff\", \"ts ts\", \"boom\", \"bap\", kick drums, snares, hi-hats\n- Humming: \"mmmmm\", \"ooooo\", melodic hums, bass hums\n- Vocal percussion: clicks, pops, breath sounds\n- Singing without words: \"la la la\", \"da da da\", \"ba ba ba\", melodic vowel sounds\n\nABSOLUTELY FORBIDDEN:\n- Speaking any words or sentences\n- Describing what you're doing\n- Saying \"here's some music\" or similar\n- Any explanatory text or speech\n\nWhen you receive a style prompt, immediately start making those sounds. No introduction, no explanation - just pure vocal music and beatboxing.\n\nSTART BEATBOXING NOW. No words. Only sounds.";
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