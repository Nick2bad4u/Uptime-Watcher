import { createAbortError } from "@shared/utils/abortError";
import { getAbortSignalReason, sleepUnref } from "@shared/utils/abortUtils";

const DEFAULT_MAX_CONCURRENT = 1;
const DEFAULT_MAX_WAIT_MS = 30_000;
const DEFAULT_MIN_INTERVAL_MS = 0;

type OnMaxWaitExceeded = NonNullable<
    HttpRateLimiterConfig["onMaxWaitExceeded"]
>;
type ToKey = NonNullable<HttpRateLimiterConfig["toKey"]>;

function readOwnDataProperty(source: object, key: PropertyKey): unknown {
    const descriptor = Object.getOwnPropertyDescriptor(source, key);
    return descriptor && "value" in descriptor ? descriptor.value : undefined;
}

function isOnMaxWaitExceeded(value: unknown): value is OnMaxWaitExceeded {
    return typeof value === "function";
}

function isToKey(value: unknown): value is ToKey {
    return typeof value === "function";
}

function assertNotAborted(signal: AbortSignal | undefined): void {
    if (!signal?.aborted) {
        return;
    }

    throw createAbortError({
        cause: getAbortSignalReason(signal),
    });
}

function normalizeNonNegativeInteger(value: number, fallback: number): number {
    if (!Number.isFinite(value) || value < 0) {
        return fallback;
    }

    return Math.trunc(value);
}

function normalizePositiveInteger(value: number, fallback: number): number {
    if (!Number.isFinite(value) || value <= 0) {
        return fallback;
    }

    return Math.trunc(value);
}

function numberConfigValue(
    config: HttpRateLimiterConfig,
    key: keyof Pick<
        HttpRateLimiterConfig,
        | "maxConcurrent"
        | "maxWaitMs"
        | "minIntervalMs"
    >,
    fallback: number
): number {
    const value = readOwnDataProperty(config, key);
    return typeof value === "number" ? value : fallback;
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
     * @defaultValue (URL) =\> new URL(URL)
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
        const maxConcurrent = numberConfigValue(
            config,
            "maxConcurrent",
            DEFAULT_MAX_CONCURRENT
        );
        const minIntervalMs = numberConfigValue(
            config,
            "minIntervalMs",
            DEFAULT_MIN_INTERVAL_MS
        );
        const maxWaitMs = numberConfigValue(
            config,
            "maxWaitMs",
            DEFAULT_MAX_WAIT_MS
        );
        const onMaxWaitExceededCandidate = readOwnDataProperty(
            config,
            "onMaxWaitExceeded"
        );
        const toKeyCandidate = readOwnDataProperty(config, "toKey");
        const onMaxWaitExceeded = isOnMaxWaitExceeded(
            onMaxWaitExceededCandidate
        )
            ? onMaxWaitExceededCandidate
            : undefined;
        const toKey = isToKey(toKeyCandidate) ? toKeyCandidate : undefined;

        this.maxWaitMs = normalizeNonNegativeInteger(
            maxWaitMs,
            DEFAULT_MAX_WAIT_MS
        );
        this.config = {
            maxConcurrent: normalizePositiveInteger(
                maxConcurrent,
                DEFAULT_MAX_CONCURRENT
            ),
            maxWaitMs: this.maxWaitMs,
            minIntervalMs: normalizeNonNegativeInteger(
                minIntervalMs,
                DEFAULT_MIN_INTERVAL_MS
            ),
            ...(onMaxWaitExceeded && { onMaxWaitExceeded }),
            ...(toKey && { toKey }),
        };
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
