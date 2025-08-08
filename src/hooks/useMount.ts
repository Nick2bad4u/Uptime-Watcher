import { useEffect, useRef } from "react";

import logger from "../services/logger";
import { ensureError } from "../utils/errorHandling";

/**
 * A React hook that provides mount and unmount functionality similar to useEffect
 * with an empty dependency array, but with better StrictMode compatibility.
 *
 * This hook ensures that:
 * - The mount callback runs once on component mount
 * - The unmount callback (if provided) runs once on component unmount
 * - Handles React StrictMode properly by preventing duplicate execution
 *
 * @param mountCallback - Function to run on mount. Can be async.
 * @param unmountCallback - Optional function to run on unmount
 *
 * @example
 * ```tsx
 * useMount(
 *   async () => {
 *     // This runs once on mount
 *     await fetchData();
 *   },
 *   () => {
 *     // This runs once on unmount
 *     cleanup();
 *   }
 * );
 * ```
 */
export function useMount(
    mountCallback: () => Promise<void> | void,
    unmountCallback?: () => void
): void {
    const hasMountedRef = useRef(false);
    const cleanupRef = useRef<(() => void) | undefined>(undefined);
    const mountCallbackRef = useRef(mountCallback);
    const unmountCallbackRef = useRef(unmountCallback);

    // Update refs with latest callbacks
    mountCallbackRef.current = mountCallback;
    unmountCallbackRef.current = unmountCallback;

    // eslint-disable-next-line canonical/prefer-use-mount -- This IS the useMount implementation
    useEffect(() => {
        // Prevent duplicate mount in StrictMode
        if (hasMountedRef.current) {
            return;
        }

        hasMountedRef.current = true;

        // Execute mount callback with proper async/await handling
        const executeMountCallback = async () => {
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

        // Set up cleanup function
        if (unmountCallbackRef.current) {
            cleanupRef.current = unmountCallbackRef.current;
        }

        // Return cleanup function
        // eslint-disable-next-line consistent-return -- Cleanup function is optional
        return () => {
            // Call cleanup function on unmount
            cleanupRef.current?.();
        };
    }, []);
}
