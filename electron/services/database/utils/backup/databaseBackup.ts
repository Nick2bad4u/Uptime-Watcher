import { ensureError } from "@shared/utils/errorHandling";
import { app } from "electron";
import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";

import { BACKUP_DB_FILE_NAME } from "../../../../constants";
import { logger } from "../../../../utils/logger";
import { DATABASE_SCHEMA_VERSION } from "../schema/databaseSchema";

export const DEFAULT_BACKUP_RETENTION_HINT_DAYS: number = 30;
export const DEFAULT_MAX_BACKUP_SIZE_BYTES: number = 50 * 1024 * 1024;

/**
 * Metadata describing a serialized SQLite backup artifact.
 */
export interface DatabaseBackupMetadata {
    appVersion: string;
    checksum: string;
    createdAt: number;
    originalPath: string;
    retentionHintDays: number;
    schemaVersion: number;
    sizeBytes: number;
}

/**
 * Optional constraints applied when validating serialized backup payloads.
 */
export interface DatabaseBackupValidationOptions {
    maxSizeBytes?: number;
}

/**
 * Result payload produced when exporting the SQLite database.
 */
export interface DatabaseBackupResult {
    buffer: Buffer;
    fileName: string;
    metadata: DatabaseBackupMetadata;
}

/**
 * Payload supplied by consumers when restoring from a serialized backup.
 */
export interface DatabaseRestorePayload {
    buffer: Buffer;
    fileName?: string;
}

/**
 * Detailed information about a completed restore operation.
 */
export interface DatabaseRestoreResult {
    metadata: DatabaseBackupMetadata;
    preRestoreBackup: DatabaseBackupResult;
    preRestoreFileName: string;
    restoredAt: number;
}

/**
 * Summary returned to renderer processes after a restore completes.
 */
export interface DatabaseRestoreSummary {
    metadata: DatabaseBackupMetadata;
    preRestoreFileName: string;
    restoredAt: number;
}

interface CreateDatabaseBackupArgs {
    dbPath: string;
    fileName?: string;
}

type CreateDatabaseBackupParams = CreateDatabaseBackupArgs | string;

function computeBackupChecksum(buffer: Buffer): string {
    return createHash("sha256").update(buffer).digest("hex");
}

function buildBackupMetadata(
    buffer: Buffer,
    dbPath: string
): DatabaseBackupMetadata {
    return {
        appVersion: app.getVersion(),
        checksum: computeBackupChecksum(buffer),
        createdAt: Date.now(),
        originalPath: dbPath,
        retentionHintDays: DEFAULT_BACKUP_RETENTION_HINT_DAYS,
        schemaVersion: DATABASE_SCHEMA_VERSION,
        sizeBytes: buffer.length,
    };
}

function normalizeBackupArgs(
    params: CreateDatabaseBackupParams
): CreateDatabaseBackupArgs {
    const normalized: CreateDatabaseBackupArgs =
        typeof params === "string" ? { dbPath: params } : params;

    if (
        typeof normalized.fileName === "string" &&
        normalized.fileName.trim().length === 0
    ) {
        return { dbPath: normalized.dbPath };
    }

    return normalized;
}

/**
 * Creates a byte-for-byte copy of the SQLite database for download/export.
 */
export async function createDatabaseBackup(
    params: CreateDatabaseBackupParams
): Promise<DatabaseBackupResult> {
    const { dbPath, fileName = BACKUP_DB_FILE_NAME } =
        normalizeBackupArgs(params);
    try {
        // DbPath originates from app-controlled directories (userData, temporary
        // folders). Inline lint suppression documents the trusted origin.
        // eslint-disable-next-line security/detect-non-literal-fs-filename -- temp directory path constructed from trusted OS paths and sanitized file names
        const buffer = await fs.readFile(dbPath);
        const metadata = buildBackupMetadata(buffer, dbPath);

        logger.info("[DatabaseBackup] Database backup created successfully", {
            checksum: metadata.checksum,
            createdAt: metadata.createdAt,
            dbPath,
            fileName,
            schemaVersion: metadata.schemaVersion,
            sizeBytes: metadata.sizeBytes,
        });

        return {
            buffer,
            fileName,
            metadata,
        };
    } catch (error) {
        const normalizedError = ensureError(error);
        logger.error("[DatabaseBackup] Failed to create database backup", {
            dbPath,
            error: normalizedError.message,
            fileName,
            stack: normalizedError.stack,
        });
        throw normalizedError;
    }
}

/**
 * Ensures a backup payload is safe to apply on the current runtime.
 */
export function validateDatabaseBackupPayload(
    payload: Pick<DatabaseBackupResult, "buffer" | "metadata">,
    options: DatabaseBackupValidationOptions = {}
): void {
    const { buffer, metadata } = payload;
    const { maxSizeBytes = DEFAULT_MAX_BACKUP_SIZE_BYTES } = options;

    if (metadata.sizeBytes !== buffer.byteLength) {
        throw new Error(
            `Backup size metadata mismatch: expected ${metadata.sizeBytes} bytes but received ${buffer.byteLength}`
        );
    }

    // Schema version compatibility policy:
    // - Older backups are allowed to exist and be transported (downloaded/uploaded).
    // - Applying/restoring a backup is responsible for enforcing strict
    //   compatibility.
    // This keeps remote backup history usable across app upgrades.
    if (metadata.schemaVersion > DATABASE_SCHEMA_VERSION) {
        throw new Error(
            `Backup schema version ${metadata.schemaVersion} is newer than current version ${DATABASE_SCHEMA_VERSION}`
        );
    }

    if (metadata.sizeBytes > maxSizeBytes) {
        throw new Error(
            `Backup size ${metadata.sizeBytes} exceeds maximum allowed ${maxSizeBytes}`
        );
    }

    const computedChecksum = computeBackupChecksum(buffer);
    if (metadata.checksum !== computedChecksum) {
        throw new Error("Backup checksum mismatch; payload may be corrupted");
    }
}
