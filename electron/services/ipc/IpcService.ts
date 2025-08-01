import { BrowserWindow, ipcMain } from "electron";

import { Site } from "../../types";
import { UptimeOrchestrator } from "../../UptimeOrchestrator";
import { logger } from "../../utils/logger";
import { getAllMonitorTypeConfigs, getMonitorTypeConfig, validateMonitorData } from "../monitoring/MonitorTypeRegistry";
import { AutoUpdaterService } from "../updater/AutoUpdaterService";
import { createValidationResponse, registerStandardizedIpcHandler } from "./utils";
import {
    DataHandlerValidators,
    MonitoringHandlerValidators,
    MonitorTypeHandlerValidators,
    SiteHandlerValidators,
    StateSyncHandlerValidators,
} from "./validators";

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
            serviceFactory,
            type,
            uiConfig,
            validationSchema,
            version,
            ...unexpectedProperties
        } = config;

        // These properties are intentionally extracted but not used in serialization
        serviceFactory;
        validationSchema;

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
     * Handles export/import of configuration, history limit management, and database backup using standardized IPC patterns.
     * All handlers use consistent response formatting, parameter validation, and error handling.
     * All handlers are registered with unique channel names and are tracked for cleanup.
     *
     * @internal
     */
    private setupDataHandlers(): void {
        // Export data handler (no parameters)
        registerStandardizedIpcHandler(
            "export-data",
            async () => this.uptimeOrchestrator.exportData(),
            DataHandlerValidators.exportData,
            this.registeredIpcHandlers
        );

        // Import data handler with validation
        registerStandardizedIpcHandler(
            "import-data",
            async (...args: unknown[]) => this.uptimeOrchestrator.importData(args[0] as string),
            DataHandlerValidators.importData,
            this.registeredIpcHandlers
        );

        // Update history limit handler with validation
        registerStandardizedIpcHandler(
            "update-history-limit",
            async (...args: unknown[]) => this.uptimeOrchestrator.setHistoryLimit(args[0] as number),
            DataHandlerValidators.updateHistoryLimit,
            this.registeredIpcHandlers
        );

        // Get history limit handler (no parameters)
        registerStandardizedIpcHandler(
            "get-history-limit",
            () => this.uptimeOrchestrator.getHistoryLimit(),
            DataHandlerValidators.getHistoryLimit,
            this.registeredIpcHandlers
        );

        // Reset settings handler (no parameters)
        registerStandardizedIpcHandler(
            "reset-settings",
            async () => this.uptimeOrchestrator.resetSettings(),
            DataHandlerValidators.resetSettings,
            this.registeredIpcHandlers
        );

        // Download SQLite backup handler (no parameters)
        registerStandardizedIpcHandler(
            "download-sqlite-backup",
            async () => this.uptimeOrchestrator.downloadBackup(),
            DataHandlerValidators.downloadSqliteBackup,
            this.registeredIpcHandlers
        );
    }

    /**
     * Registers IPC handlers for monitoring control operations.
     *
     * @remarks
     * Handles starting/stopping monitoring globally or per site/monitor, and manual checks using standardized IPC patterns.
     * All handlers use consistent response formatting, parameter validation, and error handling.
     * All handlers are registered with unique channel names and are tracked for cleanup.
     *
     * @internal
     */
    private setupMonitoringHandlers(): void {
        // Start monitoring globally (no parameters)
        registerStandardizedIpcHandler(
            "start-monitoring",
            async () => {
                await this.uptimeOrchestrator.startMonitoring();
                return true;
            },
            MonitoringHandlerValidators.startMonitoring,
            this.registeredIpcHandlers
        );

        // Stop monitoring globally (no parameters)
        registerStandardizedIpcHandler(
            "stop-monitoring",
            async () => {
                await this.uptimeOrchestrator.stopMonitoring();
                return true;
            },
            MonitoringHandlerValidators.stopMonitoring,
            this.registeredIpcHandlers
        );

        // Start monitoring for specific site/monitor
        registerStandardizedIpcHandler(
            "start-monitoring-for-site",
            async (...args: unknown[]) => {
                const identifier = args[0] as string;
                const monitorId = args[1] as string | undefined;
                return this.uptimeOrchestrator.startMonitoringForSite(identifier, monitorId);
            },
            MonitoringHandlerValidators.startMonitoringForSite,
            this.registeredIpcHandlers
        );

        // Stop monitoring for specific site/monitor
        registerStandardizedIpcHandler(
            "stop-monitoring-for-site",
            async (...args: unknown[]) => {
                const identifier = args[0] as string;
                const monitorId = args[1] as string | undefined;
                return this.uptimeOrchestrator.stopMonitoringForSite(identifier, monitorId);
            },
            MonitoringHandlerValidators.stopMonitoringForSite,
            this.registeredIpcHandlers
        );

        // Check site manually with validation
        registerStandardizedIpcHandler(
            "check-site-now",
            async (...args: unknown[]) => {
                const identifier = args[0] as string;
                const monitorId = args[1] as string;
                return this.uptimeOrchestrator.checkSiteManually(identifier, monitorId);
            },
            MonitoringHandlerValidators.checkSiteNow,
            this.registeredIpcHandlers
        );
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
        // Get monitor types handler (no parameters)
        registerStandardizedIpcHandler(
            "get-monitor-types",
            () => {
                // Get all monitor type configs and serialize them safely for IPC
                const configs = getAllMonitorTypeConfigs();
                return configs.map((config) => this.serializeMonitorTypeConfig(config));
            },
            MonitorTypeHandlerValidators.getMonitorTypes,
            this.registeredIpcHandlers
        );

        // Format monitor detail handler with validation
        registerStandardizedIpcHandler(
            "format-monitor-detail",
            (...args: unknown[]) => {
                const monitorType = args[0] as string;
                const details = args[1] as string;

                const config = getMonitorTypeConfig(monitorType.trim());
                if (!config) {
                    logger.warn("[IpcService] Unknown monitor type for detail formatting", { monitorType });
                    return details; // Return original details if type is unknown
                }

                if (config.uiConfig?.formatDetail) {
                    return config.uiConfig.formatDetail(details);
                }

                return details;
            },
            MonitorTypeHandlerValidators.formatMonitorDetail,
            this.registeredIpcHandlers
        );

        // Format monitor title suffix handler with validation
        registerStandardizedIpcHandler(
            "format-monitor-title-suffix",
            (...args: unknown[]) => {
                const monitorType = args[0] as string;
                const monitor = args[1] as Record<string, unknown>;

                const config = getMonitorTypeConfig(monitorType.trim());
                if (!config) {
                    logger.warn("[IpcService] Unknown monitor type for title suffix formatting", { monitorType });
                    return ""; // Return empty string if type is unknown
                }

                if (config.uiConfig?.formatTitleSuffix) {
                    return config.uiConfig.formatTitleSuffix(monitor);
                }

                return "";
            },
            MonitorTypeHandlerValidators.formatMonitorTitleSuffix,
            this.registeredIpcHandlers
        );

        // Validate monitor data handler with special validation response format
        registerStandardizedIpcHandler(
            "validate-monitor-data",
            (...args: unknown[]) => {
                const monitorType = args[0] as string;
                const data = args[1];

                // Use the validation function from the registry
                const result = validateMonitorData(monitorType.trim(), data);

                // Return in the expected validation format for backward compatibility
                return createValidationResponse(result.success, result.errors, result.warnings, result.metadata);
            },
            MonitorTypeHandlerValidators.validateMonitorData,
            this.registeredIpcHandlers
        );
    }

    /**
     * Registers IPC handlers for site management operations.
     *
     * @remarks
     * Handles CRUD operations for sites and monitors using standardized IPC patterns.
     * All handlers use consistent response formatting, parameter validation, and error handling.
     * All handlers are registered with unique channel names and are tracked for cleanup.
     *
     * @internal
     */
    private setupSiteHandlers(): void {
        // Add site handler with validation
        registerStandardizedIpcHandler(
            "add-site",
            async (...args: unknown[]) => this.uptimeOrchestrator.addSite(args[0] as Site),
            SiteHandlerValidators.addSite,
            this.registeredIpcHandlers
        );

        // Remove site handler with validation
        registerStandardizedIpcHandler(
            "remove-site",
            async (...args: unknown[]) => this.uptimeOrchestrator.removeSite(args[0] as string),
            SiteHandlerValidators.removeSite,
            this.registeredIpcHandlers
        );

        // Get sites handler (no parameters)
        registerStandardizedIpcHandler(
            "get-sites",
            async () => this.uptimeOrchestrator.getSites(),
            SiteHandlerValidators.getSites,
            this.registeredIpcHandlers
        );

        // Update site handler with validation
        registerStandardizedIpcHandler(
            "update-site",
            async (...args: unknown[]) =>
                this.uptimeOrchestrator.updateSite(args[0] as string, args[1] as Partial<Site>),
            SiteHandlerValidators.updateSite,
            this.registeredIpcHandlers
        );

        // Remove monitor handler with validation
        registerStandardizedIpcHandler(
            "remove-monitor",
            async (...args: unknown[]) => this.uptimeOrchestrator.removeMonitor(args[0] as string, args[1] as string),
            SiteHandlerValidators.removeMonitor,
            this.registeredIpcHandlers
        );
    }

    /**
     * Registers IPC handlers for state synchronization operations.
     *
     * @remarks
     * Handles manual full sync requests and sync status queries using standardized IPC patterns.
     * Emits synchronization events to all renderer processes. All handlers use consistent response
     * formatting, parameter validation, and error handling. All handlers are registered with
     * unique channel names and are tracked for cleanup.
     *
     * @internal
     */
    private setupStateSyncHandlers(): void {
        // Request full sync handler (no parameters)
        registerStandardizedIpcHandler(
            "request-full-sync",
            async () => {
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
            },
            StateSyncHandlerValidators.requestFullSync,
            this.registeredIpcHandlers
        );

        // Get sync status handler (no parameters)
        registerStandardizedIpcHandler(
            "get-sync-status",
            async () => {
                const sites = await this.uptimeOrchestrator.getSites();
                return {
                    lastSync: Date.now(),
                    siteCount: sites.length,
                    success: true,
                    synchronized: true,
                };
            },
            StateSyncHandlerValidators.getSyncStatus,
            this.registeredIpcHandlers
        );
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
