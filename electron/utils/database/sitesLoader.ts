/**
 * Database sites loading utility.
 * Handles loading sites from repositories and manages in-memory cache.
 */

import { EventEmitter } from "events";

import { HistoryRepository, MonitorRepository, SettingsRepository, SiteRepository } from "../../services/database";
import { Site } from "../../types";
import { monitorLogger as logger } from "../logger";

/**
 * Configuration for the sites loader
 */
interface SitesLoaderConfig {
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
 * Load sites from database repositories into memory.
 * Handles error reporting and database operations.
 *
 * @param config - Configuration object with repositories and callbacks
 * @returns Promise that resolves when sites are loaded
 */
export async function loadSitesFromDatabase(config: SitesLoaderConfig): Promise<void> {
    const { eventEmitter, repositories, setHistoryLimit, sites, startMonitoring } = config;

    try {
        const siteRows = await repositories.site.findAll();
        sites.clear();

        for (const siteRow of siteRows) {
            // Fetch monitors for this site using repository
            const monitors = await repositories.monitor.findBySiteIdentifier(siteRow.identifier);

            // Load history for each monitor using repository
            for (const monitor of monitors) {
                if (monitor.id) {
                    monitor.history = await repositories.history.findByMonitorId(monitor.id);
                }
            }

            const site: Site = {
                identifier: siteRow.identifier,
                monitors: monitors,
                name: siteRow.name,
            };
            sites.set(site.identifier, site);
        }

        // Load historyLimit from settings using repository
        const historyLimitStr = await repositories.settings.get("historyLimit");
        if (historyLimitStr) {
            setHistoryLimit(parseInt(historyLimitStr, 10));
        }

        // Resume monitoring for all monitors that were running before restart
        for (const site of sites.values()) {
            for (const monitor of site.monitors) {
                if (monitor.monitoring) {
                    await startMonitoring(site.identifier, String(monitor.id));
                }
            }
        }
    } catch (error) {
        logger.error("Failed to load sites from DB", error);
        eventEmitter.emit("db-error", { error, operation: "loadSites" });
        throw error; // Re-throw so that callers can handle the error
    }
}
