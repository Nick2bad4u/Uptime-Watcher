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
    type StateSyncApiSurface,
    type StateSyncDomainBridge,
} from "@shared/types/preload";

import { RENDERER_EVENT_CHANNELS } from "@shared/ipc/rendererEvents";
import {
    safeParseStateSyncEventData,
    type StateSyncEventData,
} from "@shared/types/events";

import { createEventManager, createTypedInvoker } from "../core/bridgeFactory";
import {
    buildPayloadPreview,
    preloadDiagnosticsLogger,
    reportPreloadGuardFailure,
} from "../utils/preloadLogger";

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
const stateSyncEventManager = createEventManager(
    RENDERER_EVENT_CHANNELS.STATE_SYNC
);

export const stateSyncApi: StateSyncApiInterface = {
    /**
     * Gets the current synchronization status
     *
     * @returns Promise resolving to current sync status information
     */
    getSyncStatus: createTypedInvoker(STATE_SYNC_CHANNELS.getSyncStatus),

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
        stateSyncEventManager.on((payload: unknown) => {
            const parsed = safeParseStateSyncEventData(payload);

            if (!parsed.success) {
                const payloadPreview = buildPayloadPreview(payload);
                const payloadType = Array.isArray(payload)
                    ? "array"
                    : typeof payload;

                preloadDiagnosticsLogger.warn(
                    "[stateSyncApi] Dropped malformed payload for 'state-sync-event'",
                    {
                        guard: "safeParseStateSyncEventData",
                        payloadPreview,
                        payloadType,
                    }
                );

                void reportPreloadGuardFailure({
                    channel: RENDERER_EVENT_CHANNELS.STATE_SYNC,
                    guard: "safeParseStateSyncEventData",
                    metadata: {
                        domain: "stateSyncApi",
                        payloadType,
                    },
                    payloadPreview,
                    reason: "payload-validation",
                });
                return;
            }

            callback(parsed.data);
        }),

    /**
     * Requests a full synchronization of all data
     *
     * @returns Promise resolving to synchronized site data
     */
    requestFullSync: createTypedInvoker(STATE_SYNC_CHANNELS.requestFullSync),
} as const;

/**
 * Type alias for the state sync domain preload surface.
 *
 * @public
 */
export type StateSyncApi = StateSyncApiSurface;
