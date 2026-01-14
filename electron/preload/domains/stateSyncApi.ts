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

import { createValidatedInvoker } from "../core/bridgeFactory";

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
export const stateSyncApi: StateSyncApiInterface = {
    /**
     * Gets the current synchronization status
     *
     * @returns Promise resolving to current sync status information
     */
    // eslint-disable-next-line ex/no-unhandled -- Accessing constant channel mapping.
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
    // eslint-disable-next-line ex/no-unhandled -- Accessing constant channel mapping.
    requestFullSync: createValidatedInvoker(
        STATE_SYNC_CHANNELS.requestFullSync,
        safeParseStateSyncFullSyncResult,
        {
            domain: "stateSyncApi",
            guardName: "safeParseStateSyncFullSyncResult",
        }
    ),
} as const;

/**
 * Type alias for the state sync domain preload surface.
 *
 * @public
 */
export type StateSyncApi = StateSyncDomainBridge;
