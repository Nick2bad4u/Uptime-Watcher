/**
 * React hook for mount and unmount lifecycle management with StrictMode
 * compatibility.
 *
 * @remarks
 * This hook provides a clean alternative to useEffect with an empty dependency
 * array for component lifecycle management. It's specifically designed to
 * handle React's StrictMode development behavior where effects can run multiple
 * times.
 *
 * Key features:
 *
 * - Compatible with React StrictMode's extra setup/cleanup cycle
 * - Supports both synchronous and asynchronous mount callbacks
 * - Provides automatic error handling with logging
 * - Ensures cleanup functions run exactly once on unmount
 * - Maintains callback reference stability to prevent stale closures
 *
 * The hook is particularly useful for:
 *
 * - Initializing data subscriptions
 * - Setting up event listeners
 * - Performing one-time setup operations
 * - Managing component lifecycle in a predictable way
 *
 * @example
 *
 * ```tsx
 * import { logger } from "@app/services/logger";
 *
 * // Basic usage with sync operations
 * useMount(
 *     () => {
 *         logger.info("Component mounted");
 *         setupEventListeners();
 *     },
 *     () => {
 *         logger.info("Component unmounting");
 *         cleanupEventListeners();
 *     }
 * );
 *
 * // With async operations
 * useMount(
 *     async () => {
 *         const data = await fetchInitialData();
 *         updateState(data);
 *     },
 *     () => {
 *         cancelPendingRequests();
 *     }
 * );
 * ```
 *
 * @param mountCallback - Function to execute on component mount (can be async)
 * @param unmountCallback - Optional cleanup function for component unmount
 *
 * @public
 */

import type { Promisable } from "type-fest";

import { ensureError } from "@shared/utils/errorHandling";
import { useEffect, useRef } from "react";

import { logger } from "../services/logger";
import { fireAndForget } from "../utils/async/fireAndForget";

/**
 * React hook for mount and unmount lifecycle management with StrictMode
 * compatibility.
 *
 * @remarks
 * Provides a clean alternative to useEffect with an empty dependency array for
 * component lifecycle management. Specifically designed to handle React's
 * StrictMode development behavior where effects can run multiple times.
 *
 * @param mountCallback - Function to execute on component mount (can be async).
 *   Receives an `AbortSignal` that is aborted before unmount cleanup runs.
 * @param unmountCallback - Optional function to execute on component unmount.
 *
 * @returns `void` – the hook performs side effects only.
 *
 * @public
 */
export function useMount(
    mountCallback: (signal: AbortSignal) => Promisable<void>,
    unmountCallback?: () => void
): void {
    const mountCallbackRef = useRef(mountCallback);
    const unmountCallbackRef = useRef(unmountCallback);

    useEffect(function syncMountLifecycleCallbacks() {
        mountCallbackRef.current = mountCallback;
        unmountCallbackRef.current = unmountCallback;
    });

    // eslint-disable-next-line canonical/prefer-use-mount -- This is the implementation of useMount's mount-only lifecycle effect.
    useEffect(function handleMountLifecycle() {
        const abortController = new AbortController();
        let didCleanup = false;

        fireAndForget(() => mountCallbackRef.current(abortController.signal), {
            onError: (error) => {
                logger.error("Error in useMount callback:", ensureError(error));
            },
        });

        return (): void => {
            if (didCleanup) {
                return;
            }

            didCleanup = true;
            abortController.abort();

            try {
                unmountCallbackRef.current?.();
            } catch (error: unknown) {
                logger.error("Error in useMount cleanup:", ensureError(error));
            }
        };
    }, []);
}
