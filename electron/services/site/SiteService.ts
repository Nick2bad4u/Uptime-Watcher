/**
 * Site service delegating operations to {@link SiteManager} to ensure a single
 * orchestration entry point for site management.
 */

import type { Site } from "@shared/types";
import { withErrorHandling } from "@shared/utils/errorHandling";

import type { SiteManager } from "../../managers/SiteManager";
import { logger } from "../../utils/logger";

/**
 * Dependencies required by {@link SiteService}.
 *
 * @public
 */
export interface SiteServiceDependencies {
    /** Site manager coordinating site mutations and cache state. */
    siteManager: SiteManager;
}

/**
 * Facade for site operations routed through {@link SiteManager}.
 *
 * @remarks
 * Maintains the historical SiteService API surface for internal consumers while
 * guaranteeing that all work is executed via the consolidated
 * SiteManager/SiteWriterService pipeline.
 *
 * @public
 */
export class SiteService {
    private readonly siteManager: SiteManager;

    public constructor(dependencies: SiteServiceDependencies) {
        this.siteManager = dependencies.siteManager;
    }

    /**
     * Deletes a site and all related data using {@link SiteManager.removeSite}.
     *
     * @param identifier - Unique identifier of the site to delete.
     *
     * @returns Resolves to `true` when the site existed and was removed.
     */
    public async deleteSiteWithRelatedData(
        identifier: string
    ): Promise<boolean> {
        return withErrorHandling(
            async () => {
                if (!identifier || typeof identifier !== "string") {
                    throw new Error(`Invalid site identifier: ${identifier}`);
                }

                const siteSnapshot =
                    await this.siteManager.getSiteWithDetails(identifier);
                const monitorCount = siteSnapshot?.monitors.length ?? 0;

                const deleted = await this.siteManager.removeSite(identifier);

                if (deleted) {
                    logger.info(
                        `[SiteService] Successfully deleted site ${identifier} with all related data`
                    );
                    logger.debug(
                        `[SiteService] Deletion summary for site ${identifier}: ${monitorCount} monitors removed`
                    );
                } else {
                    logger.warn(
                        `[SiteService] Site ${identifier} not found during deletion`
                    );
                }

                return deleted;
            },
            {
                logger,
                operationName: `Delete site with related data: ${identifier}`,
            }
        );
    }

    /**
     * Retrieves a single site via {@link SiteManager.getSiteWithDetails}.
     *
     * @param identifier - Unique identifier of the site to load.
     *
     * @returns Promise resolving to the site or `undefined` when not found.
     */
    public async findByIdentifierWithDetails(
        identifier: string
    ): Promise<Site | undefined> {
        return withErrorHandling(
            async () => {
                if (!identifier || typeof identifier !== "string") {
                    throw new Error(`Invalid site identifier: ${identifier}`);
                }

                const site =
                    await this.siteManager.getSiteWithDetails(identifier);

                if (!site) {
                    logger.debug(`[SiteService] Site not found: ${identifier}`);
                    return undefined;
                }

                logger.debug(
                    `[SiteService] Found site ${identifier} with ${site.monitors.length} monitors`
                );
                return site;
            },
            {
                logger,
                operationName: `Find site by identifier: ${identifier}`,
            }
        );
    }

    /**
     * Retrieves all sites with full details via {@link SiteManager.getSites}.
     *
     * @returns Promise resolving to the full site collection.
     */
    public async getAllWithDetails(): Promise<Site[]> {
        return withErrorHandling(
            async () => {
                logger.debug(
                    "[SiteService] Loading details for all sites via SiteManager"
                );
                const sites = await this.siteManager.getSites();
                logger.info(
                    `[SiteService] Loaded ${sites.length} sites with complete details`
                );
                return sites;
            },
            {
                logger,
                operationName: "Get all sites with details",
            }
        );
    }
}
