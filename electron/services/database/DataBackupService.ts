import type { Logger } from "@shared/utils/logger/interfaces";

import { DEFAULT_MAX_BACKUP_SIZE_BYTES } from "@shared/constants/backup";
import { ensureError } from "@shared/utils/errorHandling";
import { toSerializedError } from "@shared/utils/errorSerialization";
import { createSingleFlight } from "@shared/utils/singleFlight";
import { app } from "electron";
import { createHash, randomUUID } from "node:crypto";
import * as fs from "node:fs/promises";
import * as path from "node:path";

import type { UptimeEvents } from "../../events/eventTypes";
import type { TypedEventBus } from "../../events/TypedEventBus";
import type { DatabaseService } from "./DatabaseService";

import { DB_FILE_NAME } from "../../constants";
import {
    buildRestoreMetadata,
    normalizeBackupResultMetadata,
} from "./dataBackupService/backupMetadata";
import { replaceDatabaseFile } from "./dataBackupService/replaceDatabaseFile";
import { createSanitizedFileName } from "./dataBackupService/sanitizeBackupFileName";
import { createConsistentSnapshot } from "./dataBackupService/snapshot";
import { createTempDirectory, removeDirectorySafe } from "./dataBackupService/tempDirectories";
import { writeFileWithinDirectory } from "./dataBackupService/writeFileWithinDirectory";
import { SiteLoadingError } from "./interfaces";
import {
    assertSqliteDatabaseIntegrity,
    createDatabaseBackup,
    type DatabaseBackupMetadata,
    type DatabaseBackupResult,
    type DatabaseRestorePayload,
    type DatabaseRestoreResult,
    DEFAULT_BACKUP_RETENTION_HINT_DAYS,
    readDatabaseSchemaVersionFromFile,
    validateDatabaseBackupPayload,
} from "./utils/backup/databaseBackup";

const RESTORE_TEMP_PREFIX = "uptime-watcher-restore-";
const ROLLBACK_TEMP_PREFIX = "uptime-watcher-rollback-";
const BACKUP_TEMP_PREFIX = "uptime-watcher-backup-";

const BACKUP_SNAPSHOT_FILE_NAME = "backup-snapshot.sqlite";
const PRERESTORE_SNAPSHOT_FILE_NAME = "pre-restore-snapshot.sqlite";

const SQLITE_HEADER = Buffer.from("SQLite format 3\0", "ascii");

