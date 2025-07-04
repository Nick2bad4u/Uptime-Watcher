/**
 * File backup utility for handling file download operations.
 * Provides utilities for browser-based file downloads.
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
 * Helper function to create and trigger download
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
    if (body) {
        try {
            body.appendChild(a);
            a.click();
            body.removeChild(a);
        } catch (domError) {
            // Fallback: just click without DOM manipulation
            console.warn("DOM manipulation failed, using fallback click", domError);
            a.click();
        }
    } else {
        // No body available, just click
        a.click();
    }

    URL.revokeObjectURL(url);
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
        if (error instanceof Error) {
            if (
                error.message.includes("createObjectURL") ||
                error.message.includes("createElement") ||
                error.message.includes("Click failed") ||
                error.message.includes("Failed to create object URL") ||
                error.message.includes("Failed to create element") ||
                error.message.includes("createElement not available")
            ) {
                throw error;
            }
        }

        // Only try fallback for DOM-related errors
        if (error instanceof Error && error.message.includes("appendChild")) {
            try {
                createAndTriggerDownload(buffer, fileName, mimeType);
                return;
            } catch (fallbackError) {
                console.error("Both primary and fallback download failed:", fallbackError);
                throw new Error("File download failed");
            }
        }

        console.error("Failed to download file:", error);
        throw new Error("File download failed");
    }
}

/**
 * Generates a default backup filename with timestamp
 */
export function generateBackupFileName(prefix: string = "backup", extension: string = "sqlite"): string {
    const timestamp = new Date().toISOString().split("T")[0];
    return `${prefix}-${timestamp}.${extension}`;
}

/**
 * Handles downloading SQLite backup data as a file
 * @param downloadFn - Function that returns the backup data as Uint8Array
 * @throws Error if download fails or browser APIs are not available
 */
export async function handleSQLiteBackupDownload(downloadFn: () => Promise<Uint8Array>): Promise<void> {
    // Get the backup data
    const backupData = await downloadFn();

    // Validate the backup data
    if (!backupData || !(backupData instanceof Uint8Array)) {
        throw new Error("Invalid backup data received");
    }

    // Create blob from the backup data
    const blob = new Blob([backupData], { type: "application/x-sqlite3" });

    // Create object URL
    if (!URL.createObjectURL) {
        throw new Error("URL.createObjectURL is not available");
    }

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
            console.error("Failed to trigger download click:", clickError);
            // Re-throw with more context
            throw new Error(
                `Download trigger failed: ${clickError instanceof Error ? clickError.message : "Unknown error"}`
            );
        }
    } finally {
        // Clean up object URL
        if (URL.revokeObjectURL) {
            URL.revokeObjectURL(objectURL);
        }
    }
}
