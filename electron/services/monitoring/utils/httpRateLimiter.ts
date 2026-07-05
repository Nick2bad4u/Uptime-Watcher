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
import { isFinite as isFiniteNumber } from "ts-extras";

import { logger } from "../../../utils/logger";

const MAX_CONCURRENT_CAP = 64;
const MAX_WAIT_MS_CAP = 120_000;
const MIN_INTERVAL_MS_CAP = 60_000;

function normalizePositiveInteger(value: number, fallback: number): number {
    if (!isFiniteNumber(value) || value <= 0) {
        return fallback;
    }

    return Math.trunc(value);
}

function readBoundedPositiveIntegerEnv(args: {
    readonly defaultValue: number;
    readonly key: string;
    readonly maxValue: number;
}): number {
    return Math.min(
        normalizePositiveInteger(args.maxValue, args.defaultValue),
        normalizePositiveInteger(
            readNumberEnv(args.key, args.defaultValue),
            args.defaultValue
        )
    );
}

const sharedRateLimiter = new HttpRateLimiter({
    maxConcurrent: readBoundedPositiveIntegerEnv({
        defaultValue: 8,
        key: "UW_HTTP_MAX_CONCURRENT",
        maxValue: MAX_CONCURRENT_CAP,
    }),
    maxWaitMs: readBoundedPositiveIntegerEnv({
        defaultValue: 30_000,
        key: "UW_HTTP_MAX_WAIT_MS",
        maxValue: MAX_WAIT_MS_CAP,
    }),
    minIntervalMs: readBoundedPositiveIntegerEnv({
        defaultValue: 200,
        key: "UW_HTTP_MIN_INTERVAL_MS",
        maxValue: MIN_INTERVAL_MS_CAP,
    }),
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
