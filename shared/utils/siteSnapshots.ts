/**
 * Utilities for deriving sanitized site snapshots and synchronization deltas.
 *
 * @remarks
 * These helpers centralize the logic for removing duplicate site identifiers
 * and computing {@link SiteSyncDelta} payloads so that Electron managers,
 * preload services, and renderer stores share identical behaviour.
 */

import type { Monitor, Site, StatusHistory } from "@shared/types";
import type { SiteSyncDelta } from "@shared/types/stateSync";
import type { DuplicateSiteIdentifier } from "@shared/validation/siteIntegrity";
import type { RequireAtLeastOne, UnknownRecord } from "type-fest";

import { isMonitorStatus } from "@shared/types";
import { sanitizeSitesByIdentifier } from "@shared/validation/siteIntegrity";

import { calculateSiteSyncDelta } from "./siteSyncDelta";
import {
    isArray,
    isBoolean,
    isFiniteNumber,
    isNonEmptyString,
    isObject,
} from "./typeGuards";

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

interface SiteSyncDeltaChangeSetBase {
    addedSites?: SiteSyncDelta["addedSites"];
    removedSiteIdentifiers?: SiteSyncDelta["removedSiteIdentifiers"];
    updatedSites?: SiteSyncDelta["updatedSites"];
}

/**
 * Non-empty subset of {@link SiteSyncDelta} describing concrete changes.
 */
export type SiteSyncDeltaChangeSet =
    RequireAtLeastOne<SiteSyncDeltaChangeSetBase>;

/**
 * Delta guaranteed to contain at least one addition, removal, or update.
 */
const hasChangeSetEntries = (
    changeSet: SiteSyncDeltaChangeSetBase
): changeSet is SiteSyncDeltaChangeSet =>
    Boolean(
        changeSet.addedSites ??
        changeSet.removedSiteIdentifiers ??
        changeSet.updatedSites
    );

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
/**
 * Derives a change-set view of a delta, containing only populated sections.
 */
export function deriveSiteSyncChangeSet(
    delta: SiteSyncDelta
): null | SiteSyncDeltaChangeSet {
    const changeSet: SiteSyncDeltaChangeSetBase = {};

    if (delta.addedSites.length > 0) {
        changeSet.addedSites = delta.addedSites;
    }

    if (delta.removedSiteIdentifiers.length > 0) {
        changeSet.removedSiteIdentifiers = delta.removedSiteIdentifiers;
    }

    if (delta.updatedSites.length > 0) {
        changeSet.updatedSites = delta.updatedSites;
    }

    return hasChangeSetEntries(changeSet) ? changeSet : null;
}

/**
 * Determines whether a delta contains actionable changes.
 */
export function hasSiteSyncChanges(delta: SiteSyncDelta): boolean {
    return deriveSiteSyncChangeSet(delta) !== null;
}

const normalizeDateValue = (value: unknown): Date | undefined => {
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
        return value;
    }

    if (isNonEmptyString(value) || isFiniteNumber(value)) {
        const parsed = new Date(value);
        return Number.isNaN(parsed.getTime()) ? undefined : parsed;
    }

    return undefined;
};

const hasOverlayValues = <TOverlay extends object>(
    overlay: Partial<TOverlay>
): overlay is TOverlay =>
    Object.values(overlay).some((entry) =>
        Array.isArray(entry) ? entry.length > 0 : entry !== undefined);

/**
 * Snapshot overlay for monitors used when merging payloads with canonical cache
 * entries.
 */
export type MonitorSnapshotOverlay = Partial<
    Pick<
        Monitor,
        | "activeOperations"
        | "history"
        | "lastChecked"
        | "monitoring"
        | "responseTime"
        | "status"
    >
>;

/** Snapshot overlay for sites that can include normalized monitor snapshots. */
export type SiteSnapshotOverlay = Partial<Pick<Site, "monitoring">> & {
    monitors?: Monitor[];
};

export const isStatusHistoryEntry = (
    value: unknown
): value is StatusHistory => {
    if (!isObject(value)) {
        return false;
    }

    const { responseTime, status, timestamp } =
        value as Partial<StatusHistory> & UnknownRecord;

    return (
        isFiniteNumber(responseTime) &&
        isFiniteNumber(timestamp) &&
        typeof status === "string"
    );
};

export const isStatusHistoryArray = (
    value: unknown
): value is StatusHistory[] => isArray(value, isStatusHistoryEntry);

export const isMonitorSnapshot = (candidate: unknown): candidate is Monitor => {
    if (!isObject(candidate)) {
        return false;
    }

    const {
        checkInterval,
        history,
        id,
        monitoring,
        responseTime,
        retryAttempts,
        status,
        timeout,
        type,
    } = candidate as Partial<Monitor> & UnknownRecord;

    return (
        isNonEmptyString(id ?? undefined) &&
        isFiniteNumber(checkInterval) &&
        isArray(history, isStatusHistoryEntry) &&
        isBoolean(monitoring) &&
        isFiniteNumber(responseTime) &&
        isFiniteNumber(retryAttempts) &&
        isFiniteNumber(timeout) &&
        typeof type === "string" &&
        typeof status === "string" &&
        isMonitorStatus(status)
    );
};

