/**
 * File backup utility for handling file download operations. Provides utilities
 * for browser-based file downloads.
 *
 * @packageDocumentation
 */

import type { SerializedDatabaseBackupMetadata } from "@shared/types/databaseBackup";
import type { SerializedDatabaseBackupResult } from "@shared/types/ipc";

import { isRecord as isSharedRecord } from "@shared/utils/typeHelpers";

import { logger } from "../../../services/logger";
import { isPlaywrightAutomation } from "../../../utils/environment";

/**
 * Creates an object URL for the provided blob and guarantees cleanup.
 */
function withObjectUrl(blob: Blob, run: (objectURL: string) => void): void {
    const objectURL = URL.createObjectURL(blob);
    try {
        run(objectURL);
    } finally {
        URL.revokeObjectURL(objectURL);
    }
}

function createDownloadAnchor(objectURL: string, fileName: string): HTMLAnchorElement {
    const anchor = document.createElement("a");
    anchor.href = objectURL;
    anchor.download = fileName;
    return anchor;
}

function clickDownloadAnchor(anchor: HTMLAnchorElement, attachToDom: boolean): void {
    if (!attachToDom) {
        anchor.click();
        return;
    }

    anchor.style.display = "none";

    const { body } = document;
    try {
        body.append(anchor);
        anchor.click();
        anchor.remove();
    } catch (domError) {
        const error = domError instanceof Error ? domError : new Error(String(domError));

        // For appendChild errors, re-throw to trigger proper fallback mechanism.
        if (error.message.includes("appendChild")) {
            throw error;
        }

        // For other DOM errors, use simple fallback.
        logger.warn("DOM manipulation failed, using fallback click", error);
        anchor.click();
    }
}

/**
 * Options for downloading a file in the browser.
 *
 * @remarks
 * Used to specify the file buffer, filename, and optional MIME type for
 * download operations.
 *
 * @public
 */
export interface FileDownloadOptions {
    /** The file buffer to download */
    buffer: ArrayBuffer;
    /** The filename for the download */
    fileName: string;
    /** The MIME type of the file */
    mimeType?: string;
}

/**
 * Helper function to create and trigger a file download.
 *
 * @remarks
 * Creates a Blob from the buffer and uses an anchor element to initiate the
 * download. Falls back to direct click if DOM manipulation fails. Object URL is
 * properly managed to avoid memory leaks.
 *
 * @param buffer - File data as ArrayBuffer
 * @param fileName - Name for the downloaded file
 * @param mimeType - MIME type for the file
 *
 * @throws Error if browser APIs are unavailable or download cannot be triggered
 */
function createAndTriggerDownload(
    buffer: ArrayBuffer,
    fileName: string,
    mimeType: string
): void {
    const blob = new Blob([buffer], { type: mimeType });

    withObjectUrl(blob, (objectURL) => {
        const anchor = createDownloadAnchor(objectURL, fileName);
        clickDownloadAnchor(anchor, true);
    });
}

/**
 * Determines if an error should be re-thrown without retry.
 *
 * @param error - The error to check.
 *
 * @returns True if the error should be re-thrown, false otherwise.
 */
function shouldRethrowError(error: Error): boolean {
    const rethrownErrorMessages = [
        "createObjectURL",
        "createElement",
        "Click failed",
        "Failed to create object URL",
        "Failed to create element",
        "createElement not available",
    ];

    return rethrownErrorMessages.some((message) =>
        error.message.includes(message)
    );
}

/**
 * Attempts a fallback download method if the primary method fails.
 *
 * @param buffer - The file buffer.
 * @param fileName - The filename.
 * @param mimeType - The MIME type.
 *
 * @throws {@link Error} If both primary and fallback methods fail.
 */
function tryFallbackDownload(
    buffer: ArrayBuffer,
    fileName: string,
    mimeType: string
): void {
    try {
        createAndTriggerDownload(buffer, fileName, mimeType);
    } catch (fallbackError) {
        logger.error(
            "File download failed: both primary and fallback methods failed",
            fallbackError instanceof Error
                ? fallbackError
                : new Error(String(fallbackError))
        );
        throw new Error("File download failed", { cause: fallbackError });
    }
}

/**
 * Handles download errors and applies fallback strategies if possible.
 *
 * @remarks
 * Logs errors and attempts fallback download for DOM-related issues.
 *
 * @param error - The error encountered during download.
 * @param buffer - The file buffer.
 * @param fileName - The filename.
 * @param mimeType - The MIME type.
 *
 * @throws {@link Error} Always throws after logging and attempting fallback.
 */
