import type { Site } from "@shared/types";
import type { SiteSyncDelta as SharedSiteSyncDelta } from "@shared/types/stateSync";

import { calculateSiteSyncDelta as sharedCalculateSiteSyncDelta } from "@shared/utils/siteSyncDelta";

/**
 * Calculates the site synchronization delta scoped to the renderer store.
 *
 * @remarks
 * Thin wrapper around the shared delta utility that keeps historical imports
 * working while allowing store-level helpers to evolve independently.
 *
 * @param previousSites - Snapshot of sites before synchronization.
 * @param nextSites - Snapshot of sites after synchronization.
 *
 * @returns Structured delta describing the differences between snapshots.
 */
export function calculateSiteSyncDelta(
    previousSites: Site[],
    nextSites: Site[]
): SharedSiteSyncDelta {
    return sharedCalculateSiteSyncDelta(previousSites, nextSites);
}

/**
 * Renderer-scoped alias of the shared {@link SiteSyncDelta} type used by the
 * sites store.
 */
export type SiteSyncDelta = SharedSiteSyncDelta;
