/**
 * Utilities for deriving sanitized site snapshots and synchronization deltas.
 *
 * @remarks
 * These helpers centralize the logic for removing duplicate site identifiers
 * and computing {@link SiteSyncDelta} payloads so that Electron managers,
 * preload services, and renderer stores share identical behaviour.
 */

import type { Site } from "@shared/types";
import type { SiteSyncDelta } from "@shared/types/stateSync";
import type { DuplicateSiteIdentifier } from "@shared/validation/siteIntegrity";

import { sanitizeSitesByIdentifier } from "@shared/validation/siteIntegrity";

import { calculateSiteSyncDelta } from "./siteSyncDelta";

/**
 * Result of sanitizing a site collection.
 *
 * @public
 */
export interface SiteSnapshotDetails {
    /** Duplicate identifier diagnostics captured during sanitization. */
    readonly duplicates: DuplicateSiteIdentifier[];
    /** Sanitized site collection with duplicates removed in identifier order. */
    readonly sanitizedSites: Site[];
}

/**
 * Result of preparing a site synchronization payload including deltas.
 *
 * @public
 */
export interface SiteSyncSnapshotDetails extends SiteSnapshotDetails {
    /** Structured delta describing changes versus the previous snapshot. */
    readonly delta: SiteSyncDelta;
    /** Deep-cloned snapshot safe for emission to untrusted consumers. */
    readonly emissionSnapshot: Site[];
}

/**
 * Removes duplicate identifiers from a site collection while preserving order.
 *
 * @param sites - Collection of sites to sanitize.
 *
 * @returns Sanitized sites alongside duplicate diagnostics.
 */
export function deriveSiteSnapshot(sites: Site[]): SiteSnapshotDetails {
    const { duplicates, sanitizedSites } = sanitizeSitesByIdentifier(sites);
    return {
        duplicates: duplicates.map((entry) => ({ ...entry })),
        sanitizedSites: sanitizedSites.map((site) => structuredClone(site)),
    } satisfies SiteSnapshotDetails;
}

/**
 * Creates a defensive clone of a site snapshot using {@link structuredClone}.
 */
function cloneSites(sites: Site[]): Site[] {
    return sites.map((site) => structuredClone(site));
}

/**
 * Derives sanitized site data and computes the synchronization delta against a
 * previous snapshot.
 *
 * @param options - Options controlling snapshot preparation. Provide the
 *   candidate site collection and an optional baseline snapshot for delta
 *   computation.
 *
 * @returns Sanitized sites, delta details, and a cloned emission snapshot.
 */
export function prepareSiteSyncSnapshot({
    previousSnapshot = [],
    sites,
}: {
    previousSnapshot?: Site[];
    sites: Site[];
}): SiteSyncSnapshotDetails {
    const snapshot = deriveSiteSnapshot(sites);
    const emissionSnapshot = cloneSites(snapshot.sanitizedSites);
    const delta = calculateSiteSyncDelta(previousSnapshot, emissionSnapshot);

    return {
        delta,
        duplicates: snapshot.duplicates,
        emissionSnapshot,
        sanitizedSites: snapshot.sanitizedSites,
    } satisfies SiteSyncSnapshotDetails;
}

/**
 * Determines whether a synchronization delta contains any changes.
 *
 * @param delta - The delta produced by {@link calculateSiteSyncDelta}.
 *
 * @returns `true` when additions, removals, or updates are present.
 */
export function hasSiteSyncChanges(delta: SiteSyncDelta): boolean {
    return (
        delta.addedSites.length > 0 ||
        delta.removedSiteIdentifiers.length > 0 ||
        delta.updatedSites.length > 0
    );
}
