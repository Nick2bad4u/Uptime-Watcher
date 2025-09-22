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

/* eslint-disable ex/no-unhandled -- Domain APIs are thin wrappers that don't handle exceptions */

import type { Site } from "@shared/types";
import type { StateSyncEventData } from "@shared/types/events";

import { createEventManager, createTypedInvoker } from "../core/bridgeFactory";

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
            callback(data as StateSyncEventData);
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

/* eslint-enable ex/no-unhandled -- Re-enable exception handling warnings */
