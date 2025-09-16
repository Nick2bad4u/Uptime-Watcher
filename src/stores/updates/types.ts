/**
 * Updates store types and interfaces. Manages application updates and update
 * notifications.
 */

import type { UpdateStatus } from "../types";

/**
 * Update information interface.
 */
export interface UpdateInfo {
    /** Release date */
    releaseDate: string;
    /** Release name */
    releaseName: string;
    /** Release notes */
    releaseNotes: string;
    /** Version number */
    version: string;
}

/**
 * Updates store interface. Manages application update status and operations.
 */
export interface UpdatesStore {
    /** Apply downloaded update and restart */
    applyUpdate: () => void;
    /**
     * Applies a new update status to the store with proper state management.
     *
     * @remarks
     * Updates the current update status with clear semantics for status
     * transitions. This method provides better naming clarity for update state
     * management operations.
     *
     * @param status - New update status to apply
     */
    applyUpdateStatus: (status: UpdateStatus) => void;
    /** Clear update error */
    clearUpdateError: () => void;
    /** Set update error */
    setUpdateError: (error: string | undefined) => void;
    /** Set update info */
    setUpdateInfo: (info: undefined | UpdateInfo) => void;

    /** Set update progress */
    setUpdateProgress: (progress: number) => void;
    // Actions
    /** Update error message if any */
    updateError: string | undefined;
    /** Update information */
    updateInfo: undefined | UpdateInfo;
    /** Update progress (0-100) */
    updateProgress: number;
    // State
    /** Current update status */
    updateStatus: UpdateStatus;
}
