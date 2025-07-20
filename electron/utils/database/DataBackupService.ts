/**
 * Service for data backup operations.
 * Provides a testable, dependency-injected service for backup management.
 */

import { UptimeEvents } from "../../events/eventTypes";
import { TypedEventBus } from "../../events/TypedEventBus";
import { DatabaseService } from "../../services/database/DatabaseService";
import { Logger, SiteLoadingError } from "./interfaces";

/**
 * Configuration for data backup operations.
 */
export interface DataBackupConfig {
    databaseService: DatabaseService;
    eventEmitter: TypedEventBus<UptimeEvents>;
    logger: Logger;
}

/**
 * Service for handling data backup operations.
 * Separates data operations from side effects for better testability.
 */
export class DataBackupService {
    private readonly databaseService: DatabaseService;
    private readonly eventEmitter: TypedEventBus<UptimeEvents>;
    private readonly logger: Logger;

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
            const result = await this.databaseService.createBackup();
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
