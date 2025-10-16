/**
 * IPC service for secure communication between main and renderer processes.
 *
 * @remarks
 * Handles all IPC channels for sites, monitors, data operations, settings, and
 * system functions. Provides type-safe communication with proper error handling
 * and validation.
 */
import type { Monitor, Site } from "@shared/types";
import type { PreloadGuardDiagnosticsReport } from "@shared/types/ipc";
import type { UnknownRecord } from "type-fest";

import { LOG_TEMPLATES } from "@shared/utils/logTemplates";
import { validateMonitorData } from "@shared/validation/schemas";
import { ipcMain, shell } from "electron";

import type { UptimeOrchestrator } from "../../UptimeOrchestrator";
import type { RendererEventBridge } from "../events/RendererEventBridge";
import type { AutoUpdaterService } from "../updater/AutoUpdaterService";

import { diagnosticsLogger, logger } from "../../utils/logger";
import {
    getAllMonitorTypeConfigs,
    getMonitorTypeConfig,
} from "../monitoring/MonitorTypeRegistry";
import {
    recordMissingHandler,
    recordPreloadGuardFailure,
    recordSuccessfulHandlerCheck,
} from "./diagnosticsMetrics";
import {
    createValidationResponse,
    registerStandardizedIpcHandler,
} from "./utils";
import {
    DataHandlerValidators,
    MonitoringHandlerValidators,
    MonitorTypeHandlerValidators,
    SiteHandlerValidators,
    StateSyncHandlerValidators,
    SystemHandlerValidators,
} from "./validators";

function isPreloadGuardDiagnosticsReport(
    value: unknown
): value is PreloadGuardDiagnosticsReport {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
        return false;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- value verified as object without arrays
    const record = value as Record<string, unknown>;

    return (
        typeof record["channel"] === "string" &&
        typeof record["guard"] === "string" &&
        typeof record["timestamp"] === "number"
    );
}

/**
 * Serialized monitor type configuration for IPC transmission.
 *
 * @remarks
 * Contains only serializable properties from monitor type configurations,
 * excluding functions and Zod schemas that cannot be transmitted via IPC. This
 * interface ensures type safety when transmitting monitor configuration data
 * between the main process and renderer processes.
 *
 * @example
 *
 * ```typescript
 * const serializedConfig: SerializedMonitorTypeConfig = {
 *     description: "HTTP endpoint monitoring",
 *     displayName: "HTTP Monitor",
 *     fields: [{ name: "url", required: true }],
 *     type: "http",
 *     uiConfig: {
 *         supportsAdvancedAnalytics: true,
 *         supportsResponseTime: true,
 *     },
 *     version: "1.0.0",
 * };
 * ```
 *
 * @public
 */
interface SerializedMonitorTypeConfig {
    description: string;
    displayName: string;
    fields: unknown[];
    type: string;
    uiConfig:
        | undefined
        | {
              detailFormats?: undefined | { analyticsLabel?: string };
              display?:
                  | undefined
                  | { showAdvancedMetrics?: boolean; showUrl?: boolean };
              helpTexts?: undefined | { primary?: string; secondary?: string };
              supportsAdvancedAnalytics: boolean;
              supportsResponseTime: boolean;
          };
    version: string;
}

/**
 * Utility functions for validating and processing monitor configuration
 * properties.
 *
 * @remarks
 * Provides methods to extract and validate monitor configuration properties,
 * ensuring only expected properties are present and logging any unexpected
 * ones. Used during the serialization process to maintain data integrity.
 *
 * @internal
 */
