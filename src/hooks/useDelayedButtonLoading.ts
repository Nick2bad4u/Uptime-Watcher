/**
 * Custom hook for managing delayed button loading states.
 *
 * @remarks
 * Provides a delayed loading state for buttons to improve UX by preventing
 * flickering on fast operations. Uses configurable delays for showing and
 * hiding the loading state.
 *
 * @example
 *
 * ```tsx
 * const showButtonLoading = useDelayedButtonLoading(isSubmitting);
 *
 * return (
 *   <Button loading={showButtonLoading}>
 *     Submit
 *   </Button>
 * );
 * ```
 *
 * @param isLoading - Whether the operation is currently loading
 *
 * @returns The delayed loading state for button display
 *
 * @public
 * @public
 */

import { useCallback, useEffect, useState } from "react";

import { UI_DELAYS } from "../constants";

/**
 * Hook that manages delayed button loading states to prevent UI flickering.
 *
 * @param isLoading - Whether the operation is currently loading.
 *
 * @returns Delayed loading state for button display.
 *
 * @public
 */
export function useDelayedButtonLoading(isLoading: boolean): boolean {
    const [showButtonLoading, setShowButtonLoading] = useState(false);

    // Create stable callbacks to avoid direct setState in useEffect
    const clearButtonLoading = useCallback(() => {
        setShowButtonLoading(false);
    }, []);
    const showButtonLoadingCallback = useCallback(() => {
        setShowButtonLoading(true);
    }, []);

    useEffect(
        function handleDelayedButtonLoading() {
            if (!isLoading) {
                // Use timeout to defer state update to avoid direct call in
                // useEffect
                const clearTimeoutId = setTimeout(
                    clearButtonLoading,
                    UI_DELAYS.STATE_UPDATE_DEFER
                );
                return (): void => {
                    clearTimeout(clearTimeoutId);
                };
            }

            const timeoutId = setTimeout(
                showButtonLoadingCallback,
                UI_DELAYS.LOADING_BUTTON
            );

            return (): void => {
                clearTimeout(timeoutId);
            };
        },
        [
            clearButtonLoading,
            isLoading,
            showButtonLoadingCallback,
        ]
    );

    return showButtonLoading;
}
