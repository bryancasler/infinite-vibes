/**
 * Inactivity Service
 * Detects user inactivity to fade out UI for immersion
 */
import { UI_CONFIG } from '../utils/constants.js';
/**
 * Service for detecting user inactivity
 */
export class InactivityService {
    constructor() {
        this.timeoutId = null;
        this.lastActivityTime = Date.now();
        this.isActive = true;
        this.isEnabled = true;
        this.timeoutDuration = UI_CONFIG.INACTIVITY_TIMEOUT;
        this.eventListeners = new Set();
        // Events to track
        this.trackedEvents = [
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
        this.boundHandleActivity = this.handleActivity.bind(this);
    }
    /**
     * Gets the singleton instance
     */
    static getInstance() {
        if (!InactivityService.instance) {
            InactivityService.instance = new InactivityService();
        }
        return InactivityService.instance;
    }
    /**
     * Starts monitoring for inactivity
     */
    start() {
        if (!this.isEnabled)
            return;
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
    stop() {
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
    setEnabled(enabled) {
        this.isEnabled = enabled;
        if (!enabled) {
            this.stop();
            this.setActive(true);
        }
    }
    /**
     * Gets whether the service is enabled
     */
    getEnabled() {
        return this.isEnabled;
    }
    /**
     * Sets the inactivity timeout duration
     */
    setTimeoutDuration(duration) {
        this.timeoutDuration = Math.max(1000, duration);
        this.resetTimeout();
    }
    /**
     * Gets the current timeout duration
     */
    getTimeoutDuration() {
        return this.timeoutDuration;
    }
    /**
     * Gets whether the user is currently active
     */
    getIsActive() {
        return this.isActive;
    }
    /**
     * Gets the duration of current idle period (if inactive)
     */
    getIdleDuration() {
        if (this.isActive)
            return 0;
        return Date.now() - this.lastActivityTime;
    }
    /**
     * Adds an event listener
     */
    on(callback) {
        this.eventListeners.add(callback);
    }
    /**
     * Removes an event listener
     */
    off(callback) {
        this.eventListeners.delete(callback);
    }
    /**
     * Emits an event to all listeners
     */
    emit(event) {
        this.eventListeners.forEach((callback) => {
            try {
                callback(event);
            }
            catch (error) {
                console.error('Error in inactivity event listener:', error);
            }
        });
    }
    /**
     * Handles user activity
     */
    handleActivity() {
        this.lastActivityTime = Date.now();
        if (!this.isActive) {
            this.setActive(true);
        }
        this.resetTimeout();
    }
    /**
     * Sets the active state and emits event
     */
    setActive(active) {
        if (this.isActive === active)
            return;
        this.isActive = active;
        this.emit({
            type: active ? 'active' : 'inactive',
            idleDuration: active ? 0 : this.getIdleDuration(),
        });
    }
    /**
     * Resets the inactivity timeout
     */
    resetTimeout() {
        if (this.timeoutId !== null) {
            clearTimeout(this.timeoutId);
        }
        if (!this.isEnabled)
            return;
        this.timeoutId = setTimeout(() => {
            this.setActive(false);
        }, this.timeoutDuration);
    }
    /**
     * Manually triggers active state (useful for programmatic UI interactions)
     */
    triggerActivity() {
        this.handleActivity();
    }
    /**
     * Disposes of resources
     */
    dispose() {
        this.stop();
        this.eventListeners.clear();
    }
}
// Export singleton instance getter
export const getInactivityService = () => InactivityService.getInstance();
//# sourceMappingURL=inactivity-service.js.map