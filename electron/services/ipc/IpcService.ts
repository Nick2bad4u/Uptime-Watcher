import { ipcMain, BrowserWindow } from "electron";

import { isDev } from "../../electronUtils";
import { UptimeOrchestrator } from "../../index";
import { logger } from "../../utils/index";
import { AutoUpdaterService } from "../updater/index";
import { Site } from "../../types";
import { getAllMonitorTypeConfigs, validateMonitorData, getMonitorTypeConfig } from "../monitoring/MonitorTypeRegistry";

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
     * - `format-monitor-detail`: Format monitor detail strings using backend functions
     * - `format-monitor-title-suffix`: Format monitor title suffixes using backend functions
     * - `validate-monitor-data`: Validate monitor configuration data
     */
    private setupMonitorTypeHandlers(): void {
        ipcMain.handle("get-monitor-types", () => {
            if (isDev()) logger.debug("[IpcService] Handling get-monitor-types");

            try {
                // Get all monitor type configs and serialize them safely for IPC
                const configs = getAllMonitorTypeConfigs();
                return configs.map((config) => this.serializeMonitorTypeConfig(config));
            } catch (error) {
                logger.error("[IpcService] Failed to get monitor types", error);
                throw new Error("Failed to retrieve monitor type configurations");
            }
        });

        ipcMain.handle("format-monitor-detail", (_, type: string, details: string) => {
            if (isDev()) logger.debug("[IpcService] Handling format-monitor-detail", { type, details });

            try {
                // Input validation
                if (typeof type !== "string" || !type.trim()) {
                    throw new TypeError("Invalid monitor type provided");
                }
                if (typeof details !== "string") {
                    throw new TypeError("Invalid details provided");
                }

                const config = getMonitorTypeConfig(type.trim());
                if (!config) {
                    logger.warn("[IpcService] Unknown monitor type for detail formatting", { type });
                    return details; // Return original details if type is unknown
                }

                if (config.uiConfig?.formatDetail) {
                    return config.uiConfig.formatDetail(details);
                }

                return details;
            } catch (error) {
                logger.error("[IpcService] Failed to format monitor detail", { type, details, error });
                return details; // Return original details on error
            }
        });

        ipcMain.handle("format-monitor-title-suffix", (_, type: string, monitor: Record<string, unknown>) => {
            if (isDev()) logger.debug("[IpcService] Handling format-monitor-title-suffix", { type, monitor });

            try {
                // Input validation
                if (typeof type !== "string" || !type.trim()) {
                    throw new TypeError("Invalid monitor type provided");
                }
                // monitor is already typed as Record<string, unknown>, so basic validation is sufficient

                const config = getMonitorTypeConfig(type.trim());
                if (!config) {
                    logger.warn("[IpcService] Unknown monitor type for title suffix formatting", { type });
                    return ""; // Return empty string if type is unknown
                }

                if (config.uiConfig?.formatTitleSuffix) {
                    return config.uiConfig.formatTitleSuffix(monitor);
                }

                return "";
            } catch (error) {
                logger.error("[IpcService] Failed to format monitor title suffix", { type, monitor, error });
                return ""; // Return empty string on error
            }
        });

        ipcMain.handle("validate-monitor-data", (_, type: string, data: unknown) => {
            if (isDev()) logger.debug("[IpcService] Handling validate-monitor-data", { type, data });

            try {
                // Input validation
                if (typeof type !== "string" || !type.trim()) {
                    return {
                        success: false,
                        errors: ["Invalid monitor type provided"],
                        warnings: [],
                        metadata: {},
                    };
                }

                // Use the validation function from the registry
                const result = validateMonitorData(type.trim(), data);
                return {
                    success: result.success,
                    errors: result.errors,
                    warnings: [], // Basic validation doesn't have warnings
                    metadata: {}, // Basic validation doesn't have metadata
                };
            } catch (error) {
                logger.error("[IpcService] Failed to validate monitor data", { type, data, error });
                return {
                    success: false,
                    errors: ["Validation failed due to internal error"],
                    warnings: [],
                    metadata: {},
                };
            }
        });
    }

    /**
     * Safely serialize a monitor type configuration for IPC transmission.
     * Excludes non-serializable data while preserving all useful information.
     *
     * @param config - The monitor type configuration to serialize
     * @returns Serializable configuration object
     */
    private serializeMonitorTypeConfig(config: ReturnType<typeof getAllMonitorTypeConfigs>[0]) {
        // Extract and validate base properties
        const {
            type,
            displayName,
            description,
            version,
            fields,
            uiConfig,
            // Explicitly exclude non-serializable properties
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            validationSchema: _,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            serviceFactory: __,
            ...unexpectedProperties
        } = config;

        // Log if there are unexpected properties (helps with future maintenance)
        if (Object.keys(unexpectedProperties).length > 0) {
            logger.warn("[IpcService] Unexpected properties in monitor config", {
                type,
                unexpectedProperties: Object.keys(unexpectedProperties),
            });
        }

        // Serialize UI configuration with comprehensive property handling
        const serializedUiConfig = uiConfig
            ? {
                  // Feature support flags
                  supportsResponseTime: uiConfig.supportsResponseTime ?? false,
                  supportsAdvancedAnalytics: uiConfig.supportsAdvancedAnalytics ?? false,

                  // Help texts (preserve original structure)
                  helpTexts: uiConfig.helpTexts
                      ? {
                            primary: uiConfig.helpTexts.primary,
                            secondary: uiConfig.helpTexts.secondary,
                        }
                      : undefined,

                  // Display preferences (preserve all flags)
                  display: uiConfig.display
                      ? {
                            showUrl: uiConfig.display.showUrl ?? false,
                            showAdvancedMetrics: uiConfig.display.showAdvancedMetrics ?? false,
                        }
                      : undefined,

                  // Detail formats (include all serializable data)
                  detailFormats: uiConfig.detailFormats
                      ? {
                            analyticsLabel: uiConfig.detailFormats.analyticsLabel,
                            // Note: historyDetail function is excluded (handled via IPC)
                            // Note: formatDetail and formatTitleSuffix functions are excluded (handled via IPC)
                        }
                      : undefined,
              }
            : undefined;

        return {
            type,
            displayName,
            description,
            version,
            fields, // Fields are always present in BaseMonitorConfig
            uiConfig: serializedUiConfig,
        };
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
