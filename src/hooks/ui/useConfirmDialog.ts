/**
 * Hook that exposes the global confirmation dialog utility.
 *
 * @remarks
 * Provides a stable callback that opens the centralized confirmation dialog and
 * resolves with the user's choice. Helps components replace direct
 * `window.confirm` usage while keeping implementation details encapsulated.
 *
 * @public
 */

import { useCallback } from "react";

import { requestConfirmation } from "../../stores/ui/useConfirmDialogStore";

export type ConfirmDialogOptions = Parameters<typeof requestConfirmation>[0];

/**
 * Returns a stable function for requesting confirmation dialogs.
 *
 * @returns Function that resolves to `true` when the user confirms, `false`
 *   otherwise.
 *
 * @public
 *
 * @see {@link requestConfirmation} for the underlying UI store action.
 */
export function useConfirmDialog(): (
    options: ConfirmDialogOptions
) => Promise<boolean> {
    return useCallback(
        (options: ConfirmDialogOptions) => requestConfirmation(options),
        []
    );
}
