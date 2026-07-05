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
    StateSyncSource,
} from "@shared/types/stateSync";

import { STATE_SYNC_ACTION, STATE_SYNC_SOURCE } from "@shared/types/stateSync";
import { getOwnDataProperty } from "@shared/utils/errorPropertyAccess";
import { isRecord } from "@shared/utils/typeHelpers";
import { MAX_VALID_DATE_EPOCH_MS } from "@shared/validation/timestampSchemas";
import { isNonEmptyString } from "@shared/validation/validatorUtils";
import { isFinite as isFiniteNumber } from "ts-extras";

/**
 * Lightweight, normalized view of the `sites:state-synchronized` event used
 * exclusively for IPC status bookkeeping.
 */
export type NormalizedStateSyncStatusEvent =
    | {
          readonly _meta?: EventMetadata | undefined;
          readonly action: typeof STATE_SYNC_ACTION.BULK_SYNC;
          readonly revision: number;
          readonly siteCount: number;
          readonly sites: readonly SiteIdentifierSnapshot[];
          readonly source: StateSyncSource;
          readonly timestamp: number;
          readonly truncated?: boolean | undefined;
      }
    | {
          readonly _meta?: EventMetadata | undefined;
          readonly action:
              typeof STATE_SYNC_ACTION.DELETE | typeof STATE_SYNC_ACTION.UPDATE;
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

const isNonNegativeSafeInteger = (candidate: unknown): candidate is number =>
    typeof candidate === "number" &&
    isFiniteNumber(candidate) &&
    Number.isSafeInteger(candidate) &&
    candidate >= 0;

const isValidEpochMs = (candidate: unknown): candidate is number =>
    isNonNegativeSafeInteger(candidate) && candidate <= MAX_VALID_DATE_EPOCH_MS;

const getOwnTrimmedIdentifier = (candidate: object): string | undefined => {
    const property = getOwnDataProperty(candidate, "identifier");
    if (!property.found || !isNonEmptyString(property.value)) {
        return undefined;
    }

    return property.value.trim();
};

const buildIdentifierOnlySites = (
    candidate: unknown
): SiteIdentifierSnapshot[] => {
    if (!Array.isArray(candidate)) {
        return [];
    }

    return candidate
        .filter(isRecord)
        .map(getOwnTrimmedIdentifier)
        .filter(isNonEmptyString)
        .map((identifier) => ({ identifier }));
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

    const { action, revision, source, timestamp } = candidate;

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
        const {
            siteCount: siteCountCandidate,
            sites: sitesCandidate,
            truncated,
        } = candidate;

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

    const { delta: deltaCandidate } = candidate;
    if (!isRecord(deltaCandidate)) {
        return null;
    }

    const {
        addedSites: addedSitesCandidate,
        removedSiteIdentifiers: removedSiteIdentifiersCandidate,
        updatedSites: updatedSitesCandidate,
    } = deltaCandidate;

    if (
        !Array.isArray(addedSitesCandidate) ||
        !Array.isArray(updatedSitesCandidate) ||
        !Array.isArray(removedSiteIdentifiersCandidate)
    ) {
        return null;
    }

    const addedSites = buildIdentifierOnlySites(addedSitesCandidate);
    const updatedSites = buildIdentifierOnlySites(updatedSitesCandidate);
    const removedSiteIdentifiers = removedSiteIdentifiersCandidate
        .filter(isNonEmptyString)
        .map((identifier) => identifier.trim());

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
