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

import type {
    StateSyncApiSurface,
    StateSyncDomainBridge,
} from "@shared/types/preload";

import { RENDERER_EVENT_CHANNELS } from "@shared/ipc/rendererEvents";
import {
    safeParseStateSyncEventData,
    type StateSyncEventData,
} from "@shared/types/events";

import { createEventManager, createTypedInvoker } from "../core/bridgeFactory";

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
     * Subscribe to state synchronization events
     *
     * @param callback - Function to call when sync events are received
     *
     * @returns Cleanup function to remove the event listener
     */
    onStateSyncEvent: (
        callback: (data: StateSyncEventData) => void
    ) => () => void;

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
    getSyncStatus: createTypedInvoker("get-sync-status"),

    /**
     * Subscribe to state synchronization events
     *
     * @param callback - Function to call when sync events are received
     *
     * @returns Cleanup function to remove the event listener
     */
    onStateSyncEvent: (
        callback: (data: StateSyncEventData) => void
    ): (() => void) =>
        createEventManager(RENDERER_EVENT_CHANNELS.STATE_SYNC).on(
            (data: unknown) => {
                const parsed = safeParseStateSyncEventData(data);

                if (parsed.success) {
                    // eslint-disable-next-line n/callback-return -- Callback Return not required here as we just invoke the callback
                    callback(parsed.data);
                }
            }
        ),

    /**
     * Requests a full synchronization of all data
     *
     * @returns Promise resolving to synchronized site data
     */
    requestFullSync: createTypedInvoker("request-full-sync"),
} as const;

/**
 * Type alias for the state sync domain preload surface.
 *
 * @public
 */
export type StateSyncApi = StateSyncApiSurface;
