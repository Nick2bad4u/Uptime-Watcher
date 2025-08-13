/**
 * React hook for mount and unmount lifecycle management with StrictMode
 * compatibility.
 *
 * @remarks
 * This hook provides a clean alternative to useEffect with an empty dependency
 * array for component lifecycle management. It's specifically designed to
 * handle React's StrictMode development behavior where effects can run
 * multiple times.
 *
 * Key features:
 * - Prevents duplicate execution in React StrictMode
 * - Supports both synchronous and asynchronous mount callbacks
 * - Provides automatic error handling with logging
 * - Ensures cleanup functions run exactly once on unmount
 * - Maintains callback reference stability to prevent stale closures
 *
 * The hook is particularly useful for:
 * - Initializing data subscriptions
 * - Setting up event listeners
 * - Performing one-time setup operations
 * - Managing component lifecycle in a predictable way
 *
 * @param mountCallback - Function to execute on component mount (can be async)
 * @param unmountCallback - Optional cleanup function for component unmount
 *
 * @example
 * ```tsx
 * // Basic usage with sync operations
 * useMount(
 *   () => {
 *     console.log('Component mounted');
 *     setupEventListeners();
 *   },
 *   () => {
 *     console.log('Component unmounting');
 *     cleanupEventListeners();
 *   }
 * );
 *
 * // With async operations
 * useMount(
 *   async () => {
 *     const data = await fetchInitialData();
 *     updateState(data);
 *   },
 *   () => {
 *     cancelPendingRequests();
 *   }
 * );
 * ```
 *
 * @public
 */

import { useEffect, useRef } from "react";

import logger from "../services/logger";
import { ensureError } from "../utils/errorHandling";

export function useMount(
    mountCallback: () => Promise<void> | void,
    unmountCallback?: () => void
): void {
    const hasMountedRef = useRef(false);
    const mountCallbackRef = useRef(mountCallback);
    const unmountCallbackRef = useRef(unmountCallback);

    // Update refs with latest callbacks
    mountCallbackRef.current = mountCallback;
    unmountCallbackRef.current = unmountCallback;

    // eslint-disable-next-line canonical/prefer-use-mount -- This IS the useMount hook implementation; cannot use itself
    useEffect(function handleMountLifecycle() {
        // Prevent duplicate mount in StrictMode
        if (hasMountedRef.current) {
            // Return empty cleanup function for consistency
            return (): void => {
                // No-op cleanup for duplicate mount prevention
            };
        }

        hasMountedRef.current = true;

        // Execute mount callback with proper async/await handling
        const executeMountCallback = async (): Promise<void> => {
            try {
                const result = mountCallbackRef.current();
                // If mountCallback returns a Promise, await it
                if (result instanceof Promise) {
                    await result;
                }
            } catch (error: unknown) {
                logger.error("Error in useMount callback:", ensureError(error));
            }
        };

        void executeMountCallback();

        // Always return cleanup function for consistent return pattern
        return (): void => {
            // Only call unmount callback if it exists
            if (unmountCallbackRef.current) {
                unmountCallbackRef.current();
            }
        };
    }, []);
}