const ConfigPropertyValidator = {
    /**
     * Extracts and validates base properties from monitor configuration.
     *
     * @remarks
     * Separates known base properties from unexpected properties to maintain
     * clean serialization and provide debugging information for unknown
     * properties.
     *
     * @param config - The monitor configuration object to process
     *
     * @returns Object containing validated base properties and any unexpected
     *   properties found
     *
     * @internal
     */
    extractAndValidateBaseProperties(
        config: ReturnType<typeof getAllMonitorTypeConfigs>[0]
    ): {
        baseProperties: {
            description: string;
            displayName: string;
            fields: unknown[];
            type: string;
            uiConfig: unknown;
            version: string;
        };
        unexpectedProperties: UnknownRecord;
    } {
        // Extract serializable properties, excluding non-serializable ones
        const { description, displayName, fields, type, uiConfig, version } =
            config;

        // Get unexpected properties by filtering out known properties
        const knownProperties = new Set([
            "description",
            "displayName",
            "fields",
            "serviceFactory", // Not serializable - functions
            "type",
            "uiConfig",
            "validationSchema", // Not serializable - Zod schemas
            "version",
        ]);

        const unexpectedProperties = Object.fromEntries(
            Object.entries(config).filter(([key]) => !knownProperties.has(key))
        );

        return {
            baseProperties: {
                description,
                displayName,
                fields,
                type,
                uiConfig,
                version,
            },
            unexpectedProperties,
        };
    },

    /**
     * Validates and logs unexpected properties in monitor configuration.
     *
     * @remarks
     * Checks for properties that are not part of the expected monitor
     * configuration schema and logs warnings for debugging purposes. This helps
     * identify when monitor configurations contain unexpected data that might
     * not be serialized.
     *
     * @param unexpectedProperties - Record of unexpected properties found
     *   during validation
     * @param monitorType - The monitor type identifier for logging context
     *
     * @internal
     */
    validateAndLogUnexpectedProperties(
        unexpectedProperties: UnknownRecord,
        monitorType: string
    ): void {
        if (Object.keys(unexpectedProperties).length > 0) {
            logger.warn(
                "[IpcService] Unexpected properties in monitor config",
                {
                    type: monitorType,
                    unexpectedProperties: Object.keys(unexpectedProperties),
                }
            );
        }
    },
};

/**
 * Utility functions for serializing UI configuration objects.
 *
 * @remarks
 * Provides specialized methods for serializing different parts of monitor UI
 * configuration objects for safe transmission over IPC. Handles optional
 * properties correctly and excludes functions that cannot be serialized.
 *
 * @internal
 */
const UiConfigSerializer = {
    /**
     * Serializes detail formats configuration for IPC transmission.
     *
     * @remarks
     * Processes detail format configuration by extracting serializable
     * properties and excluding non-serializable functions like historyDetail,
     * formatDetail, and formatTitleSuffix.
     *
     * @param detailFormats - The detail formats configuration object to
     *   serialize
     *
     * @returns Serialized detail formats object or undefined if input is empty
     *
     * @internal
     */
    serializeDetailFormats(detailFormats?: {
        analyticsLabel?: string;
    }): undefined | { analyticsLabel?: string } {
        if (!detailFormats) {
            return undefined;
        }

        const result: { analyticsLabel?: string } = {};

        if (detailFormats.analyticsLabel !== undefined) {
            result.analyticsLabel = detailFormats.analyticsLabel;
        }

        // Return undefined if no properties were added (empty object)
        return Object.keys(result).length > 0 ? result : undefined;
    },

    /**
     * Serializes display preferences for IPC transmission.
     *
     * @remarks
     * Converts optional boolean display preferences to required boolean values
     * using safe defaults (false). This ensures consistent behavior across the
     * renderer process.
     *
     * @param display - The display configuration object to serialize
     *
     * @returns Serialized display preferences with default values or undefined
     *   if input is empty
     *
     * @internal
     */
    serializeDisplayPreferences(display?: {
        showAdvancedMetrics?: boolean;
        showUrl?: boolean;
    }): undefined | { showAdvancedMetrics: boolean; showUrl: boolean } {
        return display
            ? {
                  showAdvancedMetrics: display.showAdvancedMetrics ?? false,
                  showUrl: display.showUrl ?? false,
              }
            : undefined;
    },

    /**
     * Serializes help texts configuration for IPC transmission.
     *
     * @remarks
     * Extracts primary and secondary help text strings while filtering out
     * undefined values. Returns undefined if no help text content is present.
     *
     * @param helpTexts - The help texts configuration object to serialize
     *
     * @returns Serialized help texts object or undefined if no content is
     *   present
     *
     * @internal
     */
    serializeHelpTexts(helpTexts?: {
        primary?: string;
        secondary?: string;
    }): undefined | { primary?: string; secondary?: string } {
        if (!helpTexts) {
            return undefined;
        }

        const result: { primary?: string; secondary?: string } = {};

        if (helpTexts.primary !== undefined) {
            result.primary = helpTexts.primary;
        }

        if (helpTexts.secondary !== undefined) {
            result.secondary = helpTexts.secondary;
        }

        // Return undefined if no properties were added (empty object)
        return Object.keys(result).length > 0 ? result : undefined;
    },

    /**
     * Serializes complete UI configuration for IPC transmission.
     *
     * @remarks
     * Orchestrates the serialization of all UI configuration components using
     * specialized serializer methods. Only includes components with actual
     * content to avoid sending empty objects over IPC.
     *
     * @param uiConfig - The complete UI configuration object to serialize
     *
     * @returns Serialized UI configuration object or undefined if input is
     *   empty
     *
     * @internal
     */
    serializeUiConfig(uiConfig?: {
        detailFormats?: { analyticsLabel?: string };
        display?: { showAdvancedMetrics?: boolean; showUrl?: boolean };
        helpTexts?: { primary?: string; secondary?: string };
        supportsAdvancedAnalytics?: boolean;
        supportsResponseTime?: boolean;
    }):
        | undefined
        | {
              detailFormats?: undefined | { analyticsLabel?: string };
              display?:
                  | undefined
                  | { showAdvancedMetrics?: boolean; showUrl?: boolean };
              helpTexts?: undefined | { primary?: string; secondary?: string };
              supportsAdvancedAnalytics: boolean;
              supportsResponseTime: boolean;
          } {
        if (!uiConfig) {
            return undefined;
        }

        const result: {
            detailFormats?: undefined | { analyticsLabel?: string };
            display?:
                | undefined
                | { showAdvancedMetrics?: boolean; showUrl?: boolean };
            helpTexts?: undefined | { primary?: string; secondary?: string };
            supportsAdvancedAnalytics: boolean;
            supportsResponseTime: boolean;
        } = {
            supportsAdvancedAnalytics:
                uiConfig.supportsAdvancedAnalytics ?? false,
            supportsResponseTime: uiConfig.supportsResponseTime ?? false,
        };

        // Only include optional properties if they have content
        const detailFormats = this.serializeDetailFormats(
            uiConfig.detailFormats
        );
        if (detailFormats) {
            result.detailFormats = detailFormats;
        }

        const display = this.serializeDisplayPreferences(uiConfig.display);
        if (display) {
            result.display = display;
        }

        const helpTexts = this.serializeHelpTexts(uiConfig.helpTexts);
        if (helpTexts) {
            result.helpTexts = helpTexts;
        }

        return result;
    },
};

