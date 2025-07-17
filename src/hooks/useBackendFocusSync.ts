/**
 * Hook for synchronizing data when the application window gains focus.
 * Provides functionality to automatically refresh data from the backend
 * when users return to the application after being away.
 */

import { useEffect } from "react";

import { useSitesStore } from "../stores/sites/useSitesStore";

/**
 * useBackendFocusSync
 * Adds a window focus event listener that triggers fullSyncFromBackend when enabled.
 * This is useful for ensuring data consistency when the user returns to the app.
 * @param enabled - Set to true to enable focus-based backend sync (default: false)
 */
export function useBackendFocusSync(enabled = false) {
    const { fullSyncFromBackend } = useSitesStore();

    useEffect((): (() => void) | undefined => {
        if (!enabled) {
            return undefined;
        }

        const handleFocus = (): void => {
            // Use full sync on focus to ensure complete data consistency
            // since the user may have been away for a while
            void fullSyncFromBackend();
        };

        window.addEventListener("focus", handleFocus);
        return (): void => {
            window.removeEventListener("focus", handleFocus);
        };
    }, [enabled, fullSyncFromBackend]);
}
