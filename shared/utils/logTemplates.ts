/**
 * Standardized log message templates for consistent logging across the
 * application.
 *
 * @remarks
 * This module provides templates for common log messages to ensure consistency
 * while maintaining flexibility for dynamic content. Unlike ERROR_CATALOG,
 * these templates support interpolation and contextual information.
 *
 * **Usage Guidelines:**
 *
 * - Use for repeated log patterns across the codebase
 * - Templates support string interpolation for dynamic content
 * - Keep ERROR_CATALOG for user-facing errors
 * - Keep contextual debug logs as-is for performance
 *
 * @example
 *
 * ```typescript
 * import { LOG_TEMPLATES } from "@shared/utils/logTemplates";
 *
 * // Instead of: logger.info(`[SiteManager] Initialized with ${count} sites in cache`);
 * logger.info(LOG_TEMPLATES.services.SITE_MANAGER_INITIALIZED, { count });
 * ```
 *
 * @packageDocumentation
 */

/**
 * Logger interface for type safety.
 */
interface Logger {
    debug: (message: string, context?: Record<string, unknown>) => void;
    error: (message: string, context?: Record<string, unknown>) => void;
    info: (message: string, context?: Record<string, unknown>) => void;
    warn: (message: string, context?: Record<string, unknown>) => void;
}

/**
 * Service-related log message templates.
 */
export const SERVICE_LOGS = {
    /** Application activated */
    APPLICATION_ACTIVATED: "[ApplicationService] App activated",

    /** Application cleanup completed */
    APPLICATION_CLEANUP_COMPLETE: "[ApplicationService] Cleanup completed",

    /** Application cleanup started */
    APPLICATION_CLEANUP_START: "[ApplicationService] Starting cleanup",

    /** Application creating window */
    APPLICATION_CREATING_WINDOW:
        "[ApplicationService] No windows open, creating main window",

    /** Application service initialization */
    APPLICATION_INITIALIZING:
        "[ApplicationService] Initializing application services",

    /** Application quitting */
    APPLICATION_QUITTING: "[ApplicationService] Quitting app (non-macOS)",

    /** Application app ready */
    APPLICATION_READY: "[ApplicationService] App ready - initializing services",

    /** Application services initialized */
    APPLICATION_SERVICES_INITIALIZED:
        "[ApplicationService] All services initialized successfully",

    /** Application all windows closed */
    APPLICATION_WINDOWS_CLOSED: "[ApplicationService] All windows closed",

    /** Database backup created */
    DATABASE_BACKUP_CREATED:
        "[DatabaseBackup] Database backup created successfully",

    /** Database connection closed */
    DATABASE_CONNECTION_CLOSED:
        "[DatabaseService] Database connection closed safely",

    /** Database indexes created */
    DATABASE_INDEXES_CREATED:
        "[DatabaseSchema] All indexes created successfully",

    /** Database initialized successfully */
    DATABASE_INITIALIZED: "[DatabaseService] Database initialized successfully",

    /** Database monitor validation initialized */
    DATABASE_MONITOR_VALIDATION_INITIALIZED:
        "[DatabaseSchema] Monitor type validation initialized",

    /** Database monitor validation ready */
    DATABASE_MONITOR_VALIDATION_READY:
        "[DatabaseSchema] Monitor type validation framework ready",

    /** Database schema created */
    DATABASE_SCHEMA_CREATED:
        "[DatabaseSchema] Database schema created successfully",

    /** Database tables created */
    DATABASE_TABLES_CREATED: "[DatabaseSchema] All tables created successfully",

    /** History bulk insert */
    HISTORY_BULK_INSERT:
        "[HistoryManipulation] Bulk inserted {count} history entries for monitor: {monitorId}",

    /** IPC service cleanup */
    IPC_SERVICE_CLEANUP: "[IpcService] Cleaning up IPC handlers",

    /** Migration system */
    MIGRATION_APPLYING:
        "Applying migration: {monitorType} {fromVersion} → {toVersion}",

    MIGRATION_REGISTERED:
        "Registered migration for {monitorType}: {fromVersion} → {toVersion}",

    /** Monitor manager applying intervals */
    MONITOR_MANAGER_APPLYING_INTERVALS:
        "[MonitorManager] Completed applying default intervals for site: {identifier}",

    /** Monitor manager auto-starting */
    MONITOR_MANAGER_AUTO_STARTING:
        "[MonitorManager] Completed auto-starting monitoring for site: {identifier}",

    /** Monitor removed from site */
    MONITOR_REMOVED_FROM_SITE:
        "[SiteManager] Monitor {monitorId} removed from site {siteIdentifier}",

    /** Monitor started */
    MONITOR_STARTED:
        "Started monitoring for monitor {monitorId} on site {siteIdentifier}",
    /** Monitor stopped */
    MONITOR_STOPPED:
        "Stopped monitoring for monitor {monitorId} on site {siteIdentifier}",

    /** Site added successfully */
    SITE_ADDED_SUCCESS: "Site added successfully: {identifier} ({name})",

    /** Site manager initialized */
    SITE_MANAGER_INITIALIZED:
        "[SiteManager] Initialized with {count} sites in cache",

    /** Site manager initialized with cache */
    SITE_MANAGER_INITIALIZED_WITH_CACHE:
        "[SiteManager] Initialized with StandardizedCache",

    /** Site manager cache loading */
    SITE_MANAGER_LOADING_CACHE:
        "[SiteManager] Initializing - loading sites into cache",

    /** Auto updater messages */
    UPDATER_QUIT_INSTALL: "[AutoUpdaterService] Quitting and installing update",
} as const;

