/**
 * Hook for synchronizing data when the app window gains focus.
 *
 * @remarks
 * Provides functionality to automatically refresh data from the backend when
 * users return to the app after being away. Uses window focus events to trigger
 * full backend synchronization when enabled. Errors are handled internally by
 * the store's error handling system through {@link useSitesStore}'s
 * `withErrorHandling` wrapper, so the fire-and-forget void pattern is safe
 * here.
 *
 * @public
 */

import { useCallback, useEffect, useRef } from "react";

import { useSitesStore } from "../stores/sites/useSitesStore";
import { fireAndForget } from "../utils/async/fireAndForget";
import { subscribeToGlobalEvent } from "../utils/dom/eventListeners";

const noop = (): void => undefined;

/**
 * Custom hook that synchronizes app data when the window gains focus.
 *
 * @example
 *
 * ```tsx
 * function App() {
 *   const [syncOnFocus, setSyncOnFocus] = useState(true);
 *
 *   // Enable automatic sync when user returns to app
 *   useBackendFocusSync(syncOnFocus);
 *
 *   return <div>App content</div>;
 * }
 * ```
 *
 * @param enabled - Set to `true` to enable focus-based backend synchronization
 *   (defaults to `false`).
 *
 * @returns `void` – the hook only manages side effects.
 *
 * @public
 *
 * @see {@link useSitesStore} for the backing store implementation.
 */
export function useBackendFocusSync(enabled = false): void {
    const isFocusSyncInFlightRef = useRef(false);

    // Use selector to avoid unnecessary re-renders when other store state
    // changes
    const fullResyncSites = useSitesStore(
        useCallback((state) => state.fullResyncSites, [])
    );

    useEffect(
        function handleBackendFocusSync(): () => void {
            if (!enabled) {
                return noop;
            }

            const handleFocus = (): void => {
                if (isFocusSyncInFlightRef.current) {
                    return;
                }

                isFocusSyncInFlightRef.current = true;

                // Use full sync on focus to ensure complete data consistency
                // since the user may have been away for a while
                // Note: Error handling is managed internally by
                // fullResyncSites through the store's withErrorHandling
                // wrapper, so void is safe here
                fireAndForget(
                    async () => {
                        try {
                            await fullResyncSites();
                        } finally {
                            isFocusSyncInFlightRef.current = false;
                        }
                    },
                    {
                        onError: () => {
                            // Focus sync should not crash the renderer focus handler.
                        },
                    }
                );
            };

            return subscribeToGlobalEvent("window", "focus", handleFocus);
        },
        [enabled, fullResyncSites]
    );
}
