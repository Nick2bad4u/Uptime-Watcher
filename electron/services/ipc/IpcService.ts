import { ipcMain } from "electron";

import { UptimeMonitor } from "../../uptimeMonitor";
import { isDev } from "../../utils";
import { logger } from "../../utils/logger";
import { AutoUpdaterService } from "../updater/AutoUpdaterService";

/**
 * Service responsible for organizing and handling IPC communication.
 * Groups IPC handlers by domain for better maintainability.
 */
export class IpcService {
    private readonly uptimeMonitor: UptimeMonitor;
    private readonly autoUpdaterService: AutoUpdaterService;

    constructor(uptimeMonitor: UptimeMonitor, autoUpdaterService: AutoUpdaterService) {
        this.uptimeMonitor = uptimeMonitor;
        this.autoUpdaterService = autoUpdaterService;
    }

    /**
     * Setup all IPC handlers organized by domain.
     */
    public setupHandlers(): void {
        this.setupSiteHandlers();
        this.setupMonitoringHandlers();
        this.setupDataHandlers();
        this.setupSystemHandlers();
    }

    /**
     * Setup site management IPC handlers.
     */
    private setupSiteHandlers(): void {
        ipcMain.handle("add-site", async (_, site) => {
            if (isDev()) logger.debug("[IpcService] Handling add-site");
            return this.uptimeMonitor.addSite(site);
        });

        ipcMain.handle("remove-site", async (_, identifier) => {
            if (isDev()) logger.debug("[IpcService] Handling remove-site", { identifier });
            return this.uptimeMonitor.removeSite(identifier);
        });

        ipcMain.handle("get-sites", async () => {
            if (isDev()) logger.debug("[IpcService] Handling get-sites");
            return this.uptimeMonitor.getSites();
        });

        ipcMain.handle("update-site", async (_, identifier, updates) => {
            if (isDev()) logger.debug("[IpcService] Handling update-site", { identifier });
            return this.uptimeMonitor.updateSite(identifier, updates);
        });
    }

    /**
     * Setup monitoring control IPC handlers.
     */
    private setupMonitoringHandlers(): void {
        ipcMain.handle("start-monitoring", async () => {
            if (isDev()) logger.debug("[IpcService] Handling start-monitoring");
            this.uptimeMonitor.startMonitoring();
            return true;
        });

        ipcMain.handle("stop-monitoring", async () => {
            if (isDev()) logger.debug("[IpcService] Handling stop-monitoring");
            this.uptimeMonitor.stopMonitoring();
            return true;
        });

        ipcMain.handle("start-monitoring-for-site", async (_, identifier, monitorType) => {
            if (isDev())
                /* v8 ignore next 3 */ logger.debug("[IpcService] Handling start-monitoring-for-site", {
                    identifier,
                    monitorType,
                });
            return this.uptimeMonitor.startMonitoringForSite(identifier, monitorType);
        });

        ipcMain.handle("stop-monitoring-for-site", async (_, identifier, monitorType) => {
            if (isDev())
                /* v8 ignore next 3 */ logger.debug("[IpcService] Handling stop-monitoring-for-site", {
                    identifier,
                    monitorType,
                });
            return this.uptimeMonitor.stopMonitoringForSite(identifier, monitorType);
        });

        ipcMain.handle("check-site-now", async (_, identifier, monitorType) => {
            if (isDev()) logger.debug("[IpcService] Handling check-site-now", { identifier, monitorType });
            return this.uptimeMonitor.checkSiteManually(identifier, monitorType);
        });
    }

    /**
     * Setup data management IPC handlers.
     */
    private setupDataHandlers(): void {
        ipcMain.handle("export-data", async () => {
            if (isDev()) logger.debug("[IpcService] Handling export-data");
            return this.uptimeMonitor.exportData();
        });

        ipcMain.handle("import-data", async (_, data) => {
            if (isDev()) logger.debug("[IpcService] Handling import-data");
            return this.uptimeMonitor.importData(data);
        });

        ipcMain.handle("update-history-limit", async (_, limit) => {
            if (isDev()) logger.debug("[IpcService] Handling update-history-limit", { limit });
            return this.uptimeMonitor.setHistoryLimit(limit);
        });

        ipcMain.handle("get-history-limit", async () => {
            if (isDev()) logger.debug("[IpcService] Handling get-history-limit");
            return this.uptimeMonitor.getHistoryLimit();
        });

        // Direct SQLite backup download
        ipcMain.handle("download-sqlite-backup", async () => {
            if (isDev()) logger.debug("[IpcService] Handling download-sqlite-backup");
            try {
                // Delegate to uptimeMonitor which should handle this through services
                return await this.uptimeMonitor.downloadBackup();
            } catch (error) {
                logger.error("[IpcService] Failed to download SQLite backup", error);
                const message = error instanceof Error ? error.message : String(error);
                throw new Error("Failed to download SQLite backup: " + message);
            }
        });
    }

    /**
     * Setup system-level IPC handlers.
     */
    private setupSystemHandlers(): void {
        ipcMain.on("quit-and-install", () => {
            logger.info("[IpcService] Handling quit-and-install");
            this.autoUpdaterService.quitAndInstall();
        });
    }

    /**
     * Remove all IPC listeners (cleanup).
     */
    public cleanup(): void {
        logger.info("[IpcService] Cleaning up IPC handlers");
        ipcMain.removeAllListeners();
    }
}