/**
 * Debug and diagnostic log templates.
 */
export const DEBUG_LOGS = {
    /** Application cleanup service */
    APPLICATION_CLEANUP_SERVICE: "[ApplicationService] Cleaning up {name}",

    /** Application forwarding events */
    APPLICATION_FORWARDING_CACHE_INVALIDATION:
        "[ApplicationService] Forwarding cache invalidation to renderer",
    APPLICATION_FORWARDING_MONITOR_STATUS:
        "[ApplicationService] Forwarding monitor status change to renderer",
    APPLICATION_FORWARDING_MONITOR_UP:
        "[ApplicationService] Monitor recovered - forwarding to renderer",
    APPLICATION_FORWARDING_MONITORING_STARTED:
        "[ApplicationService] Forwarding monitoring started to renderer",
    APPLICATION_FORWARDING_MONITORING_STOPPED:
        "[ApplicationService] Forwarding monitoring stopped to renderer",

    /** Background operations */
    BACKGROUND_LOAD_COMPLETE:
        "[SiteManager] Background site load completed: {identifier}",
    BACKGROUND_LOAD_START:
        "[SiteManager] Loading site in background: {identifier}",

    /** Event bus operations */
    EVENT_BUS_CLEARED:
        "[TypedEventBus:{busId}] Cleared {count} middleware functions",
    EVENT_BUS_CREATED:
        "[TypedEventBus:{busId}] Created new event bus (max middleware: {maxMiddleware})",
    EVENT_BUS_EMISSION_START:
        "[TypedEventBus:{busId}] Starting emission of '{eventName}' [{correlationId}]",
    EVENT_BUS_EMISSION_SUCCESS:
        "[TypedEventBus:{busId}] Successfully emitted '{eventName}' [{correlationId}]",
    EVENT_BUS_LISTENER_REGISTERED:
        "[TypedEventBus:{busId}] Registered listener for '{eventName}'",
    EVENT_BUS_LISTENER_REMOVED:
        "[TypedEventBus:{busId}] Removed listener(s) for '{eventName}'",
    EVENT_BUS_MIDDLEWARE_REMOVED:
        "[TypedEventBus:{busId}] Removed middleware (remaining: {count})",
    EVENT_BUS_ONE_TIME_LISTENER:
        "[TypedEventBus:{busId}] Registered one-time listener for '{eventName}'",

    /** History operations */
    HISTORY_ENTRY_ADDED:
        "[HistoryManipulation] Added history entry for monitor: {monitorId} - Status: {status}",

    /** Monitor lifecycle */
    MONITOR_AUTO_STARTED:
        "[MonitorManager] Auto-started monitoring for new monitor: {monitorId}",
    MONITOR_CHECK_START:
        "Checking monitor: site={siteIdentifier}, id={monitorId}, operation={operationId}",
    MONITOR_INTERVALS_APPLIED:
        "[MonitorManager] Applied interval for monitor {monitorId}: {interval}s",
    MONITOR_MANAGER_AUTO_STARTING_SITE:
        "[MonitorManager] Auto-starting monitoring for site: {identifier}",
    MONITOR_MANAGER_INTERVALS_SETTING:
        "[MonitorManager] Applying default intervals for site: {identifier}",
    MONITOR_MANAGER_NO_MONITORS_FOUND:
        "[MonitorManager] No monitors found for site: {identifier}",
    MONITOR_MANAGER_SETUP_MONITORS:
        "[MonitorManager] Setting up {count} new monitors for site: {identifier}",
    MONITOR_MANAGER_SKIP_AUTO_START:
        "[MonitorManager] Skipping auto-start for new monitors - site monitoring disabled",
    MONITOR_MANAGER_SKIP_INDIVIDUAL:
        "[MonitorManager] Skipping monitor {monitorId} - individual monitoring disabled",
    MONITOR_MANAGER_SKIP_NEW_INDIVIDUAL:
        "[MonitorManager] Skipping new monitor {monitorId} - individual monitoring disabled",
    MONITOR_MANAGER_VALID_MONITORS:
        "[MonitorManager] No valid new monitors found for site: {identifier}",
    MONITOR_RESPONSE_TIME:
        "[HttpMonitor] URL {url} responded with status {status} in {responseTime}ms",

    /** Operation management */
    OPERATION_CANCELLED: "Cancelled {count} operations for monitor {monitorId}",
    OPERATION_COMPLETED:
        "Completed operation {operationId} for monitor {monitorId}",
    OPERATION_TIMEOUT_SCHEDULED:
        "Scheduled timeout for operation {operationId} ({timeoutMs}ms)",

    /** Site operations */
    SITE_BACKGROUND_LOAD_FAILED:
        "[SiteManager] Site not found during background load: {identifier}",
    SITE_CACHE_MISS_ERROR: "[SiteManager] Failed to emit cache miss event",
    SITE_LOADING_ERROR_IGNORED:
        "[SiteManager] Background loading error ignored",
} as const;

