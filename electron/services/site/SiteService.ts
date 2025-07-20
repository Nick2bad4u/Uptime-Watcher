/**
 * Site service for coordinating site-related operations across multiple repositories.
 * Handles complex site loading with related entities (monitors and history).
 */

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
     */
    public async deleteSiteWithRelatedData(identifier: string): Promise<boolean> {
        return this.databaseService.executeTransaction(async () => {
            // First get monitors to delete their history
            const monitors = await this.monitorRepository.findBySiteIdentifier(identifier);

            // Delete history for each monitor
            for (const monitor of monitors) {
                await this.historyRepository.deleteByMonitorId(monitor.id);
            }

            // Delete monitors for the site
            await this.monitorRepository.deleteBySiteIdentifier(identifier);

            // Finally delete the site itself
            const deleted = await this.siteRepository.delete(identifier);

            logger.debug(`[SiteService] Deleted site ${identifier} with all related data`);
            return deleted;
        });
    }

    /**
     * Find a site by identifier with all related monitors and history data.
     * This replaces the complex logic that was previously in SiteRepository.
     */
    public async findByIdentifierWithDetails(identifier: string): Promise<Site | undefined> {
        // First get the site data
        const siteRow = await this.siteRepository.findByIdentifier(identifier);
        if (!siteRow) {
            return undefined;
        }

        // Then get monitors for this site
        const monitors = await this.monitorRepository.findBySiteIdentifier(identifier);

        // For each monitor, get its history
        for (const monitor of monitors) {
            monitor.history = await this.historyRepository.findByMonitorId(monitor.id);
        }

        // Combine into complete site object
        return {
            identifier: siteRow.identifier,
            monitoring: siteRow.monitoring ?? false,
            monitors,
            name: siteRow.name ?? "Unnamed Site",
        };
    }

    /**
     * Get all sites with their related monitors and history data.
     * This replaces the complex logic that was previously in SiteRepository.
     */
    public async getAllWithDetails(): Promise<Site[]> {
        // Get all site rows
        const siteRows = await this.siteRepository.findAll();
        const sites: Site[] = [];

        // For each site, get its complete data
        for (const siteRow of siteRows) {
            const monitors = await this.monitorRepository.findBySiteIdentifier(siteRow.identifier);

            // For each monitor, get its history
            for (const monitor of monitors) {
                monitor.history = await this.historyRepository.findByMonitorId(monitor.id);
            }

            sites.push({
                identifier: siteRow.identifier,
                monitoring: siteRow.monitoring ?? false,
                monitors,
                name: siteRow.name ?? "Unnamed Site",
            });
        }

        logger.debug(`[SiteService] Loaded ${sites.length} sites with complete details`);
        return sites;
    }
}
