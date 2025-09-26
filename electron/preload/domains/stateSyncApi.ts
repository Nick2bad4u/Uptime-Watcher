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
    StateSyncFullSyncResult,
    StateSyncStatusSummary,
} from "@shared/types/stateSync";

import { createEventManager, createTypedInvoker } from "../core/bridgeFactory";

const VALID_STATE_SYNC_ACTIONS = [
    "bulk-sync",
    "delete",
    "update",
] as const;
const VALID_STATE_SYNC_SOURCES = [
    "cache",
    "database",
    "frontend",
] as const;

type ValidStateSyncAction = (typeof VALID_STATE_SYNC_ACTIONS)[number];
type ValidStateSyncSource = (typeof VALID_STATE_SYNC_SOURCES)[number];

const isValidStateSyncAction = (
    value: unknown
): value is ValidStateSyncAction =>
    typeof value === "string" &&
    (VALID_STATE_SYNC_ACTIONS as readonly string[]).includes(value);

const isValidStateSyncSource = (
    value: unknown
): value is ValidStateSyncSource =>
    typeof value === "string" &&
    (VALID_STATE_SYNC_SOURCES as readonly string[]).includes(value);

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

    if (sites !== undefined && !Array.isArray(sites)) {
        return false;
    }

    return true;
};

/**
 * Interface defining the state sync domain API operations
 */
export interface StateSyncApiInterface {
    /**
     * Gets the current synchronization status
     *
     * @returns Promise resolving to current sync status information
     */
    getSyncStatus: () => Promise<StateSyncStatusSummary>;

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
    requestFullSync: (...args: unknown[]) => Promise<StateSyncFullSyncResult>;
}

/**
 * State sync domain API providing state synchronization operations
 */
export const stateSyncApi: StateSyncApiInterface = {
    /**
     * Gets the current synchronization status
     *
     * @returns Promise resolving to current sync status information
     */
    getSyncStatus: createTypedInvoker<StateSyncStatusSummary>(
        "get-sync-status"
    ) satisfies (...args: unknown[]) => Promise<StateSyncStatusSummary>,

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
        createEventManager("state-sync-event").on((data: unknown) => {
            if (isStateSyncEventData(data)) {
                // eslint-disable-next-line n/callback-return -- Callback Return not required here as we just invoke the callback
                callback(data);
            }
        }),

    /**
     * Requests a full synchronization of all data
     *
     * @returns Promise resolving to synchronized site data
     */
    requestFullSync: createTypedInvoker<StateSyncFullSyncResult>(
        "request-full-sync"
    ) satisfies (...args: unknown[]) => Promise<StateSyncFullSyncResult>,
} as const;

export type StateSyncApi = StateSyncApiInterface;
