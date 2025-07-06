/**
 * Site repository utilities for database operations.
 * Consolidates site data access operations for better organization.
 */

import { EventEmitter } from "events";

import { SiteRepository, MonitorRepository, HistoryRepository, SettingsRepository } from "../../services/database";
import { Site } from "../../types";
import { monitorLogger as logger } from "../logger";

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
 * Configuration for the sites loader
 */
export interface SitesLoaderConfig {
    /** Repository instances */
    repositories: {
        site: SiteRepository;
        monitor: MonitorRepository;
        history: HistoryRepository;
        settings: SettingsRepository;
    };
    /** In-memory sites cache Map */
    sites: Map<string, Site>;
    /** Callback to set the history limit */
    setHistoryLimit: (limit: number) => void;
    /** Callback to start monitoring for a site */
    startMonitoring: (identifier: string, monitorId: string) => Promise<boolean>;
    /** Event emitter for error handling */
    eventEmitter: EventEmitter;
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

        const siteData: Site = {
            identifier: siteRow.identifier,
            monitors: monitors,
        };

        if (siteRow.name !== undefined) {
            siteData.name = siteRow.name;
        }

        sites.push(siteData);
    }

    return sites;
}

/**
 * Load monitors and their history for a specific site.
 */
async function loadSiteMonitors(
    siteIdentifier: string,
    repositories: SitesLoaderConfig["repositories"]
): Promise<Site["monitors"]> {
    const monitors = await repositories.monitor.findBySiteIdentifier(siteIdentifier);

    // Load history for each monitor
    for (const monitor of monitors) {
        if (monitor.id) {
            monitor.history = await repositories.history.findByMonitorId(monitor.id);
        }
    }

    return monitors;
}

/**
 * Load and apply history limit setting.
 */
async function loadHistoryLimitSetting(
    repositories: SitesLoaderConfig["repositories"],
    setHistoryLimit: (limit: number) => void
): Promise<void> {
    try {
        const historyLimitSetting = await repositories.settings.get("historyLimit");
        if (!historyLimitSetting) {
            return;
        }

        const limit = parseInt(historyLimitSetting, 10);
        if (!isNaN(limit) && limit > 0) {
            setHistoryLimit(limit);
            logger.info(`History limit loaded from settings: ${limit}`);
        }
    } catch (error) {
        logger.warn("Could not load history limit from settings:", error);
    }
}

/**
 * Start monitoring for all monitors in a site.
 */
async function startSiteMonitoring(
    site: Site,
    startMonitoring: (identifier: string, monitorId: string) => Promise<boolean>
): Promise<void> {
    logger.debug(`Auto-starting monitoring for site: ${site.identifier}`);
    for (const monitor of site.monitors) {
        if (monitor.id) {
            await startMonitoring(site.identifier, monitor.id);
        }
    }
}

/**
 * Start monitoring for individual monitors that have monitoring enabled.
 */
async function startIndividualMonitors(
    site: Site,
    startMonitoring: (identifier: string, monitorId: string) => Promise<boolean>
): Promise<void> {
    for (const monitor of site.monitors) {
        if (monitor.id && monitor.monitoring) {
            logger.debug(`Auto-starting monitoring for monitor: ${site.identifier}:${monitor.id}`);
            await startMonitoring(site.identifier, monitor.id);
        }
    }
}

/**
 * Start monitoring for sites based on their monitoring configuration.
 */
async function startMonitoringForSites(
    sites: Map<string, Site>,
    startMonitoring: (identifier: string, monitorId: string) => Promise<boolean>
): Promise<void> {
    for (const [, site] of Array.from(sites)) {
        if (site.monitoring) {
            // Site-level monitoring enabled
            await startSiteMonitoring(site, startMonitoring);
        } else {
            // Check individual monitor flags
            await startIndividualMonitors(site, startMonitoring);
        }
    }
}

/**
 * Load all sites from database and populate the sites cache.
 */
async function loadSitesData(repositories: SitesLoaderConfig["repositories"], sites: Map<string, Site>): Promise<void> {
    const siteRows = await repositories.site.findAll();
    sites.clear();

    for (const siteRow of siteRows) {
        const monitors = await loadSiteMonitors(siteRow.identifier, repositories);

        const site: Site = {
            identifier: siteRow.identifier,
            monitors: monitors,
        };

        if (siteRow.name !== undefined) {
            site.name = siteRow.name;
        }

        // Preserve monitoring property if it exists (may be set by application logic)
        if ("monitoring" in siteRow && siteRow.monitoring !== undefined) {
            site.monitoring = Boolean(siteRow.monitoring);
        }

        sites.set(site.identifier, site);
    }

    logger.info(`Loaded ${sites.size} sites from database`);
}

/**
 * Load sites from database repositories into memory.
 * Handles error reporting and database operations.
 *
 * @param config - Configuration object with repositories and callbacks
 * @returns Promise that resolves when sites are loaded
 */
export async function loadSitesFromDatabase(
    config: SitesLoaderConfig
): Promise<{ success: boolean; sitesLoaded: number; message: string }> {
    const { eventEmitter, repositories, setHistoryLimit, sites, startMonitoring } = config;

    try {
        // Load all sites and their data
        await loadSitesData(repositories, sites);

        // Load and apply settings
        await loadHistoryLimitSetting(repositories, setHistoryLimit);

        // Start monitoring for configured sites
        await startMonitoringForSites(sites, startMonitoring);

        const sitesLoaded = sites.size;
        return {
            message: `Successfully loaded ${sitesLoaded} sites and started monitoring`,
            sitesLoaded,
            success: true,
        };
    } catch (error) {
        const errorMessage = `Failed to load sites from database: ${error instanceof Error ? error.message : String(error)}`;
        logger.error(errorMessage, error);
        eventEmitter.emit("error", new Error(errorMessage));
        return {
            message: errorMessage,
            sitesLoaded: 0,
            success: false,
        };
    }
}
