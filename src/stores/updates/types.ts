/**
 * Updates store types and interfaces. Manages application updates and update
 * notifications.
 *
 * @packageDocumentation
 */

import type { UpdateStatus } from "../types";

/**
 * Updates store interface. Manages application update status and operations.
 *
 * @public
 */
export interface UpdatesStore {
    /** Apply downloaded update and restart */
    applyUpdate: () => Promise<void>;
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

    /** Set update progress */
    setUpdateProgress: (progress: number) => void;

    /**
     * Subscribes to backend update status events.
     *
     * @remarks
     * This is intentionally store-owned so application bootstrap code can
     * subscribe via the domain store (rather than wiring {@link EventsService}
     * directly in the root component).
     *
     * The returned cleanup function is safe to call even if the async
     * subscription has not yet finished establishing.
     */
    subscribeToUpdateStatusEvents: () => () => void;
    // Actions
    /** Update error message if any */
    updateError: string | undefined;
    /** Update information */
    /** Update progress (0-100) */
    updateProgress: number;
    // State
    /** Current update status */
    updateStatus: UpdateStatus;
}
