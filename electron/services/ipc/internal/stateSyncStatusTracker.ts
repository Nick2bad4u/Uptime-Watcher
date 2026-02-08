import type {
    SiteIdentifierSnapshot,
    StateSyncSource,
    StateSyncStatusSummary,
} from "@shared/types/stateSync";
import type { Logger } from "@shared/utils/logger/interfaces";

import { STATE_SYNC_ACTION, STATE_SYNC_SOURCE } from "@shared/types/stateSync";

import {
    type NormalizedStateSyncStatusEvent,
    normalizeStateSyncPayload,
} from "./stateSyncStatusNormalization";

const createDefaultStateSyncStatus = (): StateSyncStatusSummary => ({
    lastSyncAt: null,
    siteCount: 0,
    source: STATE_SYNC_SOURCE.CACHE,
    synchronized: false,
});

/**
 * Tracks IPC-facing state sync status derived from orchestrator events.
 */
export class StateSyncStatusTracker {
    private readonly logger: Logger;

    private knownSiteIdentifiers = new Set<string>();

    private stateSyncStatus: StateSyncStatusSummary =
        createDefaultStateSyncStatus();

    public constructor(logger: Logger) {
        this.logger = logger;
    }

    /**
     * Returns the current state sync status snapshot.
     */
    public getStatus(): StateSyncStatusSummary {
        return this.stateSyncStatus;
    }

    /**
     * Overrides the current state sync status snapshot.
     */
    public setStatus(summary: StateSyncStatusSummary): void {
        this.stateSyncStatus = summary;
    }

    /**
     * Resets the tracker to its initial state.
     */
    public reset(): void {
        this.knownSiteIdentifiers = new Set();
        this.stateSyncStatus = createDefaultStateSyncStatus();
    }

    /**
     * Normalizes and applies a raw `sites:state-synchronized` payload.
     */
    public handleStatusEvent(data: unknown): void {
        const normalized = normalizeStateSyncPayload(data);
        if (!normalized) {
            this.logger.warn(
                "[IpcService] Ignoring malformed sites:state-synchronized payload",
                {
                    payloadType: Array.isArray(data) ? "array" : typeof data,
                }
            );
            return;
        }

        this.updateStateSyncStatusFromEvent(normalized);
    }

    private updateStateSyncStatus(
        sites: readonly SiteIdentifierSnapshot[],
        source: StateSyncSource,
        timestamp: number
    ): void {
        this.stateSyncStatus = {
            lastSyncAt: timestamp,
            siteCount: sites.length,
            source,
            synchronized: true,
        } satisfies StateSyncStatusSummary;
    }

    private updateStateSyncStatusFromEvent(
        event: NormalizedStateSyncStatusEvent
    ): void {
        const { action, source, timestamp } = event;

        if (action === STATE_SYNC_ACTION.BULK_SYNC) {
            const { siteCount, sites, truncated } = event;

            if (truncated === true) {
                this.knownSiteIdentifiers = new Set();
                this.stateSyncStatus = {
                    lastSyncAt: timestamp,
                    siteCount,
                    source,
                    synchronized: false,
                } satisfies StateSyncStatusSummary;
                return;
            }

            this.knownSiteIdentifiers = new Set(
                sites.map((site) => site.identifier)
            );
            this.updateStateSyncStatus(sites, source, timestamp);
            return;
        }

        // Update/delete are delta-only.
        const { delta } = event;

        const { addedSites, removedSiteIdentifiers, updatedSites } = delta;

        for (const removedSiteIdentifier of removedSiteIdentifiers) {
            this.knownSiteIdentifiers.delete(removedSiteIdentifier);
        }

        for (const site of addedSites) {
            this.knownSiteIdentifiers.add(site.identifier);
        }

        for (const site of updatedSites) {
            this.knownSiteIdentifiers.add(site.identifier);
        }

        this.stateSyncStatus = {
            lastSyncAt: timestamp,
            siteCount: this.knownSiteIdentifiers.size,
            source,
            synchronized: true,
        } satisfies StateSyncStatusSummary;
    }
}