export const isSiteSnapshot = (candidate: unknown): candidate is Site => {
    if (!isObject(candidate)) {
        return false;
    }

    const { identifier, monitoring, monitors, name } =
        candidate as Partial<Site> & UnknownRecord;

    if (
        !isNonEmptyString(identifier ?? undefined) ||
        typeof name !== "string" ||
        !isBoolean(monitoring) ||
        !Array.isArray(monitors)
    ) {
        return false;
    }

    return monitors.every(isMonitorSnapshot);
};

/**
 * Derives a normalized overlay describing the mutable portions of a monitor
 * snapshot.
 *
 * @param source - Monitor payload or monitor-like object to normalize.
 *
 * @returns Overlay populated with the validated subset of monitor fields, or
 *   `undefined` when no serializable data is present.
 */
export function toMonitorSnapshotOverlay(
    source?: Monitor | MonitorSnapshotOverlay | UnknownRecord
): MonitorSnapshotOverlay | undefined {
    if (!source || !isObject(source)) {
        return undefined;
    }

    const overlay: Partial<MonitorSnapshotOverlay> = {};
    const {
        activeOperations,
        history,
        lastChecked,
        monitoring,
        responseTime,
        status,
    } = source as Partial<Monitor> &
        Partial<MonitorSnapshotOverlay> &
        UnknownRecord;

    // Empty history arrays are treated as "no overlay" so that callers that
    // occasionally omit history (or emit an empty array) do not accidentally
    // erase already-populated history from canonical snapshots.
    if (isStatusHistoryArray(history) && history.length > 0) {
        overlay.history = history;
    }

    if (isBoolean(monitoring)) {
        overlay.monitoring = monitoring;
    }

    if (isFiniteNumber(responseTime)) {
        overlay.responseTime = responseTime;
    }

    if (typeof status === "string" && isMonitorStatus(status)) {
        overlay.status = status;
    }

    if (
        isArray(activeOperations, isNonEmptyString) &&
        activeOperations.length > 0
    ) {
        overlay.activeOperations = activeOperations;
    }

    const normalizedDate = normalizeDateValue(lastChecked);
    if (normalizedDate) {
        overlay.lastChecked = normalizedDate;
    }

    return hasOverlayValues<MonitorSnapshotOverlay>(overlay)
        ? overlay
        : undefined;
}

/**
 * Builds a site-level overlay containing the monitoring flag and any valid
 * monitor snapshots discovered in the source payload.
 *
 * @param source - Site snapshot candidate or partial overlay.
 *
 * @returns Structured overlay when at least one field is present; otherwise
 *   `undefined`.
 */
export function toSiteSnapshotOverlay(
    source?: Site | SiteSnapshotOverlay | UnknownRecord
): SiteSnapshotOverlay | undefined {
    if (!source || !isObject(source)) {
        return undefined;
    }

    const overlay: Partial<SiteSnapshotOverlay> = {};
    const { monitoring, monitors } = source as Partial<Site> &
        Partial<SiteSnapshotOverlay> &
        UnknownRecord;

    if (isBoolean(monitoring)) {
        overlay.monitoring = monitoring;
    }

    if (Array.isArray(monitors)) {
        const normalizedMonitors = monitors.filter(isMonitorSnapshot);
        if (normalizedMonitors.length > 0) {
            overlay.monitors = normalizedMonitors;
        }
    }

    return hasOverlayValues<SiteSnapshotOverlay>(overlay) ? overlay : undefined;
}

/**
 * Merges canonical monitor data with an optional overlay, preserving canonical
 * fields while allowing overlay overrides for mutable values (history,
 * monitoring flags, etc.).
 *
 * @param canonicalMonitor - Monitor snapshot sourced from the cache or
 *   database.
 * @param overlaySource - Optional overlay or alternate monitor snapshot to
 *   layer on top of the canonical data.
 *
 * @returns A monitor snapshot combining canonical data with overlay values.
 */
export function mergeMonitorSnapshots(
    canonicalMonitor: Monitor,
    overlaySource?: Monitor | MonitorSnapshotOverlay
): Monitor {
    const overlay = toMonitorSnapshotOverlay(overlaySource);

    if (!overlay) {
        return canonicalMonitor;
    }

    return {
        ...canonicalMonitor,
        ...overlay,
        history: overlay.history ?? canonicalMonitor.history,
    } satisfies Monitor;
}

/**
 * Combines a canonical site snapshot with overlay details, including the set of
 * monitor overlays provided by the source payload.
 *
 * @param canonicalSite - Primary site snapshot used as the base state.
 * @param overlaySource - Overlay or partial site snapshot providing updated
 *   monitoring flags or monitor snapshots.
 *
 * @returns Site snapshot enriched with overlay data when available.
 */
export function mergeSiteSnapshots(
    canonicalSite: Site,
    overlaySource?: Site | SiteSnapshotOverlay
): Site {
    const overlay = toSiteSnapshotOverlay(overlaySource);

    if (!overlay) {
        return canonicalSite;
    }

    const overlayMonitors = new Map<string, MonitorSnapshotOverlay>();
    overlay.monitors?.forEach((candidate) => {
        const snapshot = toMonitorSnapshotOverlay(candidate);
        if (snapshot) {
            overlayMonitors.set(candidate.id, snapshot);
        }
    });

    const monitors = canonicalSite.monitors.map((canonicalMonitor) =>
        mergeMonitorSnapshots(
            canonicalMonitor,
            overlayMonitors.get(canonicalMonitor.id)
        ));

    return {
        ...canonicalSite,
        monitoring: overlay.monitoring ?? canonicalSite.monitoring,
        monitors,
    } satisfies Site;
}
