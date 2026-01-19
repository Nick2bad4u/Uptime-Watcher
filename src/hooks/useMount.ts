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

import { ensureError } from "@shared/utils/errorHandling";
import { useEffect } from "react";

import { logger } from "../services/logger";

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
 * @param unmountCallback - Optional function to execute on component unmount.
 *
 * @returns `void` – the hook performs side effects only.
 *
 * @public
 */
export function useMount(
    mountCallback: () => Promise<void> | void,
    unmountCallback?: () => void
): void {

    useEffect(
        function handleMountLifecycle() {
            let didCleanup = false;

            const executeMountCallback = async (): Promise<void> => {
                try {
                    await mountCallback();
                } catch (error: unknown) {
                    logger.error(
                        "Error in useMount callback:",
                        ensureError(error)
                    );
                }
            };

            void executeMountCallback();

            return (): void => {
                if (didCleanup) {
                    return;
                }

                didCleanup = true;
                unmountCallback?.();
            };
        },
        [mountCallback, unmountCallback]
    );
}
