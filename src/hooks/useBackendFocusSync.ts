/**
 * Hook for synchronizing data when the application window gains focus.
 *
 * @remarks
 * Provides functionality to automatically refresh data from the backend when
 * users return to the application after being away. Uses window focus events to
 * trigger full backend synchronization when enabled. Errors are handled
 * internally by the store's error handling system through withErrorHandling, so
 * the fire-and-forget void pattern is safe here.
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
 * @param enabled - Boolean - Set to true to enable focus-based backend sync
 *   (default: false)
 *
 * @returns Void - This hook manages side effects only
 */
export function useBackendFocusSync(enabled = false): void {
    // Use selector to avoid unnecessary re-renders when other store state
    // changes
    const fullSyncFromBackend = useSitesStore(
        useCallback((state) => state.fullSyncFromBackend, [])
    );

    useEffect(
        function handleBackendFocusSync(): () => void {
            const handleFocus = (): void => {
                // Use full sync on focus to ensure complete data consistency
                // since the user may have been away for a while
                // Note: Error handling is managed internally by
                // fullSyncFromBackend through the store's withErrorHandling
                // wrapper, so void is safe here
                void fullSyncFromBackend();
            };

            if (enabled) {
                window.addEventListener("focus", handleFocus);
            }

            return function cleanup(): void {
                if (enabled) {
                    window.removeEventListener("focus", handleFocus);
                }
            };
        },
        [enabled, fullSyncFromBackend]
    );
}
