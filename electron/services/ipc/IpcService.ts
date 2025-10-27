/**
 * IPC service for secure communication between main and renderer processes.
 *
 * @remarks
 * Handles all IPC channels for sites, monitors, data operations, settings, and
 * system functions. Provides type-safe communication with proper error handling
 * and validation.
 */
import type { Monitor, MonitorFieldDefinition, Site } from "@shared/types";
import type { PreloadGuardDiagnosticsReport } from "@shared/types/ipc";
import type { MonitorTypeConfig } from "@shared/types/monitorTypes";
import type {
    StateSyncSource,
    StateSyncStatusSummary,
} from "@shared/types/stateSync";
import type { UnknownRecord } from "type-fest";

import { isMonitorTypeConfig } from "@shared/types/monitorTypes";
import { STATE_SYNC_ACTION, STATE_SYNC_SOURCE } from "@shared/types/stateSync";
import { LOG_TEMPLATES } from "@shared/utils/logTemplates";
import { validateMonitorData } from "@shared/validation/schemas";
import { ipcMain, shell } from "electron";

import type { UptimeEvents } from "../../events/eventTypes";
import type { UptimeOrchestrator } from "../../UptimeOrchestrator";
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
    SettingsHandlerValidators,
    SiteHandlerValidators,
    StateSyncHandlerValidators,
    SystemHandlerValidators,
} from "./validators";

type BaseMonitorUiConfig = ReturnType<
    typeof getAllMonitorTypeConfigs
>[0]["uiConfig"];

/**
 * Determines whether a candidate is a plain object with string keys.
 *
 * @param candidate - Value to evaluate.
 *
 * @returns `true` when the candidate can be treated as {@link UnknownRecord}.
 */
function isUnknownRecord(candidate: unknown): candidate is UnknownRecord {
    return (
        typeof candidate === "object" &&
        candidate !== null &&
        !Array.isArray(candidate)
    );
}

function isPreloadGuardDiagnosticsReport(
    value: unknown
): value is PreloadGuardDiagnosticsReport {
    if (!isUnknownRecord(value)) {
        return false;
    }

    return (
        typeof value["channel"] === "string" &&
        typeof value["guard"] === "string" &&
        typeof value["timestamp"] === "number"
    );
}

/**
 * Extracts a string when present, otherwise returns `undefined`.
 *
 * @param value - Value to normalize.
 *
 * @returns The input when it is a string, otherwise `undefined`.
 */
const pickOptionalString = (value: unknown): string | undefined =>
    typeof value === "string" ? value : undefined;

/**
 * Extracts a boolean when present, otherwise returns the provided fallback.
 *
 * @param value - Value to normalize.
 * @param fallback - Boolean to use when the value is not a boolean.
 *
 * @returns A boolean suitable for serialization.
 */
const pickBooleanWithFallback = (value: unknown, fallback: boolean): boolean =>
    typeof value === "boolean" ? value : fallback;

