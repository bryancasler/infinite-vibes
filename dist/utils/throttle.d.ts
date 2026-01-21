/**
 * Throttle and Debounce Utility Functions
 */
/**
 * Creates a throttled function that only executes at most once per specified interval
 */
export declare function throttle<T extends (...args: unknown[]) => unknown>(func: T, limit: number): (...args: Parameters<T>) => void;
/**
 * Creates a throttled function that also calls the function at the end of the throttle period
 * if it was called during the throttle
 */
export declare function throttleWithTrailing<T extends (...args: unknown[]) => unknown>(func: T, limit: number): (...args: Parameters<T>) => void;
/**
 * Creates a debounced function that delays execution until after a specified wait time
 * has passed since the last call
 */
export declare function debounce<T extends (...args: unknown[]) => unknown>(func: T, wait: number): (...args: Parameters<T>) => void;
/**
 * Creates a debounced function with immediate execution on the leading edge
 */
export declare function debounceImmediate<T extends (...args: unknown[]) => unknown>(func: T, wait: number): (...args: Parameters<T>) => void;
/**
 * Creates a function that can only be called once
 */
export declare function once<T extends (...args: unknown[]) => unknown>(func: T): (...args: Parameters<T>) => ReturnType<T> | undefined;
/**
 * Creates a function that executes on animation frame, ensuring only one
 * execution per frame
 */
export declare function rafThrottle<T extends (...args: unknown[]) => unknown>(func: T): (...args: Parameters<T>) => void;
/**
 * Creates a cancelable throttled function
 */
export declare function throttleCancelable<T extends (...args: unknown[]) => unknown>(func: T, limit: number): {
    (...args: Parameters<T>): void;
    cancel: () => void;
};
/**
 * Creates a cancelable debounced function
 */
export declare function debounceCancelable<T extends (...args: unknown[]) => unknown>(func: T, wait: number): {
    (...args: Parameters<T>): void;
    cancel: () => void;
    flush: () => void;
};
/**
 * Creates an async debounced function that returns a promise
 */
export declare function debounceAsync<T extends (...args: unknown[]) => Promise<unknown>>(func: T, wait: number): (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>>;
/**
 * Rate limiter that ensures minimum time between calls
 */
export declare class RateLimiter {
    private minInterval;
    private lastCall;
    private queue;
    private processing;
    constructor(minInterval: number);
    execute<T>(fn: () => T | Promise<T>): Promise<T>;
    private processQueue;
    private sleep;
    clear(): void;
}
//# sourceMappingURL=throttle.d.ts.map