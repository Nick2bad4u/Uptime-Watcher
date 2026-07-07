import type { EventMetadata } from "@shared/types/events";
/**
 * Normalizes `sites:state-synchronized` payloads for IPC bookkeeping.
 *
 * @remarks
 * IPC only needs lightweight summary information (identifiers, counts,
 * revision) to keep {@link StateSyncStatusSummary} up-to-date. This module
 * avoids heavy validation or cloning of full site payloads.
 */
import type {
    SiteIdentifierSnapshot,
    StateSyncAction,
    StateSyncSource,
} from "@shared/types/stateSync";

import { STATE_SYNC_ACTION, STATE_SYNC_SOURCE } from "@shared/types/stateSync";
import { getOwnDataProperty } from "@shared/utils/errorPropertyAccess";
import { isNonNegativeSafeInteger } from "@shared/utils/typeGuards";
import { isRecord } from "@shared/utils/typeHelpers";
import { MAX_VALID_DATE_EPOCH_MS } from "@shared/validation/timestampSchemas";
import { isNonEmptyString } from "@shared/validation/validatorUtils";

/**
 * Lightweight, normalized view of the `sites:state-synchronized` event used
 * exclusively for IPC status bookkeeping.
 */
export type NormalizedStateSyncStatusEvent =
    | {
          readonly _meta?: EventMetadata | undefined;
          readonly action: Extract<StateSyncAction, "bulk-sync">;
          readonly revision: number;
          readonly siteCount: number;
          readonly sites: readonly SiteIdentifierSnapshot[];
          readonly source: StateSyncSource;
          readonly timestamp: number;
          readonly truncated?: boolean | undefined;
      }
    | {
          readonly _meta?: EventMetadata | undefined;
          readonly action: Extract<StateSyncAction, "delete" | "update">;
          readonly delta: {
              readonly addedSites: readonly SiteIdentifierSnapshot[];
              readonly removedSiteIdentifiers: readonly string[];
              readonly updatedSites: readonly SiteIdentifierSnapshot[];
          };
          readonly revision: number;
          readonly source: StateSyncSource;
          readonly timestamp: number;
      };

const isValidStateSyncSource = (
    candidate: unknown
): candidate is StateSyncSource =>
    candidate === STATE_SYNC_SOURCE.CACHE ||
    candidate === STATE_SYNC_SOURCE.DATABASE ||
    candidate === STATE_SYNC_SOURCE.FRONTEND ||
    candidate === STATE_SYNC_SOURCE.IMPORT ||
    candidate === STATE_SYNC_SOURCE.MONITOR_UPDATE;

const isValidEpochMs = (candidate: unknown): candidate is number =>
    isNonNegativeSafeInteger(candidate) && candidate <= MAX_VALID_DATE_EPOCH_MS;

const getOwnIdentifier = (candidate: object): string | undefined => {
    const property = getOwnDataProperty(candidate, "identifier");
    if (!property.found || !isNonEmptyString(property.value)) {
        return undefined;
    }

    return property.value;
};

const getOwnValue = (candidate: object, key: PropertyKey): unknown => {
    const property = getOwnDataProperty(candidate, key);
    return property.found ? property.value : undefined;
};

const buildIdentifierOnlySites = (
    candidate: unknown
): SiteIdentifierSnapshot[] => {
    if (!Array.isArray(candidate)) {
        return [];
    }

    const sites: SiteIdentifierSnapshot[] = [];
    for (let index = 0; index < candidate.length; index += 1) {
        const value = getOwnValue(candidate, String(index));
        if (!isRecord(value)) {
            continue;
        }

        const identifier = getOwnIdentifier(value);
        if (isNonEmptyString(identifier)) {
            sites.push({ identifier });
        }
    }

    return sites;
};

const buildStringArray = (candidate: unknown): string[] => {
    if (!Array.isArray(candidate)) {
        return [];
    }

    const values: string[] = [];
    for (let index = 0; index < candidate.length; index += 1) {
        const value = getOwnValue(candidate, String(index));
        if (isNonEmptyString(value)) {
            values.push(value);
        }
    }

    return values;
};

/**
 * Normalizes a raw state-sync event payload into a lightweight shape the IPC
 * layer can safely consume.
 */
export function normalizeStateSyncPayload(
    candidate: unknown
): NormalizedStateSyncStatusEvent | null {
    if (!isRecord(candidate)) {
        return null;
    }

    const action = getOwnValue(candidate, "action");
    const revision = getOwnValue(candidate, "revision");
    const source = getOwnValue(candidate, "source");
    const timestamp = getOwnValue(candidate, "timestamp");

    if (
        (action !== STATE_SYNC_ACTION.BULK_SYNC &&
            action !== STATE_SYNC_ACTION.DELETE &&
            action !== STATE_SYNC_ACTION.UPDATE) ||
        !isValidStateSyncSource(source) ||
        !isValidEpochMs(timestamp) ||
        !isNonNegativeSafeInteger(revision)
    ) {
        return null;
    }

    if (action === STATE_SYNC_ACTION.BULK_SYNC) {
        const siteCountCandidate = getOwnValue(candidate, "siteCount");
        const sitesCandidate = getOwnValue(candidate, "sites");
        const truncated = getOwnValue(candidate, "truncated");

        if (
            !isNonNegativeSafeInteger(siteCountCandidate) ||
            !Array.isArray(sitesCandidate)
        ) {
            return null;
        }

        const isTruncated = truncated === true;
        const sites = isTruncated
            ? []
            : buildIdentifierOnlySites(sitesCandidate);

        return {
            action,
            revision,
            // Preserve the declared count even if we drop invalid site entries.
            siteCount: siteCountCandidate,
            sites,
            source,
            timestamp,
            truncated: isTruncated,
        };
    }

    const deltaCandidate = getOwnValue(candidate, "delta");
    if (!isRecord(deltaCandidate)) {
        return null;
    }

    const addedSitesCandidate = getOwnValue(deltaCandidate, "addedSites");
    const removedSiteIdentifiersCandidate = getOwnValue(
        deltaCandidate,
        "removedSiteIdentifiers"
    );
    const updatedSitesCandidate = getOwnValue(deltaCandidate, "updatedSites");

    if (
        !Array.isArray(addedSitesCandidate) ||
        !Array.isArray(updatedSitesCandidate) ||
        !Array.isArray(removedSiteIdentifiersCandidate)
    ) {
        return null;
    }

    const addedSites = buildIdentifierOnlySites(addedSitesCandidate);
    const updatedSites = buildIdentifierOnlySites(updatedSitesCandidate);
    const removedSiteIdentifiers = buildStringArray(
        removedSiteIdentifiersCandidate
    );

    return {
        action,
        delta: {
            addedSites,
            removedSiteIdentifiers,
            updatedSites,
        },
        revision,
        source,
        timestamp,
    };
}