const ConfigPropertyValidator = {
    /**
     * Throws when unexpected monitor configuration properties are detected.
     *
     * @remarks
     * Fails fast whenever a registry entry contains keys the renderer is not
     * prepared to consume, preventing silent drift between processes.
     */
    assertNoUnexpectedProperties(
        unexpectedProperties: UnknownRecord,
        monitorType: string
    ): void {
        const unexpectedEntries = Object.entries(unexpectedProperties);

        if (unexpectedEntries.length === 0) {
            return;
        }

        const errorMessage = `Monitor config '${monitorType}' contains unexpected properties`;
        const diagnosticError = new Error(errorMessage);

        logger.error(
            "[IpcService] Unexpected properties detected in monitor config",
            diagnosticError,
            {
                monitorType,
                unexpectedProperties: unexpectedEntries,
            }
        );

        throw diagnosticError;
    },

    /**
     * Extracts IPC-safe monitor configuration properties.
     *
     * @remarks
     * Returns the serializable subset of a monitor configuration while
     * capturing any unexpected keys for diagnostics.
     */
    extractAndValidateBaseProperties(
        config: ReturnType<typeof getAllMonitorTypeConfigs>[0]
    ): {
        baseProperties: {
            description: string;
            displayName: string;
            fields: MonitorFieldDefinition[];
            type: string;
            uiConfig: ReturnType<
                typeof getAllMonitorTypeConfigs
            >[0]["uiConfig"];
            version: string;
        };
        unexpectedProperties: UnknownRecord;
    } {
        const {
            description,
            displayName,
            fields,
            type,
            uiConfig,
            version,
            ...rest
        } = config;

        const knownProperties = new Set([
            "description",
            "displayName",
            "fields",
            "serviceFactory",
            "type",
            "uiConfig",
            "validationSchema",
            "version",
        ]);

        const unexpectedProperties = Object.fromEntries(
            Object.entries(rest).filter(([key]) => !knownProperties.has(key))
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
} as const;

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
    serializeDetailFormats(
        detailFormats?: unknown
    ): undefined | { analyticsLabel?: string } {
        if (!isUnknownRecord(detailFormats)) {
            return undefined;
        }

        const analyticsLabel = pickOptionalString(
            detailFormats["analyticsLabel"]
        );

        if (analyticsLabel === undefined) {
            return undefined;
        }

        return { analyticsLabel };
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
    serializeDisplayPreferences(
        display?: unknown
    ): undefined | { showAdvancedMetrics: boolean; showUrl: boolean } {
        if (!isUnknownRecord(display)) {
            return undefined;
        }

        return {
            showAdvancedMetrics: pickBooleanWithFallback(
                display["showAdvancedMetrics"],
                false
            ),
            showUrl: pickBooleanWithFallback(display["showUrl"], false),
        };
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
    serializeHelpTexts(
        helpTexts?: unknown
    ): undefined | { primary?: string; secondary?: string } {
        if (!isUnknownRecord(helpTexts)) {
            return undefined;
        }

        const result: { primary?: string; secondary?: string } = {};

        const primary = pickOptionalString(helpTexts["primary"]);
        const secondary = pickOptionalString(helpTexts["secondary"]);

        if (primary !== undefined) {
            result.primary = primary;
        }

        if (secondary !== undefined) {
            result.secondary = secondary;
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
    serializeUiConfig(
        uiConfig?: BaseMonitorUiConfig
    ): MonitorTypeConfig["uiConfig"] {
        if (!uiConfig) {
            return undefined;
        }

        const result: NonNullable<MonitorTypeConfig["uiConfig"]> = {
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
 *         this.ipcService = new IpcService(orchestrator, updater);
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

    /**
     * Cached synchronization status for responses to get-sync-status.
     */
    private stateSyncStatus: StateSyncStatusSummary;

    /** Tracks whether the state sync listener has been registered. */
    private stateSyncListenerRegistered = false;

    private readonly handleStateSyncStatusUpdate = (
        data: UptimeEvents["sites:state-synchronized"]
    ): void => {
        this.updateStateSyncStatus(data.sites, data.source, data.timestamp);
    };

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
     *
     * @public
     */
    public constructor(
        uptimeOrchestrator: UptimeOrchestrator,
        autoUpdaterService: AutoUpdaterService
    ) {
        this.uptimeOrchestrator = uptimeOrchestrator;
        this.autoUpdaterService = autoUpdaterService;
        this.stateSyncStatus = {
            lastSyncAt: null,
            siteCount: 0,
            source: STATE_SYNC_SOURCE.CACHE,
            synchronized: false,
        } satisfies StateSyncStatusSummary;
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

        this.registeredIpcHandlers.clear();

        if (this.stateSyncListenerRegistered) {
            this.uptimeOrchestrator.off(
                "sites:state-synchronized",
                this.handleStateSyncStatusUpdate
            );
            this.stateSyncListenerRegistered = false;
        }
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
        this.setupSettingsHandlers();
        this.setupSystemHandlers();
        this.setupStateSyncHandlers();
        this.setupDiagnosticsHandlers();
        this.ensureStateSyncListener();
    }

    private ensureStateSyncListener(): void {
        if (this.stateSyncListenerRegistered) {
            return;
        }

        this.uptimeOrchestrator.onTyped(
            "sites:state-synchronized",
            this.handleStateSyncStatusUpdate
        );
        this.stateSyncListenerRegistered = true;
    }

    private updateStateSyncStatus(
        sites: Site[],
        source: StateSyncSource,
        timestamp: number
    ): void {
        this.stateSyncStatus = {
            lastSyncAt: timestamp,
            siteCount: sites.length,
            source,
            synchronized: true,
        } satisfies StateSyncStatusSummary;
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
    ): MonitorTypeConfig {
        const { baseProperties, unexpectedProperties } =
            ConfigPropertyValidator.extractAndValidateBaseProperties(config);

        ConfigPropertyValidator.assertNoUnexpectedProperties(
            unexpectedProperties,
            baseProperties.type
        );

        const serializedUiConfig = UiConfigSerializer.serializeUiConfig(
            baseProperties.uiConfig
        );

        const sanitizedConfig: MonitorTypeConfig = {
            description: baseProperties.description,
            displayName: baseProperties.displayName,
            fields: baseProperties.fields,
            type: baseProperties.type,
            version: baseProperties.version,
            ...(serializedUiConfig ? { uiConfig: serializedUiConfig } : {}),
        };

        if (!isMonitorTypeConfig(sanitizedConfig)) {
            logger.error(
                "[IpcService] Sanitized monitor type config failed validation",
                undefined,
                {
                    monitorType: baseProperties.type,
                    sanitizedConfig,
                }
            );

            throw new Error(
                `[IpcService] Invalid monitor type config produced for '${baseProperties.type}': ${JSON.stringify(
                    sanitizedConfig
                )}`
            );
        }

        return sanitizedConfig;
    }

    /**
     * Registers IPC handlers for data management operations.
     *
     * @remarks
     * Handles export/import of configuration data and database backups using
     * standardized IPC patterns. All handlers use consistent response
     * formatting, parameter validation, and error handling. All handlers are
     * registered with unique channel names and are tracked for cleanup.
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
        /* eslint-enable @typescript-eslint/no-unsafe-type-assertion -- Re-enable after validated IPC argument type conversion */

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
     * Registers IPC handlers for settings management operations.
     *
     * @remarks
     * Handles history limit queries, updates, and full settings resets using
     * standardized IPC patterns. Handlers share consistent validation and
     * cleanup semantics.
     */
    private setupSettingsHandlers(): void {
        // Update history limit handler with validation
        /* eslint-disable @typescript-eslint/no-unsafe-type-assertion -- All settings handler arguments are validated by their respective validators before type assertion */
        registerStandardizedIpcHandler(
            "update-history-limit",
            async (...args: unknown[]) => {
                await this.uptimeOrchestrator.setHistoryLimit(
                    args[0] as number
                );
                return this.uptimeOrchestrator.getHistoryLimit();
            },
            SettingsHandlerValidators.updateHistoryLimit,
            this.registeredIpcHandlers
        );

        // Get history limit handler (no parameters)
        registerStandardizedIpcHandler(
            "get-history-limit",
            () => this.uptimeOrchestrator.getHistoryLimit(),
            SettingsHandlerValidators.getHistoryLimit,
            this.registeredIpcHandlers
        );

        // Reset settings handler (no parameters)
        registerStandardizedIpcHandler(
            "reset-settings",
            async () => this.uptimeOrchestrator.resetSettings(),
            SettingsHandlerValidators.resetSettings,
            this.registeredIpcHandlers
        );
        /* eslint-enable @typescript-eslint/no-unsafe-type-assertion -- Re-enable after validated IPC argument type conversion */
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

        // Start monitoring for all monitors within a specific site
        /* eslint-disable @typescript-eslint/no-unsafe-type-assertion -- All monitoring handler arguments are validated by their respective validators before type assertion */
        registerStandardizedIpcHandler(
            "start-monitoring-for-site",
            async (...args: unknown[]) => {
                const identifier = args[0] as string;
                return this.uptimeOrchestrator.startMonitoringForSite(
                    identifier
                );
            },
            MonitoringHandlerValidators.startMonitoringForSite,
            this.registeredIpcHandlers
        );

        // Start monitoring for specific monitor within a site
        registerStandardizedIpcHandler(
            "start-monitoring-for-monitor",
            async (...args: unknown[]) => {
                const identifier = args[0] as string;
                const monitorId = args[1] as string;
                return this.uptimeOrchestrator.startMonitoringForSite(
                    identifier,
                    monitorId
                );
            },
            MonitoringHandlerValidators.startMonitoringForMonitor,
            this.registeredIpcHandlers
        );

        // Stop monitoring for specific site/monitor
        registerStandardizedIpcHandler(
            "stop-monitoring-for-site",
            async (...args: unknown[]) => {
                const identifier = args[0] as string;
                return this.uptimeOrchestrator.stopMonitoringForSite(
                    identifier
                );
            },
            MonitoringHandlerValidators.stopMonitoringForSite,
            this.registeredIpcHandlers
        );

        // Stop monitoring for specific monitor within a site
        registerStandardizedIpcHandler(
            "stop-monitoring-for-monitor",
            async (...args: unknown[]) => {
                const identifier = args[0] as string;
                const monitorId = args[1] as string;
                return this.uptimeOrchestrator.stopMonitoringForSite(
                    identifier,
                    monitorId
                );
            },
            MonitoringHandlerValidators.stopMonitoringForMonitor,
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

                const sanitizedSites =
                    await this.uptimeOrchestrator.emitSitesStateSynchronized({
                        action: STATE_SYNC_ACTION.BULK_SYNC,
                        siteIdentifier: "all",
                        sites,
                        source: STATE_SYNC_SOURCE.DATABASE,
                        timestamp,
                    });

                const responseSites = sanitizedSites.map((site) =>
                    structuredClone(site)
                );

                logger.debug("[IpcService] Full sync completed", {
                    siteCount: responseSites.length,
                });
                this.updateStateSyncStatus(
                    responseSites,
                    STATE_SYNC_SOURCE.DATABASE,
                    timestamp
                );
                return {
                    completedAt: timestamp,
                    siteCount: responseSites.length,
                    sites: responseSites,
                    source: STATE_SYNC_SOURCE.DATABASE,
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
                const summary: StateSyncStatusSummary = {
                    lastSyncAt: this.stateSyncStatus.lastSyncAt ?? null,
                    siteCount: sites.length,
                    source: this.stateSyncStatus.source,
                    synchronized: this.stateSyncStatus.synchronized,
                };

                this.stateSyncStatus = summary;
                return summary;
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
     * opening. All handlers are registered through
     * {@link registerStandardizedIpcHandler} for consistent diagnostics and
     * cleanup semantics.
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

        registerStandardizedIpcHandler(
            "quit-and-install",
            () => {
                logger.info(LOG_TEMPLATES.services.UPDATER_QUIT_INSTALL);
                this.autoUpdaterService.quitAndInstall();
                return true;
            },
            SystemHandlerValidators.quitAndInstall,
            this.registeredIpcHandlers
        );
    }

    /**
     * Registers diagnostics handlers used by the preload bridge for runtime
     * validation.
     */
    private setupDiagnosticsHandlers(): void {
        registerStandardizedIpcHandler(
            "diagnostics-verify-ipc-handler",
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
            "diagnostics-report-preload-guard",
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
