import type { Logger } from "@shared/utils/logger/interfaces";

import { getUnknownErrorMessage } from "@shared/utils/errorCatalog";
import { ensureError } from "@shared/utils/errorHandling";
import { withRetry } from "@shared/utils/retry";
import { randomInt } from "node:crypto";

/**
 * Vite development-server readiness configuration.
 *
 * @internal
 */
export const VITE_DEV_SERVER_CONFIG = {
    /** Base delay for exponential backoff in milliseconds. */
    BASE_DELAY: 500,
    /** Fetch timeout for each connection attempt in milliseconds. */
    FETCH_TIMEOUT: 5000,
    /** Maximum delay between retries in milliseconds. */
    MAX_DELAY: 10_000,
    /** Maximum number of connection attempts. */
    MAX_ATTEMPTS: 20,
    /** URL for the Vite development server. */
    SERVER_URL: "http://localhost:5173",
} as const;

const JITTER_MS = 200;

class ViteDevServerNotReadyError extends Error {
    public override readonly name = "ViteDevServerNotReadyError";
}

interface WaitForViteDevServerOptions {
    readonly fetchImplementation?: typeof fetch;
    readonly logger: Pick<Logger, "debug">;
}

/**
 * Waits for the Vite development server using bounded exponential backoff.
 *
 * @internal
 */
export async function waitForViteDevServer(
    options: WaitForViteDevServerOptions
): Promise<void> {
    const fetchImplementation = options.fetchImplementation ?? fetch;
    const { BASE_DELAY, FETCH_TIMEOUT, MAX_ATTEMPTS, MAX_DELAY, SERVER_URL } =
        VITE_DEV_SERVER_CONFIG;

    try {
        await withRetry(
            async () => {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => {
                    controller.abort();
                }, FETCH_TIMEOUT);
                timeoutId.unref();

                try {
                    const response = await fetchImplementation(SERVER_URL, {
                        signal: controller.signal,
                    });

                    if (response.ok) {
                        options.logger.debug(
                            "[WindowService] Vite dev server is ready"
                        );
                        return;
                    }

                    throw new ViteDevServerNotReadyError(
                        `Vite dev server returned ${String(response.status)}`
                    );
                } finally {
                    clearTimeout(timeoutId);
                }
            },
            {
                delayMs: ({ attempt }) => {
                    const exponentialDelay = Math.min(
                        BASE_DELAY * 2 ** (attempt - 1),
                        MAX_DELAY
                    );
                    const jitter = randomInt(0, JITTER_MS + 1);

                    return exponentialDelay + jitter;
                },
                maxRetries: MAX_ATTEMPTS,
                operationName: "wait for Vite dev server",
                onError: (error, attempt) => {
                    const resolved = ensureError(error);
                    if (
                        attempt === MAX_ATTEMPTS ||
                        (resolved.name !== "AbortError" &&
                            resolved.name !== "ViteDevServerNotReadyError")
                    ) {
                        options.logger.debug(
                            `[WindowService] Vite server not ready (attempt ${String(attempt)}/${String(MAX_ATTEMPTS)}): ${getUnknownErrorMessage(resolved)}`
                        );
                    }
                },
                onFailedAttempt: ({ attempt, delayMs }) => {
                    options.logger.debug(
                        `[WindowService] Waiting ${String(Math.round(delayMs))}ms before retry ${String(attempt + 1)}/${String(MAX_ATTEMPTS)}`
                    );
                },
            }
        );
    } catch (error) {
        throw new Error(
            `Vite dev server did not become available after ${String(MAX_ATTEMPTS)} attempts`,
            { cause: error }
        );
    }
}
