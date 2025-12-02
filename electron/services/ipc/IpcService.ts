/**
 * IPC service for secure communication between main and renderer processes.
 *
 * @remarks
 * Handles all IPC channels for sites, monitors, data operations, settings, and
 * system functions. Provides type-safe communication with proper error handling
 * and validation.
 */
import type { MonitorFieldDefinition, Site } from "@shared/types";
import type { EventMetadata } from "@shared/types/events";
import type {
    IpcHandlerVerificationLogMetadata,
    IpcInvokeChannel,
    PreloadGuardDiagnosticsLogMetadata,
    PreloadGuardDiagnosticsReport,
    SerializedDatabaseBackupResult,
} from "@shared/types/ipc";
import type { MonitorTypeConfig } from "@shared/types/monitorTypes";
import type {
    StateSyncSource,
    StateSyncStatusSummary,
} from "@shared/types/stateSync";
import type { DuplicateSiteIdentifier } from "@shared/validation/siteIntegrity";
import type { UnknownRecord } from "type-fest";

import { isMonitorTypeConfig } from "@shared/types/monitorTypes";
import {
    DATA_CHANNELS,
    MONITOR_TYPES_CHANNELS,
    MONITORING_CHANNELS,
    NOTIFICATION_CHANNELS,
    SETTINGS_CHANNELS,
    SITES_CHANNELS,
    STATE_SYNC_CHANNELS,
    SYSTEM_CHANNELS,
} from "@shared/types/preload";
import { STATE_SYNC_ACTION, STATE_SYNC_SOURCE } from "@shared/types/stateSync";
import { ensureError } from "@shared/utils/errorHandling";
import { LOG_TEMPLATES } from "@shared/utils/logTemplates";
import { deriveSiteSnapshot } from "@shared/utils/siteSnapshots";
import { isRecord } from "@shared/utils/typeHelpers";
import { validateMonitorData } from "@shared/validation/schemas";
import { ipcMain, shell } from "electron";

import type { UptimeEvents } from "../../events/eventTypes";
import type { UptimeOrchestrator } from "../../UptimeOrchestrator";
import type { NotificationService } from "../notifications/NotificationService";
import type { AutoUpdaterService } from "../updater/AutoUpdaterService";

import { ScopedSubscriptionManager } from "../../events/ScopedSubscriptionManager";
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
    NotificationHandlerValidators,
    SettingsHandlerValidators,
    SiteHandlerValidators,
    StateSyncHandlerValidators,
    SystemHandlerValidators,
} from "./validators";

const UPDATE_NOTIFICATION_PREFERENCES_CHANNEL =
    "update-notification-preferences";

const DIAGNOSTICS_VERIFY_CHANNEL: Extract<
    IpcInvokeChannel,
    "diagnostics-verify-ipc-handler"
> = "diagnostics-verify-ipc-handler";

const DIAGNOSTICS_REPORT_CHANNEL: Extract<
    IpcInvokeChannel,
    "diagnostics-report-preload-guard"
> = "diagnostics-report-preload-guard";

const environment = process.env["NODE_ENV"];
const notificationChannelCandidate = Reflect.get(
    NOTIFICATION_CHANNELS,
    "updatePreferences"
);

if (typeof notificationChannelCandidate !== "string") {
    throw new TypeError(
        "Notification channel constant is not a string at build time"
    );
}

const registeredNotificationChannel = notificationChannelCandidate;
const notificationChannelMismatchDetected =
    registeredNotificationChannel.localeCompare(
        UPDATE_NOTIFICATION_PREFERENCES_CHANNEL
    ) !== 0;

if (environment !== "production" && notificationChannelMismatchDetected) {
    throw new Error("Notification channel mapping mismatch detected");
}

interface NormalizedNotificationPreferences {
    enabled: boolean;
    playSound: boolean;
}

