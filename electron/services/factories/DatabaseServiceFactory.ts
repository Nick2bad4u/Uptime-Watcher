/**
 * Service factory for database-related services following the Factory pattern.
 * Provides centralized creation and configuration of database services.
 *
 * @remarks
 * This factory implements the Factory pattern to resolve the Dependency Inversion
 * Principle violations in DatabaseManager. All service creation is centralized
 * here with proper abstraction interfaces.
 */

import { UptimeEvents } from "../../events/eventTypes";
import { TypedEventBus } from "../../events/TypedEventBus";
import { Site } from "../../types";
import { DataBackupService } from "../../utils/database/DataBackupService";
import { DataImportExportService } from "../../utils/database/DataImportExportService";
import { LoggerAdapter } from "../../utils/database/serviceFactory";
import { SiteRepositoryService } from "../../utils/database/SiteRepositoryService";
import { monitorLogger } from "../../utils/logger";
import { DatabaseService } from "../database/DatabaseService";
import { HistoryRepository } from "../database/HistoryRepository";
import { MonitorRepository } from "../database/MonitorRepository";
import { SettingsRepository } from "../database/SettingsRepository";
import { SiteRepository } from "../database/SiteRepository";

/**
 * Dependencies required by the database service factory.
 */
export interface DatabaseServiceFactoryDependencies {
    databaseService: DatabaseService;
    eventEmitter: TypedEventBus<UptimeEvents>;
    repositories: {
        history: HistoryRepository;
        monitor: MonitorRepository;
        settings: SettingsRepository;
        site: SiteRepository;
    };
}

/**
 * Abstract interface for backup service operations.
 */
export interface IDataBackupService {
    downloadDatabaseBackup(): Promise<{ buffer: Buffer; fileName: string }>;
}

/**
 * Abstract interface for import/export service operations.
 */
export interface IDataImportExportService {
    exportAllData(): Promise<string>;
    importDataFromJson(data: string): Promise<{ settings: Record<string, string>; sites: unknown[] }>;
    persistImportedData(sites: unknown[], settings: Record<string, string>): Promise<void>;
}

/**
 * Abstract interface for site repository service operations.
 */
export interface ISiteRepositoryService {
    getSitesFromDatabase(): Promise<Site[]>;
}

/**
 * Factory for creating database-related services with proper dependency injection.
 *
 * @remarks
 * Centralizes service creation to resolve Dependency Inversion Principle violations.
 * All services are created with proper abstractions and dependency injection.
 */
export class DatabaseServiceFactory {
    private readonly dependencies: DatabaseServiceFactoryDependencies;
    private readonly loggerAdapter: LoggerAdapter;

    /**
     * Creates a new DatabaseServiceFactory instance.
     *
     * @param dependencies - Required dependencies for service creation
     */
    constructor(dependencies: DatabaseServiceFactoryDependencies) {
        this.dependencies = dependencies;
        this.loggerAdapter = new LoggerAdapter(monitorLogger);
    }

    /**
     * Creates a data backup service instance.
     *
     * @returns Data backup service implementation
     */
    public createBackupService(): IDataBackupService {
        return new DataBackupService({
            eventEmitter: this.dependencies.eventEmitter,
            logger: this.loggerAdapter,
        });
    }

    /**
     * Creates a data import/export service instance.
     *
     * @returns Data import/export service implementation
     */
    public createImportExportService(): IDataImportExportService {
        return new DataImportExportService({
            databaseService: this.dependencies.databaseService,
            eventEmitter: this.dependencies.eventEmitter,
            logger: this.loggerAdapter,
            repositories: this.dependencies.repositories,
        });
    }

    /**
     * Creates a site repository service instance.
     *
     * @returns Site repository service implementation
     */
    public createSiteRepositoryService(): SiteRepositoryService {
        return new SiteRepositoryService({
            eventEmitter: this.dependencies.eventEmitter,
            logger: this.loggerAdapter,
            repositories: this.dependencies.repositories,
        });
    }
}
