import { BrowserWindow, ipcMain } from "electron";

import { isDev } from "../../electronUtils";
import { Site } from "../../types";
import { UptimeOrchestrator } from "../../UptimeOrchestrator";
import { logger } from "../../utils/logger";
import { getAllMonitorTypeConfigs, getMonitorTypeConfig, validateMonitorData } from "../monitoring/MonitorTypeRegistry";
import { AutoUpdaterService } from "../updater/AutoUpdaterService";

/**
 * The result structure returned by the validate-monitor-data IPC handler.
 */
interface MonitorValidationResult {
    errors: string[];
    metadata: Record<string, unknown>;
    success: boolean;
    warnings: string[];
}

/**
 * Inter-Process Communication service for Electron main-renderer communication.
 *
 * @remarks
 * Manages all IPC handlers between the main process and renderer processes,
 * organized by functional domains (sites, monitoring, data, system).
 * Provides a secure interface for the frontend to interact with backend services.
 */
export class IpcService {
    private readonly autoUpdaterService: AutoUpdaterService;
    private readonly registeredIpcHandlers = new Set<string>();
    private readonly uptimeOrchestrator: UptimeOrchestrator;

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
     * Clean up all IPC listeners.
     *
     * @remarks
     * Removes all registered IPC handlers to prevent memory leaks.
     * Should be called during application shutdown.
     */
    public cleanup(): void {
        logger.info("[IpcService] Cleaning up IPC handlers");
        for (const channel of this.registeredIpcHandlers) {
            ipcMain.removeHandler(channel);
        }
        // Remove listeners for channels registered with ipcMain.on
        // Currently, only "quit-and-install" is handled here.
        // Note: If you add more ipcMain.on listeners, document and remove them below.
        ipcMain.removeAllListeners("quit-and-install");
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
     * Safely serialize a monitor type configuration for IPC transmission.
     * Excludes non-serializable data while preserving all useful information.
     *
     * @param config - The monitor type configuration to serialize
     * @returns Serializable configuration object
     */
    private serializeMonitorTypeConfig(config: ReturnType<typeof getAllMonitorTypeConfigs>[0]) {
        // Extract and validate base properties
        const {
            description,
            displayName,
            fields,
            // eslint-disable-next-line sonarjs/no-unused-vars
            serviceFactory: _unused1,
            type,
            uiConfig,
            // Explicitly exclude non-serializable properties
            // eslint-disable-next-line sonarjs/no-unused-vars
            validationSchema: _unused2,
            version,
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
                  // Detail formats (include all serializable data)
                  detailFormats: uiConfig.detailFormats
                      ? {
                            analyticsLabel: uiConfig.detailFormats.analyticsLabel,
                            // Note: historyDetail function is excluded (handled via IPC)
                            // Note: formatDetail and formatTitleSuffix functions are excluded (handled via IPC)
                        }
                      : undefined,
                  // Display preferences (preserve all flags)
                  display: uiConfig.display
                      ? {
                            showAdvancedMetrics: uiConfig.display.showAdvancedMetrics ?? false,
                            showUrl: uiConfig.display.showUrl ?? false,
                        }
                      : undefined,

                  // Help texts (preserve original structure)
                  helpTexts: uiConfig.helpTexts
                      ? {
                            primary: uiConfig.helpTexts.primary,
                            secondary: uiConfig.helpTexts.secondary,
                        }
                      : undefined,

                  supportsAdvancedAnalytics: uiConfig.supportsAdvancedAnalytics ?? false,

                  // Feature support flags
                  supportsResponseTime: uiConfig.supportsResponseTime ?? false,
              }
            : undefined;

        return {
            description,
            displayName,
            fields, // Fields are always present in BaseMonitorConfig
            type,
            uiConfig: serializedUiConfig,
            version,
        };
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
        this.registeredIpcHandlers.add("export-data");
        ipcMain.handle("export-data", async () => {
            if (isDev()) logger.debug("[IpcService] Handling export-data");
            return this.uptimeOrchestrator.exportData();
        });

        this.registeredIpcHandlers.add("import-data");
        ipcMain.handle("import-data", async (_, data: string) => {
            if (isDev()) logger.debug("[IpcService] Handling import-data");
            return this.uptimeOrchestrator.importData(data);
        });

        this.registeredIpcHandlers.add("update-history-limit");
        ipcMain.handle("update-history-limit", async (_, limit: number) => {
            if (isDev()) logger.debug("[IpcService] Handling update-history-limit", { limit });
            return this.uptimeOrchestrator.setHistoryLimit(limit);
        });

        this.registeredIpcHandlers.add("get-history-limit");
        ipcMain.handle("get-history-limit", () => {
            if (isDev()) logger.debug("[IpcService] Handling get-history-limit");
            return this.uptimeOrchestrator.getHistoryLimit();
        });

        this.registeredIpcHandlers.add("download-sqlite-backup");
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
        this.registeredIpcHandlers.add("start-monitoring");
        ipcMain.handle("start-monitoring", async () => {
            if (isDev()) logger.debug("[IpcService] Handling start-monitoring");
            await this.uptimeOrchestrator.startMonitoring();
            return true;
        });

        this.registeredIpcHandlers.add("stop-monitoring");
        ipcMain.handle("stop-monitoring", async () => {
            if (isDev()) logger.debug("[IpcService] Handling stop-monitoring");
            await this.uptimeOrchestrator.stopMonitoring();
            return true;
        });

        this.registeredIpcHandlers.add("start-monitoring-for-site");
        ipcMain.handle("start-monitoring-for-site", async (_, identifier: string, monitorId?: string) => {
            if (isDev())
                logger.debug("[IpcService] Handling start-monitoring-for-site", {
                    identifier,
                    monitorId,
                });
            return this.uptimeOrchestrator.startMonitoringForSite(identifier, monitorId);
        });

        this.registeredIpcHandlers.add("stop-monitoring-for-site");
        ipcMain.handle("stop-monitoring-for-site", async (_, identifier: string, monitorId?: string) => {
            if (isDev())
                logger.debug("[IpcService] Handling stop-monitoring-for-site", {
                    identifier,
                    monitorId,
                });
            return this.uptimeOrchestrator.stopMonitoringForSite(identifier, monitorId);
        });

        this.registeredIpcHandlers.add("check-site-now");
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
     * Setup IPC handlers for monitor type registry operations.
     *
     * @remarks
     * Handles monitor type metadata operations:
     * - `get-monitor-types`: Get all available monitor type configurations
     * - `format-monitor-detail`: Format monitor detail strings using backend functions
     * - `format-monitor-title-suffix`: Format monitor title suffixes using backend functions
     * - `validate-monitor-data`: Validate monitor configuration data
     *
     * @returns For `validate-monitor-data`, returns a {@link MonitorValidationResult} object:
     * ```typescript
     * interface MonitorValidationResult {
     *   success: boolean;
     *   errors: string[];
     *   warnings: string[];
     *   metadata: Record<string, unknown>;
     * }
     * ```
     */
    private setupMonitorTypeHandlers(): void {
        this.registeredIpcHandlers.add("get-monitor-types");
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

        this.registeredIpcHandlers.add("format-monitor-detail");
        ipcMain.handle("format-monitor-detail", (_, type: string, details: string) => {
            if (isDev()) logger.debug("[IpcService] Handling format-monitor-detail", { details, type });

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
                logger.error("[IpcService] Failed to format monitor detail", { details, error, type });
                return details; // Return original details on error
            }
        });

        this.registeredIpcHandlers.add("format-monitor-title-suffix");
        ipcMain.handle("format-monitor-title-suffix", (_, type: string, monitor: Record<string, unknown>) => {
            if (isDev()) logger.debug("[IpcService] Handling format-monitor-title-suffix", { monitor, type });

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
                logger.error("[IpcService] Failed to format monitor title suffix", { error, monitor, type });
                return ""; // Return empty string on error
            }
        });

        this.registeredIpcHandlers.add("validate-monitor-data");
        ipcMain.handle("validate-monitor-data", (_, type: string, data: unknown): MonitorValidationResult => {
            if (isDev()) logger.debug("[IpcService] Handling validate-monitor-data", { data, type });

            try {
                // Input validation
                if (typeof type !== "string" || !type.trim()) {
                    return {
                        errors: ["Invalid monitor type provided"],
                        metadata: {},
                        success: false,
                        warnings: [],
                    };
                }

                // Use the validation function from the registry
                const result = validateMonitorData(type.trim(), data);
                return {
                    errors: result.errors,
                    metadata: result.metadata,
                    success: result.success,
                    warnings: result.warnings,
                };
            } catch (error) {
                logger.error("[IpcService] Failed to validate monitor data", { data, error, type });
                return {
                    errors: ["Validation failed due to internal error"],
                    metadata: {},
                    success: false,
                    warnings: [],
                };
            }
        });
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
        this.registeredIpcHandlers.add("add-site");
        ipcMain.handle("add-site", async (_, site: Site) => {
            if (isDev()) logger.debug("[IpcService] Handling add-site");
            return this.uptimeOrchestrator.addSite(site);
        });

        this.registeredIpcHandlers.add("remove-site");
        ipcMain.handle("remove-site", async (_, identifier: string) => {
            if (isDev()) logger.debug("[IpcService] Handling remove-site", { identifier });
            return this.uptimeOrchestrator.removeSite(identifier);
        });

        this.registeredIpcHandlers.add("get-sites");
        ipcMain.handle("get-sites", async () => {
            if (isDev()) logger.debug("[IpcService] Handling get-sites");
            return this.uptimeOrchestrator.getSites();
        });

        this.registeredIpcHandlers.add("update-site");
        ipcMain.handle("update-site", async (_, identifier: string, updates: Partial<Site>) => {
            if (isDev()) logger.debug("[IpcService] Handling update-site", { identifier });
            return this.uptimeOrchestrator.updateSite(identifier, updates);
        });

        this.registeredIpcHandlers.add("remove-monitor");
        ipcMain.handle("remove-monitor", async (_, siteIdentifier: string, monitorId: string) => {
            if (isDev()) logger.debug("[IpcService] Handling remove-monitor", { monitorId, siteIdentifier });
            return this.uptimeOrchestrator.removeMonitor(siteIdentifier, monitorId);
        });
    }