// NOTE: File name sanitization is implemented in
// `dataBackupService/sanitizeBackupFileName`.

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

    private databaseFileOperationInProgress: null | string = null;

    private readonly downloadDatabaseBackupSingleFlight: () => Promise<DatabaseBackupResult>;

    /**
     * Executes an operation that temporarily closes/reinitializes the primary
     * SQLite connection or replaces the database file.
     *
     * @remarks
     * These operations must not overlap. Concurrent execution can lead to:
     *
     * - Closing the shared connection while another operation is using it,
     * - Partially replaced files being opened,
     * - Windows rename/locking issues.
     */
    private async withExclusiveDatabaseFileOperation<T>(
        operationName: string,
        operation: () => Promise<T>
    ): Promise<T> {
        if (this.databaseFileOperationInProgress) {
            throw new Error(
                `[DataBackupService] Refusing to start ${operationName} while ${this.databaseFileOperationInProgress} is in progress`
            );
        }

        this.databaseFileOperationInProgress = operationName;
        try {
            return await operation();
        } finally {
            this.databaseFileOperationInProgress = null;
        }
    }

    public async downloadDatabaseBackup(): Promise<DatabaseBackupResult> {
        return this.downloadDatabaseBackupSingleFlight();
    }

    /* eslint-disable security/detect-non-literal-fs-filename -- This workflow writes a backup to a user-selected path (via native save dialog). We still guard against symlink overwrites and use atomic replacement semantics. */

    /**
     * Saves a SQLite database backup directly to disk.
     *
     * @remarks
     * This avoids materializing the backup as a large in-memory Buffer.
     * Internally it:
     *
     * 1. Creates a consistent snapshot via `VACUUM INTO` in a temp directory,
     * 2. Copies the snapshot into the destination directory under a temp name,
     * 3. Swaps the destination file atomically (rename with a backup fallback).
     */
    public async saveDatabaseBackupToPath(
        targetPath: string
    ): Promise<DatabaseBackupMetadata> {
        return this.withExclusiveDatabaseFileOperation(
            "save-backup",
            async () => {
                if (!path.isAbsolute(targetPath)) {
                    throw new Error(
                        "Refusing to save backup to a non-absolute file path"
                    );
                }

                const dbPath = path.join(app.getPath("userData"), DB_FILE_NAME);
                const directory = path.dirname(targetPath);
                await fs.mkdir(directory, { recursive: true });

                const existing = await fs.lstat(targetPath).catch(() => null);
                if (existing?.isSymbolicLink()) {
                    throw new Error(
                        "Refusing to overwrite a symlink path when saving backup"
                    );
                }

                let snapshotDir: null | string = null;
                try {
                    snapshotDir = await createTempDirectory(BACKUP_TEMP_PREFIX);
                    const snapshotPath = createConsistentSnapshot({
                        databaseService: this.databaseService,
                        dbPath,
                        logger: this.logger,
                        snapshotDir,
                        snapshotFileName: BACKUP_SNAPSHOT_FILE_NAME,
                    });

                    const snapshotStats = await fs.stat(snapshotPath);
                    if (snapshotStats.size > DEFAULT_MAX_BACKUP_SIZE_BYTES) {
                        throw new Error(
                            `Backup exceeds max size (${snapshotStats.size} > ${DEFAULT_MAX_BACKUP_SIZE_BYTES} bytes)`
                        );
                    }

                    const tempDestination = path.join(
                        directory,
                        `${path.basename(targetPath)}.tmp-${randomUUID()}`
                    );

                    await fs.copyFile(snapshotPath, tempDestination);

                    await this.replaceFileAtomicallyWithBackup({
                        sourcePath: tempDestination,
                        targetPath,
                    });

                    const schemaVersion =
                        readDatabaseSchemaVersionFromFile(targetPath);
                    const stats = await fs.stat(targetPath);
                    const sizeBytes = stats.size;
                    const checksum = await this.computeFileChecksum(targetPath);

                    return {
                        appVersion: app.getVersion(),
                        checksum,
                        createdAt: Date.now(),
                        originalPath: path.basename(targetPath),
                        retentionHintDays: DEFAULT_BACKUP_RETENTION_HINT_DAYS,
                        schemaVersion,
                        sizeBytes,
                    } satisfies DatabaseBackupMetadata;
                } finally {
                    if (snapshotDir) {
                        await removeDirectorySafe({
                            context: "backup-save-temp-directory",
                            directoryPath: snapshotDir,
                            logger: this.logger,
                        });
                    }
                }
            }
        );
    }

    private async computeFileChecksum(filePath: string): Promise<string> {
        const handle = await fs.open(filePath, "r");
        try {
            const hash = createHash("sha256");
            const buffer = Buffer.alloc(1024 ** 2);

            while (true) {
                // eslint-disable-next-line no-await-in-loop -- File reads must be sequential.
                const { bytesRead } = await handle.read(
                    buffer,
                    0,
                    buffer.byteLength,
                    null
                );

                if (bytesRead === 0) {
                    break;
                }

                hash.update(buffer.subarray(0, bytesRead));
            }

            return hash.digest("hex");
        } finally {
            await handle.close();
        }
    }

    private async replaceFileAtomicallyWithBackup(args: {
        sourcePath: string;
        targetPath: string;
    }): Promise<void> {
        const { sourcePath, targetPath } = args;
        const backupPath = `${targetPath}.bak-${randomUUID()}`;

        const targetStat = await fs.lstat(targetPath).catch(() => null);
        const targetExists =
            targetStat?.isFile() === true && !targetStat.isSymbolicLink();

        if (!targetExists) {
            await fs.rename(sourcePath, targetPath);
            return;
        }

        await fs.rename(targetPath, backupPath);

        try {
            await fs.rename(sourcePath, targetPath);
            await fs.rm(backupPath, { force: true });
        } catch (error) {
            await fs.rm(targetPath, { force: true }).catch(() => {});
            await fs.rename(backupPath, targetPath).catch(() => {});
            await fs.rm(sourcePath, { force: true }).catch(() => {});
            throw error;
        }
    }

    /* eslint-enable security/detect-non-literal-fs-filename -- Re-enable after user-path backup save helpers. */

    private async downloadDatabaseBackupImpl(): Promise<DatabaseBackupResult> {
        let snapshotDir: string | undefined = undefined;
        return this.withExclusiveDatabaseFileOperation(
            "download-backup",
            async () => {
                try {
                    const dbPath = path.join(
                        app.getPath("userData"),
                        DB_FILE_NAME
                    );
                    snapshotDir = await createTempDirectory(BACKUP_TEMP_PREFIX);
                    const snapshotPath = createConsistentSnapshot({
                        databaseService: this.databaseService,
                        dbPath,
                        logger: this.logger,
                        snapshotDir,
                        snapshotFileName: BACKUP_SNAPSHOT_FILE_NAME,
                    });

                    const rawResult = await createDatabaseBackup({
                        dbPath: snapshotPath,
                    });
                    const result = normalizeBackupResultMetadata(rawResult);
                    validateDatabaseBackupPayload(result);
                    this.logger.info(
                        "[DataBackupService] Created database backup",
                        {
                            checksum: result.metadata.checksum,
                            fileName: result.fileName,
                            schemaVersion: result.metadata.schemaVersion,
                            sizeBytes: result.metadata.sizeBytes,
                        }
                    );
                    return result;
                } catch (error) {
                    const normalizedError = ensureError(error);
                    const message = `Failed to download database backup: ${normalizedError.message}`;

                    try {
                        await this.eventEmitter.emitTyped("database:error", {
                            details: message,
                            error: toSerializedError(normalizedError),
                            operation: "download-backup",
                            timestamp: Date.now(),
                        });
                    } catch (emitError: unknown) {
                        this.logger.warn(
                            "[DataBackupService] Failed to emit database:error event",
                            ensureError(emitError),
                            {
                                operation: "download-backup",
                            }
                        );
                    }

                    this.logger.error(message, normalizedError);
                    throw new SiteLoadingError(message, {
                        cause: normalizedError,
                    });
                } finally {
                    if (snapshotDir) {
                        await removeDirectorySafe({
                            context: "backup-temp-directory",
                            directoryPath: snapshotDir,
                            logger: this.logger,
                        });
                    }
                }
            }
        );
    }

    public async restoreDatabaseBackup(
        payload: DatabaseRestorePayload
    ): Promise<DatabaseRestoreResult> {
        return this.withExclusiveDatabaseFileOperation(
            "restore-backup",
            async () => {
                const buffer = Buffer.from(payload.buffer);
                const dbPath = path.join(app.getPath("userData"), DB_FILE_NAME);
                const timestamp = Date.now();
                let tempDir: null | string = null;
                let preRestoreSnapshotDir: null | string = null;

                try {
                    if (
                        buffer.length < SQLITE_HEADER.length ||
                        !buffer
                            .subarray(0, SQLITE_HEADER.length)
                            .equals(SQLITE_HEADER)
                    ) {
                        throw new Error(
                            "Restore payload is not a valid SQLite database file"
                        );
                    }

                    tempDir = await createTempDirectory(RESTORE_TEMP_PREFIX);
                    const incomingFileName = payload.fileName?.trim();
                    const tempFileName =
                        incomingFileName && incomingFileName.length > 0
                            ? incomingFileName
                            : `restore-${timestamp}.sqlite`;
                    const safeTempFileName =
                        createSanitizedFileName(tempFileName);
                    const tempFilePath = await writeFileWithinDirectory({
                        baseDirectory: tempDir,
                        contents: buffer,
                        fileName: safeTempFileName,
                    });

                    const metadata = buildRestoreMetadata({
                        buffer,
                        fileName: safeTempFileName,
                        filePath: tempFilePath,
                    });
                    validateDatabaseBackupPayload({ buffer, metadata });

                    // Untrusted restore validation: ensure the incoming SQLite
                    // file is structurally sound before we create snapshots or
                    // swap it into place.
                    assertSqliteDatabaseIntegrity({
                        filePath: tempFilePath,
                        mode: "quick_check",
                    });

                    preRestoreSnapshotDir =
                        await createTempDirectory(BACKUP_TEMP_PREFIX);
                    const preRestoreSnapshotPath =
                        createConsistentSnapshot({
                            databaseService: this.databaseService,
                            dbPath,
                            logger: this.logger,
                            snapshotDir: preRestoreSnapshotDir,
                            snapshotFileName: PRERESTORE_SNAPSHOT_FILE_NAME,
                        });

                    const preRestoreRaw = await createDatabaseBackup({
                        dbPath: preRestoreSnapshotPath,
                        fileName: `pre-restore-${timestamp}.sqlite`,
                    });
                    const preRestore = normalizeBackupResultMetadata(preRestoreRaw);
                    const normalizedPreRestoreName = preRestore.fileName.trim();
                    const preRestoreFileName = createSanitizedFileName(
                        normalizedPreRestoreName.length > 0
                            ? normalizedPreRestoreName
                            : `pre-restore-${timestamp}.sqlite`
                    );
                    await writeFileWithinDirectory({
                        baseDirectory: app.getPath("userData"),
                        contents: preRestore.buffer,
                        fileName: preRestoreFileName,
                    });

                    await replaceDatabaseFile({
                        databaseService: this.databaseService,
                        sourcePath: tempFilePath,
                        targetPath: dbPath,
                    });

                    const restoredAt = Date.now();

                    await this.eventEmitter.emitTyped(
                        "database:backup-restored",
                        {
                            checksum: metadata.checksum,
                            fileName: metadata.originalPath,
                            schemaVersion: metadata.schemaVersion,
                            size: metadata.sizeBytes,
                            timestamp: restoredAt,
                            triggerType: "manual",
                        }
                    );

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

                    try {
                        await this.eventEmitter.emitTyped("database:error", {
                            details: message,
                            error: toSerializedError(normalizedError),
                            operation: "restore-backup",
                            timestamp: Date.now(),
                        });
                    } catch (emitError: unknown) {
                        this.logger.warn(
                            "[DataBackupService] Failed to emit database:error event",
                            ensureError(emitError),
                            {
                                operation: "restore-backup",
                            }
                        );
                    }

                    this.logger.error(message, normalizedError);
                    throw normalizedError;
                } finally {
                    if (tempDir) {
                        await removeDirectorySafe({
                            context: "restore-temp-directory",
                            directoryPath: tempDir,
                            logger: this.logger,
                        });
                    }

                    if (preRestoreSnapshotDir) {
                        await removeDirectorySafe({
                            context: "pre-restore-snapshot-directory",
                            directoryPath: preRestoreSnapshotDir,
                            logger: this.logger,
                        });
                    }
                }
            }
        );
    }

    public async applyDatabaseBackupResult(
        backup: DatabaseBackupResult
    ): Promise<DatabaseBackupMetadata> {
        return this.withExclusiveDatabaseFileOperation(
            "apply-backup",
            async () => {
                const normalizedBackup = normalizeBackupResultMetadata(backup);
                const buffer = Buffer.from(normalizedBackup.buffer);
                if (
                    buffer.length < SQLITE_HEADER.length ||
                    !buffer
                        .subarray(0, SQLITE_HEADER.length)
                        .equals(SQLITE_HEADER)
                ) {
                    throw new Error(
                        "Backup payload is not a valid SQLite database file"
                    );
                }

                const tempDir = await createTempDirectory(ROLLBACK_TEMP_PREFIX);
                const safeFileName = createSanitizedFileName(
                    normalizedBackup.fileName
                );
                const dbPath = path.join(app.getPath("userData"), DB_FILE_NAME);

                try {
                    const tempFilePath = await writeFileWithinDirectory({
                        baseDirectory: tempDir,
                        contents: buffer,
                        fileName: safeFileName,
                    });

                    // The incoming metadata may be untrusted (e.g. downloaded
                    // from cloud storage). Always compute the schema version
                    // from the actual SQLite file so a forged schemaVersion
                    // cannot bypass compatibility checks.
                    const schemaVersion =
                        readDatabaseSchemaVersionFromFile(tempFilePath);

                    const effectiveBackup: DatabaseBackupResult = {
                        ...normalizedBackup,
                        metadata: {
                            ...normalizedBackup.metadata,
                            schemaVersion,
                            sizeBytes: buffer.length,
                        },
                    };

                    validateDatabaseBackupPayload(effectiveBackup);

                    // Even for internally-produced backups, validate that the
                    // replacement database file is structurally sound before
                    // swapping it into place.
                    assertSqliteDatabaseIntegrity({
                        filePath: tempFilePath,
                        mode: "quick_check",
                    });

                    await replaceDatabaseFile({
                        databaseService: this.databaseService,
                        sourcePath: tempFilePath,
                        targetPath: dbPath,
                    });
                    return effectiveBackup.metadata;
                } finally {
                    await removeDirectorySafe({
                        context: "rollback-temp-directory",
                        directoryPath: tempDir,
                        logger: this.logger,
                    });
                }
            }
        );
    }

    public constructor(config: DataBackupServiceConfig) {
        this.databaseService = config.databaseService;
        this.eventEmitter = config.eventEmitter;
        this.logger = config.logger;

        this.downloadDatabaseBackupSingleFlight = createSingleFlight(() =>
            this.downloadDatabaseBackupImpl()
        );
    }

    // NOTE: Restore metadata building extracted to
    // `dataBackupService/backupMetadata`.
}
