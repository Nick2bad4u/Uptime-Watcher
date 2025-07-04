/**
 * Hook for synchronizing data when the application window gains focus.
 * Provides functionality to automatically refresh data from the backend
 * when users return to the application after being away.
 */

import { useEffect } from "react";

import { useSitesStore } from "../stores";

/**
 * useBackendFocusSync
 * Adds a window focus event listener that triggers fullSyncFromBackend when enabled.
 * This is useful for ensuring data consistency when the user returns to the app.
 * @param enabled - Set to true to enable focus-based backend sync (default: false)
 */
export function useBackendFocusSync(enabled = false) {
    const { fullSyncFromBackend } = useSitesStore();

    useEffect(() => {
        if (!enabled) return;
        const handleFocus = () => {
            // Use full sync on focus to ensure complete data consistency
            // since the user may have been away for a while
            fullSyncFromBackend();
        };
        window.addEventListener("focus", handleFocus);
        return () => window.removeEventListener("focus", handleFocus);
    }, [enabled, fullSyncFromBackend]);
}
