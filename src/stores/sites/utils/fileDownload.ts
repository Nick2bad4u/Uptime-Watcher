// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable n/no-unsupported-features/node-builtins -- URL.createObjectURL is always available in modern browsers in Node */
/**
 * File backup utility for handling file download operations.
 * Provides utilities for browser-based file downloads.
 */

import logger from "../../../services/logger";

export interface FileDownloadOptions {
    /** The file buffer to download */
    buffer: ArrayBuffer;
    /** The filename for the download */
    fileName: string;
    /** The MIME type of the file */
    mimeType?: string;
}

/**
 * Triggers a file download in the browser
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
 * Generates a default backup filename with timestamp
 */
export function generateBackupFileName(prefix = "backup", extension = "sqlite"): string {
    const timestamp = new Date().toISOString().split("T")[0];
    return `${prefix}-${timestamp}.${extension}`;
}

/**
 * Handles downloading SQLite backup data as a file
 * @param downloadFunction - Function that returns the backup data as Uint8Array
 * @throws Error if download fails or browser APIs are not available
 */
export async function handleSQLiteBackupDownload(downloadFunction: () => Promise<Uint8Array>): Promise<void> {
    // Get the backup data
    const backupData = await downloadFunction();

    // Validate the backup data
    if (!(backupData instanceof Uint8Array)) {
        throw new TypeError("Invalid backup data received");
    }

    // Create blob from the backup data
    const blob = new Blob([backupData], { type: "application/x-sqlite3" });

    // Create object URL
    // URL.createObjectURL is always available in modern browsers
    const objectURL = URL.createObjectURL(blob);

    try {
        // Create anchor element for download
        const anchor = document.createElement("a");
        anchor.href = objectURL;
        anchor.download = "uptime-watcher-backup.db";

        // Trigger download
        try {
            anchor.click();
        } catch (clickError) {
            // Log the click error for debugging and add context
            logger.error(
                "Failed to trigger download click",
                clickError instanceof Error ? clickError : new Error(String(clickError))
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
 * Helper function to create and trigger download.
 *
 * @param buffer - File data as ArrayBuffer
 * @param fileName - Name for the downloaded file
 * @param mimeType - MIME type for the file
 */
function createAndTriggerDownload(buffer: ArrayBuffer, fileName: string, mimeType: string): void {
    const blob = new Blob([buffer], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.style.display = "none";

    // Safe DOM manipulation
    const body = document.body;
    // No need to check if body exists; it's always present in browser environments
    try {
        body.append(a);
        a.click();
        a.remove();
    } catch (domError) {
        // Fallback: just click without DOM manipulation
        logger.warn(
            "DOM manipulation failed, using fallback click",
            domError instanceof Error ? domError : new Error(String(domError))
        );
        a.click();
    }

    URL.revokeObjectURL(url);
}

/**
 * Handle download errors with appropriate fallback strategies
 */
function handleDownloadError(error: unknown, buffer: ArrayBuffer, fileName: string, mimeType: string): void {
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
 * Check if error should be re-thrown without retry
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

    return rethrownErrorMessages.some((message) => error.message.includes(message));
}

/**
 * Attempt fallback download method
 */
function tryFallbackDownload(buffer: ArrayBuffer, fileName: string, mimeType: string): void {
    try {
        createAndTriggerDownload(buffer, fileName, mimeType);
    } catch (fallbackError) {
        logger.error(
            "File download failed: both primary and fallback methods failed",
            fallbackError instanceof Error ? fallbackError : new Error(String(fallbackError))
        );
        throw new Error("File download failed");
    }
}
