/**
 * Utility helpers for validating cleanup handlers returned by preload-managed
 * subscriptions.
 *
 * @remarks
 * Renderer services frequently subscribe to IPC-backed event streams exposed by
 * the preload bridge. Those subscriptions are expected to return cleanup
 * functions, yet they occasionally produce unexpected values when bridges are
 * misconfigured or when contracts drift. The helpers in this module normalise
 * the returned values and centralise error handling while still allowing
 * callers to supply service-specific diagnostics.
 */

/**
 * Context supplied when a preload subscription returns an invalid cleanup
 * candidate.
 *
 * @remarks
 * The {@link CleanupResolutionHandlers.handleInvalidCleanup} hook receives this
 * structure whenever the preload bridge fails to return a callable cleanup
 * function.
 */
export interface CleanupValidationContext {
    /** Type reported by the `typeof` operator for the cleanup candidate. */
    readonly actualType: string;
    /** Raw value returned by the preload bridge. */
    readonly cleanupCandidate: unknown;
}

/**
 * Callback contract used when validating cleanup handlers returned from the
 * preload bridge.
 *
 * @remarks
 * Services provide implementations for these hooks so they can capture
 * diagnostics and supply fallbacks that preserve their public contract even
 * when the bridge misbehaves.
 */
export interface CleanupResolutionHandlers {
    /**
     * Invoked when the validated cleanup handler throws during execution.
     *
     * @remarks
     * Also invoked when a cleanup handler returns a Promise that rejects.
     */
    readonly handleCleanupError: (error: unknown) => void;
    /**
     * Invoked when the preload bridge does not return a function. The handler
     * must log diagnostics and return a fallback cleanup to preserve the
     * service contract.
     */
    readonly handleInvalidCleanup: (
        context: CleanupValidationContext
    ) => () => void;
}

/**
 * Determines whether a candidate value is a callable cleanup function.
 *
 * @remarks
 * Cleanups are expected to be zero-argument functions. Any other type is
 * treated as invalid so callers can build an error path that preserves the
 * service contract.
 *
 * @param candidate - Value produced by the preload bridge.
 *
 * @returns `true` when the candidate is a zero-argument function.
 */
const isCleanupFunction = (candidate: unknown): candidate is () => unknown =>
    typeof candidate === "function";

const isPromiseLike = (candidate: unknown): candidate is PromiseLike<unknown> =>
    typeof candidate === "object" &&
    candidate !== null &&
    "then" in candidate &&
    typeof (candidate as { then: unknown }).then === "function";

/**
 * Normalizes a cleanup candidate into a callable cleanup function.
 *
 * @remarks
 * When the preload bridge returns something other than a function the
 * {@link CleanupResolutionHandlers.handleInvalidCleanup} hook decides how to
 * proceed. Otherwise the returned function is wrapped so any cleanup failure is
 * forwarded to {@link CleanupResolutionHandlers.handleCleanupError} without
 * breaking the caller's control flow.
 *
 * @param cleanupCandidate - Value produced by the preload bridge when
 *   registering a subscription.
 * @param handlers - Hooks used to react to invalid cleanup values or cleanup
 *   failures.
 *
 * @returns A cleanup function that is safe for callers to invoke regardless of
 *   the original cleanup candidate shape.
 */
export const resolveCleanupHandler = (
    cleanupCandidate: unknown,
    handlers: CleanupResolutionHandlers
): (() => void) => {
    const cleanup: () => unknown = isCleanupFunction(cleanupCandidate)
        ? cleanupCandidate
        : handlers.handleInvalidCleanup({
              actualType: typeof cleanupCandidate,
              cleanupCandidate,
          });

    let didCleanup = false;

    return (): void => {
        if (didCleanup) {
            return;
        }

        didCleanup = true;

        try {
            const cleanupResult = cleanup();

            if (isPromiseLike(cleanupResult)) {
                // Cleanup must remain synchronous. We still attach a rejection
                // handler to prevent unhandled promise rejections.
                void (async (): Promise<void> => {
                    try {
                        await cleanupResult;
                    } catch (error: unknown) {
                        handlers.handleCleanupError(error);
                    }
                })();
            }
        } catch (error) {
            handlers.handleCleanupError(error);
        }
    };
};

/**
 * Registers a subscription and validates the resulting cleanup handler.
 *
 * @remarks
 * The helper awaits the subscription result, passes it through
 * {@link resolveCleanupHandler}, and returns the normalised cleanup callback.
 * Services use this to guarantee symmetrical setup and teardown even when the
 * preload bridge returns incorrect values.
 *
 * @param register - Function invoking the preload subscription and returning
 *   the cleanup candidate or a promise for one.
 * @param handlers - Hooks for invalid cleanup values and cleanup failures.
 *
 * @returns Promise resolving to a normalized cleanup function.
 */
export const subscribeWithValidatedCleanup = async (
    register: () => unknown,
    handlers: CleanupResolutionHandlers
): Promise<() => void> => {
    const cleanupCandidate = await Promise.resolve(register());
    return resolveCleanupHandler(cleanupCandidate, handlers);
};
