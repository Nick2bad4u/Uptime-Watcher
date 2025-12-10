/**
 * Configuration for building a composite {@link AbortSignal}.
 *
 * @remarks
 * Combining signals allows a caller to share cancellation concerns such as
 * upstream abort controllers, local timeouts, or explicit user requests. When a
 * timeout is provided together with a reason message, the generated timeout
 * signal uses that reason when aborting.
 *
 * @public
 */
export interface CombineSignalsOptions {
    /** Additional {@link AbortSignal} instances that should be observed. */
    additionalSignals?: AbortSignal[];
    /**
     * Optional abort reason message used for timeout-driven cancellation when
     * {@link CombineSignalsOptions.timeoutMs} is specified.
     */
    reason?: string;
    /** Timeout window in milliseconds before the composite signal aborts. */
    timeoutMs?: number;
}

/**
 * Configuration for retry operations that respect an {@link AbortSignal}.
 *
 * @remarks
 * Applies capped exponential backoff between attempts. When the supplied signal
 * aborts, the retry loop stops immediately even between retries.
 *
 * @public
 */
export interface RetryWithAbortOptions {
    /**
     * Multiplier applied after each retry to grow the delay window.
     *
     * @defaultValue 2
     */
    backoffMultiplier?: number;
    /**
     * Initial delay between retries in milliseconds.
     *
     * @defaultValue 1000
     */
    initialDelay?: number;
    /**
     * Maximum delay between retries in milliseconds.
     *
     * @defaultValue 30000
     */
    maxDelay?: number;
    /**
     * Maximum number of retry attempts before giving up.
     *
     * @defaultValue 3
     */
    maxRetries?: number;
    /** AbortSignal observed between attempts and before invoking the operation. */
    signal?: AbortSignal;
}

/**
 * Creates an {@link AbortSignal} that aborts when any configured source aborts.
 *
 * @remarks
 * The composite signal can observe additional caller-provided signals and an
 * optional timeout window. When neither a timeout nor additional signals are
 * provided, the function returns a signal that never aborts. Providing a
 * timeout reason ensures the composed signal exposes a meaningful `reason`
 * value when the timeout elapses.
 *
 * @example
 *
 * ```typescript
 * const controller = new AbortController();
 * const combinedSignal = createCombinedAbortSignal({
 *     timeoutMs: 5000,
 *     additionalSignals: [controller.signal],
 *     reason: "Operation timeout or user cancellation",
 * });
 *
 * await fetch(url, { signal: combinedSignal });
 * ```
 *
 * @param options - Composite signal configuration options.
 *
 * @returns An {@link AbortSignal} that mirrors the earliest abort condition.
 *
 * @public
 */
export function createCombinedAbortSignal(
    options: CombineSignalsOptions = {}
): AbortSignal {
    const { additionalSignals = [], reason, timeoutMs } = options;

    const signals: AbortSignal[] = [];

    const createTimeoutSignal = (
        timeout: number,
        timeoutReason?: string
    ): AbortSignal => {
        const controller = new AbortController();
        const resolvedReason =
            timeoutReason ??
            (typeof DOMException === "function"
                ? new DOMException("Signal timed out", "TimeoutError")
                : new Error("Signal timed out"));

        const timeoutId = setTimeout(() => {
            controller.abort(resolvedReason);
        }, timeout);

        controller.signal.addEventListener(
            "abort",
            () => {
                clearTimeout(timeoutId);
            },
            { once: true }
        );

        return controller.signal;
    };

    // Add timeout signal if specified
    if (timeoutMs !== undefined && timeoutMs > 0) {
        signals.push(createTimeoutSignal(timeoutMs, reason));
    }

    // Add additional signals (handle null/undefined additionalSignals)
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- additionalSignals may be undefined from function parameter
    if (additionalSignals) {
        signals.push(...additionalSignals.filter(Boolean));
    }

    // If no signals to combine, create a signal that never aborts
    if (signals.length === 0) {
        return new AbortController().signal;
    }

    // If only one signal, return it directly
    if (signals.length === 1) {
        const [signal] = signals;
        if (signal) {
            return signal;
        }
    }

    // Combine multiple signals
    return AbortSignal.any(signals);
}