/**
 * Error log templates.
 */
export const ERROR_LOGS = {
    /** Application errors */
    APPLICATION_CLEANUP_ERROR: "[ApplicationService] Error during cleanup",
    APPLICATION_FORWARD_CACHE_INVALIDATION_ERROR:
        "[ApplicationService] Failed to forward cache invalidation to renderer",
    APPLICATION_FORWARD_MONITOR_DOWN_ERROR:
        "[ApplicationService] Failed to forward monitor down to renderer",
    APPLICATION_FORWARD_MONITOR_STATUS_ERROR:
        "[ApplicationService] Failed to forward monitor status change to renderer",
    APPLICATION_FORWARD_MONITOR_UP_ERROR:
        "[ApplicationService] Failed to forward monitor up to renderer",
    APPLICATION_FORWARD_MONITORING_STARTED_ERROR:
        "[ApplicationService] Failed to forward monitoring started to renderer",
    APPLICATION_FORWARD_MONITORING_STOPPED_ERROR:
        "[ApplicationService] Failed to forward monitoring stopped to renderer",
    APPLICATION_INITIALIZATION_ERROR:
        "[ApplicationService] Error during app initialization",
    APPLICATION_SYSTEM_ERROR: "[ApplicationService] System error: {context}",
    APPLICATION_UPDATE_CHECK_ERROR:
        "[ApplicationService] Failed to check for updates",

    /** Database errors */
    DATABASE_BACKUP_FAILED: "[DatabaseBackup] Failed to create database backup",
    DATABASE_INDEXES_FAILED: "[DatabaseSchema] Failed to create indexes",
    DATABASE_SCHEMA_FAILED: "[DatabaseSchema] Failed to create database schema",
    DATABASE_TABLES_FAILED: "[DatabaseSchema] Failed to create tables",
    DATABASE_VALIDATION_SETUP_FAILED:
        "[DatabaseSchema] Failed to setup monitor type validation",

    /** Event bus errors */
    EVENT_BUS_EMISSION_FAILED:
        "[TypedEventBus:{busId}] Failed to emit '{eventName}' [{correlationId}]",

    /** History errors */
    HISTORY_ADD_FAILED:
        "[HistoryManipulation] Failed to add history entry for monitor: {monitorId}",
    HISTORY_BULK_INSERT_FAILED:
        "[HistoryManipulation] Failed to bulk insert history for monitor: {monitorId}",
    HISTORY_FETCH_FAILED:
        "[HistoryQuery] Failed to fetch history for monitor: {monitorId}",
    HISTORY_LATEST_FETCH_FAILED:
        "[HistoryQuery] Failed to get latest history entry for monitor: {monitorId}",
    HISTORY_MAPPER_FAILED:
        "[HistoryMapper] Failed to map database row to history entry",
    HISTORY_PRUNE_FAILED:
        "[HistoryManipulation] Failed to prune history for monitor: {monitorId}",

    /** Monitor errors */
    MONITOR_CHECK_ENHANCED_FAILED:
        "Enhanced monitor check failed for {monitorId}",
    MONITOR_MAPPER_FAILED: "[MonitorMapper] Failed to build monitor parameters",

    /** Settings errors */
    SETTINGS_MAPPER_FAILED:
        "[SettingsMapper:rowToSetting] Failed to map database row to setting",

    SITE_BACKGROUND_LOAD_EMIT_ERROR:
        "[SiteManager] Failed to emit background load error event",
    /** Site errors */
    SITE_BACKGROUND_LOAD_FAILED:
        "[SiteManager] Background site load failed for {identifier}",
    SITE_HISTORY_LIMIT_FAILED: "[SiteManager] Failed to set history limit",
    SITE_INITIALIZATION_FAILED: "[SiteManager] Failed to initialize cache",
    SITE_MAPPER_FAILED: "[SiteMapper] Failed to map database row to site",
    SITE_MONITOR_REMOVAL_FAILED:
        "[SiteManager] Failed to remove monitor {monitorId} from site {siteIdentifier}",
} as const;

