/**
 * Updates store types and interfaces.
 * Manages application updates and update notifications.
 */

import type { UpdateStatus } from "../types";

/**
 * Updates store interface.
 * Manages application update status and operations.
 */
export interface UpdatesStore {
    // State
    /** Current update status */
    updateStatus: UpdateStatus;
    /** Update error message if any */
    updateError: string | undefined;

    // Actions
    /** Set update status */
    setUpdateStatus: (status: UpdateStatus) => void;
    /** Set update error */
    setUpdateError: (error: string | undefined) => void;
    /** Apply downloaded update and restart */
    applyUpdate: () => void;
    /** Clear update error */
    clearUpdateError: () => void;
}