    /**
     * Setup IPC handlers for state synchronization operations.
     *
     * @remarks
     * Handles:
     * - `request-full-sync`: Manual full state synchronization request
     * - `get-sync-status`: Get current synchronization status
     */
    private setupStateSyncHandlers(): void {
        this.registeredIpcHandlers.add("request-full-sync");
        ipcMain.handle("request-full-sync", async () => {
            logger.debug("[IpcService] Handling request-full-sync");
            try {
                // Get all sites and send to frontend
                const sites = await this.uptimeOrchestrator.getSites();

                // Emit proper typed sync event
                await this.uptimeOrchestrator.emitTyped("sites:state-synchronized", {
                    action: "bulk-sync",
                    source: "database",
                    timestamp: Date.now(),
                });

                // Send state sync event to all renderer processes
                for (const window of BrowserWindow.getAllWindows()) {
                    window.webContents.send("state-sync-event", {
                        action: "bulk-sync",
                        sites: sites,
                        source: "database",
                        timestamp: Date.now(),
                    });
                }

                logger.debug("[IpcService] Full sync completed", { siteCount: sites.length });
                return { siteCount: sites.length, success: true };
            } catch (error) {
                logger.error("[IpcService] Failed to perform full sync", error);
                throw error;
            }
        });

        this.registeredIpcHandlers.add("get-sync-status");
        ipcMain.handle("get-sync-status", async () => {
            logger.debug("[IpcService] Handling get-sync-status");
            try {
                const sites = await this.uptimeOrchestrator.getSites();
                return {
                    lastSync: Date.now(),
                    siteCount: sites.length,
                    success: true,
                    synchronized: true,
                };
            } catch (error) {
                logger.error("[IpcService] Failed to get sync status", error);
                return {
                    lastSync: null,
                    siteCount: 0,
                    success: false,
                    synchronized: false,
                };
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
        this.registeredIpcHandlers.add("quit-and-install");
        ipcMain.on("quit-and-install", () => {
            logger.info("[IpcService] Handling quit-and-install");
            this.autoUpdaterService.quitAndInstall();
        });
    }
}
