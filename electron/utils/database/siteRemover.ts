import type { MonitorRepository, SiteRepository } from "../../services/database";
import type { Site } from "../../types";

type Logger = {
    debug: (message: string, ...args: unknown[]) => void;
    error: (message: string, error?: unknown, ...args: unknown[]) => void;
    info: (message: string, ...args: unknown[]) => void;
    warn: (message: string, ...args: unknown[]) => void;
};

/**
 * Parameters for removing a site from the database.
 */
interface RemoveSiteParams {
    /**
     * Site identifier to remove
     */
    identifier: string;

    /**
     * Repository instances
     */
    repositories: {
        site: SiteRepository;
        monitor: MonitorRepository;
    };

    /**
     * Map of sites in memory for cache management
     */
    sites: Map<string, Site>;

    /**
     * Logger instance
     */
    logger: Logger;
}

/**
 * Removes a site and all its monitors from the database.
 * Also removes the site from the in-memory cache.
 *
 * @param params - Parameters for removing a site
 * @returns True if the site was found and removed, false otherwise
 */
export async function removeSiteFromDatabase(params: RemoveSiteParams): Promise<boolean> {
    const { identifier, logger, repositories, sites } = params;

    logger.info(`Removing site: ${identifier}`);
    const removed = sites.delete(identifier);

    // Remove all monitors and their history for this site using repositories
    await repositories.monitor.deleteBySiteIdentifier(identifier);

    // Remove the site using repository
    await repositories.site.delete(identifier);

    if (removed) {
        logger.info(`Site removed successfully: ${identifier}`);
    } else {
        logger.warn(`Site not found for removal: ${identifier}`);
    }

    return removed;
}
