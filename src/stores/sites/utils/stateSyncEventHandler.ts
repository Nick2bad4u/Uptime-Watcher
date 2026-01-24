import type { Site } from "@shared/types";
import type {
    BulkStateSyncEventData,
    DeltaStateSyncEventData,
    StateSyncEventData,
} from "@shared/types/events";
import type { SiteSyncDelta } from "@shared/types/stateSync";
import type { BaseLogger } from "@shared/utils/logger/interfaces";

import { STATE_SYNC_ACTION } from "@shared/types/stateSync";
import { ensureError } from "@shared/utils/errorHandling";
import {
    deriveSiteSnapshot,
    hasSiteSyncChanges,
    prepareSiteSyncSnapshot,
} from "@shared/utils/siteSnapshots";

import { buildSanitizedIncomingSiteSyncDelta } from "../useSiteSync.deltaSanitizer";

/** Minimal logger contract required by the sync handler. */
export type SiteSyncEventLogger = Pick<BaseLogger, "debug" | "error" | "warn">;

/**
 * Contract for store telemetry logging.
 */
export type SiteSyncLogStoreAction = (
    storeName: string,
    actionName: string,
    payload: unknown
) => void;

/**
 * Dependencies required to build a {@link createStateSyncEventHandler} handler.
 */
export interface CreateStateSyncEventHandlerOptions {
    getSites: () => Site[];
    logger: SiteSyncEventLogger;
    logStoreAction: SiteSyncLogStoreAction;
    onSiteDelta?: (delta: SiteSyncDelta) => void;
    setSites: (sites: Site[]) => void;
}

const applyDeltaToSites = (
    currentSites: Site[],
    sanitizedDelta: SiteSyncDelta
): {
    duplicates: ReturnType<typeof deriveSiteSnapshot>["duplicates"];
    sanitizedSites: Site[];
} => {
    const removedIdentifiers = new Set(sanitizedDelta.removedSiteIdentifiers);
    const { addedSites, updatedSites } = sanitizedDelta;

    const updatedByIdentifier = new Map(
        updatedSites.map((site) => [site.identifier, site] as const)
    );

    const nextSites: Site[] = [];
    const seenIdentifiers = new Set<string>();

    for (const site of currentSites) {
        const { identifier } = site;
        if (!removedIdentifiers.has(identifier)) {
            nextSites.push(updatedByIdentifier.get(identifier) ?? site);
            seenIdentifiers.add(identifier);
        }
    }

    for (const site of addedSites) {
        const { identifier } = site;
        if (
            !removedIdentifiers.has(identifier) &&
            !seenIdentifiers.has(identifier)
        ) {
            nextSites.push(site);
            seenIdentifiers.add(identifier);
        }
    }

    // Treat unknown updates as upserts.
    for (const site of updatedSites) {
        const { identifier } = site;
        if (
            !removedIdentifiers.has(identifier) &&
            !seenIdentifiers.has(identifier)
        ) {
            nextSites.push(site);
            seenIdentifiers.add(identifier);
        }
    }

    const snapshot = deriveSiteSnapshot(nextSites);
    return {
        duplicates: snapshot.duplicates,
        sanitizedSites: snapshot.sanitizedSites,
    };
};

/**
 * Create a stable handler for backend state sync events.
 *
 * @remarks
 * Extracted from `useSiteSync.ts` to keep store orchestration separate from the
 * event application logic.
 */
