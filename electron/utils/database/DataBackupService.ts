import type { Logger } from "@shared/utils/logger/interfaces";

import { ensureError } from "@shared/utils/errorHandling";
import { app } from "electron";
import sqlite3 from "node-sqlite3-wasm";
import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import type { UptimeEvents } from "../../events/eventTypes";
import type { TypedEventBus } from "../../events/TypedEventBus";
import type { DatabaseService } from "../../services/database/DatabaseService";

import { DB_FILE_NAME } from "../../constants";
import {
    createDatabaseBackup,
    type DatabaseBackupMetadata,
    type DatabaseBackupResult,
    type DatabaseRestorePayload,
    type DatabaseRestoreResult,
    DEFAULT_BACKUP_RETENTION_HINT_DAYS,
    validateDatabaseBackupPayload,
} from "../../services/database/utils/databaseBackup";
import { toSerializedError } from "../errorSerialization";
import { SiteLoadingError } from "./interfaces";

const RESTORE_TEMP_PREFIX = "uptime-watcher-restore-";
const ROLLBACK_TEMP_PREFIX = "uptime-watcher-rollback-";

const UNSAFE_FILENAME_PATTERN = /[^\p{L}\p{N}._-]/gu;

const createSanitizedFileName = (fileName: string): string =>
    path.basename(fileName).replaceAll(UNSAFE_FILENAME_PATTERN, "_");

/**
 * Dependencies required to orchestrate database backup workflows.
 */
export interface DataBackupServiceConfig {
    /** Database service responsible for connection lifecycle management. */
    readonly databaseService: DatabaseService;
    /** Typed event emitter used to broadcast backup lifecycle events. */
    readonly eventEmitter: TypedEventBus<UptimeEvents>;
    /** Logger instance for diagnostics. */
    readonly logger: Logger;
}

/**
 * Provides high-level database backup and restore operations with diagnostics.
 */
export class DataBackupService {
    private readonly databaseService: DatabaseService;

    private readonly eventEmitter: TypedEventBus<UptimeEvents>;

    private readonly logger: Logger;

    public async downloadDatabaseBackup(): Promise<DatabaseBackupResult> {
        try {
            const dbPath = path.join(app.getPath("userData"), DB_FILE_NAME);
            const result = await createDatabaseBackup({ dbPath });
            validateDatabaseBackupPayload(result);
            this.logger.info("[DataBackupService] Created database backup", {
                checksum: result.metadata.checksum,
                fileName: result.fileName,
                schemaVersion: result.metadata.schemaVersion,
                sizeBytes: result.metadata.sizeBytes,
            });
            return result;
        } catch (error) {
            const normalizedError = ensureError(error);
            const message = `Failed to download database backup: ${normalizedError.message}`;

            await this.eventEmitter.emitTyped("database:error", {
                details: message,
                error: toSerializedError(normalizedError),
                operation: "download-backup",
                timestamp: Date.now(),
            });

            this.logger.error(message, normalizedError);
            throw new SiteLoadingError(message, { cause: normalizedError });
        }
    }

    public async restoreDatabaseBackup(
        payload: DatabaseRestorePayload
    ): Promise<DatabaseRestoreResult> {
        const buffer = Buffer.from(payload.buffer);
        const dbPath = path.join(app.getPath("userData"), DB_FILE_NAME);
        const timestamp = Date.now();
        const tempDir = await this.createTempDirectory(RESTORE_TEMP_PREFIX);
        const incomingFileName = payload.fileName?.trim();
        const tempFileName =
            incomingFileName && incomingFileName.length > 0
                ? incomingFileName
                : `restore-${timestamp}.sqlite`;
        const safeTempFileName = createSanitizedFileName(tempFileName);
        const tempFilePath = await this.writeFileWithinDirectory(
            tempDir,
            safeTempFileName,
            buffer
        );

        try {
            const metadata = this.buildRestoreMetadata(
                tempFilePath,
                buffer,
                safeTempFileName
            );
            validateDatabaseBackupPayload({ buffer, metadata });

            const preRestore = await createDatabaseBackup({
                dbPath,
                fileName: `pre-restore-${timestamp}.sqlite`,
            });
            const normalizedPreRestoreName = preRestore.fileName.trim();
            const preRestoreFileName = createSanitizedFileName(
                normalizedPreRestoreName.length > 0
                    ? normalizedPreRestoreName
                    : `pre-restore-${timestamp}.sqlite`
            );
            await this.writeFileWithinDirectory(
                app.getPath("userData"),
                preRestoreFileName,
                preRestore.buffer
            );

            await this.replaceDatabaseFile(tempFilePath, dbPath);

            const restoredAt = Date.now();

            await this.eventEmitter.emitTyped("database:backup-restored", {
                checksum: metadata.checksum,
                fileName: metadata.originalPath,
                schemaVersion: metadata.schemaVersion,
                size: metadata.sizeBytes,
                timestamp: restoredAt,
                triggerType: "manual",
            });

            this.logger.info(
                "[DataBackupService] Database restored from backup",
                {
                    checksum: metadata.checksum,
                    preRestoreFileName,
                    schemaVersion: metadata.schemaVersion,
                }
            );

            return {
                metadata,
                preRestoreBackup: preRestore,
                preRestoreFileName,
                restoredAt,
            } satisfies DatabaseRestoreResult;
        } catch (error) {
            const normalizedError = ensureError(error);
            const message =
                "Failed to restore database backup. Original database has been preserved.";

            await this.eventEmitter.emitTyped("database:error", {
                details: message,
                error: toSerializedError(normalizedError),
                operation: "restore-backup",
                timestamp: Date.now(),
            });

            this.logger.error(message, normalizedError);
            throw normalizedError;
        } finally {
            await this.removeDirectorySafe(tempDir, "restore-temp-directory");
        }
    }

