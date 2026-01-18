import type { Logger } from "@shared/utils/logger/interfaces";

import { DEFAULT_MAX_BACKUP_SIZE_BYTES } from "@shared/constants/backup";
import { tryGetErrorCode } from "@shared/utils/errorCodes";
import { ensureError } from "@shared/utils/errorHandling";
import { toSerializedError } from "@shared/utils/errorSerialization";
import { createSingleFlight } from "@shared/utils/singleFlight";
import { isSqliteLockedError } from "@shared/utils/sqliteErrors";
import { app } from "electron";
import sqlite3 from "node-sqlite3-wasm";
import { createHash, randomUUID } from "node:crypto";
import * as fs from "node:fs/promises";
import * as os from "node:os";
import * as path from "node:path";

import type { UptimeEvents } from "../../events/eventTypes";
import type { TypedEventBus } from "../../events/TypedEventBus";
import type { DatabaseService } from "./DatabaseService";

import { DB_FILE_NAME } from "../../constants";
import {
    renameIfExists,
    syncDirectorySafely,
    syncFileSafely,
} from "../../utils/fsSafeOps";
import { SiteLoadingError } from "./interfaces";
import {
    assertSqliteDatabaseIntegrity,
    computeDatabaseBackupChecksum,
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

const SNAPSHOT_BUSY_TIMEOUT_MS = 10_000;

const UNSAFE_FILENAME_PATTERN = /[^\p{L}\p{N}._-]/gu;

const WINDOWS_RESERVED_BASENAMES = new Set([
    "aux",
    "com1",
    "com2",
    "com3",
    "com4",
    "com5",
    "com6",
    "com7",
    "com8",
    "com9",
    "con",
    "lpt1",
    "lpt2",
    "lpt3",
    "lpt4",
    "lpt5",
    "lpt6",
    "lpt7",
    "lpt8",
    "lpt9",
    "nul",
    "prn",
]);

function createSanitizedFileName(fileName: string): string {
    const MAX_FILE_NAME_LENGTH = 200;
    const fallback = "backup.sqlite";

    const rawBase = path.basename(fileName);
    const normalizedBase = rawBase.replaceAll(UNSAFE_FILENAME_PATTERN, "_");
    let withoutTrailingDotsOrSpaces = normalizedBase;
    while (
        withoutTrailingDotsOrSpaces.endsWith(".") ||
        withoutTrailingDotsOrSpaces.endsWith(" ")
    ) {
        withoutTrailingDotsOrSpaces = withoutTrailingDotsOrSpaces.slice(0, -1);
    }

    const trimmed = withoutTrailingDotsOrSpaces.trim();

    if (trimmed.length === 0 || trimmed === "." || trimmed === "..") {
        return fallback;
    }

    const ext = path.extname(trimmed);
    const baseName = path.basename(trimmed, ext);
    const baseNameLower = baseName.toLowerCase();

    // Avoid Windows device names (even when running on non-Windows, a backup
    // can later be downloaded/restored on Windows).
    const safeBaseName = WINDOWS_RESERVED_BASENAMES.has(baseNameLower)
        ? `${baseName}_`
        : baseName;

    const candidate = `${safeBaseName}${ext}`;
    if (candidate.length <= MAX_FILE_NAME_LENGTH) {
        return candidate;
    }

    const shortenedBase = safeBaseName.slice(
        0,
        Math.max(1, MAX_FILE_NAME_LENGTH - ext.length)
    );

    return `${shortenedBase}${ext}`;
}

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
     * - closing the shared connection while another operation is using it,
     * - partially replaced files being opened,
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
     * 1) creates a consistent snapshot via `VACUUM INTO` in a temp directory,
     * 2) copies the snapshot into the destination directory under a temp name,
     * 3) swaps the destination file atomically (rename with a backup fallback).
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
                    snapshotDir = await this.createTempDirectory(
                        BACKUP_TEMP_PREFIX
                    );
                    const snapshotPath = this.createConsistentSnapshot({
                        dbPath,
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
                        await this.removeDirectorySafe(
                            snapshotDir,
                            "backup-save-temp-directory"
                        );
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
                    snapshotDir = await this.createTempDirectory(
                        BACKUP_TEMP_PREFIX
                    );
                    const snapshotPath = this.createConsistentSnapshot({
                        dbPath,
                        snapshotDir,
                        snapshotFileName: BACKUP_SNAPSHOT_FILE_NAME,
                    });

                    const rawResult = await createDatabaseBackup({
                        dbPath: snapshotPath,
                    });
                    const result = this.normalizeBackupResultMetadata(rawResult);
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
                        await this.removeDirectorySafe(
                            snapshotDir,
                            "backup-temp-directory"
                        );
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

                    tempDir = await this.createTempDirectory(RESTORE_TEMP_PREFIX);
                    const incomingFileName = payload.fileName?.trim();
                    const tempFileName =
                        incomingFileName && incomingFileName.length > 0
                            ? incomingFileName
                            : `restore-${timestamp}.sqlite`;
                    const safeTempFileName =
                        createSanitizedFileName(tempFileName);
                    const tempFilePath = await this.writeFileWithinDirectory(
                        tempDir,
                        safeTempFileName,
                        buffer
                    );

                    const metadata = this.buildRestoreMetadata(
                        tempFilePath,
                        buffer,
                        safeTempFileName
                    );
                    validateDatabaseBackupPayload({ buffer, metadata });

                    // Untrusted restore validation: ensure the incoming SQLite
                    // file is structurally sound before we create snapshots or
                    // swap it into place.
                    assertSqliteDatabaseIntegrity({
                        filePath: tempFilePath,
                        mode: "quick_check",
                    });

                    preRestoreSnapshotDir = await this.createTempDirectory(
                        BACKUP_TEMP_PREFIX
                    );
                    const preRestoreSnapshotPath =
                        this.createConsistentSnapshot({
                            dbPath,
                            snapshotDir: preRestoreSnapshotDir,
                            snapshotFileName: PRERESTORE_SNAPSHOT_FILE_NAME,
                        });

                    const preRestoreRaw = await createDatabaseBackup({
                        dbPath: preRestoreSnapshotPath,
                        fileName: `pre-restore-${timestamp}.sqlite`,
                    });
                    const preRestore =
                        this.normalizeBackupResultMetadata(preRestoreRaw);
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
                        await this.removeDirectorySafe(
                            tempDir,
                            "restore-temp-directory"
                        );
                    }

                    if (preRestoreSnapshotDir) {
                        await this.removeDirectorySafe(
                            preRestoreSnapshotDir,
                            "pre-restore-snapshot-directory"
                        );
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
                const normalizedBackup =
                    this.normalizeBackupResultMetadata(backup);
                validateDatabaseBackupPayload(normalizedBackup);

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

                const tempDir = await this.createTempDirectory(
                    ROLLBACK_TEMP_PREFIX
                );
                const safeFileName = createSanitizedFileName(
                    normalizedBackup.fileName
                );
                const dbPath = path.join(
                    app.getPath("userData"),
                    DB_FILE_NAME
                );

                try {
                    const tempFilePath = await this.writeFileWithinDirectory(
                        tempDir,
                        safeFileName,
                        buffer
                    );

                    // Even for internally-produced backups, validate that the
                    // replacement database file is structurally sound before
                    // swapping it into place.
                    assertSqliteDatabaseIntegrity({
                        filePath: tempFilePath,
                        mode: "quick_check",
                    });

                    await this.replaceDatabaseFile(tempFilePath, dbPath);
                    return normalizedBackup.metadata;
                } finally {
                    await this.removeDirectorySafe(
                        tempDir,
                        "rollback-temp-directory"
                    );
                }
            }
        );
    }

    private async replaceDatabaseFile(
        sourcePath: string,
        targetPath: string
    ): Promise<void> {
        this.databaseService.close();

        const targetDir = path.dirname(targetPath);
        const baseName = path.basename(targetPath);
        const timestamp = Date.now();
        const rollbackPath = path.join(
            targetDir,
            `${baseName}.rollback-${timestamp}`
        );
        const rollbackWalPath = `${rollbackPath}-wal`;
        const rollbackShmPath = `${rollbackPath}-shm`;
        const rollbackJournalPath = `${rollbackPath}-journal`;
        const incomingPath = path.join(
            targetDir,
            `${baseName}.incoming-${timestamp}`
        );

        const walPath = `${targetPath}-wal`;
        const shmPath = `${targetPath}-shm`;
        const journalPath = `${targetPath}-journal`;

        let hadExistingTarget = false;
        let copyError: Error | undefined = undefined;

        try {
            // Stage the incoming DB first to reduce the time window where
            // `targetPath` is missing. This also ensures we never move the live
            // DB aside unless we have a fully-written replacement ready.
            await fs.copyFile(sourcePath, incomingPath);
            await syncFileSafely(incomingPath);

            // Move the existing DB out of the way (so rename into place is safe).
            try {
                // WAL/SHM sidecars must not follow the restored DB into place.
                // We relocate them alongside the main DB so rollback restores
                // the *exact* prior state and we avoid corrupting the restored
                // DB with a mismatched WAL.
                //
                // These renames are best-effort. If files do not exist we
                // treat it as a no-op.
                await renameIfExists(walPath, rollbackWalPath);
                await renameIfExists(shmPath, rollbackShmPath);
                await renameIfExists(journalPath, rollbackJournalPath);

                // eslint-disable-next-line security/detect-non-literal-fs-filename -- rollbackPath is derived from the trusted DB path with a controlled suffix.
                await fs.rename(targetPath, rollbackPath);
                hadExistingTarget = true;
                await syncDirectorySafely(targetDir);
            } catch (error) {
                if (tryGetErrorCode(error) === "ENOENT") {
                    // No existing file.
                } else {
                    throw ensureError(error);
                }
            }

            // eslint-disable-next-line security/detect-non-literal-fs-filename -- incomingPath/targetPath are within app-controlled userData directory.
            await fs.rename(incomingPath, targetPath);
            await syncDirectorySafely(targetDir);
        } catch (error: unknown) {
            copyError = ensureError(error);
        }

        // If we failed to copy the restored DB into place but we moved the
        // original DB out of the way, restore the original before we
        // re-initialize. Otherwise initialize() may open/lock an empty/bad DB
        // and make rollback impossible on Windows.
        if (copyError && hadExistingTarget) {
            try {
                await fs.rm(targetPath, { force: true });
                // eslint-disable-next-line security/detect-non-literal-fs-filename -- rollbackPath/targetPath are within app-controlled userData directory.
                await fs.rename(rollbackPath, targetPath);

                // Restore sidecars if we relocated them.
                await renameIfExists(rollbackWalPath, walPath);
                await renameIfExists(rollbackShmPath, shmPath);
                await renameIfExists(rollbackJournalPath, journalPath);
                hadExistingTarget = false;
            } catch {
                // Best effort. We still surface the original copy error below.
            }
        }

        try {
            this.databaseService.initialize();
        } catch (error: unknown) {
            const initError = ensureError(error);

            // Attempt rollback if we replaced the file.
            if (hadExistingTarget) {
                try {
                    await fs.rm(targetPath, { force: true });
                    // eslint-disable-next-line security/detect-non-literal-fs-filename -- rollbackPath/targetPath are within app-controlled userData directory.
                    await fs.rename(rollbackPath, targetPath);

                    await renameIfExists(rollbackWalPath, walPath);
                    await renameIfExists(rollbackShmPath, shmPath);
                    await renameIfExists(rollbackJournalPath, journalPath);
                    this.databaseService.initialize();
                } catch {
                    // If rollback fails, we still surface the init error below.
                }
            }

            if (copyError) {
                throw new Error(
                    `Failed to restore database file (copy failed: ${copyError.message}; reinitialize failed: ${initError.message})`,
                    { cause: error }
                );
            }

            throw initError;
        } finally {
            await fs.rm(incomingPath, { force: true }).catch(() => {});
            if (!copyError) {
                await fs.rm(rollbackPath, { force: true }).catch(() => {});
                await fs.rm(rollbackWalPath, { force: true }).catch(() => {});
                await fs.rm(rollbackShmPath, { force: true }).catch(() => {});
                await fs.rm(rollbackJournalPath, { force: true }).catch(() => {});
            }
        }

        if (copyError) {
            throw copyError;
        }
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

        const tmpPath = this.resolvePathWithinDirectory(
            baseDirectory,
            `${fileName}.tmp-${randomUUID()}`
        );
        const rollbackPath = this.resolvePathWithinDirectory(
            baseDirectory,
            `${fileName}.rollback-${randomUUID()}`
        );

        try {
            // Path is validated by resolvePathWithinDirectory to prevent traversal.
            // eslint-disable-next-line security/detect-non-literal-fs-filename -- tmpPath is sanitized and confined to baseDirectory.
            await fs.writeFile(tmpPath, contents);
            await syncFileSafely(tmpPath);

            try {
                // eslint-disable-next-line security/detect-non-literal-fs-filename -- targetPath/rollbackPath are sanitized and confined to baseDirectory.
                await fs.rename(targetPath, rollbackPath);
            } catch (error) {
                if (tryGetErrorCode(error) === "ENOENT") {
                    // No existing file.
                } else {
                    throw ensureError(error);
                }
            }

            // eslint-disable-next-line security/detect-non-literal-fs-filename -- tmpPath/targetPath are sanitized and confined to baseDirectory.
            await fs.rename(tmpPath, targetPath);
            await syncDirectorySafely(baseDirectory);
        } catch (error) {
            // Best-effort cleanup.
            await fs.rm(tmpPath, { force: true }).catch(() => {});

            // Best-effort rollback (no-op if rollback doesn't exist).
            // eslint-disable-next-line security/detect-non-literal-fs-filename -- rollbackPath/targetPath are sanitized and confined to baseDirectory.
            await fs.rename(rollbackPath, targetPath).catch(() => {});
            await syncDirectorySafely(baseDirectory);

            throw ensureError(error);
        } finally {
            // Best-effort cleanup (no-op if rollback doesn't exist).
            await fs.rm(rollbackPath, { force: true }).catch(() => {});
        }

        return targetPath;
    }

    private createVacuumSnapshot(args: {
        dbPath: string;
        snapshotPath: string;
    }): void {
        const { dbPath, snapshotPath } = args;

        const tempDb = new sqlite3.Database(dbPath, {
            fileMustExist: true,
        });
        try {
            try {
                tempDb.exec(`PRAGMA busy_timeout = ${SNAPSHOT_BUSY_TIMEOUT_MS}`);
            } catch {
                // Best-effort; snapshot still works without it.
            }

            tempDb.exec(
                `VACUUM INTO ${this.escapeSqlStringLiteral(snapshotPath)}`
            );
        } finally {
            tempDb.close();
        }
    }









    private createConsistentSnapshot(args: {
        dbPath: string;
        snapshotDir: string;
        snapshotFileName: string;
    }): string {
        const { dbPath, snapshotDir, snapshotFileName } = args;

        const safeName = createSanitizedFileName(snapshotFileName);
        const snapshotPath = this.resolvePathWithinDirectory(
            snapshotDir,
            safeName
        );

        // Preferred path: avoid disrupting the primary connection.
        try {
            this.createVacuumSnapshot({ dbPath, snapshotPath });
            return snapshotPath;
        } catch (error: unknown) {
            if (!isSqliteLockedError(error)) {
                throw error;
            }

            // Fallback path for locked/busy failures: temporarily close and
            // reopen the main connection to reduce lock contention.
            this.logger.warn(
                "[DataBackupService] Snapshot creation hit SQLITE_BUSY/LOCKED; retrying after closing primary connection"
            );

            this.databaseService.close();
            try {
                this.createVacuumSnapshot({ dbPath, snapshotPath });
                return snapshotPath;
            } finally {
                this.databaseService.initialize();
            }
        }
    }

    private normalizeBackupResultMetadata(
        backup: DatabaseBackupResult
    ): DatabaseBackupResult {
        const safeOriginalPath = backup.fileName;
        return {
            ...backup,
            metadata: {
                ...backup.metadata,
                originalPath: safeOriginalPath,
            },
        };
    }

    private escapeSqlStringLiteral(value: string): string {
        return `'${value.replaceAll("'", "''")}'`;
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

        this.downloadDatabaseBackupSingleFlight = createSingleFlight(() =>
            this.downloadDatabaseBackupImpl()
        );
    }

    private buildRestoreMetadata(
        filePath: string,
        buffer: Buffer,
        fileName: string
    ): DatabaseBackupMetadata {
        const schemaVersion = readDatabaseSchemaVersionFromFile(filePath);
        const checksum = computeDatabaseBackupChecksum(buffer);
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
}
