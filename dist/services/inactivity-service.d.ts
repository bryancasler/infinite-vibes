/**
 * Inactivity Service
 * Detects user inactivity to fade out UI for immersion
 */
export type InactivityEventType = 'active' | 'inactive';
export interface InactivityEvent {
    type: InactivityEventType;
    idleDuration: number;
}
type InactivityEventCallback = (event: InactivityEvent) => void;
/**
 * Service for detecting user inactivity
 */
export declare class InactivityService {
    private static instance;
    private timeoutId;
    private lastActivityTime;
    private isActive;
    private isEnabled;
    private timeoutDuration;
    private eventListeners;
    private trackedEvents;
    private boundHandleActivity;
    private constructor();
    /**
     * Gets the singleton instance
     */
    static getInstance(): InactivityService;
    /**
     * Starts monitoring for inactivity
     */
    start(): void;
    /**
     * Stops monitoring for inactivity
     */
    stop(): void;
    /**
     * Enables or disables the service
     */
    setEnabled(enabled: boolean): void;
    /**
     * Gets whether the service is enabled
     */
    getEnabled(): boolean;
    /**
     * Sets the inactivity timeout duration
     */
    setTimeoutDuration(duration: number): void;
    /**
     * Gets the current timeout duration
     */
    getTimeoutDuration(): number;
    /**
     * Gets whether the user is currently active
     */
    getIsActive(): boolean;
    /**
     * Gets the duration of current idle period (if inactive)
     */
    getIdleDuration(): number;
    /**
     * Adds an event listener
     */
    on(callback: InactivityEventCallback): void;
    /**
     * Removes an event listener
     */
    off(callback: InactivityEventCallback): void;
    /**
     * Emits an event to all listeners
     */
    private emit;
    /**
     * Handles user activity
     */
    private handleActivity;
    /**
     * Sets the active state and emits event
     */
    private setActive;
    /**
     * Resets the inactivity timeout
     */
    private resetTimeout;
    /**
     * Manually triggers active state (useful for programmatic UI interactions)
     */
    triggerActivity(): void;
    /**
     * Disposes of resources
     */
    dispose(): void;
}
export declare const getInactivityService: () => InactivityService;
export {};
//# sourceMappingURL=inactivity-service.d.ts.map