    public async applyDatabaseBackupResult(
        backup: DatabaseBackupResult
    ): Promise<DatabaseBackupMetadata> {
        validateDatabaseBackupPayload(backup);
        const tempDir = await this.createTempDirectory(ROLLBACK_TEMP_PREFIX);
        const safeFileName = createSanitizedFileName(backup.fileName);
        const dbPath = path.join(app.getPath("userData"), DB_FILE_NAME);

        try {
            const tempFilePath = await this.writeFileWithinDirectory(
                tempDir,
                safeFileName,
                backup.buffer
            );
            await this.replaceDatabaseFile(tempFilePath, dbPath);
            return backup.metadata;
        } finally {
            await this.removeDirectorySafe(tempDir, "rollback-temp-directory");
        }
    }

    private async replaceDatabaseFile(
        sourcePath: string,
        targetPath: string
    ): Promise<void> {
        this.databaseService.close();
        await fs.copyFile(sourcePath, targetPath);
        this.databaseService.initialize();
    }

    private async createTempDirectory(prefix: string): Promise<string> {
        const osTempPath = os.tmpdir();
        return fs.mkdtemp(path.join(osTempPath, prefix));
    }

    private async removeDirectorySafe(
        directoryPath: string,
        context: string
    ): Promise<void> {
        try {
            await fs.rm(directoryPath, { force: true, recursive: true });
        } catch (error) {
            const normalizedError = ensureError(error);
            this.logger.warn(
                `[DataBackupService] Failed to remove ${context}`,
                normalizedError
            );
        }
    }

    private async writeFileWithinDirectory(
        baseDirectory: string,
        fileName: string,
        contents: Parameters<typeof fs.writeFile>[1]
    ): Promise<string> {
        const targetPath = this.resolvePathWithinDirectory(
            baseDirectory,
            fileName
        );
        // Path is validated by resolvePathWithinDirectory to prevent traversal.
        // eslint-disable-next-line security/detect-non-literal-fs-filename -- targetPath is sanitized and confined to baseDirectory.
        await fs.writeFile(targetPath, contents);
        return targetPath;
    }

    private resolvePathWithinDirectory(
        baseDirectory: string,
        fileName: string
    ): string {
        const sanitizedFileName = createSanitizedFileName(fileName);
        const resolvedBase = path.resolve(baseDirectory);
        const normalizedBase = `${resolvedBase}${path.sep}`;
        const targetPath = path.resolve(resolvedBase, sanitizedFileName);

        if (!targetPath.startsWith(normalizedBase)) {
            throw new Error(
                `[DataBackupService] Refusing to write outside of ${resolvedBase}`
            );
        }

        return targetPath;
    }

    public constructor(config: DataBackupServiceConfig) {
        this.databaseService = config.databaseService;
        this.eventEmitter = config.eventEmitter;
        this.logger = config.logger;
    }

    private buildRestoreMetadata(
        filePath: string,
        buffer: Buffer,
        fileName: string
    ): DatabaseBackupMetadata {
        const schemaVersion = this.readSchemaVersion(filePath);
        const checksum = this.computeChecksum(buffer);
        return {
            appVersion: app.getVersion(),
            checksum,
            createdAt: Date.now(),
            originalPath: fileName,
            retentionHintDays: DEFAULT_BACKUP_RETENTION_HINT_DAYS,
            schemaVersion,
            sizeBytes: buffer.length,
        } satisfies DatabaseBackupMetadata;
    }

    private computeChecksum(buffer: Buffer): string {
        return createHash("sha256").update(buffer).digest("hex");
    }

    private readSchemaVersion(filePath: string): number {
        const database = new sqlite3.Database(filePath);
        try {
            const result: unknown = database
                .prepare("PRAGMA user_version")
                .get();
            if (
                result &&
                typeof result === "object" &&
                "user_version" in result
            ) {
                const version = (result as Record<string, unknown>)[
                    "user_version"
                ];
                if (typeof version === "number") {
                    return version;
                }
            }
            return 0;
        } finally {
            database.close();
        }
    }
}
