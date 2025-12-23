/**
 * Shared HTTP monitoring rate limiter to prevent request flooding.
 *
 * @remarks
 * Provides coarse-grained concurrency limiting for all HTTP-based monitor
 * services. The limiter enforces both maximum concurrency and minimum interval
 * between requests to the same host. A shared singleton instance is exposed so
 * that multiple monitor services can coordinate their traffic shaping.
 */

import { readNumberEnv } from "@shared/utils/environment";

import { logger } from "../../../utils/logger";

/**
 * Lightweight in-memory rate limiter for HTTP monitor requests.
 */
export class HttpRateLimiter {
    private readonly lastInvocation = new Map<string, number>();

    private active = 0;

    private readonly maxConcurrent: number;

    private readonly minIntervalMs: number;

    private readonly maxWaitMs: number;

    /**
     * Schedule a function respecting concurrency and rate limits.
     */
    public async schedule<T>(url: string, fn: () => Promise<T>): Promise<T> {
        const key = this.getKey(url);
        const sleep = async (ms: number): Promise<void> =>
            new Promise((resolve) => {
                // eslint-disable-next-line clean-timer/assign-timer-id -- Timer completes when promise resolves
                setTimeout(resolve, ms);
            });

        const startTime = Date.now();
        let shouldContinue = true;
        while (shouldContinue) {
            const now = Date.now();

            if (now - startTime > this.maxWaitMs) {
                logger.warn(
                    `[HttpRateLimiter] Max wait time exceeded for ${url}, proceeding`
                );
                shouldContinue = false;
            } else {
                const last = this.lastInvocation.get(key) ?? 0;
                const since = now - last;
                const needDelay = since < this.minIntervalMs;

                if (this.active < this.maxConcurrent && !needDelay) {
                    shouldContinue = false;
                } else {
                    const waitFor = needDelay ? this.minIntervalMs - since : 25;
                    // eslint-disable-next-line no-await-in-loop -- Sequential delays are required for rate limiting
                    await sleep(waitFor);
                }
            }
        }

        this.active += 1;
        this.lastInvocation.set(key, Date.now());
        try {
            return await fn();
        } finally {
            this.active -= 1;
        }
    }

    private getKey(url: string): string {
        try {
            const parsed = new URL(url);
            return `${parsed.protocol}//${parsed.host}`;
        } catch {
            return "global";
        }
    }

    public constructor(
        maxConcurrent: number,
        minIntervalMs: number,
        maxWaitMs = 30_000
    ) {
        this.maxConcurrent = maxConcurrent;
        this.minIntervalMs = minIntervalMs;
        this.maxWaitMs = maxWaitMs;
    }
}

const sharedRateLimiter = new HttpRateLimiter(
    readNumberEnv("UW_HTTP_MAX_CONCURRENT", 8),
    readNumberEnv("UW_HTTP_MIN_INTERVAL_MS", 200)
);

/**
 * Get the shared HTTP rate limiter instance.
 */
export function getSharedHttpRateLimiter(): HttpRateLimiter {
    return sharedRateLimiter;
}
