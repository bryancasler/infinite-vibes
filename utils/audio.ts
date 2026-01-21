/**
 * Audio Utility Functions
 * Handles Base64 PCM decoding and AudioBuffer creation
 */

import { AUDIO_CONFIG } from './constants.js';

/**
 * Decodes a Base64 string to a Uint8Array
 */
export function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const length = binaryString.length;
  const bytes = new Uint8Array(length);

  for (let i = 0; i < length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return bytes;
}

/**
 * Converts Uint8Array (raw bytes) to Int16Array (16-bit PCM)
 */
export function uint8ArrayToInt16Array(uint8Array: Uint8Array): Int16Array {
  // Each sample is 2 bytes (16-bit), little-endian
  const int16Array = new Int16Array(uint8Array.length / 2);

  for (let i = 0; i < int16Array.length; i++) {
    const lowByte = uint8Array[i * 2];
    const highByte = uint8Array[i * 2 + 1];
    // Little-endian: low byte first
    int16Array[i] = (highByte << 8) | lowByte;
    // Handle signed conversion
    if (int16Array[i] > 32767) {
      int16Array[i] -= 65536;
    }
  }

  return int16Array;
}

/**
 * Converts Int16Array to Float32Array (normalized -1.0 to 1.0)
 */
export function int16ArrayToFloat32Array(int16Array: Int16Array): Float32Array {
  const float32Array = new Float32Array(int16Array.length);
  const scale = 1.0 / 32768.0; // Normalize 16-bit signed to -1.0 to 1.0

  for (let i = 0; i < int16Array.length; i++) {
    float32Array[i] = int16Array[i] * scale;
  }

  return float32Array;
}

/**
 * Converts Base64 encoded PCM audio to Float32Array
 * Complete pipeline: Base64 -> Uint8Array -> Int16Array -> Float32Array
 */
export function base64PcmToFloat32(base64: string): Float32Array {
  const uint8Array = base64ToUint8Array(base64);
  const int16Array = uint8ArrayToInt16Array(uint8Array);
  return int16ArrayToFloat32Array(int16Array);
}

/**
 * Creates an AudioBuffer from Float32Array data
 */
export function createAudioBuffer(
  audioContext: AudioContext,
  data: Float32Array,
  sampleRate: number = AUDIO_CONFIG.SAMPLE_RATE
): AudioBuffer {
  const audioBuffer = audioContext.createBuffer(
    AUDIO_CONFIG.CHANNELS,
    data.length,
    sampleRate
  );

  // Copy data to the audio buffer's channel
  audioBuffer.copyToChannel(data, 0);

  return audioBuffer;
}

/**
 * Decodes Base64 PCM and creates an AudioBuffer in one step
 */
export function decodeBase64ToAudioBuffer(
  audioContext: AudioContext,
  base64: string,
  sampleRate: number = AUDIO_CONFIG.SAMPLE_RATE
): AudioBuffer {
  const float32Data = base64PcmToFloat32(base64);
  return createAudioBuffer(audioContext, float32Data, sampleRate);
}

/**
 * Applies a fade-in effect to audio data
 */
export function applyFadeIn(
  data: Float32Array,
  fadeSamples: number
): Float32Array {
  const result = new Float32Array(data);
  const fadeLength = Math.min(fadeSamples, data.length);

  for (let i = 0; i < fadeLength; i++) {
    const gain = i / fadeLength;
    result[i] *= gain;
  }

  return result;
}

/**
 * Applies a fade-out effect to audio data
 */
export function applyFadeOut(
  data: Float32Array,
  fadeSamples: number
): Float32Array {
  const result = new Float32Array(data);
  const fadeLength = Math.min(fadeSamples, data.length);
  const startIndex = data.length - fadeLength;

  for (let i = 0; i < fadeLength; i++) {
    const gain = 1 - (i / fadeLength);
    result[startIndex + i] *= gain;
  }

  return result;
}

/**
 * Applies crossfade between current and next buffer
 */
export function applyCrossfade(
  current: Float32Array,
  next: Float32Array,
  fadeSamples: number
): { current: Float32Array; next: Float32Array } {
  return {
    current: applyFadeOut(current, fadeSamples),
    next: applyFadeIn(next, fadeSamples),
  };
}

/**
 * Calculates RMS (Root Mean Square) volume of audio data
 */
export function calculateRMS(data: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    sum += data[i] * data[i];
  }
  return Math.sqrt(sum / data.length);
}

/**
 * Calculates peak amplitude of audio data
 */
export function calculatePeak(data: Float32Array): number {
  let peak = 0;
  for (let i = 0; i < data.length; i++) {
    const abs = Math.abs(data[i]);
    if (abs > peak) {
      peak = abs;
    }
  }
  return peak;
}

/**
 * Resamples audio data from one sample rate to another
 */
export function resample(
  data: Float32Array,
  fromRate: number,
  toRate: number
): Float32Array {
  if (fromRate === toRate) {
    return data;
  }

  const ratio = fromRate / toRate;
  const newLength = Math.round(data.length / ratio);
  const result = new Float32Array(newLength);

  for (let i = 0; i < newLength; i++) {
    const srcIndex = i * ratio;
    const srcIndexFloor = Math.floor(srcIndex);
    const srcIndexCeil = Math.min(srcIndexFloor + 1, data.length - 1);
    const t = srcIndex - srcIndexFloor;

    // Linear interpolation
    result[i] = data[srcIndexFloor] * (1 - t) + data[srcIndexCeil] * t;
  }

  return result;
}

/**
 * Normalizes audio data to a target peak level
 */
export function normalize(
  data: Float32Array,
  targetPeak: number = 0.95
): Float32Array {
  const currentPeak = calculatePeak(data);

  if (currentPeak === 0) {
    return data;
  }

  const gain = targetPeak / currentPeak;
  const result = new Float32Array(data.length);

  for (let i = 0; i < data.length; i++) {
    result[i] = data[i] * gain;
  }

  return result;
}

/**
 * Concatenates multiple Float32Arrays into one
 */
export function concatenateAudioData(
  ...arrays: Float32Array[]
): Float32Array {
  const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);
  const result = new Float32Array(totalLength);

  let offset = 0;
  for (const arr of arrays) {
    result.set(arr, offset);
    offset += arr.length;
  }

  return result;
}

/**
 * Mixes multiple audio buffers together
 */
export function mixAudioData(
  ...arrays: { data: Float32Array; gain: number }[]
): Float32Array {
  if (arrays.length === 0) {
    return new Float32Array(0);
  }

  const maxLength = Math.max(...arrays.map((a) => a.data.length));
  const result = new Float32Array(maxLength);

  for (const { data, gain } of arrays) {
    for (let i = 0; i < data.length; i++) {
      result[i] += data[i] * gain;
    }
  }

  return result;
}

/**
 * Creates silence of specified duration
 */
export function createSilence(
  durationMs: number,
  sampleRate: number = AUDIO_CONFIG.SAMPLE_RATE
): Float32Array {
  const samples = Math.round((durationMs / 1000) * sampleRate);
  return new Float32Array(samples);
}
