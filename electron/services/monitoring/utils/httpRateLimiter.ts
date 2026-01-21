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
import { HttpRateLimiter } from "@shared/utils/httpRateLimiter";

import { logger } from "../../../utils/logger";

const sharedRateLimiter = new HttpRateLimiter({
    maxConcurrent: readNumberEnv("UW_HTTP_MAX_CONCURRENT", 8),
    maxWaitMs: readNumberEnv("UW_HTTP_MAX_WAIT_MS", 30_000),
    minIntervalMs: readNumberEnv("UW_HTTP_MIN_INTERVAL_MS", 200),
    onMaxWaitExceeded: ({
        key,
        waitedMs,
    }: {
        key: string;
        waitedMs: number;
    }): void => {
        logger.warn(
            `[HttpRateLimiter] Max wait time exceeded for ${key} after ${waitedMs}ms; proceeding`
        );
    },
    toKey: (url: string): string => {
        try {
            const parsed = new URL(url);
            return `${parsed.protocol}//${parsed.host}`;
        } catch {
            return "global";
        }
    },
});

/**
 * Get the shared HTTP rate limiter instance.
 */
export function getSharedHttpRateLimiter(): HttpRateLimiter {
    return sharedRateLimiter;
}
