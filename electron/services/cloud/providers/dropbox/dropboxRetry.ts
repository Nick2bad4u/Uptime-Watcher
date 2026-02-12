import { logger } from "@electron/utils/logger";
import { calculateBackoffDelayMs } from "@shared/utils/backoff";
import { withRetry } from "@shared/utils/retry";
import { isRecord } from "@shared/utils/typeHelpers";
import axios from "axios";
import { DropboxResponseError } from "dropbox";
import { randomInt } from "node:crypto";

const DEFAULT_INITIAL_DELAY_MS = 500;
const DEFAULT_MAX_DELAY_MS = 10_000;
const DEFAULT_MAX_ATTEMPTS = 4;

function parseRetryAfterMs(value: unknown): number | undefined {
    if (typeof value !== "string") {
        return undefined;
    }

    const trimmed = value.trim();
    if (trimmed.length === 0) {
        return undefined;
    }

    // Retry-After can be either seconds or an HTTP date.
    const seconds = Number(trimmed);
    if (Number.isFinite(seconds) && seconds >= 0) {
        return Math.round(seconds * 1000);
    }

    const dateMs = Date.parse(trimmed);
    if (Number.isFinite(dateMs)) {
        const delta = dateMs - Date.now();
        return Math.max(delta, 0);
    }

    return undefined;
}

function readHeaderValue(headers: unknown, headerName: string): unknown {
    if (!headers || typeof headers !== "object") {
        return undefined;
    }

    // node-fetch Headers
    if (isRecord(headers)) {
        const maybeGet = headers["get"];
        if (typeof maybeGet === "function") {
            return Reflect.apply(maybeGet, headers, [headerName]);
        }
    }

    if (!isRecord(headers)) {
        return undefined;
    }

    const record = headers;
    return (
        record[headerName] ??
        record[headerName.toLowerCase()] ??
        record[headerName.toUpperCase()]
    );
}

function computeBackoffDelayMs(args: {
    attemptIndex: number;
    initialDelayMs: number;
    maxDelayMs: number;
}): number {
    const capped = Math.min(
        args.maxDelayMs,
        calculateBackoffDelayMs({
            attemptIndex: args.attemptIndex,
            initialDelayMs: args.initialDelayMs,
            strategy: "exponential",
        })
    );
    const jitterRange = Math.max(1, Math.round(capped * 0.1));
    return Math.max(1, capped + randomInt(-jitterRange, jitterRange + 1));
}

function extractRetryableHttpFailure(error: unknown): null | {
    retryAfterMs?: number;
    status?: number;
} {
    if (error instanceof DropboxResponseError) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- Dropbox SDK types `headers` as `any`.
        const { headers, status } = error;
        const retryAfterMs = parseRetryAfterMs(
            readHeaderValue(headers, "retry-after")
        );

        if (status === 429) {
            return {
                status,
                ...(retryAfterMs === undefined ? {} : { retryAfterMs }),
            };
        }

        if (
            status === 500 ||
            status === 502 ||
            status === 503 ||
            status === 504
        ) {
            return {
                status,
                ...(retryAfterMs === undefined ? {} : { retryAfterMs }),
            };
        }

        return null;
    }

    if (!axios.isAxiosError(error)) {
        // node-fetch / undici-style network errors.
        if (error instanceof Error) {
            if (
                typeof error.name === "string" &&
                error.name.toLowerCase().includes("fetch")
            ) {
                return {};
            }

            const message = error.message.toLowerCase();
            if (
                message.includes("econn") ||
                message.includes("timeout") ||
                message.includes("socket")
            ) {
                return {};
            }
        }

        return null;
    }

    const status = error.response?.status;
    const retryAfterMs = parseRetryAfterMs(
        readHeaderValue(error.response?.headers, "retry-after")
    );

    // Dropbox uses standard HTTP status codes.
    if (
        status === 429 ||
        status === 500 ||
        status === 502 ||
        status === 503 ||
        status === 504
    ) {
        return {
            status,
            ...(retryAfterMs === undefined ? {} : { retryAfterMs }),
        };
    }

    // Network / transport errors often have no HTTP status.
    if (status === undefined) {
        return {};
    }

    return null;
}

/**
 * Executes a Dropbox HTTP operation with a retry policy.
 */
export async function withDropboxRetry<T>(args: {
    fn: () => Promise<T>;
    initialDelayMs?: number;
    maxAttempts?: number;
    maxDelayMs?: number;
    operationName: string;
}): Promise<T> {
    const maxAttempts = args.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
    const initialDelayMs = args.initialDelayMs ?? DEFAULT_INITIAL_DELAY_MS;
    const maxDelayMs = args.maxDelayMs ?? DEFAULT_MAX_DELAY_MS;

    return withRetry(args.fn, {
        delayMs: ({ attempt, error }) => {
            const retryable = extractRetryableHttpFailure(error);
            if (!retryable) {
                return 0;
            }

            const computedDelay = computeBackoffDelayMs({
                attemptIndex: attempt - 1,
                initialDelayMs,
                maxDelayMs,
            });

            return typeof retryable.retryAfterMs === "number"
                ? Math.max(computedDelay, retryable.retryAfterMs)
                : computedDelay;
        },
        maxRetries: maxAttempts,
        onFailedAttempt: ({ attempt, delayMs, error }) => {
            const retryable = extractRetryableHttpFailure(error);

            logger.warn("[Dropbox] Retrying operation", {
                attempt,
                delayMs,
                operation: args.operationName,
                status: retryable?.status,
            });
        },
        shouldRetry: (error: unknown, attempt: number) => {
            const retryable = extractRetryableHttpFailure(error);
            return retryable !== null && attempt < maxAttempts;
        },
        unrefDelay: true,
    });
}
