import type { StateSyncStatusSummary } from "@shared/types/stateSync";

import { STATE_SYNC_SOURCE } from "@shared/types/stateSync";
import { MAX_VALID_DATE_EPOCH_MS } from "@shared/validation/timestampSchemas";
import { isFinite as isFiniteNumber } from "ts-extras";

const isNonNegativeSafeInteger = (candidate: unknown): candidate is number =>
    typeof candidate === "number" &&
    isFiniteNumber(candidate) &&
    Number.isSafeInteger(candidate) &&
    candidate >= 0;

const isValidEpochMs = (candidate: unknown): candidate is number =>
    isNonNegativeSafeInteger(candidate) && candidate <= MAX_VALID_DATE_EPOCH_MS;

/**
 * Builds a normalized {@link StateSyncStatusSummary}.
 */
export function createStateSyncStatusSummary(args: {
    lastSyncAt: null | number;
    siteCount: number;
    source: StateSyncStatusSummary["source"];
    synchronized: boolean;
}): StateSyncStatusSummary {
    const lastSyncAt = isValidEpochMs(args.lastSyncAt) ? args.lastSyncAt : null;
    const siteCount = isNonNegativeSafeInteger(args.siteCount)
        ? args.siteCount
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
    const normalizedCachedSiteCount = isNonNegativeSafeInteger(cachedSiteCount)
        ? cachedSiteCount
        : 0;
    const normalizedSiteCount = isNonNegativeSafeInteger(
        currentStatus.siteCount
    )
        ? currentStatus.siteCount
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
