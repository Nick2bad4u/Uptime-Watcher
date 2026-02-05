import { useCallback, useEffect, useState } from "react";

import { UI_DELAYS } from "../../constants";

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
    const [showLoadingOverlay, setShowLoadingOverlay] =
        useState<boolean>(false);

    // Create stable callbacks to avoid direct setState in useEffect
    const clearLoadingOverlay = useCallback(() => {
        setShowLoadingOverlay(false);
    }, []);
    const showLoadingOverlayCallback = useCallback(() => {
        setShowLoadingOverlay(true);
    }, []);

    useEffect(
        function handleDelayedLoadingOverlayEffect(): () => void {
            // Only proceed if app is initialized
            if (!args.isInitialized) {
                return () => {};
            }

            if (!args.isLoading) {
                // Defer the state update to comply with the project lint rule that
                // forbids setState calls directly within an effect.
                const clearTimeoutId = setTimeout(
                    clearLoadingOverlay,
                    UI_DELAYS.STATE_UPDATE_DEFER
                );

                return (): void => {
                    clearTimeout(clearTimeoutId);
                };
            }

            const timeoutId = setTimeout(
                showLoadingOverlayCallback,
                UI_DELAYS.LOADING_OVERLAY
            );

            return (): void => {
                clearTimeout(timeoutId);
            };
        },
        [
            args.isInitialized,
            args.isLoading,
            clearLoadingOverlay,
            showLoadingOverlayCallback,
        ]
    );

    return showLoadingOverlay;
}
