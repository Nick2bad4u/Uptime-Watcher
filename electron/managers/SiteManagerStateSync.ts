/**
 * SiteManager state synchronization emitter.
 *
 * @remarks
 * `SiteManager` is a large orchestrator. Emitting `sites:state-synchronized`
 * requires internal bookkeeping (revision + previous snapshot) and some
 * defensive normalization. Extracting this logic reduces the size and
 * complexity of `SiteManager.ts` while keeping behavior identical.
 */

import type { Site } from "@shared/types";
import type {
    SiteSyncDelta,
    StateSyncAction,
    StateSyncSource,
} from "@shared/types/stateSync";

import {
    hasSiteSyncChanges,
    prepareSiteSyncSnapshot,
} from "@shared/utils/siteSnapshots";

import type { UptimeEvents } from "../events/eventTypes";
import type { TypedEventBus } from "../events/TypedEventBus";

import { logger } from "../utils/logger";

/**
 * Arguments for emitting a `sites:state-synchronized` event.
 */
export interface SiteManagerStateSyncEmitArgs {
    action: StateSyncAction;
    siteIdentifier?: string;
    sites?: Site[];
    source: StateSyncSource;
    timestamp?: number;
}

/**
 * Result returned after a state-sync attempt.
 */
export interface SiteManagerStateSyncEmitResult {
    revision: number;
    sites: Site[];
}

/**
 * Constructor options for {@link SiteManagerStateSync}.
 */
export interface SiteManagerStateSyncOptions {
    eventEmitter: TypedEventBus<UptimeEvents>;
    getSitesSnapshot: () => Site[];
}

/**
 * Emits state synchronization events and tracks revision/snapshot state.
 */
export class SiteManagerStateSync {
    private readonly eventEmitter: TypedEventBus<UptimeEvents>;

    private readonly getSitesSnapshot: () => Site[];

    private lastStateSyncSnapshot: Site[] = [];

    private stateSyncRevision = 0;

    /**
     * Emits `sites:state-synchronized`.
     *
     * @remarks
     * The implementation is intentionally aligned with the previous
     * `SiteManager.emitSitesStateSynchronized` logic. Keep changes here
     * behavior-preserving.
     */
    public async emitSitesStateSynchronized(
        args: SiteManagerStateSyncEmitArgs
    ): Promise<SiteManagerStateSyncEmitResult> {
        const candidateSites = args.sites ?? this.getSitesSnapshot();

        const { delta, duplicates, emissionSnapshot } = prepareSiteSyncSnapshot(
            {
                previousSnapshot: this.lastStateSyncSnapshot,
                sites: candidateSites,
            }
        );

        if (duplicates.length > 0) {
            logger.error("Duplicate site identifiers detected in state sync", {
                action: args.action,
                duplicates,
                totalSites: candidateSites.length,
            });
        }

        const effectiveTimestamp = args.timestamp ?? Date.now();
        let effectiveDelta: SiteSyncDelta = delta;
        let hasChanges = hasSiteSyncChanges(effectiveDelta);

        if (args.action === "delete" && !hasChanges && args.siteIdentifier) {
            effectiveDelta = {
                addedSites: [],
                removedSiteIdentifiers: [args.siteIdentifier],
                updatedSites: [],
            };
            hasChanges = true;
        }

        const shouldEmit = args.action === "bulk-sync" || hasChanges;

        if (!shouldEmit) {
            this.lastStateSyncSnapshot = emissionSnapshot.map((site) =>
                structuredClone(site)
            );

            return {
                revision: this.stateSyncRevision,
                sites: emissionSnapshot,
            };
        }

        this.stateSyncRevision += 1;
        const revision = this.stateSyncRevision;

        if (args.action === "bulk-sync") {
            await this.eventEmitter.emitTyped("sites:state-synchronized", {
                action: args.action,
                revision,
                siteCount: emissionSnapshot.length,
                siteIdentifier: args.siteIdentifier,
                sites: emissionSnapshot,
                source: args.source,
                timestamp: effectiveTimestamp,
            });
        } else {
            await this.eventEmitter.emitTyped("sites:state-synchronized", {
                action: args.action,
                delta: effectiveDelta,
                revision,
                siteIdentifier: args.siteIdentifier,
                source: args.source,
                timestamp: effectiveTimestamp,
            });
        }

        this.lastStateSyncSnapshot = emissionSnapshot.map((site) =>
            structuredClone(site)
        );

        return { revision, sites: emissionSnapshot };
    }

    public constructor(options: SiteManagerStateSyncOptions) {
        this.eventEmitter = options.eventEmitter;
        this.getSitesSnapshot = options.getSitesSnapshot;
    }

    public getStateSyncRevision(): number {
        return this.stateSyncRevision;
    }
}
