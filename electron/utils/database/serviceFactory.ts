/**
 * Factory functions to create services with proper dependency injection.
 */

import { UptimeEvents, TypedEventBus } from "../../events";
import {
    SiteRepository,
    MonitorRepository,
    HistoryRepository,
    SettingsRepository,
    DatabaseService,
} from "../../services/database";
import { monitorLogger } from "../logger";
import { DataBackupService, DataBackupOrchestrator } from "./DataBackupService";
import { DataImportExportService, DataImportExportOrchestrator } from "./DataImportExportService";
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
export function createSiteRepositoryService(eventEmitter: TypedEventBus<UptimeEvents>): SiteRepositoryService {
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
export function createSiteLoadingOrchestrator(eventEmitter: TypedEventBus<UptimeEvents>): SiteLoadingOrchestrator {
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
 * Factory function to create a properly configured DataImportExportService.
 */
export function createDataImportExportService(eventEmitter: TypedEventBus<UptimeEvents>): DataImportExportService {
    const siteRepository = new SiteRepository();
    const monitorRepository = new MonitorRepository();
    const historyRepository = new HistoryRepository();
    const settingsRepository = new SettingsRepository();
    const logger = new LoggerAdapter(monitorLogger);
    const databaseService = DatabaseService.getInstance();

    return new DataImportExportService({
        databaseService,
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
 * Factory function to create a properly configured DataBackupService.
 */
export function createDataBackupService(eventEmitter: TypedEventBus<UptimeEvents>): DataBackupService {
    const logger = new LoggerAdapter(monitorLogger);
    const databaseService = DatabaseService.getInstance();

    return new DataBackupService({
        databaseService,
        eventEmitter,
        logger,
    });
}

/**
 * Factory function to create a properly configured DataImportExportOrchestrator.
 */
export function createDataImportExportOrchestrator(
    eventEmitter: TypedEventBus<UptimeEvents>
): DataImportExportOrchestrator {
    const dataImportExportService = createDataImportExportService(eventEmitter);
    return new DataImportExportOrchestrator(dataImportExportService);
}

/**
 * Factory function to create a properly configured DataBackupOrchestrator.
 */
export function createDataBackupOrchestrator(eventEmitter: TypedEventBus<UptimeEvents>): DataBackupOrchestrator {
    const dataBackupService = createDataBackupService(eventEmitter);
    return new DataBackupOrchestrator(dataBackupService);
}
