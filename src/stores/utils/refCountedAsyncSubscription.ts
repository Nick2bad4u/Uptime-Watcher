/**
 * Ref-counted async subscription helper.
 *
 * @remarks
 * Some stores expose "subscribe" methods that:
 *
 * - Are called multiple times by multiple UI components,
 * - Must establish a single underlying subscription (IPC/event stream),
 * - Return a synchronous unsubscribe function,
 * - But need to perform async setup (awaiting services/IPC readiness).
 *
 * This helper centralizes the tricky state machine:
 *
 * - Ref counting
 * - Async setup (single flight)
 * - Early unsubscribe before setup completes
 * - Idempotent unsubscribe
 */

import { ensureError } from "@shared/utils/errorHandling";

/**
 * Options for {@link createRefCountedAsyncSubscription}.
 */
export interface RefCountedAsyncSubscriptionOptions {
    /**
     * Optional error handler invoked if the cleanup handler throws.
     */
    readonly onCleanupError?: (error: Error) => void;

    /**
     * Optional diagnostic hook called when the underlying subscription is
     * ready.
     */
    readonly onReady?: () => void;

    /**
     * Optional error handler invoked if subscription setup fails.
     */
    readonly onSetupError?: (error: Error) => void;

    /**
     * Optional diagnostic hook called when the first subscriber triggers setup.
     */
    readonly onStarted?: () => void;

    /**
     * Starts the underlying subscription.
     *
     * @returns A cleanup function.
     */
    readonly start: () => Promise<() => void>;
}

/**
 * A ref-counted subscription wrapper for async setup.
 */
export interface RefCountedAsyncSubscription {
    /**
     * Current subscriber count.
     */
    getRefCount: () => number;

    /**
     * Increments the ref count and ensures the underlying subscription is
     * started.
     *
     * @returns A synchronous unsubscribe function.
     */
    subscribe: () => () => void;
}

/**
 * Creates a ref-counted subscription wrapper for async start functions.
 */
export function createRefCountedAsyncSubscription(
    options: RefCountedAsyncSubscriptionOptions
): RefCountedAsyncSubscription {
    const { onCleanupError, onReady, onSetupError, onStarted, start } = options;

    let refCount = 0;
    let cleanup: (() => void) | undefined = undefined;
    let pending: Promise<void> | undefined = undefined;

    const safeCleanup = (): void => {
        if (cleanup === undefined) {
            return;
        }

        const fn = cleanup;
        cleanup = undefined;

        try {
            fn();
        } catch (error: unknown) {
            onCleanupError?.(ensureError(error));
        }
    };

    const ensureStarted = (): void => {
        if (cleanup !== undefined || pending !== undefined) {
            return;
        }

        onStarted?.();

        pending = (async (): Promise<void> => {
            try {
                const cleanupCandidate = await start();

                if (refCount === 0) {
                    // No consumers left by the time setup completed.
                    try {
                        cleanupCandidate();
                    } catch (error: unknown) {
                        onCleanupError?.(ensureError(error));
                    }
                    return;
                }

                cleanup = cleanupCandidate;
                onReady?.();
            } catch (error: unknown) {
                onSetupError?.(ensureError(error));
            } finally {
                pending = undefined;

                if (refCount === 0) {
                    safeCleanup();
                }
            }
        })();
    };

    const subscribe = (): (() => void) => {
        refCount += 1;
        ensureStarted();

        let didUnsubscribe = false;

        return (): void => {
            if (didUnsubscribe) {
                return;
            }

            didUnsubscribe = true;
            refCount = Math.max(0, refCount - 1);

            if (refCount > 0) {
                return;
            }

            // If setup is still pending, the pending promise will observe
            // refCount===0 and cleanup immediately once ready.
            if (cleanup !== undefined) {
                safeCleanup();
            }
        };
    };

    return {
        getRefCount: () => refCount,
        subscribe,
    };
}
