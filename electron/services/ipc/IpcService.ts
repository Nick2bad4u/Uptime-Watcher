import { ipcMain, BrowserWindow } from "electron";

import { isDev } from "../../electronUtils";
import { UptimeOrchestrator } from "../../index";
import { logger } from "../../utils/index";
import { AutoUpdaterService } from "../updater/index";
import { Site } from "../../types";
import { getAllMonitorTypeConfigs, validateMonitorData } from "../monitoring/MonitorTypeRegistry";

/**
 * Inter-Process Communication service for Electron main-renderer communication.
 *
 * @remarks
 * Manages all IPC handlers between the main process and renderer processes,
 * organized by functional domains (sites, monitoring, data, system).
 * Provides a secure interface for the frontend to interact with backend services.
 */
export class IpcService {
    private readonly uptimeOrchestrator: UptimeOrchestrator;
    private readonly autoUpdaterService: AutoUpdaterService;

    /**
     * Create a new IPC service instance.
     *
     * @param uptimeOrchestrator - Core orchestrator for monitoring operations
     * @param autoUpdaterService - Service for handling application updates
     */
    constructor(uptimeOrchestrator: UptimeOrchestrator, autoUpdaterService: AutoUpdaterService) {
        this.uptimeOrchestrator = uptimeOrchestrator;
        this.autoUpdaterService = autoUpdaterService;
    }

    /**
     * Initialize all IPC handlers organized by functional domain.
     *
     * @remarks
     * Sets up handlers for:
     * - Site management (CRUD operations)
     * - Monitoring control (start/stop operations)
     * - Data management (import/export/backup)
     * - System operations (updates, quit)
     */
    public setupHandlers(): void {
        this.setupSiteHandlers();
        this.setupMonitoringHandlers();
        this.setupMonitorTypeHandlers();
        this.setupDataHandlers();
        this.setupSystemHandlers();
        this.setupStateSyncHandlers();
    }

    /**
     * Setup IPC handlers for site management operations.
     *
     * @remarks
     * Handles site CRUD operations:
     * - `add-site`: Create new site with monitors
     * - `remove-site`: Delete site and all associated data
     * - `get-sites`: Retrieve all configured sites
     * - `update-site`: Modify existing site configuration
     * - `remove-monitor`: Delete specific monitor from site
     */
    private setupSiteHandlers(): void {
        ipcMain.handle("add-site", async (_, site: Site) => {
            if (isDev()) logger.debug("[IpcService] Handling add-site");
            return this.uptimeOrchestrator.addSite(site);
        });

        ipcMain.handle("remove-site", async (_, identifier: string) => {
            if (isDev()) logger.debug("[IpcService] Handling remove-site", { identifier });
            return this.uptimeOrchestrator.removeSite(identifier);
        });

        ipcMain.handle("get-sites", async () => {
            if (isDev()) logger.debug("[IpcService] Handling get-sites");
            return this.uptimeOrchestrator.getSites();
        });

        ipcMain.handle("update-site", async (_, identifier: string, updates: Partial<Site>) => {
            if (isDev()) logger.debug("[IpcService] Handling update-site", { identifier });
            return this.uptimeOrchestrator.updateSite(identifier, updates);
        });

        ipcMain.handle("remove-monitor", async (_, siteIdentifier: string, monitorId: string) => {
            if (isDev()) logger.debug("[IpcService] Handling remove-monitor", { monitorId, siteIdentifier });
            return this.uptimeOrchestrator.removeMonitor(siteIdentifier, monitorId);
        });
    }

    /**
     * Setup IPC handlers for monitoring control operations.
     *
     * @remarks
     * Handles monitoring lifecycle operations:
     * - `start-monitoring`: Begin monitoring all configured sites
     * - `stop-monitoring`: Stop all monitoring activities
     * - `start-monitoring-for-site`: Start monitoring specific site/monitor
     * - `stop-monitoring-for-site`: Stop monitoring specific site/monitor
     * - `check-site-now`: Perform immediate manual check
     */
    private setupMonitoringHandlers(): void {
        ipcMain.handle("start-monitoring", async () => {
            if (isDev()) logger.debug("[IpcService] Handling start-monitoring");
            await this.uptimeOrchestrator.startMonitoring();
            return true;
        });

        ipcMain.handle("stop-monitoring", async () => {
            if (isDev()) logger.debug("[IpcService] Handling stop-monitoring");
            await this.uptimeOrchestrator.stopMonitoring();
            return true;
        });

        ipcMain.handle("start-monitoring-for-site", async (_, identifier: string, monitorId?: string) => {
            if (isDev())
                logger.debug("[IpcService] Handling start-monitoring-for-site", {
                    identifier,
                    monitorId,
                });
            return this.uptimeOrchestrator.startMonitoringForSite(identifier, monitorId);
        });

        ipcMain.handle("stop-monitoring-for-site", async (_, identifier: string, monitorId?: string) => {
            if (isDev())
                logger.debug("[IpcService] Handling stop-monitoring-for-site", {
                    identifier,
                    monitorId,
                });
            return this.uptimeOrchestrator.stopMonitoringForSite(identifier, monitorId);
        });

        ipcMain.handle("check-site-now", async (_, identifier: string, monitorId: string) => {
            if (isDev()) logger.debug("[IpcService] Handling check-site-now", { identifier, monitorId });

            // Runtime validation for type safety
            if (typeof identifier !== "string") {
                throw new TypeError("Invalid site identifier");
            }

            if (typeof monitorId !== "string") {
                throw new TypeError("Invalid monitor ID");
            }

            return this.uptimeOrchestrator.checkSiteManually(identifier, monitorId);
        });
    }

