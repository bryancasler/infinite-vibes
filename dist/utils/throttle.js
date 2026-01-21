/**
 * Throttle and Debounce Utility Functions
 */
/**
 * Creates a throttled function that only executes at most once per specified interval
 */
export function throttle(func, limit) {
    let inThrottle = false;
    let lastResult;
    return function (...args) {
        if (!inThrottle) {
            lastResult = func.apply(this, args);
            inThrottle = true;
            setTimeout(() => {
                inThrottle = false;
            }, limit);
        }
    };
}
/**
 * Creates a throttled function that also calls the function at the end of the throttle period
 * if it was called during the throttle
 */
export function throttleWithTrailing(func, limit) {
    let inThrottle = false;
    let lastArgs = null;
    return function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => {
                inThrottle = false;
                if (lastArgs) {
                    func.apply(this, lastArgs);
                    lastArgs = null;
                }
            }, limit);
        }
        else {
            lastArgs = args;
        }
    };
}
/**
 * Creates a debounced function that delays execution until after a specified wait time
 * has passed since the last call
 */
export function debounce(func, wait) {
    let timeoutId = null;
    return function (...args) {
        if (timeoutId !== null) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            func.apply(this, args);
            timeoutId = null;
        }, wait);
    };
}
/**
 * Creates a debounced function with immediate execution on the leading edge
 */
export function debounceImmediate(func, wait) {
    let timeoutId = null;
    let isLeading = true;
    return function (...args) {
        if (isLeading) {
            func.apply(this, args);
            isLeading = false;
        }
        if (timeoutId !== null) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            isLeading = true;
            timeoutId = null;
        }, wait);
    };
}
/**
 * Creates a function that can only be called once
 */
export function once(func) {
    let called = false;
    let result;
    return function (...args) {
        if (!called) {
            called = true;
            result = func.apply(this, args);
        }
        return result;
    };
}
/**
 * Creates a function that executes on animation frame, ensuring only one
 * execution per frame
 */
export function rafThrottle(func) {
    let rafId = null;
    let lastArgs = null;
    return function (...args) {
        lastArgs = args;
        if (rafId === null) {
            rafId = requestAnimationFrame(() => {
                if (lastArgs) {
                    func.apply(this, lastArgs);
                }
                rafId = null;
            });
        }
    };
}
/**
 * Creates a cancelable throttled function
 */
export function throttleCancelable(func, limit) {
    let inThrottle = false;
    let timeoutId = null;
    const throttled = function (...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            timeoutId = setTimeout(() => {
                inThrottle = false;
                timeoutId = null;
            }, limit);
        }
    };
    throttled.cancel = () => {
        if (timeoutId !== null) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }
        inThrottle = false;
    };
    return throttled;
}
/**
 * Creates a cancelable debounced function
 */
export function debounceCancelable(func, wait) {
    let timeoutId = null;
    let lastArgs = null;
    let context = null;
    const debounced = function (...args) {
        context = this;
        lastArgs = args;
        if (timeoutId !== null) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            if (lastArgs) {
                func.apply(context, lastArgs);
            }
            timeoutId = null;
            lastArgs = null;
        }, wait);
    };
    debounced.cancel = () => {
        if (timeoutId !== null) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }
        lastArgs = null;
    };
    debounced.flush = () => {
        if (timeoutId !== null && lastArgs) {
            clearTimeout(timeoutId);
            func.apply(context, lastArgs);
            timeoutId = null;
            lastArgs = null;
        }
    };
    return debounced;
}
/**
 * Creates an async debounced function that returns a promise
 */
export function debounceAsync(func, wait) {
    let timeoutId = null;
    let resolveList = [];
    let rejectList = [];
    return function (...args) {
        return new Promise((resolve, reject) => {
            resolveList.push(resolve);
            rejectList.push(reject);
            if (timeoutId !== null) {
                clearTimeout(timeoutId);
            }
            timeoutId = setTimeout(async () => {
                const currentResolves = resolveList;
                const currentRejects = rejectList;
                resolveList = [];
                rejectList = [];
                timeoutId = null;
                try {
                    const result = await func.apply(this, args);
                    currentResolves.forEach((r) => r(result));
                }
                catch (error) {
                    currentRejects.forEach((r) => r(error));
                }
            }, wait);
        });
    };
}
/**
 * Rate limiter that ensures minimum time between calls
 */
export class RateLimiter {
    constructor(minInterval) {
        this.minInterval = minInterval;
        this.lastCall = 0;
        this.queue = [];
        this.processing = false;
    }
    async execute(fn) {
        return new Promise((resolve, reject) => {
            this.queue.push(async () => {
                try {
                    const result = await fn();
                    resolve(result);
                }
                catch (error) {
                    reject(error);
                }
            });
            this.processQueue();
        });
    }
    async processQueue() {
        if (this.processing || this.queue.length === 0) {
            return;
        }
        this.processing = true;
        while (this.queue.length > 0) {
            const now = Date.now();
            const timeSinceLastCall = now - this.lastCall;
            if (timeSinceLastCall < this.minInterval) {
                await this.sleep(this.minInterval - timeSinceLastCall);
            }
            const fn = this.queue.shift();
            if (fn) {
                this.lastCall = Date.now();
                await fn();
            }
        }
        this.processing = false;
    }
    sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
    clear() {
        this.queue = [];
    }
}
//# sourceMappingURL=throttle.js.map