/**
 * Executes an async operation with a composite abort signal and guaranteed
 * cleanup.
 *
 * @remarks
 * The generated signal honors every option supported by
 * {@link CombineSignalsOptions}. Provide a `cleanup` callback to release
 * resources regardless of whether the operation succeeds, fails, or the signal
 * aborts. If the cleanup throws, its error overrides any pending rejection from
 * the operation.
 *
 * @example
 *
 * ```typescript
 * import { logger } from "@app/services/logger";
 *
 * const result = await createAbortableOperation(
 *     async (signal) => {
 *         const response = await fetch(url, { signal });
 *         return response.json();
 *     },
 *     {
 *         timeoutMs: 10_000,
 *         cleanup: () => logger.info("Operation cleaned up"),
 *     }
 * );
 * ```
 *
 * @typeParam T - Resolved value produced by the operation.
 *
 * @param operation - Async function to execute with the composite signal.
 * @param options - Signal configuration plus an optional cleanup callback.
 *
 * @returns Promise that resolves with the operation output.
 *
 * @throws Re-throws errors from the operation or cleanup callbacks.
 *
 * @public
 */
export async function createAbortableOperation<T>(
    operation: (signal: AbortSignal) => Promise<T>,
    options: CombineSignalsOptions & {
        /** Cleanup function called when operation completes or is aborted */
        cleanup?: () => void;
    } = {}
): Promise<T> {
    const { cleanup, ...signalOptions } = options;
    const signal = createCombinedAbortSignal(signalOptions);

    try {
        return await operation(signal);
    } finally {
        cleanup?.();
    }
}

const createSleepAbortHandler =
    (
        timeoutId: ReturnType<typeof setTimeout>,
        reject: (error: Error) => void
    ): (() => void) =>
    (): void => {
        clearTimeout(timeoutId);
        reject(new Error("Sleep was aborted"));
    };

/**
 * Promise-based sleep helper with {@link AbortSignal} support.
 *
 * @remarks
 * Negative, zero, or non-finite durations resolve immediately. When the signal
 * aborts during the delay window, the returned promise rejects with a new
 * `Error` describing the cancellation.
 *
 * @example
 *
 * ```typescript
 * import { logger } from "@app/services/logger";
 *
 * const controller = new AbortController();
 *
 * try {
 *     await sleep(5_000, controller.signal);
 *     logger.info("Delay completed");
 * } catch (error) {
 *     if (isAbortError(error)) {
 *         logger.warn("Delay was aborted");
 *     }
 * }
 * ```
 *
 * @param ms - Delay duration in milliseconds.
 * @param signal - Optional cancellation signal to observe.
 *
 * @returns Promise that resolves after the requested delay.
 *
 * @throws When the supplied signal aborts before the delay completes.
 *
 * @public
 */
export async function sleep(ms: number, signal?: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
        if (signal?.aborted) {
            reject(new Error("Sleep was aborted"));
            return;
        }

        // Handle negative or invalid values by resolving immediately
        if (!Number.isFinite(ms) || ms <= 0) {
            resolve();
            return;
        }

        const timeoutId = setTimeout(() => {
            resolve();
        }, ms);

        const handleAbort = createSleepAbortHandler(timeoutId, reject);

        // Handle abort during sleep
        if (signal) {
            signal.addEventListener("abort", handleAbort, { once: true });
        }
    });
}

/**
 * Retries an async operation with capped exponential backoff and abort
 * handling.
 *
 * @remarks
 * The retry loop waits after failed attempts using {@link sleep}. If the
 * operation succeeds, the resolved value bypasses any remaining retries. As
 * soon as the provided signal aborts, the function stops retrying and rejects.
 *
 * @example
 *
 * ```typescript
 * const controller = new AbortController();
 *
 * const result = await retryWithAbort(
 *     async () => {
 *         const response = await fetch(url);
 *         if (!response.ok) throw new Error("Request failed");
 *         return response.json();
 *     },
 *     {
 *         maxRetries: 3,
 *         initialDelay: 1_000,
 *         signal: controller.signal,
 *     }
 * );
 * ```
 *
 * @typeParam T - Resolved value produced by the operation.
 *
 * @param operation - Async function to invoke on each retry attempt.
 * @param options - Retry behavior tuning configuration.
 *
 * @returns Promise that resolves with the operation result.
 *
 * @throws The last captured error when retries are exhausted.
 * @throws {@link Error} When the supplied signal aborts before completion.
 *
 * @public
 */
