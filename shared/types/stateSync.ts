/**
 * Shared state synchronization type definitions.
 *
 * @remarks
 * These types describe the cross-process contracts used by the state sync
 * domain. They ensure the Electron preload bridge, renderer, and main process
 * all agree on the payload and response structure for synchronization
 * operations.
 */

import type { Site } from "@shared/types";

/**
 * Enumerated state synchronization sources for cross-layer consistency.
 *
 * @public
 */
export const STATE_SYNC_SOURCE = {
    CACHE: "cache",
    DATABASE: "database",
    FRONTEND: "frontend",
} as const;

/**
 * Union of all valid state synchronization sources.
 *
 * @public
 */
export type StateSyncSource =
    (typeof STATE_SYNC_SOURCE)[keyof typeof STATE_SYNC_SOURCE];

/**
 * Enumerated state synchronization lifecycle actions.
 *
 * @public
 */
export const STATE_SYNC_ACTION = {
    BULK_SYNC: "bulk-sync",
    DELETE: "delete",
    UPDATE: "update",
} as const;

/**
 * Union of all supported state synchronization lifecycle actions.
 *
 * @public
 */
export type StateSyncAction =
    (typeof STATE_SYNC_ACTION)[keyof typeof STATE_SYNC_ACTION];

/**
 * Ordered list of valid synchronization sources.
 *
 * @public
 */
export const STATE_SYNC_SOURCES: readonly StateSyncSource[] = Object.freeze(
    Object.values(STATE_SYNC_SOURCE) as StateSyncSource[]
);

/**
 * Ordered list of valid synchronization actions.
 *
 * @public
 */
export const STATE_SYNC_ACTIONS: readonly StateSyncAction[] = Object.freeze(
    Object.values(STATE_SYNC_ACTION) as StateSyncAction[]
);

/**
 * Summary returned from a `getSyncStatus` request.
 *
 * @public
 */
export interface StateSyncStatusSummary {
    /** Timestamp (ms since epoch) of the last successful sync, if available. */
    lastSyncAt: null | number;
    /** Total number of sites currently known to the backend. */
    siteCount: number;
    /** Source that most recently produced the synchronized state. */
    source: StateSyncSource;
    /** Indicates whether renderer and backend are currently synchronized. */
    synchronized: boolean;
}

/**
 * Result returned from a `requestFullSync` invocation.
 *
 * @public
 */
export interface StateSyncFullSyncResult {
    /** Timestamp (ms since epoch) when the sync completed. */
    completedAt: number;
    /** Total number of sites contained in {@link sites}. */
    siteCount: number;
    /** Full set of sites returned by the backend. */
    sites: Site[];
    /** Origin that produced the synchronized payload. */
    source: StateSyncSource;
    /** Indicates whether the sync finished successfully. */
    synchronized: boolean;
}
