/**
 * Updates store types and interfaces.
 * Manages application updates and update notifications.
 */

import type { UpdateStatus } from "../types";

/**
 * Update information interface.
 */
export interface UpdateInfo {
    /** Version number */
    version: string;
    /** Release notes */
    releaseNotes: string;
    /** Release name */
    releaseName: string;
    /** Release date */
    releaseDate: string;
}

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
    /** Update progress (0-100) */
    updateProgress: number;
    /** Update information */
    updateInfo: UpdateInfo | undefined;

    // Actions
    /** Set update status */
    setUpdateStatus: (status: UpdateStatus) => void;
    /** Set update error */
    setUpdateError: (error: string | undefined) => void;
    /** Set update progress */
    setUpdateProgress: (progress: number) => void;
    /** Set update info */
    setUpdateInfo: (info: UpdateInfo | undefined) => void;
    /** Apply downloaded update and restart */
    applyUpdate: () => void;
    /** Clear update error */
    clearUpdateError: () => void;
}