export async function retryWithAbort<T>(
    operation: () => Promise<T>,
    options: RetryWithAbortOptions = {}
): Promise<T> {
    const {
        backoffMultiplier = 2,
        initialDelay = 1000,
        maxDelay = 30_000,
        maxRetries = 3,
        signal,
    } = options;

    let lastError: Error = new Error("No errors occurred");
    let delay = initialDelay;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        // Check if operation was aborted
        if (signal?.aborted) {
            throw new Error("Operation was aborted");
        }

        try {
            // eslint-disable-next-line no-await-in-loop -- retry operations require sequential awaits
            return await operation();
        } catch (error) {
            lastError =
                error instanceof Error ? error : new Error(String(error));

            // Don't delay after the last attempt
            if (attempt === maxRetries) {
                break;
            }

            // Wait with exponential backoff
            try {
                // eslint-disable-next-line no-await-in-loop -- retry delay requires sequential awaits
                await sleep(delay, signal);
            } catch (sleepError) {
                throw new Error("Operation was aborted", { cause: sleepError });
            }
            delay = Math.min(delay * backoffMultiplier, maxDelay);
        }
    }

    throw lastError;
}

/**
 * Determines whether an unknown value represents an abort-style error.
 *
 * @remarks
 * The check covers native {@link Error} instances, DOM `AbortError` and
 * `TimeoutError` exceptions, and message patterns commonly emitted by Fetch and
 * other browser APIs.
 *
 * @example
 *
 * ```typescript
 * import { logger } from "@app/services/logger";
 *
 * try {
 *     await fetch(url, { signal });
 * } catch (error) {
 *     if (isAbortError(error)) {
 *         logger.warn("Request was cancelled");
 *     } else {
 *         logger.error("Request failed", error);
 *     }
 * }
 * ```
 *
 * @param error - Value to inspect.
 *
 * @returns `true` when the value represents an abort scenario; otherwise
 *   `false`.
 *
 * @public
 */
export function isAbortError(error: unknown): boolean {
    if (error instanceof Error) {
        return (
            error.name === "AbortError" ||
            error.name === "TimeoutError" ||
            error.message.toLowerCase().includes("aborted") ||
            error.message.toLowerCase().includes("cancelled")
        );
    }

    // Handle DOMException (e.g., from fetch AbortController)
    if (error instanceof DOMException) {
        return (
            error.name === "AbortError" ||
            error.name === "TimeoutError" ||
            error.message.toLowerCase().includes("aborted") ||
            error.message.toLowerCase().includes("cancelled")
        );
    }

    return false;
}

/**
 * Races a promise against an {@link AbortSignal}.
 *
 * @remarks
 * Useful for APIs without native abort support. The returned promise rejects as
 * soon as the signal aborts, allowing callers to adopt a uniform cancellation
 * flow.
 *
 * @example
 *
 * ```typescript
 * const controller = new AbortController();
 *
 * const result = await raceWithAbort(
 *     someNonAbortableOperation(),
 *     controller.signal
 * );
 * ```
 *
 * @typeParam T - Resolved value of the underlying operation.
 *
 * @param operation - Promise to monitor.
 * @param signal - Abort signal to race against.
 *
 * @returns The first settled result between the promise and the abort event.
 *
 * @throws {@link Error} When the signal aborts before the operation settles.
 *
 * @public
 */
export async function raceWithAbort<T>(
    operation: Promise<T>,
    signal: AbortSignal
): Promise<T> {
    if (signal.aborted) {
        throw new Error("Operation was aborted");
    }

    // Create abort promise before racing to ensure listener is set up
    const abortPromise = new Promise<never>((_resolve, reject) => {
        if (signal.aborted) {
            reject(new Error("Operation was aborted"));
            return;
        }

        signal.addEventListener(
            "abort",
            () => {
                reject(new Error("Operation was aborted"));
            },
            { once: true }
        );
    });

    return Promise.race([operation, abortPromise]);
}
