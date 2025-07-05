/**
 * Factory functions to create services with proper dependency injection.
 */

import { EventEmitter } from "events";

import { SiteRepository, MonitorRepository, HistoryRepository, SettingsRepository } from "../../services/database";
import { monitorLogger } from "../logger";
import { SiteCache } from "./interfaces";
import {
    SiteRepositoryAdapter,
    MonitorRepositoryAdapter,
    HistoryRepositoryAdapter,
    SettingsRepositoryAdapter,
    LoggerAdapter,
} from "./repositoryAdapters";
import { SiteRepositoryService, SiteLoadingOrchestrator } from "./SiteRepositoryService";
import { SiteWriterService, SiteWritingOrchestrator } from "./SiteWriterService";

/**
 * Factory function to create a properly configured SiteRepositoryService.
 */
export function createSiteRepositoryService(eventEmitter: EventEmitter): SiteRepositoryService {
    const siteRepository = new SiteRepositoryAdapter(new SiteRepository());
    const monitorRepository = new MonitorRepositoryAdapter(new MonitorRepository());
    const historyRepository = new HistoryRepositoryAdapter(new HistoryRepository());
    const settingsRepository = new SettingsRepositoryAdapter(new SettingsRepository());
    const logger = new LoggerAdapter(monitorLogger);

    return new SiteRepositoryService({
        eventEmitter,
        logger,
        repositories: {
            history: historyRepository,
            monitor: monitorRepository,
            settings: settingsRepository,
            site: siteRepository,
        },
    });
}

/**
 * Factory function to create a properly configured SiteWriterService.
 */
export function createSiteWriterService(): SiteWriterService {
    const siteRepository = new SiteRepositoryAdapter(new SiteRepository());
    const monitorRepository = new MonitorRepositoryAdapter(new MonitorRepository());
    const logger = new LoggerAdapter(monitorLogger);

    return new SiteWriterService({
        logger,
        repositories: {
            monitor: monitorRepository,
            site: siteRepository,
        },
    });
}

/**
 * Factory function to create a properly configured SiteLoadingOrchestrator.
 */
export function createSiteLoadingOrchestrator(eventEmitter: EventEmitter): SiteLoadingOrchestrator {
    const siteRepositoryService = createSiteRepositoryService(eventEmitter);
    return new SiteLoadingOrchestrator(siteRepositoryService);
}

/**
 * Factory function to create a properly configured SiteWritingOrchestrator.
 */
export function createSiteWritingOrchestrator(): SiteWritingOrchestrator {
    const siteWriterService = createSiteWriterService();
    return new SiteWritingOrchestrator(siteWriterService);
}

/**
 * Factory function to create a site cache.
 */
export function createSiteCache(): SiteCache {
    return new SiteCache();
}

/**
 * Legacy compatibility functions that match the original function signatures.
 * These functions provide backwards compatibility during the transition period.
 */

/**
 * Legacy wrapper for getSitesFromDatabase.
 */
export async function getSitesFromDatabase(_config: {
    repositories: {
        site: SiteRepository;
        monitor: MonitorRepository;
        history: HistoryRepository;
    };
}): Promise<import("../../types").Site[]> {
    const eventEmitter = new EventEmitter();
    const siteRepositoryService = createSiteRepositoryService(eventEmitter);
    return siteRepositoryService.getSitesFromDatabase();
}

/**
 * Legacy wrapper for loadSitesFromDatabase.
 */
export async function loadSitesFromDatabase(config: {
    repositories: {
        site: SiteRepository;
        monitor: MonitorRepository;
        history: HistoryRepository;
        settings: SettingsRepository;
    };
    sites: Map<string, import("../../types").Site>;
    setHistoryLimit: (limit: number) => void;
    startMonitoring: (identifier: string, monitorId: string) => Promise<boolean>;
    eventEmitter: EventEmitter;
}): Promise<{ success: boolean; sitesLoaded: number; message: string }> {
    const siteLoadingOrchestrator = createSiteLoadingOrchestrator(config.eventEmitter);
    const siteCache = new SiteCache();

    try {
        // Load sites into our cache
        await siteLoadingOrchestrator.loadSitesFromDatabase(siteCache, {
            setHistoryLimit: config.setHistoryLimit,
            startMonitoring: config.startMonitoring,
            stopMonitoring: async () => true, // Not used in loading
        });

        // Transfer from our cache to the provided map
        config.sites.clear();
        for (const [key, site] of Array.from(siteCache.entries())) {
            config.sites.set(key, site);
        }

        const sitesLoaded = siteCache.size();
        return {
            message: `Successfully loaded ${sitesLoaded} sites`,
            sitesLoaded,
            success: true,
        };
    } catch (error) {
        return {
            message: `Failed to load sites: ${error instanceof Error ? error.message : "Unknown error"}`,
            sitesLoaded: 0,
            success: false,
        };
    }
}
