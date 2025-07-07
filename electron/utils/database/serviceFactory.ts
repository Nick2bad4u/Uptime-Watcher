/**
 * Factory functions to create services with proper dependency injection.
 */

import { EventEmitter } from "events";

import {
    SiteRepository,
    MonitorRepository,
    HistoryRepository,
    SettingsRepository,
    DatabaseService,
} from "../../services/database";
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
    const databaseService = DatabaseService.getInstance();

    return new SiteWriterService({
        databaseService,
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

// Legacy exports for backward compatibility with existing tests
export { getSitesFromDatabase, loadSitesFromDatabase } from "./siteRepository";