/**
 * Inter-Process Communication (IPC) service for Electron main-renderer
 * communication.
 *
 * @remarks
 * Manages all IPC handlers between the main process and renderer processes,
 * organized by functional domains including sites, monitoring, data management,
 * system operations, and state synchronization. Provides a secure interface for
 * the frontend to interact with backend services through Electron's
 * contextBridge API. All handler registration and cleanup is centrally managed
 * through this service to prevent memory leaks and ensure proper teardown.
 *
 * The service organizes handlers into logical groups:
 *
 * - Site management: CRUD operations for monitoring sites
 * - Monitoring control: Start/stop/status operations for monitors
 * - Monitor types: Configuration and metadata for different monitor types
 * - Data management: Database operations and data export/import
 * - System operations: Application updates, settings, logging
 * - State synchronization: Real-time updates between processes
 *
 * @example Basic usage during application startup:
 *
 * ```typescript
 * const ipcService = new IpcService(
 *     uptimeOrchestrator,
 *     autoUpdaterService,
 *     rendererEventBridge
 * );
 * ipcService.setupHandlers();
 *
 * // Later during shutdown:
 * ipcService.cleanup();
 * ```
 *
 * @example Using with dependency injection:
 *
 * ```typescript
 * class MainProcess {
 *     private ipcService: IpcService;
 *
 *     constructor(
 *         orchestrator: UptimeOrchestrator,
 *         updater: AutoUpdaterService,
 *         rendererBridge: RendererEventBridge
 *     ) {
 *         this.ipcService = new IpcService(
 *             orchestrator,
 *             updater,
 *             rendererBridge
 *         );
 *     }
 *
 *     async start(): Promise<void> {
 *         this.ipcService.setupHandlers();
 *     }
 *
 *     async stop(): Promise<void> {
 *         this.ipcService.cleanup();
 *     }
 * }
 * ```
 *
 * @public
 */
