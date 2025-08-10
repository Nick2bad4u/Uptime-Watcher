/**
 * Auto-updater service for the Uptime Watcher application.
 * Handles automatic application updates using electron-updater.
 */

import { autoUpdater } from "electron-updater";

import { logger } from "../../utils/logger";

/**
 * Data structure for update status information.
 */
export interface UpdateStatusData {
    error?: string;
    status: UpdateStatus;
}

/**
 * Status of the application update process.
 */
export type UpdateStatus =
    | "available"
    | "checking"
    | "downloaded"
    | "downloading"
    | "error"
    | "idle";

/**
 * Service responsible for handling application auto-updates.
 * Manages update checking, downloading, and installation.
 *
 * @remarks
 * This service wraps electron-updater functionality and provides a clean
 * interface for update management with status callbacks and error handling.
 *
 * Usage pattern:
 * 1. Initialize the service with event listeners
 * 2. Set status callback for UI updates
 * 3. Check for updates periodically
 * 4. Install updates when ready
 */
export class AutoUpdaterService {
    /**
     * Optional callback function for update status changes.
     *
     * @remarks
     * This callback is invoked whenever the update status changes during
     * the update lifecycle. It provides a way for the UI to react to update
     * events without directly coupling to electron-updater events.
     *
     * Lifecycle events include:
     * - checking: Update check initiated
     * - available: Update found and available for download
     * - downloading: Update download in progress
     * - downloaded: Update ready for installation
     * - error: Update process encountered an error
     * - idle: No update activity
     *
     * The callback should handle all status types gracefully and avoid
     * throwing exceptions as this could interfere with the update process.
     */
    private onStatusChange?: (statusData: UpdateStatusData) => void;

    /**
     * Check for updates and notify if available.
     *
     * @returns Promise that resolves when check completes
     *
     * @remarks
     * Initiates an update check using electron-updater. If updates are found,
     * they will be automatically downloaded and the status callback will be
     * notified of progress.
     *
     * Error handling:
     * - Network errors are caught and reported via status callback
     * - Invalid update server responses are handled gracefully
     * - All errors are logged for debugging purposes
     *
     * This method is safe to call multiple times but avoid calling it
     * frequently as it may impact performance and server load.
     */
    public async checkForUpdates(): Promise<void> {
        try {
            await autoUpdater.checkForUpdatesAndNotify();
        } catch (error) {
            logger.error(
                "[AutoUpdaterService] Failed to check for updates",
                error
            );
            this.notifyStatusChange({
                error: error instanceof Error ? error.message : String(error),
                status: "error",
            });
        }
    }

    /**
     * Initialize the auto-updater with event listeners.
     *
     * @returns void
     *
     * @remarks
     * Sets up all necessary event listeners for the update lifecycle.
     * This method should be called once during application startup.
     *
     * Side effects:
     * - Registers event listeners on autoUpdater instance
     * - Enables automatic update notifications
     * - Configures progress tracking and error handling
     *
     * Event listeners registered:
     * - checking-for-update: Update check started
     * - update-available: Update found
     * - update-not-available: No updates found
     * - download-progress: Download progress updates
     * - update-downloaded: Download completed
     * - error: Update process errors
     *
     * Call this method only once per application instance to avoid
     * duplicate event listeners.
     */
    public initialize(): void {
        logger.info("[AutoUpdaterService] Initializing auto-updater");

        autoUpdater.on("checking-for-update", () => {
            logger.debug("[AutoUpdaterService] Checking for updates");
            this.notifyStatusChange({ status: "checking" });
        });

        autoUpdater.on("update-available", (info) => {
            logger.info("[AutoUpdaterService] Update available", info);
            this.notifyStatusChange({ status: "available" });
        });

        autoUpdater.on("update-not-available", (info) => {
            logger.debug("[AutoUpdaterService] No update available", info);
            this.notifyStatusChange({ status: "idle" });
        });

        autoUpdater.on("download-progress", (progressObj) => {
            logger.debug("[AutoUpdaterService] Download progress", {
                bytesPerSecond: progressObj.bytesPerSecond,
                percent: progressObj.percent,
                total: progressObj.total,
                transferred: progressObj.transferred,
            });
            this.notifyStatusChange({ status: "downloading" });
        });

        autoUpdater.on("update-downloaded", (info) => {
            logger.info("[AutoUpdaterService] Update downloaded", info);
            this.notifyStatusChange({ status: "downloaded" });
        });

        autoUpdater.on("error", (error) => {
            logger.error("[AutoUpdaterService] Auto-updater error", error);
            this.notifyStatusChange({
                error: error.message || String(error),
                status: "error",
            });
        });
    }

    /**
     * Quit the application and install the update.
     *
     * @returns void - Method does not return as application terminates
     *
     * @remarks
     * **WARNING: This method will terminate the application immediately.**
     *
     * Preconditions:
     * - An update must be downloaded and ready (status: "downloaded")
     * - All critical application state should be saved before calling
     * - User should be prompted to confirm the action
     *
     * Process:
     * 1. Application quits immediately
     * 2. Update installer launches
     * 3. New version starts after installation
     *
     * This method should only be called when the user has explicitly
     * confirmed they want to install the update and restart the application.
     *
     * @example
     * ```typescript
     * // Proper usage with user confirmation
     * if (updateStatus === "downloaded") {
     *   const userConfirmed = await showUpdateConfirmDialog();
     *   if (userConfirmed) {
     *     await saveApplicationState();
     *     autoUpdaterService.quitAndInstall();
     *   }
     * }
     * ```
     */
    public quitAndInstall(): void {
        logger.info("[AutoUpdaterService] Quitting and installing update");
        autoUpdater.quitAndInstall();
    }

    /**
     * Set the callback for update status changes.
     *
     * @param callback - Function to call when update status changes
     * @returns void
     *
     * @remarks
     * Registers a callback function that will be invoked whenever the update
     * status changes during the update lifecycle.
     *
     * Callback contract:
     * - Must handle all UpdateStatus values gracefully
     * - Should not throw exceptions or perform blocking operations
     * - Will be called from the main process context
     * - May be called multiple times for the same status
     *
     * The callback receives UpdateStatusData containing:
     * - status: Current update status
     * - error: Error message (only present when status is "error")
     *
     * Only one callback can be registered at a time. Calling this method
     * multiple times will replace the previous callback.
     *
     * @example
     * ```typescript
     * autoUpdaterService.setStatusCallback((statusData) => {
     *   switch (statusData.status) {
     *     case "available":
     *       showUpdateAvailableNotification();
     *       break;
     *     case "error":
     *       showUpdateErrorMessage(statusData.error);
     *       break;
     *     // ... handle other statuses
     *   }
     * });
     * ```
     */
    public setStatusCallback(
        callback: (statusData: UpdateStatusData) => void
    ): void {
        this.onStatusChange = callback;
    }

    /**
     * Notify status change callback if set.
     *
     * @param statusData - Update status data to pass to callback
     * @returns void
     *
     * @remarks
     * Internal method for notifying the registered status callback about
     * update status changes. Safely handles cases where no callback is set.
     *
     * This method is called by the event listeners registered in initialize()
     * and provides a centralized point for status change notifications.
     *
     * Error handling:
     * - Gracefully handles undefined callback
     * - Does not catch callback exceptions (callbacks should handle their own errors)
     * - Logs status changes for debugging purposes
     *
     * @internal
     */
    private notifyStatusChange(statusData: UpdateStatusData): void {
        if (this.onStatusChange) {
            this.onStatusChange(statusData);
        }
    }
}
