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
 */

import { UI_DELAYS } from "../constants";
import { useDelayedBoolean } from "./useDelayedBoolean";

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
    return useDelayedBoolean({
        clearDelayMs: UI_DELAYS.STATE_UPDATE_DEFER,
        showDelayMs: UI_DELAYS.LOADING_BUTTON,
        value: isLoading,
    });
}