function handleDownloadError(
    error: unknown,
    buffer: ArrayBuffer,
    fileName: string,
    mimeType: string
): void {
    if (!(error instanceof Error)) {
        logger.error("File download failed", new Error(String(error)));
        throw new Error("File download failed");
    }

    // Re-throw specific errors that should not be retried
    if (shouldRethrowError(error)) {
        throw error;
    }

    // Try fallback for DOM-related errors
    if (error.message.includes("appendChild")) {
        tryFallbackDownload(buffer, fileName, mimeType);
        return;
    }

    logger.error("File download failed", error);
    throw new Error("File download failed");
}

/**
 * Triggers a file download in the browser.
 *
 * @remarks
 * This function creates a Blob from the provided buffer and initiates a
 * download using an anchor element. If the primary method fails, a fallback
 * strategy is attempted.
 *
 * @example
 *
 * ```typescript
 * downloadFile({
 *     buffer: myArrayBuffer,
 *     fileName: "report.txt",
 *     mimeType: "text/plain",
 * });
 * ```
 *
 * @param options - The file download options including buffer, fileName, and
 *   optional mimeType.
 *
 * @throws {@link Error} If the download fails due to browser API issues or DOM
 *   manipulation errors.
 *
 * @public
 */
export function downloadFile(options: FileDownloadOptions): void {
    const { buffer, fileName, mimeType = "application/octet-stream" } = options;

    try {
        createAndTriggerDownload(buffer, fileName, mimeType);
    } catch (error) {
        handleDownloadError(error, buffer, fileName, mimeType);
    }
}

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
 *
 * @public
 */
export function generateBackupFileName(
    prefix = "backup",
    extension = "sqlite"
): string {
    const [timestamp] = new Date().toISOString().split("T");
    return `${prefix}-${timestamp}.${extension}`;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
    isSharedRecord(value);

/**
 * Type guard ensuring a value matches {@link SerializedDatabaseBackupResult}.
 */
function isSerializedDatabaseBackupResult(
    value: unknown
): value is SerializedDatabaseBackupResult {
    if (!isRecord(value)) {
        return false;
    }

    const bufferCandidate = value["buffer"];
    if (!(bufferCandidate instanceof ArrayBuffer)) {
        return false;
    }

    const fileNameCandidate = value["fileName"];
    if (typeof fileNameCandidate !== "string") {
        return false;
    }

    const metadataCandidate = value["metadata"];
    if (!isRecord(metadataCandidate)) {
        return false;
    }

    const {
        appVersion,
        checksum,
        createdAt,
        originalPath,
        retentionHintDays,
        schemaVersion,
        sizeBytes,
    } = metadataCandidate as Partial<SerializedDatabaseBackupMetadata>;

    return (
        typeof appVersion === "string" &&
        typeof checksum === "string" &&
        typeof createdAt === "number" &&
        Number.isFinite(createdAt) &&
        typeof originalPath === "string" &&
        typeof retentionHintDays === "number" &&
        Number.isFinite(retentionHintDays) &&
        typeof schemaVersion === "number" &&
        Number.isFinite(schemaVersion) &&
        typeof sizeBytes === "number" &&
        Number.isFinite(sizeBytes) &&
        sizeBytes >= 0 &&
        sizeBytes === bufferCandidate.byteLength
    );
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
    const backupResult = await downloadFunction();

    if (!isSerializedDatabaseBackupResult(backupResult)) {
        throw new TypeError("Invalid backup data received");
    }

    if (isPlaywrightAutomation()) {
        const automationTarget = globalThis as typeof globalThis & {
            playwrightLastBackup?: SerializedDatabaseBackupResult;
        };
        automationTarget.playwrightLastBackup = backupResult;
        const metadataSizeBytes = Number.isFinite(
            backupResult.metadata.sizeBytes
        )
            ? backupResult.metadata.sizeBytes
            : backupResult.buffer.byteLength;
        logger.info("SQLite backup captured in automation mode", {
            fileName: backupResult.fileName,
            sizeBytes: metadataSizeBytes,
        });
        return backupResult;
    }

    const trimmedFileName = backupResult.fileName.trim();
    const normalizedFileName =
        trimmedFileName.length > 0
            ? trimmedFileName
            : generateBackupFileName("uptime-watcher", "db");

    // Create blob from the backup data using a fresh typed array view
    const blobData = new Uint8Array(backupResult.buffer);
    const blob = new Blob([blobData], {
        type: "application/x-sqlite3",
    });

    withObjectUrl(blob, (objectURL) => {
        const anchor = createDownloadAnchor(objectURL, normalizedFileName);

        try {
            clickDownloadAnchor(anchor, false);
        } catch (clickError) {
            logger.error(
                "Failed to trigger download click",
                clickError instanceof Error
                    ? clickError
                    : new Error(String(clickError))
            );

            throw new Error(
                `Download trigger failed: ${clickError instanceof Error ? clickError.message : String(clickError)}`,
                { cause: clickError }
            );
        }
    });

    return backupResult;
}
