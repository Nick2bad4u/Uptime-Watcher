/**
 * File backup utility for handling file download operations. Provides utilities
 * for browser-based file downloads.
 *
 * @packageDocumentation
 */

import type { SerializedDatabaseBackupResult } from "@shared/types/ipc";

import { isWindowsReservedFileBasename } from "@shared/utils/fileNameSafety";
import { normalizePathSeparatorsToPosix } from "@shared/utils/pathSeparators";
import { hasAsciiControlCharacters } from "@shared/utils/stringSafety";
import { getUserFacingErrorDetail } from "@shared/utils/userFacingErrors";
import { stringSplit } from "ts-extras";

import { logger } from "../../../services/logger";
import { triggerBlobDownload } from "../../../utils/downloads/browserFileDownload";
import { parseSerializedDatabaseBackupResult } from "../../../utils/downloads/serializedBackupResult";
import { isPlaywrightAutomation } from "../../../utils/environment";

const DEFAULT_BACKUP_FILE_NAME_PREFIX = "backup";
const DEFAULT_BACKUP_FILE_NAME_EXTENSION = "sqlite";

const WINDOWS_RESERVED_FILE_NAME_CHARACTERS = new Set([
    '"',
    "*",
    ":",
    "<",
    ">",
    "?",
    "|",
]);

/**
 * Generates a default backup filename with a timestamp.
 *
 * @remarks
 * The filename is formatted as `${prefix}-${YYYY-MM-DD}.${extension}`.
 *
 * @example
 *
 * ```typescript
 * const fileName = generateBackupFileName("db", "sqlite3");
 * // "db-2024-06-01.sqlite3"
 * ```
 *
 * @param prefix - The prefix for the filename (default: "backup").
 * @param extension - The file extension (default: "sqlite").
 *
 * @returns The generated filename string.
 */
function generateBackupFileName(
    prefix: string = DEFAULT_BACKUP_FILE_NAME_PREFIX,
    extension: string = DEFAULT_BACKUP_FILE_NAME_EXTENSION
): string {
    const [timestamp] = stringSplit(new Date().toISOString(), "T");
    const generatedFileName = `${prefix}-${timestamp}.${extension}`;
    const fallbackFileName = `${DEFAULT_BACKUP_FILE_NAME_PREFIX}-${timestamp}.${DEFAULT_BACKUP_FILE_NAME_EXTENSION}`;

    return normalizeDownloadFileName(generatedFileName, fallbackFileName);
}

function hasReservedFileNameCharacter(fileName: string): boolean {
    for (const character of fileName) {
        if (WINDOWS_RESERVED_FILE_NAME_CHARACTERS.has(character)) {
            return true;
        }
    }

    return false;
}

function isWindowsReservedFileName(fileName: string): boolean {
    const [baseName] = stringSplit(fileName, ".");
    return isWindowsReservedFileBasename(baseName ?? "");
}

function normalizeDownloadFileName(
    fileName: string,
    fallbackFileName: string
): string {
    const trimmedFileName = fileName.trim();

    if (
        trimmedFileName.length === 0 ||
        trimmedFileName === "." ||
        trimmedFileName === ".." ||
        trimmedFileName.endsWith(".") ||
        hasAsciiControlCharacters(trimmedFileName) ||
        hasReservedFileNameCharacter(trimmedFileName) ||
        isWindowsReservedFileName(trimmedFileName) ||
        normalizePathSeparatorsToPosix(trimmedFileName).includes("/")
    ) {
        return fallbackFileName;
    }

    return trimmedFileName;
}

/**
 * Handles downloading SQLite backup data as a file.
 *
 * @remarks
 * This function retrieves backup data using the provided function, validates
 * it, and triggers a browser download. The download is performed using a Blob
 * and anchor element with proper object URL lifecycle management.
 *
 * @example
 *
 * ```typescript
 * await handleSQLiteBackupDownload(() => fetchBackupData());
 * ```
 *
 * @param downloadFunction - Async function resolving to a serialized backup
 *   payload from the Electron main process.
 *
 * @throws TypeError if the backup data fails validation.
 * @throws Error if the download fails due to browser API or DOM errors.
 *
 * @public
 */
export async function handleSQLiteBackupDownload(
    downloadFunction: () => Promise<SerializedDatabaseBackupResult>
): Promise<SerializedDatabaseBackupResult> {
    const backupResult = parseSerializedDatabaseBackupResult(
        await downloadFunction()
    );
    const normalizedFileName = normalizeDownloadFileName(
        backupResult.fileName,
        generateBackupFileName("uptime-watcher", "db")
    );
    const normalizedBackupResult =
        normalizedFileName === backupResult.fileName
            ? backupResult
            : {
                  ...backupResult,
                  fileName: normalizedFileName,
              };

    if (isPlaywrightAutomation()) {
        Reflect.set(globalThis, "playwrightLastBackup", normalizedBackupResult);
        logger.info("SQLite backup captured in automation mode", {
            fileName: normalizedBackupResult.fileName,
            sizeBytes: normalizedBackupResult.metadata.sizeBytes,
        });
        return normalizedBackupResult;
    }

    // Create blob from the backup data using a fresh typed array view
    const blobData = new Uint8Array(normalizedBackupResult.buffer);
    const blob = new Blob([blobData], {
        type: "application/x-sqlite3",
    });

    try {
        triggerBlobDownload({
            attachToDom: false,
            blob,
            fileName: normalizedFileName,
        });
    } catch (clickError) {
        const normalizedClickError = Error.isError(clickError)
            ? clickError
            : new Error(getUserFacingErrorDetail(clickError));

        logger.error("Failed to trigger download click", normalizedClickError);

        throw new Error(
            `Download trigger failed: ${getUserFacingErrorDetail(clickError)}`,
            { cause: clickError }
        );
    }

    return normalizedBackupResult;
}
