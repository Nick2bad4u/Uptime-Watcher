/**
 * Utility function for adding a new site to the database.
 * This is extracted from UptimeMonitor to improve modularity and maintainability.
 */

import { SiteRepository, MonitorRepository } from "../../services/database";
import { Site } from "../../types";
import { monitorLogger as logger } from "../logger";

/**
 * Configuration object for addSiteToDatabase function.
 */
export interface AddSiteConfig {
    repositories: {
        monitor: MonitorRepository;
        site: SiteRepository;
    };
    siteData: Site;
}

/**
 * Add a new site to the database with its monitors.
 * This is a pure technical operation - validation should be done by the caller.
 *
 * @param config - Configuration object with repository instances and site data
 * @returns Promise with the site including monitors with IDs assigned
 */
export async function addSiteToDatabase(config: AddSiteConfig): Promise<Site> {
    const { repositories, siteData } = config;

    logger.info(`Adding new site to database: ${siteData.identifier}`);

    const site: Site = {
        ...siteData,
    };

    // Persist site to DB using repository
    await repositories.site.upsert(site);

    // Remove all existing monitors for this site, then insert new ones using repository
    await repositories.monitor.deleteBySiteIdentifier(site.identifier);

    for (const monitor of site.monitors) {
        // Create monitor using repository and get the new ID
        const newId = await repositories.monitor.create(site.identifier, monitor);
        monitor.id = newId;
    }

    logger.info(`Site persisted successfully to database: ${site.identifier} (${site.name ?? "unnamed"})`);
    return site;
}
