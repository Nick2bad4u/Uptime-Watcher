/**
 * Utilities for idempotent, re-entrant initialization flows.
 *
 * @remarks
 * Several Electron services treat `initialize()` as idempotent: if
 * initialization is in-flight, subsequent calls should await the same promise;
 * if initialization succeeds, future calls should no-op; if it fails, future
 * calls should be allowed to retry.
 */

/**
 * Runs an initializer guarded by a cached promise.
 *
 * @param getPromise - Reads the cached initialization promise.
 * @param setPromise - Writes the cached initialization promise.
 * @param createPromise - Callback producing the initialization promise.
 */
export async function runIdempotentInitialization(
    getPromise: () => Promise<void> | undefined,
    setPromise: (promise: Promise<void> | undefined) => void,
    createPromise: () => Promise<void>
): Promise<void> {
    const existing = getPromise();
    if (existing) {
        await existing;
        return;
    }

    const promise = createPromise();
    setPromise(promise);

    try {
        await promise;
    } catch (error) {
        // Allow retry after a failed initialization attempt.
        setPromise(undefined);
        throw error;
    }
}
