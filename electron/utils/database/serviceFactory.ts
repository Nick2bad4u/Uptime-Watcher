/**
 * Factory functions to create services with proper dependency injection.
 */

import { UptimeEvents } from "../../events/eventTypes";
import { TypedEventBus } from "../../events/TypedEventBus";
import { DatabaseService } from "../../services/database/DatabaseService";
import { HistoryRepository } from "../../services/database/HistoryRepository";
import { MonitorRepository } from "../../services/database/MonitorRepository";
import { SettingsRepository } from "../../services/database/SettingsRepository";
import { SiteRepository } from "../../services/database/SiteRepository";
import { Site } from "../../types";
import { StandardizedCache } from "../cache/StandardizedCache";
import { monitorLogger } from "../logger";
import { DataBackupService } from "./DataBackupService";
import { DataImportExportService } from "./DataImportExportService";
import { SiteLoadingOrchestrator, SiteRepositoryService } from "./SiteRepositoryService";
import { SiteWriterService } from "./SiteWriterService";

/**
 * Adapter for the logger to implement Logger interface.
 */
class LoggerAdapter {
    private readonly logger: typeof monitorLogger;

    constructor(logger: typeof monitorLogger) {
        this.logger = logger;
    }

    debug(message: string, ...args: unknown[]): void {
        this.logger.debug(message, ...args);
    }

    error(message: string, error?: unknown, ...args: unknown[]): void {
        this.logger.error(message, error, ...args);
    }

    info(message: string, ...args: unknown[]): void {
        this.logger.info(message, ...args);
    }

    warn(message: string, ...args: unknown[]): void {
        this.logger.warn(message, ...args);
    }
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
 * Factory function to create a properly configured DataImportExportService.
 *
 * @param eventEmitter - Event bus for emitting import/export events
 * @returns Configured DataImportExportService instance
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
 * Factory function to create a standardized site cache.
 *
 * @returns New StandardizedCache instance configured for temporary use
 */
export function createSiteCache(): StandardizedCache<Site> {
    return new StandardizedCache<Site>({
        defaultTTL: 300_000, // 5 minutes for temporary operations
        enableStats: false, // No need for stats in temporary caches
        maxSize: 1000,
        name: "temporary-sites",
    });
}

/**
 * Factory function to create a properly configured SiteLoadingOrchestrator.
 *
 * @param eventEmitter - Event bus for emitting database events
 * @returns Configured SiteLoadingOrchestrator instance
 */
export function createSiteLoadingOrchestrator(eventEmitter: TypedEventBus<UptimeEvents>): SiteLoadingOrchestrator {
    const siteRepositoryService = createSiteRepositoryService(eventEmitter);
    return new SiteLoadingOrchestrator(siteRepositoryService);
}

/**
 * Factory function to create a properly configured SiteRepositoryService.
 *
 * @param eventEmitter - Event bus for emitting database events
 * @returns Configured SiteRepositoryService instance
 */
export function createSiteRepositoryService(eventEmitter: TypedEventBus<UptimeEvents>): SiteRepositoryService {
    const siteRepository = new SiteRepository();
    const monitorRepository = new MonitorRepository();
    const historyRepository = new HistoryRepository();
    const settingsRepository = new SettingsRepository();
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
 *
 * @returns Configured SiteWriterService instance
 */
export function createSiteWriterService(): SiteWriterService {
    const siteRepository = new SiteRepository();
    const monitorRepository = new MonitorRepository();
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
