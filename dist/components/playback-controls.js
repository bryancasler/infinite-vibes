/**
 * Playback Controls Component
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { getOrchestrator } from '../core/prompt-dj-orchestrator.js';
import { getAudioService } from '../services/audio-service.js';
let PlaybackControls = class PlaybackControls extends LitElement {
    constructor() {
        super(...arguments);
        this.playbackState = 'stopped';
        this.isConnected = false;
        this.volume = 1.0;
        this.bufferLevel = 0;
        this.isMuted = false;
        this.orchestrator = getOrchestrator();
        this.audioService = getAudioService();
        this.previousVolume = 1.0;
        this.handleBufferUpdate = (event) => {
            if (event.bufferLevel !== undefined) {
                this.bufferLevel = event.bufferLevel;
            }
        };
    }
    static { this.styles = css `
    :host {
      display: block;
    }

    .controls-container {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      border-radius: 50px;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .play-btn {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      background: linear-gradient(135deg, #8338ec, #ff006e);
      color: #fff;
      font-size: 1.5rem;
    }

    .play-btn:hover {
      transform: scale(1.05);
      box-shadow: 0 0 30px rgba(131, 56, 236, 0.5);
    }

    .play-btn:active {
      transform: scale(0.98);
    }

    .play-btn.playing {
      background: linear-gradient(135deg, #ff006e, #ff5400);
    }

    .play-btn.connecting {
      background: linear-gradient(135deg, #ffbe0b, #ff5400);
      animation: pulse 1s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }

    .secondary-btn {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      border: 1px solid rgba(255, 255, 255, 0.2);
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      transition: all 0.2s;
    }

    .secondary-btn:hover {
      background: rgba(255, 255, 255, 0.2);
      border-color: rgba(255, 255, 255, 0.3);
    }

    .secondary-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* Volume slider */
    .volume-container {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0 0.5rem;
    }

    .volume-icon {
      font-size: 1.25rem;
      cursor: pointer;
    }

    .volume-slider {
      width: 80px;
      height: 4px;
      -webkit-appearance: none;
      appearance: none;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 2px;
      outline: none;
    }

    .volume-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: #fff;
      cursor: pointer;
    }

    .volume-slider::-moz-range-thumb {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: #fff;
      cursor: pointer;
      border: none;
    }

    /* Buffer indicator */
    .buffer-indicator {
      width: 60px;
      height: 4px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 2px;
      overflow: hidden;
    }

    .buffer-fill {
      height: 100%;
      background: linear-gradient(90deg, #8338ec, #06ffa5);
      border-radius: 2px;
      transition: width 0.3s;
    }
  `; }
    connectedCallback() {
        super.connectedCallback();
        this.volume = this.audioService.getVolume();
        // Listen for buffer updates
        this.audioService.on('buffer-update', this.handleBufferUpdate);
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this.audioService.off('buffer-update', this.handleBufferUpdate);
    }
    async handlePlayPause() {
        if (this.playbackState === 'playing') {
            await this.orchestrator.pause();
        }
        else if (this.playbackState === 'paused') {
            await this.orchestrator.play();
        }
        else if (this.playbackState === 'stopped') {
            await this.orchestrator.play();
        }
    }
    async handleStop() {
        await this.orchestrator.stop();
    }
    async handleReset() {
        await this.orchestrator.hardReset();
    }
    handleVolumeChange(e) {
        const target = e.target;
        const volume = parseFloat(target.value);
        this.volume = volume;
        this.isMuted = volume === 0;
        this.orchestrator.setVolume(volume);
    }
    handleVolumeToggle() {
        if (this.isMuted) {
            this.volume = this.previousVolume;
            this.isMuted = false;
        }
        else {
            this.previousVolume = this.volume;
            this.volume = 0;
            this.isMuted = true;
        }
        this.orchestrator.setVolume(this.volume);
    }
    getPlayIcon() {
        switch (this.playbackState) {
            case 'playing':
                return '⏸';
            case 'connecting':
                return '⏳';
            default:
                return '▶';
        }
    }
    getVolumeIcon() {
        if (this.isMuted || this.volume === 0)
            return '🔇';
        if (this.volume < 0.3)
            return '🔈';
        if (this.volume < 0.7)
            return '🔉';
        return '🔊';
    }
    render() {
        const playBtnClasses = {
            'play-btn': true,
            playing: this.playbackState === 'playing',
            connecting: this.playbackState === 'connecting',
        };
        return html `
      <div class="controls-container">
        <!-- Volume -->
        <div class="volume-container">
          <span class="volume-icon" @click=${this.handleVolumeToggle}>
            ${this.getVolumeIcon()}
          </span>
          <input
            type="range"
            class="volume-slider"
            min="0"
            max="1"
            step="0.05"
            .value=${String(this.volume)}
            @input=${this.handleVolumeChange}
          />
        </div>

        <!-- Stop -->
        <button
          class="secondary-btn"
          @click=${this.handleStop}
          ?disabled=${this.playbackState === 'stopped'}
          title="Stop"
        >
          ⏹
        </button>

        <!-- Play/Pause -->
        <button
          class=${classMap(playBtnClasses)}
          @click=${this.handlePlayPause}
          ?disabled=${this.playbackState === 'connecting'}
          title=${this.playbackState === 'playing' ? 'Pause' : 'Play'}
        >
          ${this.getPlayIcon()}
        </button>

        <!-- Reset -->
        <button
          class="secondary-btn"
          @click=${this.handleReset}
          title="Hard Reset"
        >
          ↻
        </button>

        <!-- Buffer indicator -->
        <div class="buffer-indicator" title="Buffer Level">
          <div
            class="buffer-fill"
            style="width: ${this.bufferLevel * 100}%"
          ></div>
        </div>
      </div>
    `;
    }
};
__decorate([
    property({ type: String })
], PlaybackControls.prototype, "playbackState", void 0);
__decorate([
    property({ type: Boolean })
], PlaybackControls.prototype, "isConnected", void 0);
__decorate([
    state()
], PlaybackControls.prototype, "volume", void 0);
__decorate([
    state()
], PlaybackControls.prototype, "bufferLevel", void 0);
__decorate([
    state()
], PlaybackControls.prototype, "isMuted", void 0);
PlaybackControls = __decorate([
    customElement('playback-controls')
], PlaybackControls);
export { PlaybackControls };
//# sourceMappingURL=playback-controls.js.map