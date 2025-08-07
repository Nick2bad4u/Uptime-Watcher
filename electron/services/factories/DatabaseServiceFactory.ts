/**
 * Service factory for database-related services following the Factory pattern.
 *
 * @remarks
 * Provides centralized creation and configuration of database services. Implements the Factory pattern to resolve Dependency Inversion Principle violations in DatabaseManager. All service creation is centralized here with proper abstraction interfaces and dependency injection.
 *
 * @public
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
 * Defines the dependencies required by the {@link DatabaseServiceFactory} for service creation.
 *
 * @remarks
 * Includes all repositories, the database service, and the event emitter needed for constructing database-related services.
 *
 * @public
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
 *
 * @remarks
 * Used for type safety and dependency injection for backup-related operations.
 *
 * @public
 */
export interface IDataBackupService {
    downloadDatabaseBackup(): Promise<{ buffer: Buffer; fileName: string }>;
}

/**
 * Abstract interface for import/export service operations.
 *
 * @remarks
 * Used for type safety and dependency injection for import/export-related operations.
 *
 * @public
 */
export interface IDataImportExportService {
    exportAllData(): Promise<string>;
    importDataFromJson(
        data: string
    ): Promise<{ settings: Record<string, string>; sites: unknown[] }>;
    persistImportedData(
        sites: unknown[],
        settings: Record<string, string>
    ): Promise<void>;
}

/**
 * Abstract interface for site repository service operations.
 *
 * @remarks
 * Used for type safety and dependency injection for site repository operations.
 *
 * @public
 */
export interface ISiteRepositoryService {
    getSitesFromDatabase(): Promise<Site[]>;
}

/**
 * Factory for creating database-related services with proper dependency injection.
 *
 * @remarks
 * Centralizes service creation to resolve Dependency Inversion Principle violations. All services are created with proper abstractions and dependency injection. This class is the single entry point for constructing all database-related services in the backend.
 *
 * @public
 */
export class DatabaseServiceFactory {
    private readonly dependencies: DatabaseServiceFactoryDependencies;
    private readonly loggerAdapter: LoggerAdapter;

    /**
     * Constructs a new {@link DatabaseServiceFactory} instance.
     *
     * @remarks
     * Initializes the factory with all required dependencies and sets up a logger adapter for use by created services.
     *
     * @param dependencies - The {@link DatabaseServiceFactoryDependencies} required for service creation.
     */
    constructor(dependencies: DatabaseServiceFactoryDependencies) {
        this.dependencies = dependencies;
        this.loggerAdapter = new LoggerAdapter(monitorLogger);
    }

    /**
     * Creates a data backup service instance.
     *
     * @remarks
     * Returns a new {@link DataBackupService} with injected dependencies for backup operations.
     *
     * @returns Data backup service implementation.
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
     * @remarks
     * Returns a new {@link DataImportExportService} with injected dependencies for import/export operations.
     *
     * @returns Data import/export service implementation.
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
     * @remarks
     * Returns a new {@link SiteRepositoryService} with injected dependencies for site repository operations.
     *
     * @returns Site repository service implementation.
     */
    public createSiteRepositoryService(): SiteRepositoryService {
        return new SiteRepositoryService({
            eventEmitter: this.dependencies.eventEmitter,
            logger: this.loggerAdapter,
            repositories: this.dependencies.repositories,
        });
    }
}
