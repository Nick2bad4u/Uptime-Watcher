/**
 * Hook for synchronizing data when the application window gains focus.
 *
 * @remarks
 * Provides functionality to automatically refresh data from the backend when
 * users return to the application after being away. Uses window focus events to
 * trigger full backend synchronization when enabled. Errors are handled
 * internally by the store's error handling system through
 * {@link useSitesStore}'s `withErrorHandling` wrapper, so the fire-and-forget
 * void pattern is safe here.
 *
 * @public
 */

import { useCallback, useEffect } from "react";

import { useSitesStore } from "../stores/sites/useSitesStore";

/**
 * Custom hook that synchronizes application data when the window gains focus.
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
    // Use selector to avoid unnecessary re-renders when other store state
    // changes
    const fullResyncSites = useSitesStore(
        useCallback((state) => state.fullResyncSites, [])
    );

    useEffect(
        function handleBackendFocusSync(): () => void {
            if (!enabled || typeof window === "undefined") {
                return () => {
                    // No-op: focus sync disabled or window unavailable.
                };
            }

            const handleFocus = (): void => {
                // Use full sync on focus to ensure complete data consistency
                // since the user may have been away for a while
                // Note: Error handling is managed internally by
                // fullResyncSites through the store's withErrorHandling
                // wrapper, so void is safe here
                void fullResyncSites();
            };

            window.addEventListener("focus", handleFocus);

            return function cleanup(): void {
                window.removeEventListener("focus", handleFocus);
            };
        },
        [enabled, fullResyncSites]
    );
}
