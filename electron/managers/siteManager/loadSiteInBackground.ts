import type { Site } from "@shared/types";
import type { ValueOf } from "type-fest";

import { STATE_SYNC_ACTION, STATE_SYNC_SOURCE } from "@shared/types/stateSync";
import {
    interpolateLogTemplate,
    LOG_TEMPLATES,
} from "@shared/utils/logTemplates";

import type { UptimeEvents } from "../../events/eventTypes";
import type { SiteRepositoryService } from "../../services/database/SiteRepositoryService";
import type { StandardizedCache } from "../../utils/cache/StandardizedCache";

import { logger } from "../../utils/logger";

/**
 * Dependencies required by {@link loadSiteInBackground}.
 */
export interface LoadSiteInBackgroundDeps {
    /** Emits cache-miss events (observability only). */
    readonly emitSiteCacheMissSafe: (args: {
        backgroundLoading: boolean;
        identifier: string;
        operation: UptimeEvents["internal:site:cache-miss"]["operation"];
    }) => Promise<void>;
    /** Emits cache-updated events for observability. */
    readonly emitSiteCacheUpdated: (args: {
        identifier: string;
        operation: UptimeEvents["internal:site:cache-updated"]["operation"];
        timestamp: number;
    }) => Promise<void>;
    /** Emits state sync updates after hydration. */
    readonly emitSitesStateSynchronized: (payload: {
        action: ValueOf<typeof STATE_SYNC_ACTION>;
        siteIdentifier: string;
        source: ValueOf<typeof STATE_SYNC_SOURCE>;
        timestamp: number;
    }) => Promise<unknown>;
    /** Identifier of the site to load. */
    readonly identifier: string;
    /** Database-backed reader for individual site records. */
    readonly siteRepositoryService: Pick<
        SiteRepositoryService,
        "getSiteFromDatabase"
    >;
    /** Cache to hydrate when a site is found. */
    readonly sitesCache: Pick<StandardizedCache<Site>, "set">;
}

/**
 * Background site hydration used by `SiteManager.getSiteFromCache`.
 *
 * @remarks
 * Extracted from `SiteManager` to keep the manager file smaller while
 * preserving the non-blocking, observability-focused behavior.
 */
export async function loadSiteInBackground(
    deps: LoadSiteInBackgroundDeps
): Promise<void> {
    try {
        logger.debug(
            interpolateLogTemplate(LOG_TEMPLATES.debug.BACKGROUND_LOAD_START, {
                identifier: deps.identifier,
            })
        );

        const site = await deps.siteRepositoryService.getSiteFromDatabase(
            deps.identifier
        );

        if (site) {
            deps.sitesCache.set(deps.identifier, site);

            const timestamp = Date.now();

            await deps.emitSitesStateSynchronized({
                action: STATE_SYNC_ACTION.UPDATE,
                siteIdentifier: deps.identifier,
                source: STATE_SYNC_SOURCE.DATABASE,
                timestamp,
            });

            await deps.emitSiteCacheUpdated({
                identifier: deps.identifier,
                operation: "background-load",
                timestamp,
            });

            logger.debug(
                interpolateLogTemplate(
                    LOG_TEMPLATES.debug.BACKGROUND_LOAD_COMPLETE,
                    { identifier: deps.identifier }
                )
            );

            return;
        }

        logger.debug(
            interpolateLogTemplate(
                LOG_TEMPLATES.debug.SITE_BACKGROUND_LOAD_FAILED,
                {
                    identifier: deps.identifier,
                }
            )
        );

        await deps.emitSiteCacheMissSafe({
            backgroundLoading: false,
            identifier: deps.identifier,
            operation: "cache-lookup",
        });
    } catch (error) {
        logger.debug(
            interpolateLogTemplate(
                LOG_TEMPLATES.errors.SITE_BACKGROUND_LOAD_FAILED,
                {
                    identifier: deps.identifier,
                }
            ),
            error
        );

        await deps.emitSiteCacheMissSafe({
            backgroundLoading: false,
            identifier: deps.identifier,
            operation: "cache-lookup",
        });
    }
}
