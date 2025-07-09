/**
 * Auto-updater service for the Uptime Watcher application.
 * Handles automatic application updates using electron-updater.
 */

import { autoUpdater } from "electron-updater";

import { logger } from "../../utils/index";

/**
 * Status of the application update process.
 */
export type UpdateStatus = "idle" | "checking" | "available" | "downloading" | "downloaded" | "error";

/**
 * Data structure for update status information.
 */
export interface UpdateStatusData {
    status: UpdateStatus;
    error?: string;
}

/**
 * Service responsible for handling application auto-updates.
 * Manages update checking, downloading, and installation.
 */
export class AutoUpdaterService {
    private onStatusChange?: (statusData: UpdateStatusData) => void;

    /**
     * Set the callback for update status changes.
     */
    public setStatusCallback(callback: (statusData: UpdateStatusData) => void): void {
        this.onStatusChange = callback;
    }

    /**
     * Initialize the auto-updater with event listeners.
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
     * Check for updates and notify if available.
     */
    public async checkForUpdates(): Promise<void> {
        try {
            await autoUpdater.checkForUpdatesAndNotify();
        } catch (error) {
            logger.error("[AutoUpdaterService] Failed to check for updates", error);
            this.notifyStatusChange({
                error: error instanceof Error ? error.message : String(error),
                status: "error",
            });
        }
    }

    /**
     * Quit the application and install the update.
     */
    public quitAndInstall(): void {
        logger.info("[AutoUpdaterService] Quitting and installing update");
        autoUpdater.quitAndInstall();
    }

    /**
     * Notify status change callback if set.
     */
    private notifyStatusChange(statusData: UpdateStatusData): void {
        if (this.onStatusChange) {
            this.onStatusChange(statusData);
        }
    }
}
