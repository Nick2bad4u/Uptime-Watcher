/**
 * Service layer for handling state synchronization operations via Electron IPC.
 *
 * @remarks
 * Ensures all state synchronization interactions go through the preload bridge
 * with proper initialization, logging, and error handling. Provides typed
 * wrappers for sync status retrieval, full sync requests, and event
 * subscriptions.
 */

import type { StateSyncEventData } from "@shared/types/events";
import type {
    StateSyncFullSyncResult,
    StateSyncStatusSummary,
} from "@shared/types/stateSync";

import { ensureError } from "@shared/utils/errorHandling";

import { getIpcServiceHelpers } from "./utils/createIpcServiceHelpers";

const { ensureInitialized, wrap } = ((): ReturnType<
    typeof getIpcServiceHelpers
> => {
    try {
        return getIpcServiceHelpers("StateSyncService");
    } catch (error: unknown) {
        throw ensureError(error);
    }
})();

/**
 * Contract for renderer-facing state synchronization operations.
 *
 * @remarks
 * Provides guarded access to preload-managed IPC endpoints so callers do not
 * touch the `window.electronAPI` global directly. Implementations must ensure
 * the Electron bridge is ready before invoking any underlying channel.
 */
interface StateSyncServiceContract {
    /** Retrieves the latest synchronization status snapshot from the backend. */
    readonly getSyncStatus: () => Promise<StateSyncStatusSummary>;
    /** Ensures the preload bridge is available prior to IPC usage. */
    readonly initialize: () => Promise<void>;
    /**
     * Registers a handler for incremental state sync events and returns a
     * cleanup callback.
     */
    readonly onStateSyncEvent: (
        callback: (event: StateSyncEventData) => void
    ) => Promise<() => void>;
    /**
     * Requests a full synchronization cycle and returns the backend result
     * payload.
     */
    readonly requestFullSync: () => Promise<StateSyncFullSyncResult>;
}

/**
 * State synchronization service bridging renderer and main process IPC.
 *
 * @public
 */
export const StateSyncService: StateSyncServiceContract = {
    /**
     * Retrieves the latest synchronization summary from the backend.
     *
     * @returns {@link StateSyncStatusSummary} Describing recent sync activity.
     */
    getSyncStatus: wrap("getSyncStatus", (api) =>
        // eslint-disable-next-line n/no-sync -- IPC channel is asynchronous despite "Sync" suffix.
        api.stateSync.getSyncStatus()
    ),

    /**
     * Ensures the preload bridge is initialized prior to invoking IPC.
     *
     * @returns Promise that resolves when the bridge is ready.
     */
    initialize: ensureInitialized,

    /**
     * Subscribes to incremental state synchronization updates.
     *
     * @param callback - Handler invoked with {@link StateSyncEventData}.
     *
     * @returns Cleanup callback that removes the subscription.
     */
    onStateSyncEvent: wrap(
        "onStateSyncEvent",
        (api, callback: (event: StateSyncEventData) => void) =>
            // eslint-disable-next-line n/no-sync -- IPC channel is asynchronous despite "Sync" suffix.
            Promise.resolve(api.stateSync.onStateSyncEvent(callback))
    ),

    /**
     * Requests a full state synchronization cycle.
     *
     * @returns {@link StateSyncFullSyncResult} Emitted by the backend.
     */
    requestFullSync: wrap("requestFullSync", (api) =>
        // eslint-disable-next-line n/no-sync -- IPC bridge exposes async method with "Sync" suffix.
        api.stateSync.requestFullSync()
    ),
};
