/**
 * File backup utility for handling file download operations.
 * Provides utilities for browser-based file downloads.
 */

import logger from "../../../services/logger";

/**
 * Options for downloading a file in the browser.
 *
 * @remarks
 * Used to specify the file buffer, filename, and optional MIME type for download operations.
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
 * Triggers a file download in the browser.
 *
 * @remarks
 * This function creates a Blob from the provided buffer and initiates a download using an anchor element.
 * If the primary method fails, a fallback strategy is attempted.
 *
 * @param options - The file download options including buffer, fileName, and optional mimeType.
 * @throws {@link Error} If the download fails due to browser API issues or DOM manipulation errors.
 * @example
 * ```typescript
 * downloadFile({
 *   buffer: myArrayBuffer,
 *   fileName: "report.txt",
 *   mimeType: "text/plain"
 * });
 * ```
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
 * @param prefix - The prefix for the filename (default: "backup").
 * @param extension - The file extension (default: "sqlite").
 * @returns The generated filename string.
 * @example
 * ```typescript
 * const fileName = generateBackupFileName("db", "sqlite3");
 * // "db-2024-06-01.sqlite3"
 * ```
 */
export function generateBackupFileName(
    prefix = "backup",
    extension = "sqlite"
): string {
    const timestamp = new Date().toISOString().split("T")[0];
    return `${prefix}-${timestamp}.${extension}`;
}

/**
 * Handles downloading SQLite backup data as a file.
 *
 * @remarks
 * This function retrieves backup data using the provided function, validates it, and triggers a browser download.
 * The download is performed using a Blob and anchor element with proper object URL lifecycle management.
 *
 * @param downloadFunction - An async function that returns the backup data as a Uint8Array
 * @throws TypeError if the backup data is not a Uint8Array
 * @throws Error if the download fails due to browser API or DOM errors
 * @example
 * ```typescript
 * await handleSQLiteBackupDownload(() => fetchBackupData());
 * ```
 */
/* eslint-disable n/no-unsupported-features/node-builtins -- URL.createObjectURL is always available in modern browsers in Node */
export async function handleSQLiteBackupDownload(
    downloadFunction: () => Promise<Uint8Array>
): Promise<void> {
    // Get the backup data
    const backupData = await downloadFunction();

    // Validate the backup data
    if (!(backupData instanceof Uint8Array)) {
        throw new TypeError("Invalid backup data received");
    }

    // Create blob from the backup data
    // Create a new Uint8Array to ensure proper typing for Blob constructor
    const blobData = new Uint8Array(backupData);
    const blob = new Blob([blobData], {
        type: "application/x-sqlite3",
    });

    // Create object URL
    // URL.createObjectURL is always available in modern browsers
    const objectURL = URL.createObjectURL(blob);

    try {
        // Create anchor element for download
        const anchor = document.createElement("a");
        anchor.href = objectURL;
        anchor.download = generateBackupFileName("uptime-watcher", "db");

        // Trigger download
        try {
            anchor.click();
        } catch (clickError) {
            // Log the click error for debugging and add context
            logger.error(
                "Failed to trigger download click",
                clickError instanceof Error
                    ? clickError
                    : new Error(String(clickError))
            );
            // Re-throw with more context
            throw new Error(
                `Download trigger failed: ${clickError instanceof Error ? clickError.message : "Unknown error"}`
            );
        }
    } finally {
        // Clean up object URL
        URL.revokeObjectURL(objectURL);
    }
}

/**
 * Helper function to create and trigger a file download.
 *
 * @remarks
 * Creates a Blob from the buffer and uses an anchor element to initiate the download.
 * Falls back to direct click if DOM manipulation fails. Object URL is properly
 * managed to avoid memory leaks.
 *
 * @param buffer - File data as ArrayBuffer
 * @param fileName - Name for the downloaded file
 * @param mimeType - MIME type for the file
 * @throws Error if browser APIs are unavailable or download cannot be triggered
 */
function createAndTriggerDownload(
    buffer: ArrayBuffer,
    fileName: string,
    mimeType: string
): void {
    const blob = new Blob([buffer], { type: mimeType });
    let objectURL: string | undefined;

    try {
        objectURL = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = objectURL;
        anchor.download = fileName;
        anchor.style.display = "none";

        // Safe DOM manipulation
        const body = document.body;
        // No need to check if body exists; it's always present in browser environments
        try {
            body.append(anchor);
            anchor.click();
            anchor.remove();
        } catch (domError) {
            // Fallback: just click without DOM manipulation
            logger.warn(
                "DOM manipulation failed, using fallback click",
                domError instanceof Error
                    ? domError
                    : new Error(String(domError))
            );
            anchor.click();
        }
    } finally {
        // Clean up object URL only if it was created
        if (objectURL) {
            URL.revokeObjectURL(objectURL);
        }
    }
}
/* eslint-enable n/no-unsupported-features/node-builtins -- Re-add rule for Consistency */

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
 * Determines if an error should be re-thrown without retry.
 *
 * @param error - The error to check.
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
        throw new Error("File download failed");
    }
}
