import { EventEmitter } from "events";

import { HistoryRepository } from "../../services/database/HistoryRepository";
import { MonitorRepository } from "../../services/database/MonitorRepository";
import { SettingsRepository } from "../../services/database/SettingsRepository";
import { SiteRepository } from "../../services/database/SiteRepository";
import { Site, StatusHistory } from "../../types";
import { monitorLogger as logger } from "../logger";

/**
 * Type for imported site data structure.
 */
export type ImportSite = {
    identifier: string;
    name?: string;
    monitors?: Site["monitors"];
};

/**
 * Dependencies required for data import/export operations.
 */
export interface DataImportExportDependencies {
    eventEmitter: EventEmitter;
    repositories: {
        history: HistoryRepository;
        monitor: MonitorRepository;
        settings: SettingsRepository;
        site: SiteRepository;
    };
}

/**
 * Callbacks for operations that need to be handled by the main class.
 */
export interface DataImportExportCallbacks {
    loadSites: () => Promise<void>;
    getSitesFromCache: () => Site[];
}

/**
 * Export all application data as JSON string.
 */
export async function exportData(deps: DataImportExportDependencies): Promise<string> {
    try {
        // Export all sites and settings using repositories
        const sites = await deps.repositories.site.exportAll();
        const settings = await deps.repositories.settings.getAll();

        const exportObj = {
            settings,
            sites: sites.map((site) => ({
                identifier: site.identifier,
                monitors: [] as Site["monitors"],
                name: site.name,
            })),
        };

        // Export monitors and history for each site
        for (const site of exportObj.sites) {
            const monitors = await deps.repositories.monitor.findBySiteIdentifier(site.identifier);
            for (const monitor of monitors) {
                if (monitor.id) {
                    monitor.history = await deps.repositories.history.findByMonitorId(monitor.id);
                }
            }
            site.monitors = monitors;
        }

        return JSON.stringify(exportObj, undefined, 2);
    } catch (error) {
        logger.error("Failed to export data", error);
        deps.eventEmitter.emit("db-error", { error, operation: "exportData" });
        throw error;
    }
}

/**
 * Import data from JSON string.
 */
export async function importData(
    deps: DataImportExportDependencies,
    callbacks: DataImportExportCallbacks,
    data: string
): Promise<boolean> {
    logger.info("Importing data");
    try {
        const parsedData = validateImportData(data);
        await clearExistingData(deps);
        await importSitesAndSettings(deps, parsedData);

        if (parsedData.sites) {
            await importMonitorsWithHistory(deps, parsedData.sites);
        }

        await callbacks.loadSites();

        logger.info("Data imported successfully");
        return true;
    } catch (error) {
        logger.error("Failed to import data", error);
        deps.eventEmitter.emit("db-error", { error, operation: "importData" });
        return false;
    }
}

/**
 * Validate and parse import data.
 */
export function validateImportData(data: string): { sites?: ImportSite[]; settings?: Record<string, string> } {
    if (!data || typeof data !== "string") {
        throw new Error("Invalid import data: must be a non-empty string");
    }

    const parsedData = JSON.parse(data);
    if (!parsedData || typeof parsedData !== "object") {
        throw new Error("Invalid import data: must be a valid JSON object");
    }

    return parsedData;
}

/**
 * Clear all existing data from repositories.
 */
export async function clearExistingData(deps: DataImportExportDependencies): Promise<void> {
    await deps.repositories.site.deleteAll();
    await deps.repositories.settings.deleteAll();
    await deps.repositories.monitor.deleteAll();
    await deps.repositories.history.deleteAll();
}

/**
 * Import sites and settings data.
 */
export async function importSitesAndSettings(
    deps: DataImportExportDependencies,
    parsedData: {
        sites?: ImportSite[];
        settings?: Record<string, string>;
    }
): Promise<void> {
    if (Array.isArray(parsedData.sites)) {
        const sitesToInsert = parsedData.sites.map((site: { identifier: string; name?: string }) => {
            const siteData: { identifier: string; name?: string | undefined } = {
                identifier: site.identifier,
            };
            if (site.name !== undefined) {
                siteData.name = site.name;
            }
            return siteData;
        });
        await deps.repositories.site.bulkInsert(sitesToInsert);
    }

    if (parsedData.settings && typeof parsedData.settings === "object") {
        await deps.repositories.settings.bulkInsert(parsedData.settings);
    }
}

/**
 * Import monitors and their associated history.
 */
export async function importMonitorsWithHistory(
    deps: DataImportExportDependencies,
    sites: ImportSite[]
): Promise<void> {
    for (const site of sites) {
        if (Array.isArray(site.monitors)) {
            const createdMonitors = await deps.repositories.monitor.bulkCreate(site.identifier, site.monitors);
            await importHistoryForMonitors(deps, createdMonitors, site.monitors);
        }
    }
}

/**
 * Import history for created monitors by matching with original monitors.
 */
export async function importHistoryForMonitors(
    deps: DataImportExportDependencies,
    createdMonitors: Site["monitors"],
    originalMonitors: Site["monitors"]
): Promise<void> {
    for (const createdMonitor of createdMonitors) {
        const originalMonitor = findMatchingOriginalMonitor(createdMonitor, originalMonitors);

        if (shouldImportHistory(createdMonitor, originalMonitor)) {
            const historyToImport = (originalMonitor?.history ?? []).map((historyEntry) => {
                const entry: StatusHistory & { details?: string } = {
                    responseTime: historyEntry.responseTime,
                    status: historyEntry.status,
                    timestamp: historyEntry.timestamp,
                };
                if (historyEntry.details !== undefined) {
                    entry.details = historyEntry.details;
                }
                return entry;
            });
            await deps.repositories.history.bulkInsert(createdMonitor.id, historyToImport);
        }
    }
}

/**
 * Find the original monitor that matches the created monitor.
 */
export function findMatchingOriginalMonitor(
    createdMonitor: Site["monitors"][0],
    originalMonitors: Site["monitors"]
): Site["monitors"][0] | undefined {
    return originalMonitors.find(
        (original: Site["monitors"][0]) => original.url === createdMonitor.url && original.type === createdMonitor.type
    );
}

/**
 * Check if history should be imported for a monitor.
 */
export function shouldImportHistory(
    createdMonitor: Site["monitors"][0],
    originalMonitor?: Site["monitors"][0]
): boolean {
    return !!(createdMonitor && originalMonitor && createdMonitor.id);
}