export function createStateSyncEventHandler(
    options: CreateStateSyncEventHandlerOptions
): (event: StateSyncEventData) => void {
    const { getSites, logger, logStoreAction, onSiteDelta, setSites } = options;

    const logSyncEventReceived = (event: StateSyncEventData): void => {
        const { action, revision, siteIdentifier, source, timestamp } = event;

        let sitesCount: number | undefined = undefined;
        if (action === STATE_SYNC_ACTION.BULK_SYNC) {
            const { sites } = event;
            sitesCount = sites.length;
        }

        logStoreAction("SitesStore", "syncEventReceived", {
            action,
            message: `Received sync event: ${action}`,
            revision,
            siteIdentifier,
            source,
            timestamp,
            ...(typeof sitesCount === "number" ? { sitesCount } : {}),
        });
    };

    const applySnapshotEvent = (event: BulkStateSyncEventData): void => {
        const { action, revision, siteIdentifier, sites, source, timestamp } =
            event;

        const snapshot = prepareSiteSyncSnapshot({
            previousSnapshot: getSites(),
            sites,
        });

        const { delta, duplicates, emissionSnapshot } = snapshot;

        if (duplicates.length > 0) {
            logger.error(
                "Duplicate site identifiers detected in state sync snapshot",
                {
                    action,
                    duplicates,
                    originalSiteCount: sites.length,
                    sanitizedSiteCount: emissionSnapshot.length,
                    source,
                }
            );
        }

        const hasChanges = hasSiteSyncChanges(delta);

        logStoreAction("SitesStore", "applySyncDelta", {
            action,
            addedCount: delta.addedSites.length,
            removedCount: delta.removedSiteIdentifiers.length,
            sanitizedSiteCount: emissionSnapshot.length,
            source,
            timestamp,
            updatedCount: delta.updatedSites.length,
        });

        if (!hasChanges) {
            logger.debug(
                "Sync snapshot did not change site state; skipping store update",
                {
                    action,
                    revision,
                    siteIdentifier,
                    source,
                    timestamp,
                }
            );
            onSiteDelta?.(delta);
            return;
        }

        setSites(emissionSnapshot);
        onSiteDelta?.(delta);
    };

    const applyDeltaEvent = (event: DeltaStateSyncEventData): void => {
        const { action, delta, revision, siteIdentifier, source, timestamp } =
            event;

        const {
            delta: sanitizedDelta,
            diagnostics: {
                addedDuplicates,
                overlapIdentifiers,
                updatedDuplicates,
            },
        } = buildSanitizedIncomingSiteSyncDelta(delta);

        if (addedDuplicates.length > 0) {
            logger.error(
                "Duplicate site identifiers detected in incoming sync delta additions",
                {
                    action,
                    duplicates: addedDuplicates,
                    source,
                }
            );
        }

        if (updatedDuplicates.length > 0) {
            logger.error(
                "Duplicate site identifiers detected in incoming sync delta updates",
                {
                    action,
                    duplicates: updatedDuplicates,
                    source,
                }
            );
        }

        if (overlapIdentifiers.length > 0) {
            logger.error(
                "Incoming sync delta contains overlapping added/updated identifiers",
                {
                    action,
                    overlapIdentifiers,
                    source,
                }
            );
        }

        if (!hasSiteSyncChanges(sanitizedDelta)) {
            logger.debug(
                "Sync delta did not change site state; skipping store update",
                {
                    action,
                    revision,
                    siteIdentifier,
                    source,
                    timestamp,
                }
            );
            onSiteDelta?.(sanitizedDelta);
            return;
        }

        const { duplicates, sanitizedSites } = applyDeltaToSites(
            getSites(),
            sanitizedDelta
        );

        if (duplicates.length > 0) {
            logger.error(
                "Duplicate site identifiers detected after applying sync delta",
                {
                    action,
                    duplicates,
                    source,
                }
            );
        }

        logStoreAction("SitesStore", "applySyncDelta", {
            action,
            addedCount: sanitizedDelta.addedSites.length,
            removedCount: sanitizedDelta.removedSiteIdentifiers.length,
            sanitizedSiteCount: sanitizedSites.length,
            source,
            timestamp,
            updatedCount: sanitizedDelta.updatedSites.length,
        });

        setSites(sanitizedSites);
        onSiteDelta?.(sanitizedDelta);
    };

    return (event: StateSyncEventData): void => {
        try {
            logSyncEventReceived(event);

            if (event.truncated === true) {
                // Normally handled upstream by StateSyncService (full-sync recovery),
                // but keep this guard to avoid applying incomplete payloads.
                const { action, revision, siteIdentifier, source } = event;
                logger.warn(
                    "Ignoring truncated state sync event in SitesStore",
                    {
                        action,
                        revision,
                        siteIdentifier,
                        source,
                    }
                );
                return;
            }

            if (event.action === STATE_SYNC_ACTION.BULK_SYNC) {
                applySnapshotEvent(event);
                return;
            }

            applyDeltaEvent(event);
        } catch (error: unknown) {
            const normalizedError = ensureError(error);
            const { action, revision, siteIdentifier, source } = event;
            logger.error("Failed to apply state sync event", normalizedError, {
                action,
                revision,
                siteIdentifier,
                source,
            });
        }
    };
}
