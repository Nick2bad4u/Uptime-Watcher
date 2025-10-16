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

import type { StateSyncEventData } from "@shared/types/events";
import type {
    StateSyncApiSurface,
    StateSyncDomainBridge,
} from "@shared/types/preload";
import type { StateSyncAction, StateSyncSource } from "@shared/types/stateSync";

import { RENDERER_EVENT_CHANNELS } from "@shared/ipc/rendererEvents";
import {
    STATE_SYNC_ACTIONS,
    STATE_SYNC_SOURCES,
} from "@shared/types/stateSync";

import { createEventManager, createTypedInvoker } from "../core/bridgeFactory";

const isValidStateSyncAction = (value: unknown): value is StateSyncAction =>
    typeof value === "string" &&
    STATE_SYNC_ACTIONS.some(
        (action): action is StateSyncAction => action === value
    );

const isValidStateSyncSource = (value: unknown): value is StateSyncSource =>
    typeof value === "string" &&
    STATE_SYNC_SOURCES.some(
        (source): source is StateSyncSource => source === value
    );

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === "object" && value !== null;

/**
 * Type guard to validate StateSyncEventData structure
 */
const isStateSyncEventData = (data: unknown): data is StateSyncEventData => {
    if (!isRecord(data)) {
        return false;
    }

    const { action, siteIdentifier, sites, source, timestamp } = data;

    if (typeof action !== "string" || !isValidStateSyncAction(action)) {
        return false;
    }

    if (typeof source !== "string" || !isValidStateSyncSource(source)) {
        return false;
    }

    if (typeof timestamp !== "number") {
        return false;
    }

    if (siteIdentifier !== undefined && typeof siteIdentifier !== "string") {
        return false;
    }

    if (!Array.isArray(sites)) {
        return false;
    }

    return true;
};

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
                if (isStateSyncEventData(data)) {
                    // eslint-disable-next-line n/callback-return -- Callback Return not required here as we just invoke the callback
                    callback(data);
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