const normalizeNotificationPreferenceUpdate = (
    candidate: unknown
): NormalizedNotificationPreferences => {
    if (!isRecord(candidate)) {
        throw new TypeError(
            "Invalid notification preference payload received via IPC"
        );
    }

    const systemNotificationsEnabledValue = Reflect.get(
        candidate,
        "systemNotificationsEnabled"
    );
    const systemNotificationsSoundEnabledValue = Reflect.get(
        candidate,
        "systemNotificationsSoundEnabled"
    );

    if (
        typeof systemNotificationsEnabledValue !== "boolean" ||
        typeof systemNotificationsSoundEnabledValue !== "boolean"
    ) {
        throw new TypeError(
            "Invalid notification preference payload received via IPC"
        );
    }

    return {
        enabled: systemNotificationsEnabledValue,
        playSound: systemNotificationsSoundEnabledValue,
    } satisfies NormalizedNotificationPreferences;
};

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

const withIgnoredIpcEvent = <Args extends unknown[], ReturnValue>(
    handler: (...args: Args) => ReturnValue
): ((...args: Args) => ReturnValue) => handler;

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
    private readonly registeredIpcHandlers = new Set<IpcInvokeChannel>();

    /** Manages orchestrator listener lifetimes for teardown safety. */
    private readonly scopedSubscriptions = new ScopedSubscriptionManager();

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

    private readonly notificationService: NotificationService;

    private readonly handleStateSyncStatusUpdate = (
        data: UptimeEvents["sites:state-synchronized"] & {
            _meta: EventMetadata;
        }
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
        autoUpdaterService: AutoUpdaterService,
        notificationService: NotificationService
    ) {
        this.uptimeOrchestrator = uptimeOrchestrator;
        this.autoUpdaterService = autoUpdaterService;
        this.notificationService = notificationService;
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

        this.scopedSubscriptions.clearAll({
            onError: (error) => {
                logger.error(
                    "[IpcService] Failed to dispose event subscription",
                    { error: ensureError(error) }
                );
            },
            suppressErrors: true,
        });

        this.stateSyncListenerRegistered = false;
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
     * 5. Notification preference handlers
     * 6. System operation handlers
     * 7. State synchronization handlers
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
        this.setupNotificationHandlers();
        this.setupSystemHandlers();
        this.setupStateSyncHandlers();
        this.setupDiagnosticsHandlers();
        this.ensureStateSyncListener();
    }

    private ensureStateSyncListener(): void {
        if (this.stateSyncListenerRegistered) {
            return;
        }

        this.scopedSubscriptions.onTyped<
            UptimeEvents,
            "sites:state-synchronized"
        >(
            this.uptimeOrchestrator,
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
            DATA_CHANNELS.exportData,
            withIgnoredIpcEvent(() => this.uptimeOrchestrator.exportData()),
            DataHandlerValidators.exportData,
            this.registeredIpcHandlers
        );

        // Import data handler with validation
        registerStandardizedIpcHandler(
            DATA_CHANNELS.importData,
            withIgnoredIpcEvent((serializedBackup) =>
                this.uptimeOrchestrator.importData(serializedBackup)
            ),
            DataHandlerValidators.importData,
            this.registeredIpcHandlers
        );

        // Download SQLite backup handler (no parameters)
        registerStandardizedIpcHandler(
            DATA_CHANNELS.downloadSqliteBackup,
            withIgnoredIpcEvent(async () => {
                const result = await this.uptimeOrchestrator.downloadBackup();

                const arrayBuffer = new ArrayBuffer(result.buffer.byteLength);
                new Uint8Array(arrayBuffer).set(result.buffer);

                return {
                    buffer: arrayBuffer,
                    fileName: result.fileName,
                } satisfies SerializedDatabaseBackupResult;
            }),
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
        registerStandardizedIpcHandler(
            SETTINGS_CHANNELS.updateHistoryLimit,
            withIgnoredIpcEvent(async (historyLimit) => {
                await this.uptimeOrchestrator.setHistoryLimit(historyLimit);
                return this.uptimeOrchestrator.getHistoryLimit();
            }),
            SettingsHandlerValidators.updateHistoryLimit,
            this.registeredIpcHandlers
        );

        // Get history limit handler (no parameters)
        registerStandardizedIpcHandler(
            SETTINGS_CHANNELS.getHistoryLimit,
            withIgnoredIpcEvent(() =>
                this.uptimeOrchestrator.getHistoryLimit()
            ),
            SettingsHandlerValidators.getHistoryLimit,
            this.registeredIpcHandlers
        );

        // Reset settings handler (no parameters)
        registerStandardizedIpcHandler(
            SETTINGS_CHANNELS.resetSettings,
            withIgnoredIpcEvent(async (): Promise<undefined> => {
                await this.uptimeOrchestrator.resetSettings();
                return undefined;
            }),
            SettingsHandlerValidators.resetSettings,
            this.registeredIpcHandlers
        );
    }

    /**
     * Registers IPC handlers for notification preference updates.
     */
    private setupNotificationHandlers(): void {
        registerStandardizedIpcHandler(
            UPDATE_NOTIFICATION_PREFERENCES_CHANNEL,
            withIgnoredIpcEvent((payload): undefined => {
                const preferences =
                    normalizeNotificationPreferenceUpdate(payload);

                this.notificationService.updateConfig(preferences);
                return undefined;
            }),
            NotificationHandlerValidators.updatePreferences,
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
            MONITORING_CHANNELS.startMonitoring,
            withIgnoredIpcEvent(() =>
                this.uptimeOrchestrator.startMonitoring()
            ),
            MonitoringHandlerValidators.startMonitoring,
            this.registeredIpcHandlers
        );

        // Stop monitoring globally (no parameters)
        registerStandardizedIpcHandler(
            MONITORING_CHANNELS.stopMonitoring,
            withIgnoredIpcEvent(() => this.uptimeOrchestrator.stopMonitoring()),
            MonitoringHandlerValidators.stopMonitoring,
            this.registeredIpcHandlers
        );

        // Start monitoring for all monitors within a specific site
        registerStandardizedIpcHandler(
            MONITORING_CHANNELS.startMonitoringForSite,
            withIgnoredIpcEvent((siteIdentifier) =>
                this.uptimeOrchestrator.startMonitoringForSite(siteIdentifier)
            ),
            MonitoringHandlerValidators.startMonitoringForSite,
            this.registeredIpcHandlers
        );

        // Start monitoring for specific monitor within a site
        registerStandardizedIpcHandler(
            MONITORING_CHANNELS.startMonitoringForMonitor,
            withIgnoredIpcEvent((siteIdentifier, monitorIdentifier) =>
                this.uptimeOrchestrator.startMonitoringForSite(
                    siteIdentifier,
                    monitorIdentifier
                )
            ),
            MonitoringHandlerValidators.startMonitoringForMonitor,
            this.registeredIpcHandlers
        );

        // Stop monitoring for specific site/monitor
        registerStandardizedIpcHandler(
            MONITORING_CHANNELS.stopMonitoringForSite,
            withIgnoredIpcEvent((siteIdentifier) =>
                this.uptimeOrchestrator.stopMonitoringForSite(siteIdentifier)
            ),
            MonitoringHandlerValidators.stopMonitoringForSite,
            this.registeredIpcHandlers
        );

        // Stop monitoring for specific monitor within a site
        registerStandardizedIpcHandler(
            MONITORING_CHANNELS.stopMonitoringForMonitor,
            withIgnoredIpcEvent((siteIdentifier, monitorIdentifier) =>
                this.uptimeOrchestrator.stopMonitoringForSite(
                    siteIdentifier,
                    monitorIdentifier
                )
            ),
            MonitoringHandlerValidators.stopMonitoringForMonitor,
            this.registeredIpcHandlers
        );

        // Check site manually with validation
        registerStandardizedIpcHandler(
            MONITORING_CHANNELS.checkSiteNow,
            withIgnoredIpcEvent((siteIdentifier, monitorIdentifier) =>
                this.uptimeOrchestrator.checkSiteManually(
                    siteIdentifier,
                    monitorIdentifier
                )
            ),
            MonitoringHandlerValidators.checkSiteNow,
            this.registeredIpcHandlers
        );
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
            MONITOR_TYPES_CHANNELS.getMonitorTypes,
            withIgnoredIpcEvent(() => {
                // Get all monitor type configs and serialize them safely for
                // IPC
                const configs = getAllMonitorTypeConfigs();
                return configs.map((config) =>
                    this.serializeMonitorTypeConfig(config)
                );
            }),
            MonitorTypeHandlerValidators.getMonitorTypes,
            this.registeredIpcHandlers
        );

        // Format monitor detail handler with validation
        registerStandardizedIpcHandler(
            MONITOR_TYPES_CHANNELS.formatMonitorDetail,
            withIgnoredIpcEvent((monitorType, details) => {
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
            }),
            MonitorTypeHandlerValidators.formatMonitorDetail,
            this.registeredIpcHandlers
        );

        // Format monitor title suffix handler with validation
        registerStandardizedIpcHandler(
            MONITOR_TYPES_CHANNELS.formatMonitorTitleSuffix,
            withIgnoredIpcEvent((monitorType, monitor) => {
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
            }),
            MonitorTypeHandlerValidators.formatMonitorTitleSuffix,
            this.registeredIpcHandlers
        );

        // Validate monitor data handler with special validation response format
        registerStandardizedIpcHandler(
            MONITOR_TYPES_CHANNELS.validateMonitorData,
            withIgnoredIpcEvent((monitorType, data) => {
                // Use the validation function from the registry
                const result = validateMonitorData(monitorType.trim(), data);

                const metadata = isRecord(result.metadata)
                    ? result.metadata
                    : undefined;

                // Return the validation result directly - map success to
                // success parameter
                return createValidationResponse(
                    result.success,
                    result.errors,
                    result.warnings,
                    metadata
                );
            }),
            MonitorTypeHandlerValidators.validateMonitorData,
            this.registeredIpcHandlers
        );
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
        registerStandardizedIpcHandler(
            SITES_CHANNELS.addSite,
            withIgnoredIpcEvent((site) =>
                this.uptimeOrchestrator.addSite(site)
            ),
            SiteHandlerValidators.addSite,
            this.registeredIpcHandlers
        );

        // Delete all sites handler (no parameters)
        registerStandardizedIpcHandler(
            SITES_CHANNELS.deleteAllSites,
            withIgnoredIpcEvent(async () => {
                logger.info("delete-all-sites IPC handler called");
                const result = await this.uptimeOrchestrator.deleteAllSites();
                logger.info(
                    `delete-all-sites completed, deleted ${result} sites`
                );
                return result;
            }),
            SiteHandlerValidators.deleteAllSites,
            this.registeredIpcHandlers
        );

        // Remove site handler with validation
        registerStandardizedIpcHandler(
            SITES_CHANNELS.removeSite,
            withIgnoredIpcEvent((siteIdentifier) =>
                this.uptimeOrchestrator.removeSite(siteIdentifier)
            ),
            SiteHandlerValidators.removeSite,
            this.registeredIpcHandlers
        );

        // Get sites handler (no parameters)
        registerStandardizedIpcHandler(
            SITES_CHANNELS.getSites,
            withIgnoredIpcEvent(async () => {
                const sites = await this.uptimeOrchestrator.getSites();
                const snapshot = deriveSiteSnapshot(sites);

                if (snapshot.duplicates.length > 0) {
                    logger.error(
                        "[IpcService] Duplicate site identifiers detected in get-sites response",
                        undefined,
                        {
                            duplicateCount: snapshot.duplicates.length,
                            duplicates: snapshot.duplicates.map(
                                (entry: DuplicateSiteIdentifier) => ({
                                    identifier: entry.identifier,
                                    occurrences: entry.occurrences,
                                })
                            ),
                            originalSites: sites.length,
                            sanitizedSites: snapshot.sanitizedSites.length,
                        }
                    );
                }

                return snapshot.sanitizedSites.map((site) =>
                    structuredClone(site)
                );
            }),
            SiteHandlerValidators.getSites,
            this.registeredIpcHandlers
        );

        // Update site handler with validation
        registerStandardizedIpcHandler(
            SITES_CHANNELS.updateSite,
            withIgnoredIpcEvent((siteIdentifier, updates) =>
                this.uptimeOrchestrator.updateSite(siteIdentifier, updates)
            ),
            SiteHandlerValidators.updateSite,
            this.registeredIpcHandlers
        );

        // Remove monitor handler with validation
        registerStandardizedIpcHandler(
            SITES_CHANNELS.removeMonitor,
            withIgnoredIpcEvent((siteIdentifier, monitorIdentifier) =>
                this.uptimeOrchestrator.removeMonitor(
                    siteIdentifier,
                    monitorIdentifier
                )
            ),
            SiteHandlerValidators.removeMonitor,
            this.registeredIpcHandlers
        );
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
            STATE_SYNC_CHANNELS.requestFullSync,
            withIgnoredIpcEvent(async () => {
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
            }),
            StateSyncHandlerValidators.requestFullSync,
            this.registeredIpcHandlers
        );

        // Get sync status handler (no parameters)
        registerStandardizedIpcHandler(
            STATE_SYNC_CHANNELS.getSyncStatus,
            withIgnoredIpcEvent(() => {
                const siteCount = this.uptimeOrchestrator.getCachedSiteCount();
                const summary: StateSyncStatusSummary = {
                    lastSyncAt: this.stateSyncStatus.lastSyncAt ?? null,
                    siteCount,
                    source: this.stateSyncStatus.source,
                    synchronized: this.stateSyncStatus.synchronized,
                };

                this.stateSyncStatus = summary;
                return summary;
            }),
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
            SYSTEM_CHANNELS.openExternal,
            withIgnoredIpcEvent(async (url) => {
                await shell.openExternal(url);
                return true;
            }),
            SystemHandlerValidators.openExternal,
            this.registeredIpcHandlers
        );

        registerStandardizedIpcHandler(
            SYSTEM_CHANNELS.quitAndInstall,
            withIgnoredIpcEvent(() => {
                logger.info(LOG_TEMPLATES.services.UPDATER_QUIT_INSTALL);
                this.autoUpdaterService.quitAndInstall();
                return true;
            }),
            SystemHandlerValidators.quitAndInstall,
            this.registeredIpcHandlers
        );
    }

    /**
     * Registers diagnostics handlers used by the preload bridge for runtime
     * validation.
     */
    private setupDiagnosticsHandlers(): void {
        registerStandardizedIpcHandler<"diagnostics-verify-ipc-handler">(
            DIAGNOSTICS_VERIFY_CHANNEL,
            withIgnoredIpcEvent((channelRaw) => {
                if (typeof channelRaw !== "string") {
                    throw new TypeError(
                        "Channel name must be a non-empty string"
                    );
                }

                const availableChannels = Array.from(
                    this.registeredIpcHandlers
                ).toSorted((left, right) => left.localeCompare(right));

                const matchedChannel = availableChannels.find(
                    (registeredChannel) => registeredChannel === channelRaw
                );
                const isRegistered = matchedChannel !== undefined;

                if (isRegistered) {
                    recordSuccessfulHandlerCheck();
                } else {
                    recordMissingHandler(channelRaw);
                    const logMetadata: IpcHandlerVerificationLogMetadata = {
                        availableChannels,
                        channel: channelRaw,
                    };
                    logger.error(
                        "[IpcService] Missing IPC handler requested by preload bridge",
                        logMetadata
                    );
                }

                return {
                    availableChannels,
                    channel: channelRaw,
                    registered: isRegistered,
                };
            }),
            SystemHandlerValidators.verifyIpcHandler,
            this.registeredIpcHandlers
        );

        registerStandardizedIpcHandler<"diagnostics-report-preload-guard">(
            DIAGNOSTICS_REPORT_CHANNEL,
            withIgnoredIpcEvent((reportCandidate): undefined => {
                if (!isPreloadGuardDiagnosticsReport(reportCandidate)) {
                    throw new TypeError(
                        "Invalid preload guard diagnostics payload"
                    );
                }

                const report = reportCandidate;

                recordPreloadGuardFailure(report);

                const logMetadata: PreloadGuardDiagnosticsLogMetadata = {
                    channel: report.channel,
                    guard: report.guard,
                    ...(report.metadata !== undefined && {
                        metadata: report.metadata,
                    }),
                    ...(report.payloadPreview !== undefined && {
                        payloadPreview: report.payloadPreview,
                    }),
                    ...(report.reason !== undefined && {
                        reason: report.reason,
                    }),
                    timestamp: report.timestamp,
                };

                diagnosticsLogger.warn(
                    "[IpcDiagnostics] Preload guard rejected payload",
                    logMetadata
                );

                return undefined;
            }),
            SystemHandlerValidators.reportPreloadGuard,
            this.registeredIpcHandlers
        );
    }
}
