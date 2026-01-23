import { createAbortError } from "@shared/utils/abortError";
import { sleepUnref } from "@shared/utils/abortUtils";

function assertNotAborted(signal: AbortSignal | undefined): void {
    if (!signal?.aborted) {
        return;
    }

    throw createAbortError({
        cause: Reflect.get(signal, "reason"),
    });
}

/**
 * Configuration for {@link HttpRateLimiter}.
 */
export interface HttpRateLimiterConfig {
    /** Max number of concurrent operations globally. */
    readonly maxConcurrent: number;

    /**
     * Maximum time to wait for a slot before failing (ms).
     *
     * @defaultValue 30_000
     */
    readonly maxWaitMs?: number;

    /** Minimum interval between requests to the same key (ms). */
    readonly minIntervalMs: number;

    /**
     * Optional callback invoked when a caller waited longer than maxWaitMs.
     *
     * @remarks
     * This is useful for logging/telemetry in environment-specific wrappers.
     */
    readonly onMaxWaitExceeded?: (context: {
        readonly key: string;
        readonly waitedMs: number;
    }) => void;

    /**
     * Optional key derivation function.
     *
     * @defaultValue (url) =\> new URL(url)
     */
    readonly toKey?: (url: string) => string;
}

/**
 * A small rate limiter designed for HTTP monitor workloads.
 *
 * @remarks
 * This is intentionally environment-agnostic and safe for shared usage.
 * Consumers may wrap it to add logging or load config from env vars.
 */
export class HttpRateLimiter {
    private readonly lastInvocationByKey = new Map<string, number>();

    private active = 0;

    private readonly maxWaitMs: number;

    private readonly config: HttpRateLimiterConfig;

    public async schedule<T>(
        url: string,
        operation: () => Promise<T>,
        options?: { readonly signal?: AbortSignal }
    ): Promise<T> {
        const key = this.toKey(url);
        const startWaitMs = Date.now();
        const signal = options?.signal;

        while (true) {
            assertNotAborted(signal);

            const nowMs = Date.now();
            const lastStartTimeMs = this.lastInvocationByKey.get(key) ?? 0;

            const canStartGlobal = this.active < this.config.maxConcurrent;
            const sinceLastStartMs = nowMs - lastStartTimeMs;
            const canStartKey = sinceLastStartMs >= this.config.minIntervalMs;

            if (canStartGlobal && canStartKey) {
                this.active += 1;
                this.lastInvocationByKey.set(key, nowMs);

                try {
                    // eslint-disable-next-line no-await-in-loop -- retry loop requires sequential awaits
                    return await operation();
                } finally {
                    this.active = Math.max(0, this.active - 1);
                }
            }

            const waitedMs = Date.now() - startWaitMs;
            if (waitedMs > this.maxWaitMs) {
                // Respect cancellation even when failing open.
                assertNotAborted(signal);

                this.config.onMaxWaitExceeded?.({ key, waitedMs });

                // Fail-open: proceed rather than risking deadlock.
                this.active += 1;
                this.lastInvocationByKey.set(key, Date.now());
                try {
                    // eslint-disable-next-line no-await-in-loop -- retry loop requires sequential awaits
                    return await operation();
                } finally {
                    this.active = Math.max(0, this.active - 1);
                }
            }

            const waitForMs = canStartKey
                ? 25
                : Math.max(0, this.config.minIntervalMs - sinceLastStartMs);

            try {
                // eslint-disable-next-line no-await-in-loop -- scheduling loop requires sequential delays
                await sleepUnref(waitForMs, signal);
            } catch (error) {
                // Normalize abort errors coming from the sleep helper so
                // callers can consistently treat queue cancellation as an
                // AbortError.
                assertNotAborted(signal);
                throw error;
            }
        }
    }

    public constructor(config: HttpRateLimiterConfig) {
        this.config = config;
        this.maxWaitMs = config.maxWaitMs ?? 30_000;
    }

    private toKey(url: string): string {
        if (this.config.toKey) {
            return this.config.toKey(url);
        }

        try {
            return new URL(url).host;
        } catch {
            // Fallback: treat the whole string as the key.
            return url;
        }
    }
}
