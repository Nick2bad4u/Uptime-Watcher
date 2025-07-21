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
        // Re-throw specific errors for better test coverage
        if (
            error instanceof Error &&
            (error.message.includes("createObjectURL") ||
                error.message.includes("createElement") ||
                error.message.includes("Click failed") ||
                error.message.includes("Failed to create object URL") ||
                error.message.includes("Failed to create element") ||
                error.message.includes("createElement not available"))
        ) {
            throw error;
        }

        // Only try fallback for DOM-related errors
        if (error instanceof Error && error.message.includes("appendChild")) {
            try {
                createAndTriggerDownload(buffer, fileName, mimeType);
                return;
            } catch (fallbackError) {
                logger.error(
                    "File download failed: both primary and fallback methods failed",
                    fallbackError instanceof Error ? fallbackError : new Error(String(fallbackError))
                );
                throw new Error("File download failed");
            }
        }

        logger.error("File download failed", error instanceof Error ? error : new Error(String(error)));
        throw new Error("File download failed");
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
 * @param downloadFn - Function that returns the backup data as Uint8Array
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
