/**
 * Application Constants
 */
// ============================================================================
// API Configuration
// ============================================================================
export const API_CONFIG = {
    MODEL: 'gemini-2.5-flash-preview-native-audio-dialog',
    AUDIO_MODEL: 'gemini-2.5-flash-preview-native-audio-dialog',
    CHAT_MODEL: 'gemini-2.0-flash',
    IMAGE_MODEL: 'imagen-3.0-generate-002',
    RECONNECT_DELAY: 2000,
    MAX_RECONNECT_ATTEMPTS: 5,
    HEARTBEAT_INTERVAL: 30000,
};
export const SYSTEM_INSTRUCTION = `You are an advanced AI music synthesizer and DJ. Your ONLY job is to generate continuous, rhythmic, and melodic audio using your voice capabilities - beatboxing, humming, singing non-verbal sounds, creating percussion, basslines, melodies, and atmospheric textures.

CRITICAL RULES:
1. DO NOT speak words or sentences. Only produce musical sounds.
2. Keep audio flowing continuously without gaps.
3. Respond to style prompts by adjusting your musical output accordingly.
4. Maintain consistent tempo and rhythm.
5. Layer different sounds (bass, drums, melody, atmosphere) based on the provided prompts.
6. React to intensity/weight values by making sounds more or less prominent.

You are the instrument. Generate music now.`;
// ============================================================================
// Audio Configuration
// ============================================================================
export const AUDIO_CONFIG = {
    SAMPLE_RATE: 24000,
    CHANNELS: 1,
    BIT_DEPTH: 16,
    BUFFER_SIZE: 4096,
    LOOKAHEAD_TIME: 0.1, // seconds
    UNDERRUN_THRESHOLD: 0.05, // seconds
    FADE_DURATION: 0.05, // seconds for crossfade
};
// ============================================================================
// Default Settings
// ============================================================================
export const DEFAULT_GENERATION_SETTINGS = {
    temperature: 1.0,
    topK: 40,
    topP: 0.95,
    bpm: 120,
    key: 'C',
    scale: 'minor',
    density: 0.7,
    brightness: 0.6,
    muteBass: false,
    muteDrums: false,
    guidance: 1.0,
};
export const DEFAULT_VISUALIZER_CONFIG = {
    mode: 'particles',
    sensitivity: 1.0,
    colorScheme: 'neon',
    blur: 0,
    opacity: 1.0,
};
// ============================================================================
// Storage Keys
// ============================================================================
export const STORAGE_KEYS = {
    STATE: 'infinite-vibes-state',
    API_KEY: 'infinite-vibes-api-key',
    SETTINGS: 'infinite-vibes-settings',
};
// ============================================================================
// Musical Constants
// ============================================================================
export const MUSICAL_KEYS = [
    'C', 'C#', 'D', 'D#', 'E', 'F',
    'F#', 'G', 'G#', 'A', 'A#', 'B',
];
export const MUSICAL_SCALES = [
    { value: 'major', label: 'Major' },
    { value: 'minor', label: 'Minor' },
    { value: 'dorian', label: 'Dorian' },
    { value: 'phrygian', label: 'Phrygian' },
    { value: 'lydian', label: 'Lydian' },
    { value: 'mixolydian', label: 'Mixolydian' },
    { value: 'locrian', label: 'Locrian' },
    { value: 'pentatonic-major', label: 'Pentatonic Major' },
    { value: 'pentatonic-minor', label: 'Pentatonic Minor' },
    { value: 'blues', label: 'Blues' },
    { value: 'harmonic-minor', label: 'Harmonic Minor' },
    { value: 'melodic-minor', label: 'Melodic Minor' },
];
// ============================================================================
// Inspiration Presets
// ============================================================================
export const INSPIRATION_PRESETS = [
    {
        id: 'deep-house',
        name: 'Deep House Groove',
        description: 'Smooth, hypnotic deep house vibes',
        prompts: [
            { text: 'Deep house kick drum', weight: 1.2, color: '#ff006e', enabled: true },
            { text: 'Warm sub bass', weight: 1.0, color: '#8338ec', enabled: true },
            { text: 'Shuffled hi-hats', weight: 0.8, color: '#3a86ff', enabled: true },
            { text: 'Atmospheric pads', weight: 0.6, color: '#06ffa5', enabled: true },
        ],
        settings: { bpm: 122, key: 'A', scale: 'minor' },
    },
    {
        id: 'ambient-chill',
        name: 'Ambient Chill',
        description: 'Relaxing ambient soundscapes',
        prompts: [
            { text: 'Ethereal pad textures', weight: 1.0, color: '#00b4d8', enabled: true },
            { text: 'Gentle wind sounds', weight: 0.7, color: '#90e0ef', enabled: true },
            { text: 'Soft bell tones', weight: 0.5, color: '#caf0f8', enabled: true },
            { text: 'Distant humming', weight: 0.4, color: '#48cae4', enabled: true },
        ],
        settings: { bpm: 70, key: 'D', scale: 'major', density: 0.3 },
    },
    {
        id: 'techno-drive',
        name: 'Techno Drive',
        description: 'Driving techno energy',
        prompts: [
            { text: 'Hard techno kick', weight: 1.5, color: '#ff0054', enabled: true },
            { text: 'Acid bassline', weight: 1.2, color: '#ff5400', enabled: true },
            { text: 'Industrial percussion', weight: 1.0, color: '#ffbd00', enabled: true },
            { text: 'Dark atmospheric drone', weight: 0.6, color: '#9e0059', enabled: true },
        ],
        settings: { bpm: 138, key: 'F', scale: 'phrygian', density: 0.9 },
    },
    {
        id: 'lofi-beats',
        name: 'Lo-Fi Beats',
        description: 'Cozy lo-fi hip hop vibes',
        prompts: [
            { text: 'Dusty vinyl crackle', weight: 0.4, color: '#bc6c25', enabled: true },
            { text: 'Mellow jazz chords', weight: 1.0, color: '#dda15e', enabled: true },
            { text: 'Lazy boom-bap drums', weight: 0.9, color: '#606c38', enabled: true },
            { text: 'Smooth bass', weight: 0.7, color: '#283618', enabled: true },
        ],
        settings: { bpm: 85, key: 'E', scale: 'dorian', brightness: 0.4 },
    },
    {
        id: 'synthwave',
        name: 'Synthwave',
        description: '80s retro futuristic sounds',
        prompts: [
            { text: 'Retro synth arpeggios', weight: 1.2, color: '#f72585', enabled: true },
            { text: 'Punchy 80s drums', weight: 1.0, color: '#7209b7', enabled: true },
            { text: 'Analog bass synth', weight: 1.1, color: '#3a0ca3', enabled: true },
            { text: 'Dreamy synth pads', weight: 0.8, color: '#4361ee', enabled: true },
        ],
        settings: { bpm: 110, key: 'A', scale: 'minor', brightness: 0.8 },
    },
    {
        id: 'dnb-jungle',
        name: 'Drum & Bass',
        description: 'High energy breakbeats',
        prompts: [
            { text: 'Fast breakbeat drums', weight: 1.4, color: '#ff6b35', enabled: true },
            { text: 'Rolling bassline', weight: 1.3, color: '#f7c59f', enabled: true },
            { text: 'Chopped vocal stabs', weight: 0.7, color: '#efa00b', enabled: true },
            { text: 'Reese bass', weight: 0.9, color: '#d65108', enabled: true },
        ],
        settings: { bpm: 174, key: 'F#', scale: 'minor', density: 0.85 },
    },
];
// ============================================================================
// UI Constants
// ============================================================================
export const UI_CONFIG = {
    INACTIVITY_TIMEOUT: 3000, // ms before UI fades
    FADE_DURATION: 500, // ms for fade animation
    TOAST_DURATION: 3000, // ms for toast notifications
    MAX_PROMPTS: 8,
    MIN_WEIGHT: 0,
    MAX_WEIGHT: 2.0,
    WEIGHT_STEP: 0.1,
};
// ============================================================================
// Color Palettes
// ============================================================================
export const NEON_COLORS = [
    '#ff006e', // Pink
    '#8338ec', // Purple
    '#3a86ff', // Blue
    '#06ffa5', // Green
    '#ffbe0b', // Yellow
    '#fb5607', // Orange
    '#ff0054', // Red
    '#00f5d4', // Cyan
];
export const COLOR_SCHEMES = {
    neon: NEON_COLORS,
    warm: ['#ff006e', '#ff5400', '#ffbd00', '#ff8500', '#ff0054', '#ff7b00', '#ffa200', '#ffcb47'],
    cool: ['#00b4d8', '#0077b6', '#03045e', '#023e8a', '#0096c7', '#48cae4', '#90e0ef', '#caf0f8'],
    monochrome: ['#ffffff', '#e0e0e0', '#c0c0c0', '#a0a0a0', '#808080', '#606060', '#404040', '#202020'],
};
//# sourceMappingURL=constants.js.map