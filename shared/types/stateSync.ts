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
 * Valid sources that can initiate a state synchronization action.
 *
 * @public
 */
export type StateSyncSource = "cache" | "database" | "frontend";

/**
 * Supported state synchronization lifecycle actions.
 *
 * @public
 */
export type StateSyncAction = "bulk-sync" | "delete" | "update";

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
