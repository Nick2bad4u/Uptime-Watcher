import { ensureError } from "@shared/utils/errorHandling";
import axios from "axios";
import { randomInt } from "node:crypto";

import { logger } from "../../../../utils/logger";

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

function computeBackoffDelayMs(args: {
    attemptIndex: number;
    initialDelayMs: number;
    maxDelayMs: number;
}): number {
    const exponent = Math.max(0, args.attemptIndex);
    const base = args.initialDelayMs * 2 ** exponent;
    const capped = Math.min(args.maxDelayMs, base);
    const jitterRange = Math.max(1, Math.round(capped * 0.1));
    return Math.max(1, capped + randomInt(-jitterRange, jitterRange + 1));
}

async function sleep(delayMs: number): Promise<void> {
    await new Promise<void>((resolve) => {
        const timer = setTimeout(resolve, delayMs);
        timer.unref();
    });
}

function isRetryableAxiosError(error: unknown): null | {
    retryAfterMs?: number;
    status?: number;
} {
    if (!axios.isAxiosError(error)) {
        return null;
    }

    const status = error.response?.status;
    const retryAfterMs = parseRetryAfterMs(
        error.response?.headers["retry-after"]
    );

    // Dropbox uses standard HTTP status codes.
    if (status === 429) {
        return {
            status,
            ...(retryAfterMs === undefined ? {} : { retryAfterMs }),
        };
    }

    if (status === 500 || status === 502 || status === 503 || status === 504) {
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

    let attempt = 0;

    while (true) {
        try {
            // eslint-disable-next-line no-await-in-loop -- Retry loop is intentionally sequential.
            return await args.fn();
        } catch (error) {
            attempt += 1;
            const retryable = isRetryableAxiosError(error);

            if (!retryable || attempt >= maxAttempts) {
                throw ensureError(error);
            }

            const computedDelay = computeBackoffDelayMs({
                attemptIndex: attempt - 1,
                initialDelayMs,
                maxDelayMs,
            });

            const delayMs =
                typeof retryable.retryAfterMs === "number"
                    ? Math.max(computedDelay, retryable.retryAfterMs)
                    : computedDelay;

            logger.warn("[Dropbox] Retrying operation", {
                attempt,
                delayMs,
                operation: args.operationName,
                status: retryable.status,
            });

            // eslint-disable-next-line no-await-in-loop -- Retry loop is intentionally sequential.
            await sleep(delayMs);
        }
    }
}