/**
 * Warning and error log templates.
 */
export const WARNING_LOGS = {
    /** Application warnings */
    APPLICATION_MONITOR_DOWN:
        "[ApplicationService] Monitor failure detected - forwarding to renderer",

    /** Database warnings */
    DATABASE_MONITOR_VALIDATION_CONTINUE:
        "[DatabaseSchema] Continuing without monitor type validation",
    DATABASE_MONITOR_VALIDATION_MISSING:
        "[DatabaseSchema] No monitor types registered - validation will allow any type",

    /** History warnings */
    HISTORY_INVALID_STATUS:
        "[HistoryMapper] Invalid status value, defaulting to 'down'",

    /** Monitor warnings */
    MONITOR_ACTIVE_OPERATIONS_INVALID:
        "active_operations contains invalid or unsafe data, using empty array",
    MONITOR_ACTIVE_OPERATIONS_PARSE_FAILED:
        "Failed to parse active_operations, using empty array",
    MONITOR_CONFIG_UPDATE_FAILED_INSTANCE:
        "Failed to update config for monitor instance",
    MONITOR_CONFIG_UPDATE_FAILED_TYPE:
        "Failed to update config for monitor type {type}",
    MONITOR_FRESH_DATA_MISSING: "Fresh monitor data not found for {monitorId}",
    MONITOR_NOT_FOUND_CACHE: "Monitor {monitorId} not found, ignoring result",
    MONITOR_NOT_MONITORING:
        "Monitor {monitorId} no longer monitoring, ignoring result",
    MONITOR_TYPE_UNKNOWN_CHECK: "Unknown monitor type: {monitorType}",
    MONITOR_TYPE_UNKNOWN_DETAIL: "Unknown monitor type for detail formatting",
    MONITOR_TYPE_UNKNOWN_TITLE:
        "Unknown monitor type for title suffix formatting",

    /** Notification warnings */
    NOTIFICATIONS_UNSUPPORTED: "Notifications not supported on this platform",

    /** Operation warnings */
    OPERATION_TIMEOUT: "Operation {operationId} timed out, cancelling",
    RECURSIVE_CALL_PREVENTED:
        "Preventing recursive call for {identifier}/{monitorId}",

    /** Site not found warnings */
    SITE_NOT_FOUND_MANUAL:
        "Site {identifier} not found or has no monitors for manual check",
    SITE_NOT_FOUND_SCHEDULED:
        "Site {siteIdentifier} not found in cache for scheduled check",
} as const;

