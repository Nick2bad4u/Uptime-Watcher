/**
 * Site service for coordinating site-related operations across multiple repositories.
 * Handles complex site loading with related entities (monitors and history).
 */

import { withErrorHandling } from "../../../shared/utils/errorHandling";
import { Site } from "../../types";
import { logger } from "../../utils/logger";
import { DatabaseService } from "../database/DatabaseService";
import { HistoryRepository } from "../database/HistoryRepository";
import { MonitorRepository } from "../database/MonitorRepository";
import { SiteRepository } from "../database/SiteRepository";

/**
 * Dependencies for SiteService.
 */
export interface SiteServiceDependencies {
    databaseService: DatabaseService;
    historyRepository: HistoryRepository;
    monitorRepository: MonitorRepository;
    siteRepository: SiteRepository;
}

/**
 * Service for coordinating site operations across multiple repositories.
 * Handles complex operations that require coordination between site, monitor, and history data.
 */
export class SiteService {
    /**
     * Default name for sites when no name is provided.
     */
    private static readonly DEFAULT_SITE_NAME = "Unnamed Site";

    private readonly databaseService: DatabaseService;
    private readonly historyRepository: HistoryRepository;
    private readonly monitorRepository: MonitorRepository;
    private readonly siteRepository: SiteRepository;

    constructor(dependencies: SiteServiceDependencies) {
        this.databaseService = dependencies.databaseService;
        this.historyRepository = dependencies.historyRepository;
        this.monitorRepository = dependencies.monitorRepository;
        this.siteRepository = dependencies.siteRepository;
    }

    /**
     * Delete a site and all its related data (monitors and history).
     * Uses transaction to ensure atomicity.
     *
     * @param identifier - Site identifier to delete
     * @returns Promise resolving to true if all deletions succeeded
     *
     * @throws Error When any deletion operation fails
     */
    public async deleteSiteWithRelatedData(identifier: string): Promise<boolean> {
        return withErrorHandling(
            async () => {
                // Validate input
                if (!identifier || typeof identifier !== "string") {
                    throw new Error(`Invalid site identifier: ${identifier}`);
                }

                return this.databaseService.executeTransaction(async () => {
                    logger.debug(`[SiteService] Starting deletion of site ${identifier} with related data`);

                    // First get monitors to delete their history
                    const monitors = await this.monitorRepository.findBySiteIdentifier(identifier);
                    logger.debug(`[SiteService] Found ${monitors.length} monitors to delete for site ${identifier}`);

                    // Delete history for each monitor
                    for (const monitor of monitors) {
                        try {
                            await this.historyRepository.deleteByMonitorId(monitor.id);
                        } catch (error) {
                            throw new Error(
                                `Failed to delete history for monitor ${monitor.id} in site ${identifier}: ${error}`
                            );
                        }
                    }
                    logger.debug(`[SiteService] Deleted history for ${monitors.length} monitors`);

                    // Delete monitors for the site
                    try {
                        await this.monitorRepository.deleteBySiteIdentifier(identifier);
                    } catch (error) {
                        throw new Error(`Failed to delete monitors for site ${identifier}: ${error}`);
                    }
                    logger.debug(`[SiteService] Deleted monitors for site ${identifier}`);

                    // Finally delete the site itself
                    const siteDeleted = await this.siteRepository.delete(identifier);
                    if (!siteDeleted) {
                        throw new Error(`Failed to delete site ${identifier}`);
                    }

                    logger.info(`[SiteService] Successfully deleted site ${identifier} with all related data`);
                    return true;
                });
            },
            {
                logger,
                operationName: `Delete site with related data: ${identifier}`,
            }
        );
    }

    /**
     * Find a site by identifier with all related monitors and history data.
     * This replaces the complex logic that was previously in SiteRepository.
     *
     * @param identifier - Site identifier to find
     * @returns Promise resolving to site with details or undefined if not found
     */
    public async findByIdentifierWithDetails(identifier: string): Promise<Site | undefined> {
        return withErrorHandling(
            async () => {
                // Validate input
                if (!identifier || typeof identifier !== "string") {
                    throw new Error(`Invalid site identifier: ${identifier}`);
                }

                // First get the site data
                const siteRow = await this.siteRepository.findByIdentifier(identifier);
                if (!siteRow) {
                    logger.debug(`[SiteService] Site not found: ${identifier}`);
                    return;
                }

                // Then get monitors for this site
                const monitors = await this.monitorRepository.findBySiteIdentifier(identifier);

                // Fetch monitor history in parallel for better performance
                if (monitors.length > 0) {
                    const historyPromises = monitors.map(async (monitor) => {
                        monitor.history = await this.historyRepository.findByMonitorId(monitor.id);
                        return monitor;
                    });
                    await Promise.all(historyPromises);
                }

                // Combine into complete site object
                const site = {
                    identifier: siteRow.identifier,
                    monitoring: siteRow.monitoring ?? false,
                    monitors,
                    name: this.getDisplayName(siteRow.name),
                };

                logger.debug(`[SiteService] Found site ${identifier} with ${monitors.length} monitors`);
                return site;
            },
            {
                logger,
                operationName: `Find site by identifier: ${identifier}`,
            }
        );
    }

    /**
     * Get all sites with their related monitors and history data.
     * This replaces the complex logic that was previously in SiteRepository.
     *
     * @returns Promise resolving to array of sites with complete data
     *
     * @remarks
     * Optimized to fetch monitor history in parallel for better performance.
     */
    public async getAllWithDetails(): Promise<Site[]> {
        return withErrorHandling(
            async () => {
                // Get all site rows
                const siteRows = await this.siteRepository.findAll();
                logger.debug(`[SiteService] Loading details for ${siteRows.length} sites`);

                // Process sites in parallel for better performance
                const sites = await Promise.all(
                    siteRows.map(async (siteRow) => {
                        const monitors = await this.monitorRepository.findBySiteIdentifier(siteRow.identifier);

                        // Fetch monitor history in parallel
                        if (monitors.length > 0) {
                            const historyPromises = monitors.map(async (monitor) => {
                                monitor.history = await this.historyRepository.findByMonitorId(monitor.id);
                                return monitor;
                            });
                            await Promise.all(historyPromises);
                        }

                        return {
                            identifier: siteRow.identifier,
                            monitoring: siteRow.monitoring ?? false,
                            monitors,
                            name: this.getDisplayName(siteRow.name),
                        };
                    })
                );

                logger.info(`[SiteService] Loaded ${sites.length} sites with complete details`);
                return sites;
            },
            {
                logger,
                operationName: "Get all sites with details",
            }
        );
    }

    /**
     * Get the display name for a site, using default if none provided.
     *
     * @param siteName - The site name from database
     * @returns Display name with fallback to default
     */
    private getDisplayName(siteName: null | string | undefined): string {
        return siteName ?? SiteService.DEFAULT_SITE_NAME;
    }
}
