/**
 * Utility function to get sites from database with their monitors and history.
 * This is extracted from UptimeMonitor to improve modularity and maintainability.
 */

import { SiteRepository, MonitorRepository, HistoryRepository } from "../../services/database";
import { Site } from "../../types";

/**
 * Configuration object for getSitesFromDatabase function.
 */
export interface GetSitesConfig {
    repositories: {
        site: SiteRepository;
        monitor: MonitorRepository;
        history: HistoryRepository;
    };
}

/**
 * Get sites from database with their monitors and history.
 *
 * @param config - Configuration object with repository instances
 * @returns Promise with array of Site objects
 */
export async function getSitesFromDatabase(config: GetSitesConfig): Promise<Site[]> {
    // Always fetch from DB for latest data (needed for frontend sync)
    const siteRows = await config.repositories.site.findAll();
    const sites: Site[] = [];

    for (const siteRow of siteRows) {
        // Fetch monitors for this site using repository
        const monitors = await config.repositories.monitor.findBySiteIdentifier(siteRow.identifier);

        // Load history for each monitor using repository
        for (const monitor of monitors) {
            if (monitor.id) {
                monitor.history = await config.repositories.history.findByMonitorId(monitor.id);
            }
        }

        sites.push({
            identifier: siteRow.identifier,
            monitors: monitors,
            name: siteRow.name,
        });
    }

    return sites;
}