export class IpcService {
    /**
     * Service for handling application updates.
     *
     * @internal
     */
    private readonly autoUpdaterService: AutoUpdaterService;

    /**
     * Set of registered IPC handler channel names.
     *
     * @internal
     */
    private readonly registeredIpcHandlers = new Set<string>();

    /**
     * Core orchestrator for monitoring operations.
     *
     * @internal
     */
    private readonly uptimeOrchestrator: UptimeOrchestrator;

    /** Renderer bridge for broadcasting events to all windows. */
    private readonly rendererEventBridge: RendererEventBridge;

    /**
     * Constructs a new IpcService instance.
     *
     * @remarks
     * Initializes the IPC service with required orchestrator and updater
     * dependencies. The constructor only stores references to dependencies - no
     * handlers are registered until {@link setupHandlers} is explicitly called.
     * This allows for proper initialization order during application startup.
     *
     * @example
     *
     * ```typescript
     * const ipcService = new IpcService(
     *     uptimeOrchestrator,
     *     autoUpdaterService
     * );
     * // No handlers registered yet - call setupHandlers() when ready
     * ```
     *
     * @param uptimeOrchestrator - The core orchestrator for monitoring
     *   operations
     * @param autoUpdaterService - The service for handling application updates
     * @param rendererEventBridge - Bridge for broadcasting events to renderer
     *   processes
     *
     * @public
     */
    public constructor(
        uptimeOrchestrator: UptimeOrchestrator,
        autoUpdaterService: AutoUpdaterService,
        rendererEventBridge: RendererEventBridge
    ) {
        this.uptimeOrchestrator = uptimeOrchestrator;
        this.autoUpdaterService = autoUpdaterService;
        this.rendererEventBridge = rendererEventBridge;
    }

    /**
     * Removes all registered IPC handlers and event listeners.
     *
     * @remarks
     * Should be called during application shutdown to prevent memory leaks.
     * Removes handlers registered via `ipcMain.handle` and listeners via
     * `ipcMain.on` for all registered channels.
     *
     * @example
     *
     * ```typescript
     * ipcService.cleanup();
     * ```
     *
     * @public
     */
    public cleanup(): void {
        logger.info(LOG_TEMPLATES.services.IPC_SERVICE_CLEANUP);
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
     * Sets up handlers for all functional domains including site management,
     * monitoring control, monitor type registry, data management, system
     * operations, and state synchronization. This method should be called
     * exactly once during application startup after all dependencies are
     * initialized.
     *
     * The setup process registers handlers in the following order:
     *
     * 1. Site management handlers
     * 2. Monitoring control handlers
     * 3. Monitor type configuration handlers
     * 4. Data management handlers
     * 5. System operation handlers
     * 6. State synchronization handlers
     *
     * @example
     *
     * ```typescript
     * // During application startup
     * ipcService.setupHandlers();
     * logger.info("IPC handlers registered successfully");
     * ```
     *
     * @throws Error when handlers are already registered or dependencies are
     *   not available
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
        this.setupDiagnosticsHandlers();
    }

    /**
     * Serializes a monitor type configuration for IPC transmission.
     *
     * @remarks
     * Excludes non-serializable properties (functions, schemas) and logs
     * unexpected properties. Preserves all data needed by the renderer process.
     * Throws if unexpected properties are encountered.
     *
     * @param config - The monitor type configuration to serialize.
     *
     * @returns Serializable configuration object safe for IPC transmission.
     *
     * @throws Error If unexpected properties are encountered in the config
     *   object.
     *
     * @internal
     */
    private serializeMonitorTypeConfig(
        config: ReturnType<typeof getAllMonitorTypeConfigs>[0]
    ): SerializedMonitorTypeConfig {
        // Extract and validate properties using utility
        const { baseProperties, unexpectedProperties } =
            ConfigPropertyValidator.extractAndValidateBaseProperties(config);

        // Validate and log any unexpected properties
        ConfigPropertyValidator.validateAndLogUnexpectedProperties(
            unexpectedProperties,
            baseProperties.type
        );

        // Serialize UI configuration using utility
        const serializedUiConfig = UiConfigSerializer.serializeUiConfig(
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- uiConfig is validated by the serializer and type-checked at runtime
            baseProperties.uiConfig as
                | undefined
                | {
                      detailFormats?: { analyticsLabel?: string };
                      display?: {
                          showAdvancedMetrics?: boolean;
                          showUrl?: boolean;
                      };
                      helpTexts?: { primary?: string; secondary?: string };
                      supportsAdvancedAnalytics?: boolean;
                      supportsResponseTime?: boolean;
                  }
        );

        return {
            description: baseProperties.description,
            displayName: baseProperties.displayName,
            fields: baseProperties.fields, // Fields are always present in BaseMonitorConfig
            type: baseProperties.type,
            uiConfig: serializedUiConfig,
            version: baseProperties.version,
        };
    }

