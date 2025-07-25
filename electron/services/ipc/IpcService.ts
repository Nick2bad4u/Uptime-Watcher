import { BrowserWindow, ipcMain } from "electron";

import { isDev } from "../../electronUtils";
import { Site } from "../../types";
import { UptimeOrchestrator } from "../../UptimeOrchestrator";
import { logger } from "../../utils/logger";
import { getAllMonitorTypeConfigs, getMonitorTypeConfig, validateMonitorData } from "../monitoring/MonitorTypeRegistry";
import { AutoUpdaterService } from "../updater/AutoUpdaterService";

/**
 * Result structure for monitor data validation via IPC.
 *
 * @remarks
 * Used to communicate monitor validation results between main and renderer processes. Contains errors, warnings, metadata, and success status.
 *
 * @example
 * ```typescript
 * const result: MonitorValidationResult = await window.electronAPI.invoke("validate-monitor-data", type, data);
 * if (!result.success) {
 *   // handle errors
 * }
 * ```
 *
 * @public
 */
interface MonitorValidationResult {
    /**
     * List of validation errors encountered during monitor data validation.
     * @readonly
     */
    errors: string[];
    /**
     * Additional metadata produced during validation.
     * @readonly
     */
    metadata: Record<string, unknown>;
    /**
     * Indicates if validation succeeded.
     * @readonly
     */
    success: boolean;
    /**
     * List of non-critical warnings encountered during validation.
     * @readonly
     */
    warnings: string[];
}

/**
 * Inter-Process Communication (IPC) service for Electron main-renderer communication.
 *
 * @remarks
 * Manages all IPC handlers between the main process and renderer processes, organized by functional domains (sites, monitoring, data, system, state sync). Provides a secure interface for the frontend to interact with backend services. All handler registration and cleanup is managed through this service.
 *
 * @example
 * ```typescript
 * const ipcService = new IpcService(uptimeOrchestrator, autoUpdaterService);
 * ipcService.setupHandlers();
 * // ...
 * ipcService.cleanup();
 * ```
 *
 * @public
 */
export class IpcService {
    /**
     * Service for handling application updates.
     * @internal
     */
    private readonly autoUpdaterService: AutoUpdaterService;
    /**
     * Set of registered IPC handler channel names.
     * @internal
     */
    private readonly registeredIpcHandlers = new Set<string>();
    /**
     * Core orchestrator for monitoring operations.
     * @internal
     */
    private readonly uptimeOrchestrator: UptimeOrchestrator;

    /**
     * Constructs a new {@link IpcService} instance.
     *
     * @param uptimeOrchestrator - The core orchestrator for monitoring operations.
     * @param autoUpdaterService - The service for handling application updates.
     *
     * @remarks
     * Initializes the IPC service with required orchestrator and updater dependencies. This does not register any handlers until {@link setupHandlers} is called.
     *
     * @example
     * ```typescript
     * const ipcService = new IpcService(uptimeOrchestrator, autoUpdaterService);
     * ```
     *
     * @public
     */
    constructor(uptimeOrchestrator: UptimeOrchestrator, autoUpdaterService: AutoUpdaterService) {
        this.uptimeOrchestrator = uptimeOrchestrator;
        this.autoUpdaterService = autoUpdaterService;
    }

    /**
     * Removes all registered IPC handlers and event listeners.
     *
     * @remarks
     * Should be called during application shutdown to prevent memory leaks. Removes handlers registered via `ipcMain.handle` and listeners via `ipcMain.on` for all registered channels.
     *
     * @example
     * ```typescript
     * ipcService.cleanup();
     * ```
     *
     * @public
     */
    public cleanup(): void {
        logger.info("[IpcService] Cleaning up IPC handlers");
        for (const channel of this.registeredIpcHandlers) {
            ipcMain.removeHandler(channel);
        }
        // Remove listeners for channels registered with ipcMain.on
        ipcMain.removeAllListeners("quit-and-install");
    }

    /**
     * Initializes all IPC handlers for the main process.
     *
     * @remarks
     * Sets up handlers for site management, monitoring control, monitor type registry, data management, system operations, and state synchronization. Should be called once during application startup.
     *
     * @example
     * ```typescript
     * ipcService.setupHandlers();
     * ```
     *
     * @public
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
     * Serializes a monitor type configuration for IPC transmission.
     *
     * @remarks
     * Excludes non-serializable properties (functions, schemas) and logs unexpected properties. Preserves all data needed by the renderer process. Throws if unexpected properties are encountered.
     *
     * @param config - The monitor type configuration to serialize.
     * @returns Serializable configuration object safe for IPC transmission.
     * @throws Error If unexpected properties are encountered in the config object.
     *
     * @internal
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
     * Registers IPC handlers for data management operations.
     *
     * @remarks
     * Handles export/import of configuration, history limit management, and database backup. All handlers are registered with unique channel names and are tracked for cleanup.
     *
     * @internal
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
     * Registers IPC handlers for monitoring control operations.
     *
     * @remarks
     * Handles starting/stopping monitoring globally or per site/monitor, and manual checks. All handlers are registered with unique channel names and are tracked for cleanup.
     *
     * @internal
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
     * Registers IPC handlers for monitor type registry operations.
     *
     * @remarks
     * Handles retrieval of monitor type configs, formatting, and validation. All handlers are registered with unique channel names and are tracked for cleanup.
     *
     * @returns For `validate-monitor-data`, returns a {@link MonitorValidationResult} object.
     *
     * @example
     * ```typescript
     * const result = await window.electronAPI.invoke("validate-monitor-data", type, data);
     * if (!result.success) {
     *   // handle errors
     * }
     * ```
     *
     * @internal
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
     * Registers IPC handlers for site management operations.
     *
     * @remarks
     * Handles CRUD operations for sites and monitors. All handlers are registered with unique channel names and are tracked for cleanup.
     *
     * @internal
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
     * Registers IPC handlers for state synchronization operations.
     *
     * @remarks
     * Handles manual full sync requests and sync status queries. Emits synchronization events to all renderer processes. All handlers are registered with unique channel names and are tracked for cleanup.
     *
     * @internal
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
     * Registers IPC handlers for system-level operations.
     *
     * @remarks
     * Handles application quit and install events using event listeners. Event listeners must be removed via {@link cleanup}.
     *
     * @internal
     */
    private setupSystemHandlers(): void {
        this.registeredIpcHandlers.add("quit-and-install");
        ipcMain.on("quit-and-install", () => {
            logger.info("[IpcService] Handling quit-and-install");
            this.autoUpdaterService.quitAndInstall();
        });
    }
}
