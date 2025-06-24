"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useBackendFocusSync = useBackendFocusSync;
const react_1 = require("react");
const store_1 = require("../store");
/**
 * useBackendFocusSync
 * Adds a window focus event listener that triggers syncSitesFromBackend when enabled.
 * @param enabled - Set to true to enable focus-based backend sync (default: false)
 */
function useBackendFocusSync(enabled = false) {
    const syncSitesFromBackend = (0, store_1.useStore)((s) => s.syncSitesFromBackend);
    (0, react_1.useEffect)(() => {
        if (!enabled)
            return;
        const handleFocus = () => {
            syncSitesFromBackend();
        };
        window.addEventListener("focus", handleFocus);
        return () => window.removeEventListener("focus", handleFocus);
    }, [enabled, syncSitesFromBackend]);
}
