/**
 * SiteManager event emission helpers.
 *
 * @remarks
 * SiteManager emits a handful of strongly-typed internal events that are used
 * for observability and UI synchronization. Keeping these helpers in a separate
 * module prevents the main SiteManager class from accumulating repetitive
 * payload-shaping boilerplate.
 */

import type { Site } from "@shared/types";
import type { SiteAddedSource } from "@shared/types/events";
import type { StateSyncAction, StateSyncSource } from "@shared/types/stateSync";

import { STATE_SYNC_ACTION, STATE_SYNC_SOURCE } from "@shared/types/stateSync";
import { LOG_TEMPLATES } from "@shared/utils/logTemplates";

import type { UptimeEvents } from "../../events/eventTypes";
import type { TypedEventBus } from "../../events/TypedEventBus";

import { logger } from "../../utils/logger";

/** Dependencies required to emit SiteManager events. */
export interface SiteManagerEventEmitterDeps {
    readonly emitSitesStateSynchronized: (args: {
        action: StateSyncAction;
        siteIdentifier: string;
        sites?: Site[];
        source: StateSyncSource;
        timestamp?: number;
    }) => Promise<void>;
    readonly eventEmitter: TypedEventBus<UptimeEvents>;
}

/**
 * Emits `internal:site:cache-miss` without allowing errors to crash callers.
 */
export async function emitSiteCacheMissSafe(
    deps: SiteManagerEventEmitterDeps,
    args: {
        backgroundLoading: boolean;
        identifier: string;
        operation: UptimeEvents["internal:site:cache-miss"]["operation"];
        timestamp?: number;
    }
): Promise<void> {
    try {
        await deps.eventEmitter.emitTyped("internal:site:cache-miss", {
            backgroundLoading: args.backgroundLoading,
            identifier: args.identifier,
            operation: args.operation,
            timestamp: args.timestamp ?? Date.now(),
        });
    } catch (error) {
        // Observability only: never crash callers.
        logger.debug(LOG_TEMPLATES.debug.SITE_CACHE_MISS_ERROR, error);
    }
}

/** Emits an `internal:site:cache-updated` event. */
export async function emitSiteCacheUpdated(
    deps: SiteManagerEventEmitterDeps,
    args: {
        identifier: string;
        operation: UptimeEvents["internal:site:cache-updated"]["operation"];
        timestamp?: number;
    }
): Promise<void> {
    await deps.eventEmitter.emitTyped("internal:site:cache-updated", {
        identifier: args.identifier,
        operation: args.operation,
        timestamp: args.timestamp ?? Date.now(),
    });
}

/**
 * Emits the canonical `internal:site:updated` event and its correlated
 * state-sync update.
 */
export async function emitSiteUpdatedAndStateSynchronized(
    deps: SiteManagerEventEmitterDeps,
    args: {
        identifier: string;
        previousSite: Site;
        site: Site;
        timestamp?: number;
        updatedFields: readonly string[];
    }
): Promise<void> {
    const timestamp = args.timestamp ?? Date.now();

    await deps.eventEmitter.emitTyped("internal:site:updated", {
        identifier: args.identifier,
        operation: "updated",
        previousSite: structuredClone(args.previousSite),
        site: structuredClone(args.site),
        timestamp,
        updatedFields: Array.from(args.updatedFields),
    });

    await deps.emitSitesStateSynchronized({
        action: STATE_SYNC_ACTION.UPDATE,
        siteIdentifier: args.identifier,
        source: STATE_SYNC_SOURCE.DATABASE,
        timestamp,
    });
}

/**
 * Emits the canonical `internal:site:added` event and a correlated state-sync
 * update.
 */
export async function emitSiteAddedAndStateSynchronized(
    deps: SiteManagerEventEmitterDeps,
    args: {
        site: Site;
        source: SiteAddedSource;
        timestamp?: number;
    }
): Promise<void> {
    const timestamp = args.timestamp ?? Date.now();
    const site = structuredClone(args.site);

    await deps.eventEmitter.emitTyped("internal:site:added", {
        identifier: site.identifier,
        operation: "added",
        site,
        source: args.source,
        timestamp,
    });

    await deps.emitSitesStateSynchronized({
        action: STATE_SYNC_ACTION.UPDATE,
        siteIdentifier: site.identifier,
        source: STATE_SYNC_SOURCE.DATABASE,
        timestamp,
    });
}