/**
 * Interface for the log templates catalog structure.
 *
 * @public
 */
export interface LogTemplatesInterface {
    readonly debug: typeof DEBUG_LOGS;
    readonly errors: typeof ERROR_LOGS;
    readonly services: typeof SERVICE_LOGS;
    readonly warnings: typeof WARNING_LOGS;
}

/**
 * Complete log templates catalog.
 */
export const LOG_TEMPLATES: LogTemplatesInterface = {
    debug: DEBUG_LOGS,
    errors: ERROR_LOGS,
    services: SERVICE_LOGS,
    warnings: WARNING_LOGS,
} as const;

/**
 * Type representing all possible log template values.
 */
export type LogTemplate =
    | (typeof DEBUG_LOGS)[keyof typeof DEBUG_LOGS]
    | (typeof ERROR_LOGS)[keyof typeof ERROR_LOGS]
    | (typeof SERVICE_LOGS)[keyof typeof SERVICE_LOGS]
    | (typeof WARNING_LOGS)[keyof typeof WARNING_LOGS];

/**
 * Helper function to interpolate template variables in log messages.
 *
 * @example
 *
 * ```typescript
 * const message = interpolateLogTemplate(
 *     "Site {identifier} loaded with {count} monitors",
 *     { identifier: "example.com", count: 3 }
 * );
 * // Returns: "Site example.com loaded with 3 monitors"
 * ```
 *
 * @param template - Log template string with variable placeholders
 * @param variables - Object containing variable values for interpolation
 *
 * @returns Interpolated log message
 */
export function interpolateLogTemplate(
    template: string,
    variables: Record<string, number | string>
): string {
    return template.replaceAll(
        // eslint-disable-next-line regexp/strict, regexp/require-unicode-sets-regexp -- Conflicting rules: strict wants escaped braces, require-unicode-sets wants v flag
        /{(?<variableName>[$_a-z][\w$]*)}/gi,
        (match, key) => {
            const value = variables[key as keyof typeof variables];
            return value === undefined ? match : String(value);
        }
    );
}

/**
 * Enhanced logger wrapper that supports template interpolation.
 *
 * @example
 *
 * ```typescript
 * import { createTemplateLogger } from "@shared/utils/logTemplates";
 *
 * const logger = createTemplateLogger(baseLogger);
 *
 * // Use with templates
 * logger.info(LOG_TEMPLATES.services.SITE_MANAGER_INITIALIZED, {
 *     count: 42,
 * });
 *
 * // Use normally for dynamic content
 * logger.debug(`Processing site ${siteId} with custom logic`);
 * ```
 */
export function createTemplateLogger(baseLogger: Logger): {
    debug: (
        message: string,
        variables?: Record<string, number | string>
    ) => void;
    error: (
        message: string,
        variables?: Record<string, number | string>
    ) => void;
    info: (
        message: string,
        variables?: Record<string, number | string>
    ) => void;
    warn: (
        message: string,
        variables?: Record<string, number | string>
    ) => void;
} {
    return {
        debug: (
            message: string,
            variables?: Record<string, number | string>
        ): void => {
            const interpolated = variables
                ? interpolateLogTemplate(message, variables)
                : message;
            baseLogger.debug(interpolated, variables);
        },
        error: (
            message: string,
            variables?: Record<string, number | string>
        ): void => {
            const interpolated = variables
                ? interpolateLogTemplate(message, variables)
                : message;
            baseLogger.error(interpolated, variables);
        },
        info: (
            message: string,
            variables?: Record<string, number | string>
        ): void => {
            const interpolated = variables
                ? interpolateLogTemplate(message, variables)
                : message;
            baseLogger.info(interpolated, variables);
        },
        warn: (
            message: string,
            variables?: Record<string, number | string>
        ): void => {
            const interpolated = variables
                ? interpolateLogTemplate(message, variables)
                : message;
            baseLogger.warn(interpolated, variables);
        },
    };
}
