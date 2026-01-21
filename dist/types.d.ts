/**
 * Infinite Vibes DJ - Type Definitions
 */
export interface Prompt {
    id: string;
    text: string;
    weight: number;
    color: string;
    enabled: boolean;
    createdAt: number;
}
export interface PromptSnapshot {
    id: string;
    prompts: Prompt[];
    timestamp: number;
    label?: string;
}
export type ChatRole = 'user' | 'assistant' | 'system';
export interface ChatMessage {
    id: string;
    role: ChatRole;
    content: string;
    timestamp: number;
    snapshot?: PromptSnapshot;
}
export interface ChatAction {
    action: 'add' | 'remove' | 'update';
    prompt: string;
    weight?: number;
    promptId?: string;
}
export interface ChatResponse {
    message: string;
    actions: ChatAction[];
}
export interface AudioChunk {
    data: Float32Array;
    sampleRate: number;
    timestamp: number;
}
export interface AudioConfig {
    sampleRate: number;
    channels: number;
    bitDepth: number;
}
export type PlaybackState = 'playing' | 'paused' | 'stopped' | 'connecting';
export type VisualizationMode = 'gradient-pulse' | 'particles' | 'spectrogram' | 'warp' | 'album-art';
export interface VisualizerConfig {
    mode: VisualizationMode;
    sensitivity: number;
    colorScheme: 'neon' | 'warm' | 'cool' | 'monochrome';
    blur: number;
    opacity: number;
}
export interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    alpha: number;
    life: number;
    maxLife: number;
}
export interface GenerationSettings {
    temperature: number;
    topK: number;
    topP: number;
    bpm: number;
    key: MusicalKey;
    scale: MusicalScale;
    density: number;
    brightness: number;
    muteBass: boolean;
    muteDrums: boolean;
    guidance: number;
}
export type MusicalKey = 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' | 'F#' | 'G' | 'G#' | 'A' | 'A#' | 'B';
export type MusicalScale = 'major' | 'minor' | 'dorian' | 'phrygian' | 'lydian' | 'mixolydian' | 'locrian' | 'pentatonic-major' | 'pentatonic-minor' | 'blues' | 'harmonic-minor' | 'melodic-minor';
export interface ApiConnectionState {
    connected: boolean;
    connecting: boolean;
    error: string | null;
    sessionId: string | null;
}
export interface LiveApiMessage {
    type: 'audio' | 'text' | 'error' | 'setup' | 'control';
    data?: string;
    text?: string;
    error?: string;
}
export interface LiveApiConfig {
    model: string;
    systemInstruction: string;
    generationConfig: Partial<GenerationSettings>;
    audioConfig: AudioConfig;
}
export interface AppState {
    prompts: Prompt[];
    settings: GenerationSettings;
    visualizerConfig: VisualizerConfig;
    chatHistory: ChatMessage[];
    snapshots: PromptSnapshot[];
    apiKey?: string;
}
export interface StorageKeys {
    STATE: 'infinite-vibes-state';
    API_KEY: 'infinite-vibes-api-key';
    SETTINGS: 'infinite-vibes-settings';
}
export interface PromptChangeEvent extends CustomEvent {
    detail: {
        prompt: Prompt;
        action: 'add' | 'remove' | 'update';
    };
}
export interface PlaybackChangeEvent extends CustomEvent {
    detail: {
        state: PlaybackState;
    };
}
export interface SettingsChangeEvent extends CustomEvent {
    detail: {
        settings: GenerationSettings;
    };
}
export interface ChatSubmitEvent extends CustomEvent {
    detail: {
        message: string;
    };
}
export interface SnapshotRestoreEvent extends CustomEvent {
    detail: {
        snapshot: PromptSnapshot;
    };
}
export interface InspirationPreset {
    id: string;
    name: string;
    description: string;
    prompts: Omit<Prompt, 'id' | 'createdAt'>[];
    settings?: Partial<GenerationSettings>;
}
export interface AlbumArtConfig {
    style: 'abstract' | 'landscape' | 'geometric' | 'organic';
    colorPalette: string[];
    mood: string;
}
export interface GeneratedImage {
    url: string;
    prompt: string;
    timestamp: number;
}
export interface UIState {
    showSettings: boolean;
    showChat: boolean;
    showInspiration: boolean;
    uiVisible: boolean;
    isDragging: boolean;
    draggedPromptId: string | null;
}
export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
export type EventCallback<T = unknown> = (event: T) => void;
export interface Disposable {
    dispose(): void;
}
//# sourceMappingURL=types.d.ts.map