    /**
     * Setup IPC handlers for data management operations.
     *
     * @remarks
     * Handles data persistence and backup operations:
     * - `export-data`: Export all configuration and history as JSON
     * - `import-data`: Import configuration from JSON data
     * - `update-history-limit`: Configure history retention policy
     * - `get-history-limit`: Retrieve current history retention setting
     * - `download-sqlite-backup`: Create and download database backup
     */
    private setupDataHandlers(): void {
        ipcMain.handle("export-data", async () => {
            if (isDev()) logger.debug("[IpcService] Handling export-data");
            return this.uptimeOrchestrator.exportData();
        });

        ipcMain.handle("import-data", async (_, data: string) => {
            if (isDev()) logger.debug("[IpcService] Handling import-data");
            return this.uptimeOrchestrator.importData(data);
        });

        ipcMain.handle("update-history-limit", async (_, limit: number) => {
            if (isDev()) logger.debug("[IpcService] Handling update-history-limit", { limit });
            return this.uptimeOrchestrator.setHistoryLimit(limit);
        });

        ipcMain.handle("get-history-limit", () => {
            if (isDev()) logger.debug("[IpcService] Handling get-history-limit");
            return this.uptimeOrchestrator.getHistoryLimit();
        });

        ipcMain.handle("download-sqlite-backup", async () => {
            if (isDev()) logger.debug("[IpcService] Handling download-sqlite-backup");
            try {
                return await this.uptimeOrchestrator.downloadBackup();
            } catch (error) {
                logger.error("[IpcService] Failed to download SQLite backup", error);
                const message = error instanceof Error ? error.message : String(error);
                throw new Error("Failed to download SQLite backup: " + message);
            }
        });
    }

    /**
     * Setup IPC handlers for system-level operations.
     *
     * @remarks
     * Handles application lifecycle and system operations:
     * - `quit-and-install`: Quit application and install pending update
     */
    private setupSystemHandlers(): void {
        ipcMain.on("quit-and-install", () => {
            logger.info("[IpcService] Handling quit-and-install");
            this.autoUpdaterService.quitAndInstall();
        });
    }

    /**
     * Setup IPC handlers for state synchronization operations.
     *
     * @remarks
     * Handles:
     * - `request-full-sync`: Manual full state synchronization request
     */
    private setupStateSyncHandlers(): void {
        ipcMain.handle("request-full-sync", async () => {
            logger.debug("[IpcService] Handling request-full-sync");
            try {
                // Get all sites and send to frontend
                const sites = await this.uptimeOrchestrator.getSites();

                // Emit state sync event to all renderer processes
                for (const window of BrowserWindow.getAllWindows()) {
                    window.webContents.send("state-sync-event", {
                        action: "bulk-sync",
                        sites: sites,
                        timestamp: Date.now(),
                    });
                }

                logger.debug("[IpcService] Full sync completed");
                return { success: true };
            } catch (error) {
                logger.error("[IpcService] Failed to perform full sync", error);
                throw error;
            }
        });
    }

    /**
     * Setup IPC handlers for monitor type registry operations.
     *
     * @remarks
     * Handles monitor type metadata operations:
     * - `get-monitor-types`: Get all available monitor type configurations
     */
    private setupMonitorTypeHandlers(): void {
        ipcMain.handle("get-monitor-types", () => {
            if (isDev()) logger.debug("[IpcService] Handling get-monitor-types");

            // Get all monitor type configs and strip out non-serializable data (Zod schemas and functions)
            const configs = getAllMonitorTypeConfigs();
            return configs.map((config) => ({
                type: config.type,
                displayName: config.displayName,
                description: config.description,
                version: config.version,
                fields: config.fields, // This is serializable
                // Serialize uiConfig by excluding functions and keeping only data
                uiConfig: config.uiConfig
                    ? {
                          supportsResponseTime: config.uiConfig.supportsResponseTime,
                          supportsAdvancedAnalytics: config.uiConfig.supportsAdvancedAnalytics,
                          helpTexts: config.uiConfig.helpTexts,
                          display: config.uiConfig.display,
                          detailFormats: config.uiConfig.detailFormats
                              ? {
                                    analyticsLabel: config.uiConfig.detailFormats.analyticsLabel,
                                    // Exclude functions, we'll recreate them on the frontend based on type
                                }
                              : undefined,
                      }
                    : undefined,
                // Exclude validationSchema as it contains Zod objects that can't be serialized
                // Exclude serviceFactory as it contains function references
            }));
        });

        ipcMain.handle("validate-monitor-data", (_, type: string, data: unknown) => {
            if (isDev()) logger.debug("[IpcService] Handling validate-monitor-data", { type, data });

            // Use the basic validation function for form validation
            // The advanced validation is for more complex scenarios
            const result = validateMonitorData(type, data);
            return {
                success: result.success,
                errors: result.errors,
                warnings: [], // Basic validation doesn't have warnings
                metadata: {}, // Basic validation doesn't have metadata
            };
        });
    }

    /**
     * Clean up all IPC listeners.
     *
     * @remarks
     * Removes all registered IPC handlers to prevent memory leaks.
     * Should be called during application shutdown.
     */
    public cleanup(): void {
        logger.info("[IpcService] Cleaning up IPC handlers");
        ipcMain.removeAllListeners();
    }
}
