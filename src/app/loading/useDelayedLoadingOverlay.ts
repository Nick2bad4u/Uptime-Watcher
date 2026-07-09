import { UI_DELAYS } from "../../constants";
import { useDelayedBoolean } from "../../hooks/useDelayedBoolean";

/**
 * Manages the app's delayed loading overlay state.
 *
 * @remarks
 * The overlay only appears when loading takes more than a threshold to prevent
 * a flash for quick operations and during initial app startup.
 */
export function useDelayedLoadingOverlay(args: {
    readonly isInitialized: boolean;
    readonly isLoading: boolean;
}): boolean {
    return useDelayedBoolean({
        clearDelayMs: UI_DELAYS.STATE_UPDATE_DEFER,
        enabled: args.isInitialized,
        showDelayMs: UI_DELAYS.LOADING_OVERLAY,
        value: args.isLoading,
    });
}
