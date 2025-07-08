/**
 * Service for data backup operations.
 * Provides a testable, dependency-injected service for backup management.
 */

import { UptimeEvents, TypedEventBus } from "../../events";
import { DatabaseService } from "../../services/database";
import { ILogger, ISiteCache, SiteLoadingError } from "./interfaces";

/**
 * Configuration for data backup operations.
 */
export interface DataBackupConfig {
    eventEmitter: TypedEventBus<UptimeEvents>;
    databaseService: DatabaseService;
    logger: ILogger;
}

/**
 * Service for handling data backup operations.
 * Separates data operations from side effects for better testability.
 */
export class DataBackupService {
    private readonly databaseService: DatabaseService;
    private readonly logger: ILogger;
    private readonly eventEmitter: TypedEventBus<UptimeEvents>;

    constructor(config: DataBackupConfig) {
        this.databaseService = config.databaseService;
        this.logger = config.logger;
        this.eventEmitter = config.eventEmitter;
    }

    /**
     * Download SQLite database backup.
     * Pure data operation that returns backup buffer and filename.
     */
    async downloadDatabaseBackup(): Promise<{ buffer: Buffer; fileName: string }> {
        try {
            const result = await this.databaseService.downloadBackup();
            this.logger.info(`Database backup created: ${result.fileName}`);
            return result;
        } catch (error) {
            const message = `Failed to download backup: ${error instanceof Error ? error.message : String(error)}`;
            this.logger.error(message, error);

            await this.eventEmitter.emitTyped("database:error", {
                details: message,
                error: error instanceof Error ? error : new Error(String(error)),
                operation: "download-backup",
                timestamp: Date.now(),
            });

            throw new SiteLoadingError(message, error instanceof Error ? error : undefined);
        }
    }
}

/**
 * Orchestrates the complete data backup process.
 * Coordinates backup operations with side effects.
 */
export class DataBackupOrchestrator {
    private readonly dataBackupService: DataBackupService;

    constructor(dataBackupService: DataBackupService) {
        this.dataBackupService = dataBackupService;
    }

    /**
     * Download database backup.
     * Coordinates the complete backup process.
     */
    async downloadBackup(): Promise<{ buffer: Buffer; fileName: string }> {
        return await this.dataBackupService.downloadDatabaseBackup();
    }

    /**
     * Refresh sites from cache.
     * Simple operation that returns sites from the provided cache.
     */
    refreshSitesFromCache(siteCache: ISiteCache): Promise<{ identifier: string; name?: string }[]> {
        try {
            const sites = Array.from(siteCache.entries()).map(([, site]) => ({
                identifier: site.identifier,
                ...(site.name !== undefined && { name: site.name }),
            }));
            return Promise.resolve(sites);
        } catch (error) {
            return Promise.reject(
                new SiteLoadingError(
                    `Failed to refresh sites from cache: ${error instanceof Error ? error.message : String(error)}`,
                    error instanceof Error ? error : undefined
                )
            );
        }
    }
}
