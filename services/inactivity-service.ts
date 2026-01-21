/**
 * Inactivity Service
 * Detects user inactivity to fade out UI for immersion
 */

import { UI_CONFIG } from '../utils/constants.js';

export type InactivityEventType = 'active' | 'inactive';

export interface InactivityEvent {
  type: InactivityEventType;
  idleDuration: number;
}

type InactivityEventCallback = (event: InactivityEvent) => void;

/**
 * Service for detecting user inactivity
 */
export class InactivityService {
  private static instance: InactivityService;

  private timeoutId: ReturnType<typeof setTimeout> | null = null;
  private lastActivityTime: number = Date.now();
  private isActive = true;
  private isEnabled = true;
  private timeoutDuration = UI_CONFIG.INACTIVITY_TIMEOUT;

  private eventListeners: Set<InactivityEventCallback> = new Set();

  // Events to track
  private trackedEvents = [
    'mousemove',
    'mousedown',
    'mouseup',
    'keydown',
    'keyup',
    'touchstart',
    'touchmove',
    'touchend',
    'scroll',
    'wheel',
  ];

  private boundHandleActivity: () => void;

  private constructor() {
    this.boundHandleActivity = this.handleActivity.bind(this);
  }

  /**
   * Gets the singleton instance
   */
  static getInstance(): InactivityService {
    if (!InactivityService.instance) {
      InactivityService.instance = new InactivityService();
    }
    return InactivityService.instance;
  }

  /**
   * Starts monitoring for inactivity
   */
  start(): void {
    if (!this.isEnabled) return;

    // Add event listeners
    this.trackedEvents.forEach((event) => {
      document.addEventListener(event, this.boundHandleActivity, {
        passive: true,
      });
    });

    // Start the timeout
    this.resetTimeout();
  }

  /**
   * Stops monitoring for inactivity
   */
  stop(): void {
    // Remove event listeners
    this.trackedEvents.forEach((event) => {
      document.removeEventListener(event, this.boundHandleActivity);
    });

    // Clear timeout
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    // Reset state
    this.setActive(true);
  }

  /**
   * Enables or disables the service
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;

    if (!enabled) {
      this.stop();
      this.setActive(true);
    }
  }

  /**
   * Gets whether the service is enabled
   */
  getEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Sets the inactivity timeout duration
   */
  setTimeoutDuration(duration: number): void {
    this.timeoutDuration = Math.max(1000, duration);
    this.resetTimeout();
  }

  /**
   * Gets the current timeout duration
   */
  getTimeoutDuration(): number {
    return this.timeoutDuration;
  }

  /**
   * Gets whether the user is currently active
   */
  getIsActive(): boolean {
    return this.isActive;
  }

  /**
   * Gets the duration of current idle period (if inactive)
   */
  getIdleDuration(): number {
    if (this.isActive) return 0;
    return Date.now() - this.lastActivityTime;
  }

  /**
   * Adds an event listener
   */
  on(callback: InactivityEventCallback): void {
    this.eventListeners.add(callback);
  }

  /**
   * Removes an event listener
   */
  off(callback: InactivityEventCallback): void {
    this.eventListeners.delete(callback);
  }

  /**
   * Emits an event to all listeners
   */
  private emit(event: InactivityEvent): void {
    this.eventListeners.forEach((callback) => {
      try {
        callback(event);
      } catch (error) {
        console.error('Error in inactivity event listener:', error);
      }
    });
  }

  /**
   * Handles user activity
   */
  private handleActivity(): void {
    this.lastActivityTime = Date.now();

    if (!this.isActive) {
      this.setActive(true);
    }

    this.resetTimeout();
  }

  /**
   * Sets the active state and emits event
   */
  private setActive(active: boolean): void {
    if (this.isActive === active) return;

    this.isActive = active;

    this.emit({
      type: active ? 'active' : 'inactive',
      idleDuration: active ? 0 : this.getIdleDuration(),
    });
  }

  /**
   * Resets the inactivity timeout
   */
  private resetTimeout(): void {
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
    }

    if (!this.isEnabled) return;

    this.timeoutId = setTimeout(() => {
      this.setActive(false);
    }, this.timeoutDuration);
  }

  /**
   * Manually triggers active state (useful for programmatic UI interactions)
   */
  triggerActivity(): void {
    this.handleActivity();
  }

  /**
   * Disposes of resources
   */
  dispose(): void {
    this.stop();
    this.eventListeners.clear();
  }
}

// Export singleton instance getter
export const getInactivityService = (): InactivityService =>
  InactivityService.getInstance();
