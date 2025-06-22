import { useEffect } from "react";
import { useStore } from "../store";

/**
 * useBackendFocusSync
 * Adds a window focus event listener that triggers syncSitesFromBackend when enabled.
 * @param enabled - Set to true to enable focus-based backend sync (default: false)
 */
export function useBackendFocusSync(enabled = false) {
    const syncSitesFromBackend = useStore((s) => s.syncSitesFromBackend);

    useEffect(() => {
        if (!enabled) return;
        const handleFocus = () => {
            syncSitesFromBackend();
        };
        window.addEventListener("focus", handleFocus);
        return () => window.removeEventListener("focus", handleFocus);
    }, [enabled, syncSitesFromBackend]);
}
