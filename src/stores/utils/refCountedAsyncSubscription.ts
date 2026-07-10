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
import { isDefined } from "ts-extras";

/**
 * Options for {@link createRefCountedAsyncSubscription}.
 */
export interface RefCountedAsyncSubscriptionOptions {
    /** Maximum setup attempts while at least one subscriber remains. */
    readonly maxSetupAttempts?: number;

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

    /** Delay between setup attempts in milliseconds. */
    readonly retryDelayMs?: number;

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
    const {
        maxSetupAttempts = 1,
        onCleanupError,
        onReady,
        onSetupError,
        onStarted,
        retryDelayMs = 0,
        start,
    } = options;

    let refCount = 0;
    let cleanup: (() => void) | undefined;
    let pending: Promise<void> | undefined;
    let retryTimer: ReturnType<typeof setTimeout> | undefined;
    let setupAttempts = 0;

    const invokeHook = (hook: (() => void) | undefined): void => {
        try {
            hook?.();
        } catch {
            // Diagnostic hooks must not corrupt subscription lifecycle state.
        }
    };

    const invokeErrorHook = (
        hook: ((error: Error) => void) | undefined,
        error: unknown
    ): void => {
        try {
            hook?.(ensureError(error));
        } catch {
            // Error reporting hooks must not become unhandled failures.
        }
    };

    const clearRetry = (): void => {
        if (!isDefined(retryTimer)) {
            return;
        }

        clearTimeout(retryTimer);
        retryTimer = undefined;
    };

    const safeCleanup = (): void => {
        if (!isDefined(cleanup)) {
            return;
        }

        const fn = cleanup;
        cleanup = undefined;

        try {
            fn();
        } catch (error: unknown) {
            invokeErrorHook(onCleanupError, error);
        }
    };

    const ensureStarted = (): void => {
        if (isDefined(cleanup) || isDefined(pending) || isDefined(retryTimer)) {
            return;
        }

        setupAttempts += 1;
        invokeHook(onStarted);

        pending = (async (): Promise<void> => {
            let shouldRetry = false;
            try {
                const cleanupCandidate = await start();

                if (refCount === 0) {
                    // No consumers left by the time setup completed.
                    try {
                        cleanupCandidate();
                    } catch (error: unknown) {
                        invokeErrorHook(onCleanupError, error);
                    }
                    return;
                }

                cleanup = cleanupCandidate;
                setupAttempts = 0;
                invokeHook(onReady);
            } catch (error: unknown) {
                invokeErrorHook(onSetupError, error);
                shouldRetry = refCount > 0 && setupAttempts < maxSetupAttempts;
            } finally {
                pending = undefined;

                if (refCount === 0) {
                    setupAttempts = 0;
                    safeCleanup();
                } else if (shouldRetry) {
                    retryTimer = setTimeout(
                        () => {
                            retryTimer = undefined;
                            ensureStarted();
                        },
                        Math.max(0, retryDelayMs)
                    );
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

            clearRetry();
            setupAttempts = 0;

            // If setup is still pending, the pending promise will observe
            // refCount===0 and cleanup immediately once ready.
            if (isDefined(cleanup)) {
                safeCleanup();
            }
        };
    };

    return {
        getRefCount: () => refCount,
        subscribe,
    };
}
