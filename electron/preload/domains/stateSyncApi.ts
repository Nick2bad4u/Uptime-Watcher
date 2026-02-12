/**
 * State Sync Domain API - Auto-generated preload bridge for state
 * synchronization
 *
 * @remarks
 * This module provides type-safe IPC communication for state synchronization
 * operations between frontend and backend. As a thin wrapper over the bridge
 * factory, exceptions are intentionally propagated to the frontend for handling
 * at the UI level.
 *
 * @packageDocumentation
 */

import {
    STATE_SYNC_CHANNELS,
    type StateSyncDomainBridge,
} from "@shared/types/preload";
import {
    safeParseStateSyncFullSyncResult,
    safeParseStateSyncStatusSummary,
} from "@shared/types/stateSync";
import { ensureError } from "@shared/utils/errorHandling";

import { createValidatedInvoker } from "../core/bridgeFactory";
import {
    acceptUnusedPreloadArguments,
    createPreloadDomain,
} from "../utils/preloadDomainFactory";

/**
 * Interface defining the state sync domain API operations.
 *
 * @public
 */
export interface StateSyncApiInterface extends StateSyncDomainBridge {
    /**
     * Gets the current synchronization status
     *
     * @returns Promise resolving to current sync status information
     */
    getSyncStatus: StateSyncDomainBridge["getSyncStatus"];

    /**
     * Requests a full synchronization of all data
     *
     * @returns Promise resolving to synchronized site data
     */
    requestFullSync: StateSyncDomainBridge["requestFullSync"];
}

/**
 * State sync domain API providing state synchronization operations.
 *
 * @public
 */
function createStateSyncApi(): StateSyncApiInterface {
    try {
        return {
            /**
             * Gets the current synchronization status
             *
             * @returns Promise resolving to current sync status information
             */
            getSyncStatus: createValidatedInvoker(
                STATE_SYNC_CHANNELS.getSyncStatus,
                safeParseStateSyncStatusSummary,
                {
                    domain: "stateSyncApi",
                    guardName: "safeParseStateSyncStatusSummary",
                }
            ),

            /**
             * Requests a full synchronization of all data
             *
             * @returns Promise resolving to synchronized site data
             */
            requestFullSync: createValidatedInvoker(
                STATE_SYNC_CHANNELS.requestFullSync,
                safeParseStateSyncFullSyncResult,
                {
                    domain: "stateSyncApi",
                    guardName: "safeParseStateSyncFullSyncResult",
                }
            ),
        } as const;
    } catch (error) {
        throw ensureError(error);
    }
}

const createStateSyncApiFallback = (
    unavailableError: Error
): StateSyncApiInterface =>
    ({
        getSyncStatus: (
            ...args: Parameters<StateSyncApiInterface["getSyncStatus"]>
        ) => {
            acceptUnusedPreloadArguments(...args);
            return Promise.reject(unavailableError);
        },
        requestFullSync: (
            ...args: Parameters<StateSyncApiInterface["requestFullSync"]>
        ) => {
            acceptUnusedPreloadArguments(...args);
            return Promise.reject(unavailableError);
        },
    }) as const;

export const stateSyncApi: StateSyncApiInterface = createPreloadDomain({
    create: createStateSyncApi,
    createFallback: createStateSyncApiFallback,
    domain: "stateSyncApi",
});

/**
 * Type alias for the state sync domain preload surface.
 *
 * @public
 */
export type StateSyncApi = StateSyncDomainBridge;
