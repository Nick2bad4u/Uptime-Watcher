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

import { waitForElectronAPI } from "../stores/utils";
import { logger } from "./logger";

/**
 * Contract for renderer-facing state synchronization operations.
 *
 * @remarks
 * Provides guarded access to preload-managed IPC endpoints so callers do not
 * touch {@link window.electronAPI} directly. Implementations must ensure the
 * Electron bridge is ready before invoking any underlying channel.
 */
interface StateSyncServiceContract {
    /** Retrieves the latest synchronization status snapshot from the backend. */
    getSyncStatus: () => Promise<StateSyncStatusSummary>;
    /** Ensures the preload bridge is available prior to IPC usage. */
    initialize: () => Promise<void>;
    /** Registers a handler for incremental state sync events and returns a
cleanup callback. */
    onStateSyncEvent: (
        callback: (event: StateSyncEventData) => void
    ) => Promise<() => void>;
    /** Requests a full synchronization cycle and returns the backend result
payload. */
    requestFullSync: () => Promise<StateSyncFullSyncResult>;
}

/**
 * State synchronization service bridging renderer and main process IPC.
 *
 * @public
 */
export const StateSyncService: StateSyncServiceContract = {
    async getSyncStatus(): Promise<StateSyncStatusSummary> {
        await this.initialize();
        try {
            return await window.electronAPI.stateSync.getSyncStatus();
        } catch (error) {
            logger.error(
                "Failed to retrieve state sync status:",
                ensureError(error)
            );
            throw error;
        }
    },

    async initialize(): Promise<void> {
        try {
            await waitForElectronAPI();
        } catch (error) {
            logger.error(
                "Failed to initialize StateSyncService:",
                ensureError(error)
            );
            throw error;
        }
    },

    async onStateSyncEvent(
        callback: (event: StateSyncEventData) => void
    ): Promise<() => void> {
        await this.initialize();
        try {
            return window.electronAPI.stateSync.onStateSyncEvent(callback);
        } catch (error) {
            logger.error(
                "Failed to register state sync event listener:",
                ensureError(error)
            );
            throw error;
        }
    },

    async requestFullSync(): Promise<StateSyncFullSyncResult> {
        await this.initialize();
        try {
            return await window.electronAPI.stateSync.requestFullSync();
        } catch (error) {
            logger.error(
                "Failed to request full state synchronization:",
                ensureError(error)
            );
            throw error;
        }
    },
};
