/**
 * Audio Utility Functions
 * Handles Base64 PCM decoding and AudioBuffer creation
 */
/**
 * Decodes a Base64 string to a Uint8Array
 */
export declare function base64ToUint8Array(base64: string): Uint8Array;
/**
 * Converts Uint8Array (raw bytes) to Int16Array (16-bit PCM)
 */
export declare function uint8ArrayToInt16Array(uint8Array: Uint8Array): Int16Array;
/**
 * Converts Int16Array to Float32Array (normalized -1.0 to 1.0)
 */
export declare function int16ArrayToFloat32Array(int16Array: Int16Array): Float32Array;
/**
 * Converts Base64 encoded PCM audio to Float32Array
 * Complete pipeline: Base64 -> Uint8Array -> Int16Array -> Float32Array
 */
export declare function base64PcmToFloat32(base64: string): Float32Array;
/**
 * Creates an AudioBuffer from Float32Array data
 */
export declare function createAudioBuffer(audioContext: AudioContext, data: Float32Array, sampleRate?: number): AudioBuffer;
/**
 * Decodes Base64 PCM and creates an AudioBuffer in one step
 */
export declare function decodeBase64ToAudioBuffer(audioContext: AudioContext, base64: string, sampleRate?: number): AudioBuffer;
/**
 * Applies a fade-in effect to audio data
 */
export declare function applyFadeIn(data: Float32Array, fadeSamples: number): Float32Array;
/**
 * Applies a fade-out effect to audio data
 */
export declare function applyFadeOut(data: Float32Array, fadeSamples: number): Float32Array;
/**
 * Applies crossfade between current and next buffer
 */
export declare function applyCrossfade(current: Float32Array, next: Float32Array, fadeSamples: number): {
    current: Float32Array;
    next: Float32Array;
};
/**
 * Calculates RMS (Root Mean Square) volume of audio data
 */
export declare function calculateRMS(data: Float32Array): number;
/**
 * Calculates peak amplitude of audio data
 */
export declare function calculatePeak(data: Float32Array): number;
/**
 * Resamples audio data from one sample rate to another
 */
export declare function resample(data: Float32Array, fromRate: number, toRate: number): Float32Array;
/**
 * Normalizes audio data to a target peak level
 */
export declare function normalize(data: Float32Array, targetPeak?: number): Float32Array;
/**
 * Concatenates multiple Float32Arrays into one
 */
export declare function concatenateAudioData(...arrays: Float32Array[]): Float32Array;
/**
 * Mixes multiple audio buffers together
 */
export declare function mixAudioData(...arrays: {
    data: Float32Array;
    gain: number;
}[]): Float32Array;
/**
 * Creates silence of specified duration
 */
export declare function createSilence(durationMs: number, sampleRate?: number): Float32Array;
//# sourceMappingURL=audio.d.ts.map