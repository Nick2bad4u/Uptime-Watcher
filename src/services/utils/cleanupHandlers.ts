/**
 * Utilities for validating cleanup handlers returned by preload-managed
 * subscriptions.
 *
 * @remarks
 * Renderer services frequently subscribe to IPC-driven event streams exposed by
 * the preload bridge. These subscriptions are expected to return cleanup
 * functions but in practice may yield unexpected values when bridges are
 * misconfigured or when channel contracts drift. The helpers in this module
 * enforce consistent validation and error handling across services while
 * allowing each caller to customize diagnostics.
 *
 * @packageDocumentation
 */

/**
 * Context supplied when a preload subscription returns an invalid cleanup
 * value.
 *
 * @public
 */
export interface CleanupValidationContext {
    /** Type reported by {@link typeof} for the cleanup candidate. */
    readonly actualType: string;
    /** Raw value returned by the preload bridge. */
    readonly cleanupCandidate: unknown;
}

/**
 * Callback contract used when validating cleanup handlers.
 *
 * @public
 */
export interface CleanupResolutionHandlers {
    /**
     * Invoked when the validated cleanup handler throws during execution.
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
 * @param candidate - Value produced by the preload bridge.
 *
 * @returns `true` when the candidate is a zero-argument function.
 */
const isCleanupFunction = (candidate: unknown): candidate is () => void =>
    typeof candidate === "function";

/**
 * Normalizes a cleanup candidate into a callable cleanup function.
 *
 * @param cleanupCandidate - Value produced by the preload bridge when
 *   registering a subscription.
 * @param handlers - Hooks used to react to invalid cleanup values or cleanup
 *   failures.
 *
 * @returns A cleanup function that is safe for callers to invoke regardless of
 *   the original cleanup candidate shape.
 *
 * @public
 */
export const resolveCleanupHandler = (
    cleanupCandidate: unknown,
    handlers: CleanupResolutionHandlers
): (() => void) => {
    if (!isCleanupFunction(cleanupCandidate)) {
        return handlers.handleInvalidCleanup({
            actualType: typeof cleanupCandidate,
            cleanupCandidate,
        });
    }

    const cleanup: () => void = cleanupCandidate;

    return (): void => {
        try {
            cleanup();
        } catch (error) {
            handlers.handleCleanupError(error);
        }
    };
};

/**
 * Registers a subscription and validates the resulting cleanup handler.
 *
 * @param register - Function invoking the preload subscription and returning
 *   the cleanup candidate (or a promise thereof).
 * @param handlers - Hooks for invalid cleanup values and cleanup failures.
 *
 * @returns Promise resolving to a normalized cleanup function.
 *
 * @public
 */
export const subscribeWithValidatedCleanup = async (
    register: () => unknown,
    handlers: CleanupResolutionHandlers
): Promise<() => void> => {
    const cleanupCandidate = await Promise.resolve(register());
    return resolveCleanupHandler(cleanupCandidate, handlers);
};
