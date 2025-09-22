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

import type { Site } from "@shared/types";
import type { StateSyncEventData } from "@shared/types/events";

import { createEventManager, createTypedInvoker } from "../core/bridgeFactory";

/**
 * Type guard to validate StateSyncEventData structure
 */
const isStateSyncEventData = (data: unknown): data is StateSyncEventData => {
    if (typeof data !== "object" || data === null) {
        return false;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Type guard validation requires assertion
    const event = data as Record<string, unknown>;
    return (
        typeof event["action"] === "string" &&
        [
            "bulk-sync",
            "create",
            "delete",
            "update",
        ].includes(event["action"]) &&
        typeof event["source"] === "string" &&
        [
            "backend",
            "cache",
            "manual",
        ].includes(event["source"]) &&
        typeof event["timestamp"] === "number"
    );
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
    getSyncStatus: (...args: unknown[]) => Promise<Site[]>;

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
    requestFullSync: (...args: unknown[]) => Promise<Site[]>;
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
    getSyncStatus: createTypedInvoker<Site[]>("get-sync-status") satisfies (
        ...args: unknown[]
    ) => Promise<Site[]>,

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
        createEventManager("state:sync").on((data: unknown) => {
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
    requestFullSync: createTypedInvoker<Site[]>("request-full-sync") satisfies (
        ...args: unknown[]
    ) => Promise<Site[]>,
} as const;

export type StateSyncApi = StateSyncApiInterface;
