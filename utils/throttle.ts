/**
 * Throttle and Debounce Utility Functions
 */

/**
 * Creates a throttled function that only executes at most once per specified interval
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  let lastResult: ReturnType<T> | undefined;

  return function (this: unknown, ...args: Parameters<T>): void {
    if (!inThrottle) {
      lastResult = func.apply(this, args) as ReturnType<T>;
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
export function throttleWithTrailing<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  let lastArgs: Parameters<T> | null = null;

  return function (this: unknown, ...args: Parameters<T>): void {
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
    } else {
      lastArgs = args;
    }
  };
}

/**
 * Creates a debounced function that delays execution until after a specified wait time
 * has passed since the last call
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function (this: unknown, ...args: Parameters<T>): void {
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
export function debounceImmediate<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let isLeading = true;

  return function (this: unknown, ...args: Parameters<T>): void {
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
export function once<T extends (...args: unknown[]) => unknown>(
  func: T
): (...args: Parameters<T>) => ReturnType<T> | undefined {
  let called = false;
  let result: ReturnType<T> | undefined;

  return function (this: unknown, ...args: Parameters<T>): ReturnType<T> | undefined {
    if (!called) {
      called = true;
      result = func.apply(this, args) as ReturnType<T>;
    }
    return result;
  };
}

/**
 * Creates a function that executes on animation frame, ensuring only one
 * execution per frame
 */
export function rafThrottle<T extends (...args: unknown[]) => unknown>(
  func: T
): (...args: Parameters<T>) => void {
  let rafId: number | null = null;
  let lastArgs: Parameters<T> | null = null;

  return function (this: unknown, ...args: Parameters<T>): void {
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
export function throttleCancelable<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): {
  (...args: Parameters<T>): void;
  cancel: () => void;
} {
  let inThrottle = false;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const throttled = function (this: unknown, ...args: Parameters<T>): void {
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
export function debounceCancelable<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): {
  (...args: Parameters<T>): void;
  cancel: () => void;
  flush: () => void;
} {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;
  let context: unknown = null;

  const debounced = function (this: unknown, ...args: Parameters<T>): void {
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
export function debounceAsync<T extends (...args: unknown[]) => Promise<unknown>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>> {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let resolveList: ((value: Awaited<ReturnType<T>>) => void)[] = [];
  let rejectList: ((reason: unknown) => void)[] = [];

  return function (this: unknown, ...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> {
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
          currentResolves.forEach((r) => r(result as Awaited<ReturnType<T>>));
        } catch (error) {
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
  private lastCall = 0;
  private queue: (() => void)[] = [];
  private processing = false;

  constructor(private minInterval: number) {}

  async execute<T>(fn: () => T | Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
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

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  clear(): void {
    this.queue = [];
  }
}