    /**
     * Registers IPC handlers for data management operations.
     *
     * @remarks
     * Handles export/import of configuration, history limit management, and
     * database backup using standardized IPC patterns. All handlers use
     * consistent response formatting, parameter validation, and error handling.
     * All handlers are registered with unique channel names and are tracked for
     * cleanup.
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
        /* eslint-disable @typescript-eslint/no-unsafe-type-assertion -- All IPC handler arguments are validated by their respective validators before type assertion */
        registerStandardizedIpcHandler(
            "import-data",
            async (...args: unknown[]) =>
                this.uptimeOrchestrator.importData(args[0] as string),
            DataHandlerValidators.importData,
            this.registeredIpcHandlers
        );

        // Update history limit handler with validation
        registerStandardizedIpcHandler(
            "update-history-limit",
            async (...args: unknown[]) => {
                await this.uptimeOrchestrator.setHistoryLimit(
                    args[0] as number
                );
                return this.uptimeOrchestrator.getHistoryLimit();
            },
            DataHandlerValidators.updateHistoryLimit,
            this.registeredIpcHandlers
        );
        /* eslint-enable @typescript-eslint/no-unsafe-type-assertion -- Re-enable after validated IPC argument type conversion */

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
            async () => {
                const result = await this.uptimeOrchestrator.downloadBackup();
                // Convert Buffer to ArrayBuffer for frontend compatibility
                const arrayBuffer = result.buffer.buffer.slice(
                    result.buffer.byteOffset,
                    result.buffer.byteOffset + result.buffer.byteLength
                );
                return {
                    ...result,
                    buffer: arrayBuffer,
                };
            },
            DataHandlerValidators.downloadSqliteBackup,
            this.registeredIpcHandlers
        );
    }

    /**
     * Registers IPC handlers for monitoring control operations.
     *
     * @remarks
     * Handles starting/stopping monitoring globally or per site/monitor, and
     * manual checks using standardized IPC patterns. All handlers use
     * consistent response formatting, parameter validation, and error handling.
     * All handlers are registered with unique channel names and are tracked for
     * cleanup.
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
        /* eslint-disable @typescript-eslint/no-unsafe-type-assertion -- All monitoring handler arguments are validated by their respective validators before type assertion */
        registerStandardizedIpcHandler(
            "start-monitoring-for-site",
            async (...args: unknown[]) => {
                const identifier = args[0] as string;
                const monitorId = args[1] as string | undefined;
                return this.uptimeOrchestrator.startMonitoringForSite(
                    identifier,
                    monitorId
                );
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
                return this.uptimeOrchestrator.stopMonitoringForSite(
                    identifier,
                    monitorId
                );
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
                return this.uptimeOrchestrator.checkSiteManually(
                    identifier,
                    monitorId
                );
            },
            MonitoringHandlerValidators.checkSiteNow,
            this.registeredIpcHandlers
        );
        /* eslint-enable @typescript-eslint/no-unsafe-type-assertion -- Re-enable type assertion checks after controlled cast for registered handlers */
    }

    /**
     * Registers IPC handlers for monitor type registry operations.
     *
     * @remarks
     * Handles retrieval of monitor type configs, formatting, and validation.
     * All handlers are registered with unique channel names and are tracked for
     * cleanup.
     *
     * @example
     *
     * ```typescript
     * const result = await window.electronAPI.invoke(
     *     "validate-monitor-data",
     *     type,
     *     data
     * );
     * if (!result.success) {
     *     // handle errors
     * }
     * ```
     *
     * @returns For `validate-monitor-data`, returns a {@link ValidationResult}
     *   object.
     *
     * @internal
     */
    private setupMonitorTypeHandlers(): void {
        // Get monitor types handler (no parameters)
        registerStandardizedIpcHandler(
            "get-monitor-types",
            () => {
                // Get all monitor type configs and serialize them safely for
                // IPC
                const configs = getAllMonitorTypeConfigs();
                return configs.map((config) =>
                    this.serializeMonitorTypeConfig(config)
                );
            },
            MonitorTypeHandlerValidators.getMonitorTypes,
            this.registeredIpcHandlers
        );

        // Format monitor detail handler with validation
        /* eslint-disable @typescript-eslint/no-unsafe-type-assertion -- All monitor type handler arguments are validated by their respective validators before type assertion */
        registerStandardizedIpcHandler(
            "format-monitor-detail",
            (...args: unknown[]) => {
                const monitorType = args[0] as string;
                const details = args[1] as string;

                const config = getMonitorTypeConfig(monitorType.trim());
                if (!config) {
                    logger.warn(
                        LOG_TEMPLATES.warnings.MONITOR_TYPE_UNKNOWN_DETAIL,
                        { monitorType }
                    );
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
                const monitor = args[1] as Monitor;

                const config = getMonitorTypeConfig(monitorType.trim());
                if (!config) {
                    logger.warn(
                        LOG_TEMPLATES.warnings.MONITOR_TYPE_UNKNOWN_TITLE,
                        { monitorType }
                    );
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
                const [monitorType, data] = args as [string, unknown];

                // Use the validation function from the registry
                const result = validateMonitorData(monitorType.trim(), data);

                // Return the validation result directly - map success to
                // success parameter
                return createValidationResponse(
                    result.success,
                    result.errors,
                    result.warnings,
                    result.metadata as undefined | UnknownRecord
                );
            },
            MonitorTypeHandlerValidators.validateMonitorData,
            this.registeredIpcHandlers
        );
        /* eslint-enable @typescript-eslint/no-unsafe-type-assertion -- Re-enable type assertion checks after controlled cast for monitor type handlers */
    }

    /**
     * Registers IPC handlers for site management operations.
     *
     * @remarks
     * Handles CRUD operations for sites and monitors using standardized IPC
     * patterns. All handlers use consistent response formatting, parameter
     * validation, and error handling. All handlers are registered with unique
     * channel names and are tracked for cleanup.
     *
     * @internal
     */
    private setupSiteHandlers(): void {
        // Add site handler with validation
        /* eslint-disable @typescript-eslint/no-unsafe-type-assertion -- All site handler arguments are validated by their respective validators before type assertion */
        registerStandardizedIpcHandler(
            "add-site",
            async (...args: unknown[]) =>
                this.uptimeOrchestrator.addSite(args[0] as Site),
            SiteHandlerValidators.addSite,
            this.registeredIpcHandlers
        );

        // Delete all sites handler (no parameters)
        registerStandardizedIpcHandler(
            "delete-all-sites",
            async () => {
                logger.info("delete-all-sites IPC handler called");
                const result = await this.uptimeOrchestrator.deleteAllSites();
                logger.info(
                    `delete-all-sites completed, deleted ${result} sites`
                );
                return result;
            },
            SiteHandlerValidators.deleteAllSites,
            this.registeredIpcHandlers
        );

        // Remove site handler with validation
        registerStandardizedIpcHandler(
            "remove-site",
            async (...args: unknown[]) =>
                this.uptimeOrchestrator.removeSite(args[0] as string),
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
                this.uptimeOrchestrator.updateSite(
                    args[0] as string,
                    args[1] as Partial<Site>
                ),
            SiteHandlerValidators.updateSite,
            this.registeredIpcHandlers
        );

        // Remove monitor handler with validation
        registerStandardizedIpcHandler(
            "remove-monitor",
            async (...args: unknown[]) =>
                this.uptimeOrchestrator.removeMonitor(
                    args[0] as string,
                    args[1] as string
                ),
            SiteHandlerValidators.removeMonitor,
            this.registeredIpcHandlers
        );
        /* eslint-enable @typescript-eslint/no-unsafe-type-assertion -- Re-enable type assertion checks after controlled cast for site handlers */
    }

    /**
     * Registers IPC handlers for state synchronization operations.
     *
     * @remarks
     * Handles manual full sync requests and sync status queries using
     * standardized IPC patterns. Emits synchronization events to all renderer
     * processes. All handlers use consistent response formatting, parameter
     * validation, and error handling. All handlers are registered with unique
     * channel names and are tracked for cleanup.
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
                const timestamp = Date.now();

                // Emit proper typed sync event
                await this.uptimeOrchestrator.emitTyped(
                    "sites:state-synchronized",
                    {
                        action: "bulk-sync",
                        sites,
                        source: "database",
                        timestamp,
                    }
                );

                // Send state sync event to all renderer processes
                this.rendererEventBridge.sendStateSyncEvent({
                    action: "bulk-sync",
                    sites,
                    source: "database",
                    timestamp,
                });

                logger.debug("[IpcService] Full sync completed", {
                    siteCount: sites.length,
                });
                return {
                    completedAt: timestamp,
                    siteCount: sites.length,
                    sites,
                    source: "database" as const,
                    synchronized: true,
                };
            },
            StateSyncHandlerValidators.requestFullSync,
            this.registeredIpcHandlers
        );

        // Get sync status handler (no parameters)
        registerStandardizedIpcHandler(
            "get-sync-status",
            async () => {
                const sites = await this.uptimeOrchestrator.getSites();
                const timestamp = Date.now();
                return {
                    lastSyncAt: timestamp,
                    siteCount: sites.length,
                    source: "database" as const,
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
     * Handles system-level operations like quit/install and external URL
     * opening. Uses {@link ipcMain.on} for event-based handlers that don't
     * return values, and {@link registerStandardizedIpcHandler} for handlers
     * that return data. All registered handlers and listeners must be removed
     * via {@link cleanup}.
     *
     * @internal
     */
    private setupSystemHandlers(): void {
        // External URL handler with validation
        registerStandardizedIpcHandler(
            "open-external",
            async (...args: unknown[]) => {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- URL parameter type validated by SystemHandlerValidators.openExternal
                const url = args[0] as string;
                await shell.openExternal(url);
                return true;
            },
            SystemHandlerValidators.openExternal,
            this.registeredIpcHandlers
        );

        this.registeredIpcHandlers.add("quit-and-install");
        ipcMain.on("quit-and-install", () => {
            logger.info(LOG_TEMPLATES.services.UPDATER_QUIT_INSTALL);
            this.autoUpdaterService.quitAndInstall();
        });
    }

    /**
     * Registers diagnostics handlers used by the preload bridge for runtime
     * validation.
     */
    private setupDiagnosticsHandlers(): void {
        registerStandardizedIpcHandler(
            "diagnostics:verify-ipc-handler",
            (...args: unknown[]) => {
                const [channelRaw] = args;
                if (typeof channelRaw !== "string") {
                    throw new TypeError(
                        "Channel name must be a non-empty string"
                    );
                }

                const availableChannels = Array.from(
                    this.registeredIpcHandlers
                ).toSorted((left, right) => left.localeCompare(right));

                const isRegistered = this.registeredIpcHandlers.has(channelRaw);

                if (isRegistered) {
                    recordSuccessfulHandlerCheck();
                } else {
                    recordMissingHandler(channelRaw);
                    logger.error(
                        "[IpcService] Missing IPC handler requested by preload bridge",
                        { availableChannels, channel: channelRaw }
                    );
                }

                return {
                    availableChannels,
                    channel: channelRaw,
                    registered: isRegistered,
                };
            },
            SystemHandlerValidators.verifyIpcHandler,
            this.registeredIpcHandlers
        );

        registerStandardizedIpcHandler(
            "diagnostics:report-preload-guard",
            (reportCandidate: unknown) => {
                if (!isPreloadGuardDiagnosticsReport(reportCandidate)) {
                    throw new TypeError(
                        "Invalid preload guard diagnostics payload"
                    );
                }

                const report = reportCandidate;

                recordPreloadGuardFailure(report);

                diagnosticsLogger.warn(
                    "[IpcDiagnostics] Preload guard rejected payload",
                    {
                        channel: report.channel,
                        guard: report.guard,
                        metadata: report.metadata,
                        payloadPreview: report.payloadPreview,
                        reason: report.reason,
                        timestamp: report.timestamp,
                    }
                );
            },
            SystemHandlerValidators.reportPreloadGuard,
            this.registeredIpcHandlers
        );
    }
}
