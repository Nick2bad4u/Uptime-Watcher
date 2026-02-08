import type { StateSyncStatusSummary } from "@shared/types/stateSync";

import { STATE_SYNC_SOURCE } from "@shared/types/stateSync";

/**
 * Builds a normalized {@link StateSyncStatusSummary}.
 */
export function createStateSyncStatusSummary(args: {
    lastSyncAt: null | number;
    siteCount: number;
    source: StateSyncStatusSummary["source"];
    synchronized: boolean;
}): StateSyncStatusSummary {
    const lastSyncAt =
        typeof args.lastSyncAt === "number" && Number.isFinite(args.lastSyncAt)
            ? args.lastSyncAt
            : null;
    const siteCount =
        typeof args.siteCount === "number" && Number.isFinite(args.siteCount)
            ? Math.max(0, Math.trunc(args.siteCount))
            : 0;

    return {
        lastSyncAt,
        siteCount,
        source: args.source,
        synchronized: args.synchronized,
    } satisfies StateSyncStatusSummary;
}

/**
 * Normalizes a cached + live summary into a safe {@link StateSyncStatusSummary}.
 */
export function normalizeStateSyncStatusSummary(args: {
    cachedSiteCount: number;
    currentStatus: StateSyncStatusSummary;
}): StateSyncStatusSummary {
    const { cachedSiteCount, currentStatus } = args;

    const hasTrustedDatabaseSummary =
        currentStatus.synchronized &&
        currentStatus.source === STATE_SYNC_SOURCE.DATABASE;

    const lastSyncAt = currentStatus.lastSyncAt ?? null;
    const normalizedCachedSiteCount =
        typeof cachedSiteCount === "number" && Number.isFinite(cachedSiteCount)
            ? Math.max(0, Math.trunc(cachedSiteCount))
            : 0;
    const normalizedSiteCount =
        typeof currentStatus.siteCount === "number" &&
        Number.isFinite(currentStatus.siteCount)
            ? Math.max(0, Math.trunc(currentStatus.siteCount))
            : normalizedCachedSiteCount;

    if (hasTrustedDatabaseSummary) {
        return createStateSyncStatusSummary({
            lastSyncAt,
            siteCount: normalizedSiteCount,
            source: STATE_SYNC_SOURCE.DATABASE,
            synchronized: true,
        });
    }

    return createStateSyncStatusSummary({
        lastSyncAt,
        siteCount: Math.max(normalizedCachedSiteCount, normalizedSiteCount),
        source: STATE_SYNC_SOURCE.CACHE,
        synchronized: false,
    });
}
