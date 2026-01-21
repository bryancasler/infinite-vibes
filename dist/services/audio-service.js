/**
 * Audio Service
 * Manages AudioContext and gapless audio playback
 */
import { AUDIO_CONFIG } from '../utils/constants.js';
import { applyFadeIn, base64PcmToFloat32, createAudioBuffer, } from '../utils/audio.js';
/**
 * Singleton service for audio playback management
 */
export class AudioService {
    constructor() {
        this.audioContext = null;
        this.gainNode = null;
        this.analyserNode = null;
        this.playbackState = 'stopped';
        this.volume = 1.0;
        // Gapless playback tracking
        this.nextStartTime = 0;
        this.scheduledSources = [];
        this.audioQueue = [];
        this.isProcessingQueue = false;
        // Event listeners
        this.eventListeners = new Map();
        // Buffer statistics
        this.bufferLevel = 0;
        this.totalBufferedDuration = 0;
        // Initialize event listener sets
        const eventTypes = [
            'state-change',
            'volume-change',
            'underrun',
            'buffer-update',
        ];
        eventTypes.forEach((type) => {
            this.eventListeners.set(type, new Set());
        });
    }
    /**
     * Gets the singleton instance
     */
    static getInstance() {
        if (!AudioService.instance) {
            AudioService.instance = new AudioService();
        }
        return AudioService.instance;
    }
    /**
     * Initializes the audio context
     */
    async initialize() {
        if (this.audioContext) {
            return true;
        }
        try {
            this.audioContext = new AudioContext({
                sampleRate: AUDIO_CONFIG.SAMPLE_RATE,
            });
            // Create gain node for volume control
            this.gainNode = this.audioContext.createGain();
            this.gainNode.gain.value = this.volume;
            // Create analyser node for visualizations
            this.analyserNode = this.audioContext.createAnalyser();
            this.analyserNode.fftSize = 2048;
            this.analyserNode.smoothingTimeConstant = 0.8;
            // Connect nodes: source -> gain -> analyser -> destination
            this.gainNode.connect(this.analyserNode);
            this.analyserNode.connect(this.audioContext.destination);
            return true;
        }
        catch (error) {
            console.error('Failed to initialize AudioContext:', error);
            return false;
        }
    }
    /**
     * Gets the AudioContext
     */
    getAudioContext() {
        return this.audioContext;
    }
    /**
     * Gets the AnalyserNode for visualizations
     */
    getAnalyserNode() {
        return this.analyserNode;
    }
    /**
     * Gets current playback state
     */
    getPlaybackState() {
        return this.playbackState;
    }
    /**
     * Gets current volume
     */
    getVolume() {
        return this.volume;
    }
    /**
     * Gets buffer level (0-1)
     */
    getBufferLevel() {
        return this.bufferLevel;
    }
    /**
     * Adds an event listener
     */
    on(eventType, callback) {
        this.eventListeners.get(eventType)?.add(callback);
    }
    /**
     * Removes an event listener
     */
    off(eventType, callback) {
        this.eventListeners.get(eventType)?.delete(callback);
    }
    /**
     * Emits an event to all listeners
     */
    emit(event) {
        this.eventListeners.get(event.type)?.forEach((callback) => {
            try {
                callback(event);
            }
            catch (error) {
                console.error('Error in audio event listener:', error);
            }
        });
    }
    /**
     * Sets playback state and emits event
     */
    setPlaybackState(state) {
        if (this.playbackState !== state) {
            this.playbackState = state;
            this.emit({ type: 'state-change', state });
        }
    }
    /**
     * Sets volume (0.0 to 1.0)
     */
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        if (this.gainNode) {
            // Use exponential ramp for smoother volume changes
            const now = this.audioContext?.currentTime || 0;
            this.gainNode.gain.setTargetAtTime(this.volume, now, 0.05);
        }
        this.emit({ type: 'volume-change', volume: this.volume });
    }
    /**
     * Starts playback
     */
    async play() {
        if (!this.audioContext) {
            const initialized = await this.initialize();
            if (!initialized)
                return false;
        }
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
        this.setPlaybackState('playing');
        this.processAudioQueue();
        return true;
    }
    /**
     * Pauses playback
     */
    async pause() {
        if (this.audioContext && this.audioContext.state === 'running') {
            await this.audioContext.suspend();
        }
        this.setPlaybackState('paused');
    }
    /**
     * Stops playback and clears buffers
     */
    async stop() {
        // Stop all scheduled sources
        this.scheduledSources.forEach((source) => {
            try {
                source.stop();
                source.disconnect();
            }
            catch {
                // Source may already be stopped
            }
        });
        this.scheduledSources = [];
        // Clear the queue
        this.audioQueue = [];
        this.totalBufferedDuration = 0;
        this.bufferLevel = 0;
        // Reset timing
        this.nextStartTime = 0;
        if (this.audioContext) {
            await this.audioContext.suspend();
        }
        this.setPlaybackState('stopped');
        this.emit({ type: 'buffer-update', bufferLevel: 0 });
    }
    /**
     * Queues Base64 PCM audio for playback
     */
    queueAudioChunk(base64Data) {
        if (!this.audioContext) {
            console.warn('AudioContext not initialized');
            return;
        }
        try {
            // Decode Base64 to Float32Array
            const float32Data = base64PcmToFloat32(base64Data);
            // Apply fade-in if this is the first chunk after silence
            const fadeSamples = Math.floor(AUDIO_CONFIG.FADE_DURATION * AUDIO_CONFIG.SAMPLE_RATE);
            const processedData = this.audioQueue.length === 0 && this.scheduledSources.length === 0
                ? applyFadeIn(float32Data, fadeSamples)
                : float32Data;
            // Create AudioBuffer
            const buffer = createAudioBuffer(this.audioContext, processedData, AUDIO_CONFIG.SAMPLE_RATE);
            // Add to queue
            this.audioQueue.push(buffer);
            this.totalBufferedDuration += buffer.duration;
            // Update buffer level (assuming 5 seconds is "full")
            this.bufferLevel = Math.min(1, this.totalBufferedDuration / 5);
            this.emit({ type: 'buffer-update', bufferLevel: this.bufferLevel });
            // Process queue if playing
            if (this.playbackState === 'playing') {
                this.processAudioQueue();
            }
        }
        catch (error) {
            console.error('Failed to queue audio chunk:', error);
        }
    }
    /**
     * Processes the audio queue for gapless playback
     */
    processAudioQueue() {
        if (this.isProcessingQueue ||
            !this.audioContext ||
            this.playbackState !== 'playing') {
            return;
        }
        this.isProcessingQueue = true;
        try {
            const currentTime = this.audioContext.currentTime;
            // Schedule buffers with look-ahead
            while (this.audioQueue.length > 0) {
                const buffer = this.audioQueue.shift();
                // Check for underrun
                if (this.nextStartTime < currentTime) {
                    // We have an underrun - play immediately
                    console.warn('Audio underrun detected');
                    this.nextStartTime = currentTime;
                    this.emit({ type: 'underrun' });
                }
                // Create and schedule source
                const source = this.audioContext.createBufferSource();
                source.buffer = buffer;
                source.connect(this.gainNode);
                // Schedule playback
                source.start(this.nextStartTime);
                // Track this source
                this.scheduledSources.push(source);
                // Clean up when done
                source.onended = () => {
                    const index = this.scheduledSources.indexOf(source);
                    if (index > -1) {
                        this.scheduledSources.splice(index, 1);
                    }
                    source.disconnect();
                    // Update buffered duration
                    this.totalBufferedDuration = Math.max(0, this.totalBufferedDuration - buffer.duration);
                    this.bufferLevel = Math.min(1, this.totalBufferedDuration / 5);
                };
                // Update next start time for gapless playback
                this.nextStartTime += buffer.duration;
                // Only schedule a limited amount ahead
                if (this.nextStartTime - currentTime >
                    AUDIO_CONFIG.LOOKAHEAD_TIME * 10) {
                    break;
                }
            }
        }
        finally {
            this.isProcessingQueue = false;
        }
        // Continue processing if there's more in the queue
        if (this.audioQueue.length > 0 && this.playbackState === 'playing') {
            requestAnimationFrame(() => this.processAudioQueue());
        }
    }
    /**
     * Gets current RMS volume level (for visualizations)
     */
    getCurrentLevel() {
        if (!this.analyserNode)
            return 0;
        const dataArray = new Uint8Array(this.analyserNode.frequencyBinCount);
        this.analyserNode.getByteTimeDomainData(dataArray);
        // Convert to float and calculate RMS
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
            const value = (dataArray[i] - 128) / 128;
            sum += value * value;
        }
        return Math.sqrt(sum / dataArray.length);
    }
    /**
     * Gets frequency data for visualizations
     */
    getFrequencyData() {
        if (!this.analyserNode) {
            return new Uint8Array(0);
        }
        const dataArray = new Uint8Array(this.analyserNode.frequencyBinCount);
        this.analyserNode.getByteFrequencyData(dataArray);
        return dataArray;
    }
    /**
     * Gets time domain data for visualizations
     */
    getTimeDomainData() {
        if (!this.analyserNode) {
            return new Uint8Array(0);
        }
        const dataArray = new Uint8Array(this.analyserNode.frequencyBinCount);
        this.analyserNode.getByteTimeDomainData(dataArray);
        return dataArray;
    }
    /**
     * Cleans up and releases resources
     */
    async dispose() {
        await this.stop();
        if (this.audioContext) {
            await this.audioContext.close();
            this.audioContext = null;
        }
        this.gainNode = null;
        this.analyserNode = null;
        // Clear event listeners
        this.eventListeners.forEach((set) => set.clear());
    }
}
// Export singleton instance getter
export const getAudioService = () => AudioService.getInstance();
//# sourceMappingURL=audio-service.js.map