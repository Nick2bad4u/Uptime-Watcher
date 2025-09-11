/**
 * AbortController utilities for enhanced operation cancellation management.
 *
 * @remarks
 * Provides utilities for combining abort signals, creating timeout signals, and
 * managing operation cancellation in a composable way. These utilities replace
 * manual cancellation patterns and provide standardized error handling.
 *
 * @packageDocumentation
 */

/**
 * Options for creating combined abort signals.
 *
 * @public
 */
export interface CombineSignalsOptions {
    /** Additional signals to combine */
    additionalSignals?: AbortSignal[];
    /** Optional reason for abort */
    reason?: string;
    /** Timeout in milliseconds */
    timeoutMs?: number;
}

/**
 * Options for creating retry operations with abort support.
 *
 * @public
 */
export interface RetryWithAbortOptions {
    /** Multiplier for exponential backoff */
    backoffMultiplier?: number;
    /** Initial delay between retries in milliseconds */
    initialDelay?: number;
    /** Maximum delay between retries in milliseconds */
    maxDelay?: number;
    /** Maximum number of retry attempts */
    maxRetries?: number;
    /** AbortSignal to respect during retries */
    signal?: AbortSignal;
}

/**
 * Creates a combined AbortSignal from multiple sources.
 *
 * @remarks
 * Combines timeout, additional signals, and provides a unified cancellation
 * mechanism. Useful for operations that need to be cancelled by multiple
 * conditions (timeout, user action, system shutdown, etc.).
 *
 * @example
 *
 * ```typescript
 * const controller = new AbortController();
 * const combinedSignal = combineAbortSignals({
 *     timeoutMs: 5000,
 *     additionalSignals: [controller.signal],
 *     reason: "Operation timeout or user cancellation",
 * });
 *
 * // Use in fetch request
 * fetch(url, { signal: combinedSignal });
 * ```
 *
 * @param options - Configuration for combining signals
 *
 * @returns Combined AbortSignal that triggers when any source signal triggers
 *
 * @public
 */
export function createCombinedAbortSignal(
    options: CombineSignalsOptions = {}
): AbortSignal {
    const { additionalSignals = [], reason, timeoutMs } = options;

    const signals: AbortSignal[] = [];

    // Add timeout signal if specified
    if (timeoutMs !== undefined && timeoutMs > 0) {
        if (reason) {
            // Create custom timeout signal with reason
            const controller = new AbortController();
            const timeoutId = setTimeout(() => {
                controller.abort(reason);
            }, timeoutMs);

            // Clean up timeout if signal is aborted by other means
            controller.signal.addEventListener(
                "abort",
                () => {
                    clearTimeout(timeoutId);
                },
                { once: true }
            );

            signals.push(controller.signal);
        } else {
            signals.push(AbortSignal.timeout(timeoutMs));
        }
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
 * Creates an operation that can be aborted and provides cleanup.
 *
 * @remarks
 * Wraps an async operation with abort support and automatic cleanup. The
 * operation function receives an AbortSignal and should check it periodically
 * for cancellation.
 *
 * @example
 *
 * ```typescript
 * const result = await createAbortableOperation(
 *     async (signal) => {
 *         const response = await fetch(url, { signal });
 *         return response.json();
 *     },
 *     {
 *         timeoutMs: 10000,
 *         cleanup: () => console.log("Operation cleaned up"),
 *     }
 * );
 * ```
 *
 * @param operation - Async function that performs the operation
 * @param options - Configuration options
 *
 * @returns Promise that resolves to the operation result
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

/**
 * Promise-based sleep function with abort support.
 *
 * @remarks
 * Creates a cancelable delay that can be aborted via AbortSignal. Throws when
 * the signal is aborted during the delay.
 *
 * @example
 *
 * ```typescript
 * const controller = new AbortController();
 *
 * try {
 *     await sleep(5000, controller.signal);
 *     console.log("Delay completed");
 * } catch (error) {
 *     console.log("Delay was aborted");
 * }
 * ```
 *
 * @param ms - Delay in milliseconds
 * @param signal - Optional AbortSignal for cancellation
 *
 * @returns Promise that resolves after the delay
 *
 * @throws When the signal is aborted
 *
 * @public
 */
export async function sleep(ms: number, signal?: AbortSignal): Promise<void> {
    return new Promise((resolve, reject) => {
        if (signal?.aborted) {
            reject(new Error("Sleep was aborted"));
            return;
        }

        const timeoutId = setTimeout(() => {
            resolve();
        }, ms);

        // Handle abort during sleep
        const handleAbort = (): void => {
            clearTimeout(timeoutId);
            reject(new Error("Sleep was aborted"));
        };

        signal?.addEventListener("abort", handleAbort, { once: true });
    });
}

/**
 * Implements retry logic with abort signal support.
 *
 * @remarks
 * Provides exponential backoff retry logic that respects abort signals. Will
 * stop retrying immediately if the signal is aborted.
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
 *         initialDelay: 1000,
 *         signal: controller.signal,
 *     }
 * );
 * ```
 *
 * @param operation - Function to retry
 * @param options - Retry configuration
 *
 * @returns Promise that resolves to the operation result
 *
 * @throws When all retries are exhausted or operation is aborted
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
 * Checks if an error is an AbortError.
 *
 * @remarks
 * Utility function to identify abort-related errors consistently. Handles
 * different abort error patterns from various APIs.
 *
 * @example
 *
 * ```typescript
 * try {
 *     await fetch(url, { signal });
 * } catch (error) {
 *     if (isAbortError(error)) {
 *         console.log("Request was cancelled");
 *     } else {
 *         console.error("Request failed:", error);
 *     }
 * }
 * ```
 *
 * @param error - Error to check
 *
 * @returns True if the error is an abort error
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
 * Creates a race condition between an operation and an abort signal.
 *
 * @remarks
 * Useful for operations that don't natively support AbortSignal. The operation
 * will be raced against the abort signal.
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
 * @param operation - Promise to race
 * @param signal - AbortSignal to race against
 *
 * @returns Promise that resolves to the operation result or rejects if aborted
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
