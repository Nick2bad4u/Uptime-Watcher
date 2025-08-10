/**
 * Service for data backup operations.
 *
 * Provides a testable, dependency-injected service for backup management.
 * Separates data operations from side effects for better testability.
 */

import { app } from "electron";
import path from "node:path";

import type { UptimeEvents } from "../../events/eventTypes";
import type { TypedEventBus } from "../../events/TypedEventBus";
import type { Logger } from "../interfaces";

import { DB_FILE_NAME } from "../../constants";
import { createDatabaseBackup } from "../../services/database/utils/databaseBackup";
import { SiteLoadingError } from "./interfaces";

/**
 * Configuration for data backup operations.
 */
export interface DataBackupConfig {
    /** Event emitter for cache and database events */
    eventEmitter: TypedEventBus<UptimeEvents>;
    /** Logger instance for recording operations */
    logger: Logger;
}

/**
 * Service for handling data backup operations.
 *
 * Separates data operations from side effects for better testability.
 */
export class DataBackupService {
    private readonly eventEmitter: TypedEventBus<UptimeEvents>;

    private readonly logger: Logger;

    /**
     * Download SQLite database backup.
     *
     * Pure data operation that returns backup buffer and filename.
     *
     * @returns Promise resolving to backup buffer and filename
     * @throws SiteLoadingError when backup creation fails
     */
    public async downloadDatabaseBackup(): Promise<{
        buffer: Buffer;
        fileName: string;
    }> {
        try {
            const dbPath = path.join(app.getPath("userData"), DB_FILE_NAME);
            const result = await createDatabaseBackup(dbPath);
            this.logger.info(`Database backup created: ${result.fileName}`);
            return result;
        } catch (error) {
            const message = `Failed to download backup: ${error instanceof Error ? error.message : String(error)}`;
            this.logger.error(message, error);

            await this.eventEmitter.emitTyped("database:error", {
                details: message,
                error:
                    error instanceof Error ? error : new Error(String(error)),
                operation: "download-backup",
                timestamp: Date.now(),
            });

            throw new SiteLoadingError(
                message,
                error instanceof Error ? error : new Error(String(error))
            );
        }
    }

    public constructor(config: DataBackupConfig) {
        this.logger = config.logger;
        this.eventEmitter = config.eventEmitter;
    }
}
