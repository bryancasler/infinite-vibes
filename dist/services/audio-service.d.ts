/**
 * Audio Service
 * Manages AudioContext and gapless audio playback
 */
import type { PlaybackState } from '../types.js';
export type AudioEventType = 'state-change' | 'volume-change' | 'underrun' | 'buffer-update';
export interface AudioEvent {
    type: AudioEventType;
    state?: PlaybackState;
    volume?: number;
    bufferLevel?: number;
}
type AudioEventCallback = (event: AudioEvent) => void;
/**
 * Singleton service for audio playback management
 */
export declare class AudioService {
    private static instance;
    private audioContext;
    private gainNode;
    private analyserNode;
    private playbackState;
    private volume;
    private nextStartTime;
    private scheduledSources;
    private audioQueue;
    private isProcessingQueue;
    private eventListeners;
    private bufferLevel;
    private totalBufferedDuration;
    private constructor();
    /**
     * Gets the singleton instance
     */
    static getInstance(): AudioService;
    /**
     * Initializes the audio context
     */
    initialize(): Promise<boolean>;
    /**
     * Gets the AudioContext
     */
    getAudioContext(): AudioContext | null;
    /**
     * Gets the AnalyserNode for visualizations
     */
    getAnalyserNode(): AnalyserNode | null;
    /**
     * Gets current playback state
     */
    getPlaybackState(): PlaybackState;
    /**
     * Gets current volume
     */
    getVolume(): number;
    /**
     * Gets buffer level (0-1)
     */
    getBufferLevel(): number;
    /**
     * Adds an event listener
     */
    on(eventType: AudioEventType, callback: AudioEventCallback): void;
    /**
     * Removes an event listener
     */
    off(eventType: AudioEventType, callback: AudioEventCallback): void;
    /**
     * Emits an event to all listeners
     */
    private emit;
    /**
     * Sets playback state and emits event
     */
    private setPlaybackState;
    /**
     * Sets volume (0.0 to 1.0)
     */
    setVolume(volume: number): void;
    /**
     * Starts playback
     */
    play(): Promise<boolean>;
    /**
     * Pauses playback
     */
    pause(): Promise<void>;
    /**
     * Stops playback and clears buffers
     */
    stop(): Promise<void>;
    /**
     * Queues Base64 PCM audio for playback
     */
    queueAudioChunk(base64Data: string): void;
    /**
     * Processes the audio queue for gapless playback
     */
    private processAudioQueue;
    /**
     * Gets current RMS volume level (for visualizations)
     */
    getCurrentLevel(): number;
    /**
     * Gets frequency data for visualizations
     */
    getFrequencyData(): Uint8Array;
    /**
     * Gets time domain data for visualizations
     */
    getTimeDomainData(): Uint8Array;
    /**
     * Cleans up and releases resources
     */
    dispose(): Promise<void>;
}
export declare const getAudioService: () => AudioService;
export {};
//# sourceMappingURL=audio-service.d.ts.map