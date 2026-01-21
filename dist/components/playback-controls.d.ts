/**
 * Playback Controls Component
 */
import { LitElement } from 'lit';
import type { PlaybackState } from '../types.js';
export declare class PlaybackControls extends LitElement {
    static styles: import("lit").CSSResult;
    playbackState: PlaybackState;
    isConnected: boolean;
    private volume;
    private bufferLevel;
    private isMuted;
    private orchestrator;
    private audioService;
    private previousVolume;
    connectedCallback(): void;
    disconnectedCallback(): void;
    private handleBufferUpdate;
    private handlePlayPause;
    private handleStop;
    private handleReset;
    private handleVolumeChange;
    private handleVolumeToggle;
    private getPlayIcon;
    private getVolumeIcon;
    render(): import("lit-html").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'playback-controls': PlaybackControls;
    }
}
//# sourceMappingURL=playback-controls.d.ts.map