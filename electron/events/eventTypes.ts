/**
 * Type definitions and event contracts for all events in the Uptime Watcher
 * application.
 *
 * @remarks
 * Provides compile-time type safety for event data and event names across the
 * application. Events are organized by domain (site, monitor, database, system,
 * etc.) and include comprehensive metadata for debugging, auditing, and
 * middleware processing.
 *
 * @public
 *
 * @see {@link UptimeEvents}
 */

import type { Monitor, Site, StatusUpdate } from "@shared/types";

/**
 * Comprehensive event map for the Uptime Watcher application.
 *
 * @remarks
 * Defines all events that can be emitted throughout the application lifecycle,
 * organized by functional domains. Each event includes strongly typed data for
 * compile-time safety and comprehensive metadata for debugging, auditing, and
 * event-driven workflows.
 *
 * @public
 *
 * @see {@link EventCategory}
 * @see {@link EventCheckType}
 * @see {@link EventEnvironment}
 * @see {@link EventReason}
 * @see {@link EventSeverity}
 * @see {@link EventSource}
 * @see {@link EventTriggerType}
 */
export interface UptimeEvents extends Record<string, unknown> {
    // Site events

    /**
     * Emitted when a cache entry is invalidated for a site or monitor.
     *
     * @remarks
     * Used to trigger cache refreshes or notify listeners of data changes.
     *
     * @param identifier - Optional unique identifier for the cache entry.
     * @param reason - Reason for invalidation ("delete", "expiry", "manual", or
     *   "update").
     * @param timestamp - Unix timestamp (ms) when invalidation occurred.
     * @param type - Type of cache invalidated ("all", "monitor", or "site").
     */
    "cache:invalidated": {
        identifier?: string;
        reason: "delete" | "expiry" | "manual" | "update";
        timestamp: number;
        type: "all" | "monitor" | "site";
    };

    /**
     * Emitted when a configuration setting is changed.
     *
     * @remarks
     * Used to propagate configuration changes throughout the application.
     *
     * @param newValue - The new value of the setting.
     * @param oldValue - The previous value of the setting.
     * @param setting - The name of the setting that changed.
     * @param source - The origin of the change ("migration", "system", or
     *   "user").
     * @param timestamp - Unix timestamp (ms) when the change occurred.
     */
    "config:changed": {
        newValue: unknown;
        oldValue: unknown;
        setting: string;
        source: "migration" | "system" | "user";
        timestamp: number;
    };

    /**
     * Emitted when a database backup is created.
     *
     * @remarks
     * Used for backup tracking and notification.
     *
     * @param fileName - Name of the backup file.
     * @param size - Size of the backup file in bytes.
     * @param timestamp - Unix timestamp (ms) when backup was created.
     * @param triggerType - What triggered the backup ("manual", "scheduled", or
     *   "shutdown").
     */
    "database:backup-created": {
        fileName: string;
        size: number;
        timestamp: number;
        triggerType: "manual" | "scheduled" | "shutdown";
    };

    // Monitor events

    /**
     * Emitted when a database error occurs.
     *
     * @remarks
     * Additional properties may be present for context.
     *
     * @param error - The error object.
     * @param operation - The database operation that failed.
     * @param timestamp - Unix timestamp (ms) when the error occurred.
     */
    "database:error": {
        [key: string]: unknown;
        error: Error;
        operation: string;
        timestamp: number;
    };

    /**
     * Emitted when a database operation is retried after failure.
     *
     * @remarks
     * Additional properties may be present for context.
     *
     * @param attempt - The retry attempt number.
     * @param operation - The database operation being retried.
     * @param timestamp - Unix timestamp (ms) when the retry occurred.
     */
    "database:retry": {
        [key: string]: unknown;
        attempt: number;
        operation: string;
        timestamp: number;
    };

    /**
     * Emitted when a database operation succeeds.
     *
     * @remarks
     * Additional properties may be present for context.
     *
     * @param duration - Optional duration (ms) of the operation.
     * @param operation - The database operation that succeeded.
     * @param timestamp - Unix timestamp (ms) when the operation succeeded.
     */
    "database:success": {
        [key: string]: unknown;
        duration?: number;
        operation: string;
        timestamp: number;
    };

    /**
     * Emitted when a database transaction completes.
     *
     * @param duration - Duration (ms) of the transaction.
     * @param operation - The database operation performed in the transaction.
     * @param recordsAffected - Optional number of records affected.
     * @param success - Whether the transaction was successful.
     * @param timestamp - Unix timestamp (ms) when the transaction completed.
     */
    "database:transaction-completed": {
        duration: number;
        operation: string;
        recordsAffected?: number;
        success: boolean;
        timestamp: number;
    };

    /**
     * Emitted when a database backup is downloaded.
     *
     * @param fileName - Optional name of the backup file.
     * @param operation - The operation type (always "backup-downloaded").
     * @param success - Whether the download was successful.
     * @param timestamp - Unix timestamp (ms) when the download completed.
     */
    "internal:database:backup-downloaded": {
        fileName?: string;
        operation: "backup-downloaded";
        success: boolean;
        timestamp: number;
    };

    /**
     * Emitted when database data is exported.
     *
     * @param fileName - Optional name of the exported file.
     * @param operation - The operation type (always "data-exported").
     * @param success - Whether the export was successful.
     * @param timestamp - Unix timestamp (ms) when the export completed.
     */
    "internal:database:data-exported": {
        fileName?: string;
        operation: "data-exported";
        success: boolean;
        timestamp: number;
    };

    /**
     * Emitted when database data is imported.
     *
     * @param operation - The operation type (always "data-imported").
     * @param recordCount - Optional number of records imported.
     * @param success - Whether the import was successful.
     * @param timestamp - Unix timestamp (ms) when the import completed.
     */
    "internal:database:data-imported": {
        operation: "data-imported";
        recordCount?: number;
        success: boolean;
        timestamp: number;
    };

    /**
     * Emitted when a request is made to get sites from the cache.
     *
     * @param operation - The operation type (always
     *   "get-sites-from-cache-requested").
     * @param timestamp - Unix timestamp (ms) when the request was made.
     */
    "internal:database:get-sites-from-cache-requested": {
        operation: "get-sites-from-cache-requested";
        timestamp: number;
    };

    /**
     * Emitted in response to a get-sites-from-cache request.
     *
     * @param operation - The operation type (always
     *   "get-sites-from-cache-response").
     * @param sites - The list of sites returned from the cache.
     * @param timestamp - Unix timestamp (ms) when the response was sent.
     */
    "internal:database:get-sites-from-cache-response": {
        operation: "get-sites-from-cache-response";
        sites: Site[];
        timestamp: number;
    };

    /**
     * Emitted when the history limit for the database is updated.
     *
     * @param limit - The new history limit value.
     * @param operation - The operation type (always "history-limit-updated").
     * @param timestamp - Unix timestamp (ms) when the update occurred.
     */
    "internal:database:history-limit-updated": {
        limit: number;
        operation: "history-limit-updated";
        timestamp: number;
    };

    /**
     * Emitted when the database is initialized.
     *
     * @param operation - The operation type (always "initialized").
     * @param success - Whether initialization was successful.
     * @param timestamp - Unix timestamp (ms) when initialization completed.
     */
    "internal:database:initialized": {
        operation: "initialized";
        success: boolean;
        timestamp: number;
    };

    /**
     * Emitted when the sites cache is refreshed in the database.
     *
     * @param operation - The operation type (always "sites-refreshed").
     * @param siteCount - The number of sites refreshed.
     * @param timestamp - Unix timestamp (ms) when the refresh completed.
     */
    "internal:database:sites-refreshed": {
        operation: "sites-refreshed";
        siteCount: number;
        timestamp: number;
    };

    /**
     * Emitted when a request is made to update the sites cache.
     *
     * @param operation - The operation type (always
     *   "update-sites-cache-requested").
     * @param sites - Optional list of sites to update in the cache.
     * @param timestamp - Unix timestamp (ms) when the request was made.
     */
    "internal:database:update-sites-cache-requested": {
        operation: "update-sites-cache-requested";
        sites?: Site[];
        timestamp: number;
    };

    // Configuration events

    /**
     * Emitted when all monitors are started.
     *
     * @param monitorCount - The number of monitors started.
     * @param operation - The operation type (always "all-started").
     * @param siteCount - The number of sites involved.
     * @param timestamp - Unix timestamp (ms) when the operation completed.
     */
    "internal:monitor:all-started": {
        monitorCount: number;
        operation: "all-started";
        siteCount: number;
        timestamp: number;
    };

    /**
     * Emitted when all monitors are stopped.
     *
     * @param activeMonitors - The number of monitors that were active.
     * @param operation - The operation type (always "all-stopped").
     * @param reason - The reason for stopping.
     * @param timestamp - Unix timestamp (ms) when the operation completed.
     */
    "internal:monitor:all-stopped": {
        activeMonitors: number;
        operation: "all-stopped";
        reason: EventReason;
        timestamp: number;
    };

    /**
     * Emitted when a manual monitor check is completed.
     *
     * @param identifier - The unique identifier for the monitor or site.
     * @param monitorId - Optional monitor ID.
     * @param operation - The operation type (always "manual-check-completed").
     * @param result - The status update result.
     * @param timestamp - Unix timestamp (ms) when the check completed.
     */
    "internal:monitor:manual-check-completed": {
        identifier: string;
        monitorId?: string;
        operation: "manual-check-completed";
        result: StatusUpdate;
        timestamp: number;
    };

    /**
     * Emitted when site setup for monitoring is completed.
     *
     * @param identifier - The unique identifier for the site.
     * @param operation - The operation type (always "site-setup-completed").
     * @param timestamp - Unix timestamp (ms) when setup completed.
     */
    "internal:monitor:site-setup-completed": {
        identifier: string;
        operation: "site-setup-completed";
        timestamp: number;
    };

    /**
     * Emitted when a monitor is started.
     *
     * @param identifier - The unique identifier for the monitor or site.
     * @param monitorId - Optional monitor ID.
     * @param operation - The operation type (always "started").
     * @param timestamp - Unix timestamp (ms) when the monitor started.
     */
    "internal:monitor:started": {
        identifier: string;
        monitorId?: string;
        operation: "started";
        timestamp: number;
    };

    /**
     * Emitted when a monitor is stopped.
     *
     * @param identifier - The unique identifier for the monitor or site.
     * @param monitorId - Optional monitor ID.
     * @param operation - The operation type (always "stopped").
     * @param reason - The reason for stopping.
     * @param timestamp - Unix timestamp (ms) when the monitor stopped.
     */
    "internal:monitor:stopped": {
        identifier: string;
        monitorId?: string;
        operation: "stopped";
        reason: EventReason;
        timestamp: number;
    };

    /**
     * Emitted when a site is added internally.
     *
     * @param identifier - The unique identifier for the site.
     * @param operation - The operation type (always "added").
     * @param site - The site object added.
     * @param timestamp - Unix timestamp (ms) when the site was added.
     */
    "internal:site:added": {
        identifier: string;
        operation: "added";
        site: Site;
        timestamp: number;
    };

    /**
     * Emitted when a site's cache is updated internally.
     *
     * @param identifier - The unique identifier for the site.
     * @param operation - The operation type (always "cache-updated").
     * @param timestamp - Unix timestamp (ms) when the cache was updated.
     */
    "internal:site:cache-updated": {
        identifier: string;
        operation: "cache-updated";
        timestamp: number;
    };

    /**
     * Emitted when a request is made to check if monitoring is active for a
     * site.
     *
     * @param identifier - The unique identifier for the site.
     * @param monitorId - The monitor ID.
     * @param operation - The operation type (always
     *   "is-monitoring-active-requested").
     * @param timestamp - Unix timestamp (ms) when the request was made.
     */
    "internal:site:is-monitoring-active-requested": {
        identifier: string;
        monitorId: string;
        operation: "is-monitoring-active-requested";
        timestamp: number;
    };

    /**
     * Emitted in response to a monitoring active check request.
     *
     * @param identifier - The unique identifier for the site.
     * @param isActive - Whether monitoring is active.
     * @param monitorId - The monitor ID.
     * @param operation - The operation type (always
     *   "is-monitoring-active-response").
     * @param timestamp - Unix timestamp (ms) when the response was sent.
     */
    "internal:site:is-monitoring-active-response": {
        identifier: string;
        isActive: boolean;
        monitorId: string;
        operation: "is-monitoring-active-response";
        timestamp: number;
    };

    /**
     * Emitted when a site is removed internally.
     *
     * @param identifier - The unique identifier for the site.
     * @param operation - The operation type (always "removed").
     * @param timestamp - Unix timestamp (ms) when the site was removed.
     */
    "internal:site:removed": {
        identifier: string;
        operation: "removed";
        timestamp: number;
    };

    /**
     * Emitted when a request is made to restart monitoring for a site.
     *
     * @param identifier - The unique identifier for the site.
     * @param monitor - The monitor object.
     * @param operation - The operation type (always
     *   "restart-monitoring-requested").
     * @param timestamp - Unix timestamp (ms) when the request was made.
     */
    "internal:site:restart-monitoring-requested": {
        identifier: string;
        monitor: Monitor;
        operation: "restart-monitoring-requested";
        timestamp: number;
    };

    /**
     * Emitted in response to a restart monitoring request.
     *
     * @param identifier - The unique identifier for the site.
     * @param monitorId - The monitor ID.
     * @param operation - The operation type (always
     *   "restart-monitoring-response").
     * @param success - Whether the restart was successful.
     * @param timestamp - Unix timestamp (ms) when the response was sent.
     */
    "internal:site:restart-monitoring-response": {
        identifier: string;
        monitorId: string;
        operation: "restart-monitoring-response";
        success: boolean;
        timestamp: number;
    };

    /**
     * Emitted when a request is made to start monitoring for a site.
     *
     * @param identifier - The unique identifier for the site.
     * @param monitorId - Optional monitor ID.
     * @param operation - The operation type (always
     *   "start-monitoring-requested").
     * @param timestamp - Unix timestamp (ms) when the request was made.
     */
    "internal:site:start-monitoring-requested": {
        identifier: string;
        monitorId?: string;
        operation: "start-monitoring-requested";
        timestamp: number;
    };

    /**
     * Emitted when a request is made to stop monitoring for a site.
     *
     * @param identifier - The unique identifier for the site.
     * @param monitorId - Optional monitor ID.
     * @param operation - The operation type (always
     *   "stop-monitoring-requested").
     * @param timestamp - Unix timestamp (ms) when the request was made.
     */
    "internal:site:stop-monitoring-requested": {
        identifier: string;
        monitorId?: string;
        operation: "stop-monitoring-requested";
        timestamp: number;
    };

    /**
     * Emitted when a site is updated internally.
     *
     * @param identifier - The unique identifier for the site.
     * @param operation - The operation type (always "updated").
     * @param site - The updated site object.
     * @param timestamp - Unix timestamp (ms) when the update occurred.
     * @param updatedFields - Optional list of updated field names.
     */
    "internal:site:updated": {
        identifier: string;
        operation: "updated";
        site: Site;
        timestamp: number;
        updatedFields?: string[];
    };

    /**
     * Emitted when a monitor is added.
     *
     * @param monitor - The monitor object added.
     * @param siteId - The ID of the site the monitor belongs to.
     * @param timestamp - Unix timestamp (ms) when the monitor was added.
     */
    "monitor:added": {
        monitor: Monitor;
        siteId: string;
        timestamp: number;
    };

    /**
     * Emitted when a monitor check is completed.
     *
     * @param checkType - The type of check ("manual" or "scheduled").
     * @param monitorId - The monitor ID.
     * @param result - The status update result.
     * @param siteId - The ID of the site the monitor belongs to.
     * @param timestamp - Unix timestamp (ms) when the check completed.
     */
    "monitor:check-completed": {
        checkType: "manual" | "scheduled";
        monitorId: string;
        result: StatusUpdate;
        siteId: string;
        timestamp: number;
    };

    /**
     * Emitted when a monitor goes down.
     *
     * @param monitor - The monitor object.
     * @param site - The site object.
     * @param siteId - The ID of the site.
     * @param timestamp - Unix timestamp (ms) when the monitor went down.
     */
    "monitor:down": {
        monitor: Monitor;
        site: Site;
        siteId: string;
        timestamp: number;
    };

    /**
     * Emitted when a monitor is removed.
     *
     * @param monitorId - The monitor ID.
     * @param siteId - The ID of the site the monitor belonged to.
     * @param timestamp - Unix timestamp (ms) when the monitor was removed.
     */
    "monitor:removed": {
        monitorId: string;
        siteId: string;
        timestamp: number;
    };

    /**
     * Emitted when a monitor's status changes.
     *
     * @param monitor - The monitor object.
     * @param newStatus - The new status string.
     * @param previousStatus - The previous status string.
     * @param responseTime - Optional response time in ms.
     * @param site - The site object.
     * @param siteId - The ID of the site.
     * @param timestamp - Unix timestamp (ms) when the status changed.
     */
    "monitor:status-changed": {
        monitor: Monitor;
        newStatus: string;
        previousStatus: string;
        responseTime?: number;
        site: Site;
        siteId: string;
        timestamp: number;
    };

    /**
     * Emitted when a monitor goes up.
     *
     * @param monitor - The monitor object.
     * @param site - The site object.
     * @param siteId - The ID of the site.
     * @param timestamp - Unix timestamp (ms) when the monitor went up.
     */
    "monitor:up": {
        monitor: Monitor;
        site: Site;
        siteId: string;
        timestamp: number;
    };

    /**
     * Emitted when monitoring is started.
     *
     * @param monitorCount - The number of monitors started.
     * @param siteCount - The number of sites involved.
     * @param timestamp - Unix timestamp (ms) when monitoring started.
     */
    "monitoring:started": {
        monitorCount: number;
        siteCount: number;
        timestamp: number;
    };

    /**
     * Emitted when monitoring is stopped.
     *
     * @param activeMonitors - The number of monitors that were active.
     * @param reason - The reason for stopping.
     * @param timestamp - Unix timestamp (ms) when monitoring stopped.
     */
    "monitoring:stopped": {
        activeMonitors: number;
        reason: "error" | "shutdown" | "user";
        timestamp: number;
    };

    /**
     * Emitted when a performance metric is recorded.
     *
     * @param category - The metric category ("database", "monitoring",
     *   "system", or "ui").
     * @param metric - The metric name.
     * @param timestamp - Unix timestamp (ms) when the metric was recorded.
     * @param unit - The unit of the metric.
     * @param value - The value of the metric.
     */
    "performance:metric": {
        category: "database" | "monitoring" | "system" | "ui";
        metric: string;
        timestamp: number;
        unit: string;
        value: number;
    };

    /**
     * Emitted when a performance warning is triggered.
     *
     * @param actual - The actual value that triggered the warning.
     * @param metric - The metric name.
     * @param suggestion - Optional suggestion for remediation.
     * @param threshold - The threshold value for the warning.
     * @param timestamp - Unix timestamp (ms) when the warning was triggered.
     */
    "performance:warning": {
        actual: number;
        metric: string;
        suggestion?: string;
        threshold: number;
        timestamp: number;
    };

    /**
     * Emitted when a site is added.
     *
     * @param site - The site object added.
     * @param source - The source of the addition ("import", "migration", or
     *   "user").
     * @param timestamp - Unix timestamp (ms) when the site was added.
     */
    "site:added": {
        site: Site;
        source: "import" | "migration" | "user";
        timestamp: number;
    };

    /**
     * Emitted when a site cache miss occurs.
     *
     * @param backgroundLoading - Whether background loading is in progress.
     * @param identifier - The unique identifier for the site.
     * @param operation - The operation type (always "cache-lookup").
     * @param timestamp - Unix timestamp (ms) when the cache miss occurred.
     */
    "site:cache-miss": {
        backgroundLoading: boolean;
        identifier: string;
        operation: "cache-lookup";
        timestamp: number;
    };

    /**
     * Emitted when a site's cache is updated.
     *
     * @param identifier - The unique identifier for the site.
     * @param operation - The operation type ("background-load",
     *   "cache-updated", or "manual-refresh").
     * @param timestamp - Unix timestamp (ms) when the cache was updated.
     */
    "site:cache-updated": {
        identifier: string;
        operation: "background-load" | "cache-updated" | "manual-refresh";
        timestamp: number;
    };

    /**
     * Emitted when a site is removed.
     *
     * @param cascade - Whether the removal was cascaded.
     * @param siteId - The ID of the site removed.
     * @param siteName - The name of the site removed.
     * @param timestamp - Unix timestamp (ms) when the site was removed.
     */
    "site:removed": {
        cascade: boolean;
        siteId: string;
        siteName: string;
        timestamp: number;
    };

    /**
     * Emitted when a site is updated.
     *
     * @param previousSite - The previous site object.
     * @param site - The updated site object.
     * @param timestamp - Unix timestamp (ms) when the update occurred.
     * @param updatedFields - List of updated field names.
     */
    "site:updated": {
        previousSite: Site;
        site: Site;
        timestamp: number;
        updatedFields: string[];
    };

    /**
     * Emitted when site state is synchronized.
     *
     * @param action - The synchronization action ("bulk-sync", "delete", or
     *   "update").
     * @param siteIdentifier - Optional site identifier.
     * @param source - Optional source of the synchronization ("cache",
     *   "database", or "frontend").
     * @param timestamp - Unix timestamp (ms) when synchronization occurred.
     */
    "sites:state-synchronized": {
        action: "bulk-sync" | "delete" | "update";
        siteIdentifier?: string;
        source?: "cache" | "database" | "frontend";
        timestamp: number;
    };

    /**
     * Emitted when a system error occurs.
     *
     * @param context - The error context string.
     * @param error - The error object.
     * @param recovery - Optional recovery suggestion.
     * @param severity - The severity of the error ("critical", "high", "low",
     *   or "medium").
     * @param timestamp - Unix timestamp (ms) when the error occurred.
     */
    "system:error": {
        context: string;
        error: Error;
        recovery?: string;
        severity: "critical" | "high" | "low" | "medium";
        timestamp: number;
    };

    /**
     * Emitted when the system is shutting down.
     *
     * @param reason - The reason for shutdown ("error", "update", or "user").
     * @param timestamp - Unix timestamp (ms) when shutdown started.
     * @param uptime - The system uptime in ms.
     */
    "system:shutdown": {
        reason: "error" | "update" | "user";
        timestamp: number;
        uptime: number;
    };

    /**
     * Emitted when the system starts up.
     *
     * @param environment - The runtime environment ("development",
     *   "production", or "test").
     * @param timestamp - Unix timestamp (ms) when startup completed.
     * @param version - The application version string.
     */
    "system:startup": {
        environment: "development" | "production" | "test";
        timestamp: number;
        version: string;
    };
}

/**
 * Category for grouping related events by functional domain.
 *
 * @remarks
 * Used for event filtering, routing, and middleware processing.
 *
 * @example
 *
 * ```typescript
 * const category: EventCategory = "database";
 * ```
 *
 * @public
 */
export type EventCategory = "database" | "monitoring" | "system" | "ui";

/**
 * Type of monitoring check that triggered an event.
 *
 * @remarks
 * Indicates whether a monitoring event was triggered manually or by a scheduled
 * process.
 *
 * @example
 *
 * ```typescript
 * const checkType: EventCheckType = "manual";
 * ```
 *
 * @public
 */
export type EventCheckType = "manual" | "scheduled";

/**
 * Runtime environment where the event occurred.
 *
 * @remarks
 * Used for distinguishing between development, production, and test
 * environments in event payloads.
 *
 * @example
 *
 * ```typescript
 * const env: EventEnvironment = "production";
 * ```
 *
 * @public
 */
export type EventEnvironment = "development" | "production" | "test";

/**
 * Reason for an event occurrence.
 *
 * @remarks
 * Used to indicate the cause or initiator of an event, such as user action or
 * system error.
 *
 * @example
 *
 * ```typescript
 * const reason: EventReason = "user";
 * ```
 *
 * @public
 */
export type EventReason = "error" | "shutdown" | "user";

/**
 * Severity level of an event for prioritization and alerting.
 *
 * @remarks
 * Used to prioritize event handling and alerting in middleware and UI.
 *
 * @example
 *
 * ```typescript
 * const severity: EventSeverity = "critical";
 * ```
 *
 * @public
 */
export type EventSeverity = "critical" | "high" | "low" | "medium";

/**
 * Source that triggered an event.
 *
 * @remarks
 * Indicates the origin of an event, such as user action, system process, or
 * data migration.
 *
 * @example
 *
 * ```typescript
 * const source: EventSource = "system";
 * ```
 *
 * @public
 */
export type EventSource = "import" | "migration" | "system" | "user";

/**
 * What triggered a monitoring or system event.
 *
 * @remarks
 * Used to distinguish between manual, scheduled, or shutdown triggers for
 * events.
 *
 * @example
 *
 * ```typescript
 * const trigger: EventTriggerType = "scheduled";
 * ```
 *
 * @public
 */
export type EventTriggerType = "manual" | "scheduled" | "shutdown";

/**
 * Event categories for filtering and middleware processing.
 *
 * @remarks
 * Organizes all events by functional domain for filtering, routing, and
 * middleware processing. Internal events are intentionally separated for
 * manager-to-manager communication.
 *
 * @example
 *
 * ```typescript
 * const isMonitorEvent = EVENT_CATEGORIES.MONITOR.includes("monitor:up");
 * ```
 *
 * @public
 */
export const EVENT_CATEGORIES = {
    CACHE: [
        "cache:invalidated",
        "site:cache-miss",
        "site:cache-updated",
    ] as const,
    CONFIG: ["config:changed"] as const,
    DATABASE: [
        "database:backup-created",
        "database:error",
        "database:retry",
        "database:success",
        "database:transaction-completed",
    ] as const,
    INTERNAL_DATABASE: [
        "internal:database:backup-downloaded",
        "internal:database:data-exported",
        "internal:database:data-imported",
        "internal:database:get-sites-from-cache-requested",
        "internal:database:get-sites-from-cache-response",
        "internal:database:history-limit-updated",
        "internal:database:initialized",
        "internal:database:sites-refreshed",
        "internal:database:update-sites-cache-requested",
    ] as const,
    INTERNAL_MONITOR: [
        "internal:monitor:all-started",
        "internal:monitor:all-stopped",
        "internal:monitor:manual-check-completed",
        "internal:monitor:site-setup-completed",
        "internal:monitor:started",
        "internal:monitor:stopped",
    ] as const,
    INTERNAL_SITE: [
        "internal:site:added",
        "internal:site:cache-updated",
        "internal:site:is-monitoring-active-requested",
        "internal:site:is-monitoring-active-response",
        "internal:site:removed",
        "internal:site:restart-monitoring-requested",
        "internal:site:restart-monitoring-response",
        "internal:site:start-monitoring-requested",
        "internal:site:stop-monitoring-requested",
        "internal:site:updated",
    ] as const,
    MONITOR: [
        "monitor:added",
        "monitor:check-completed",
        "monitor:removed",
        "monitor:status-changed",
        "monitor:up",
        "monitor:down",
    ] as const,
    MONITORING: ["monitoring:started", "monitoring:stopped"] as const,
    PERFORMANCE: ["performance:metric", "performance:warning"] as const,
    SITE: [
        "site:added",
        "site:removed",
        "site:updated",
        "sites:state-synchronized",
    ] as const,
    SYSTEM: ["system:error", "system:shutdown", "system:startup"] as const,
} as const;

/**
 * Priority levels for events.
 *
 * @remarks
 * Categorizes events by operational importance for filtering and middleware
 * processing. Higher priority events should receive immediate attention and
 * processing.
 *
 * @example
 *
 * ```typescript
 * const isCritical = EVENT_PRIORITIES.CRITICAL.includes("system:error");
 * ```
 *
 * @public
 */
export const EVENT_PRIORITIES = {
    CRITICAL: [
        "performance:warning",
        "system:error",
        "system:shutdown",
    ] as const,
    HIGH: [
        "database:transaction-completed",
        "monitor:status-changed",
        "monitor:up",
        "monitor:down",
        "site:removed",
    ] as const,
    LOW: ["performance:metric"] as const,
    MEDIUM: [
        "config:changed",
        "monitor:added",
        "site:added",
        "site:updated",
    ] as const,
} as const;

/**
 * Gets the priority level of an event with type safety.
 *
 * @remarks
 * Uses type-safe lookup to determine event priority. Events not explicitly
 * categorized default to MEDIUM priority. This ensures all events have a
 * priority assigned for consistent middleware and filtering behavior.
 *
 * @example
 *
 * ```typescript
 * const priority = getEventPriority("system:error"); // Returns "CRITICAL"
 * const defaultPriority = getEventPriority("unknown:event"); // Returns "MEDIUM"
 * ```
 *
 * @param eventName - The event name to check priority for. Must be a key of
 *   {@link UptimeEvents}.
 *
 * @returns The priority level of the event as a key of {@link EVENT_PRIORITIES}.
 *   Returns "MEDIUM" for uncategorized events.
 *
 * @public
 *
 * @see {@link EVENT_PRIORITIES}
 */
export function getEventPriority(
    eventName: keyof UptimeEvents
): keyof typeof EVENT_PRIORITIES {
    const eventNameStr = String(eventName);

    // Check each priority level using string-based comparison to avoid type
    // assertion issues
    if (
        (EVENT_PRIORITIES.CRITICAL as readonly string[]).includes(eventNameStr)
    ) {
        return "CRITICAL";
    }
    if ((EVENT_PRIORITIES.HIGH as readonly string[]).includes(eventNameStr)) {
        return "HIGH";
    }
    if ((EVENT_PRIORITIES.LOW as readonly string[]).includes(eventNameStr)) {
        return "LOW";
    }
    if ((EVENT_PRIORITIES.MEDIUM as readonly string[]).includes(eventNameStr)) {
        return "MEDIUM";
    }

    return "MEDIUM"; // Default priority for uncategorized events
}

/**
 * Determines if an event belongs to a specific category.
 *
 * @remarks
 * Provides type-safe event categorization for filtering and routing. Internal
 * events are separated into their own categories (INTERNAL_DATABASE,
 * INTERNAL_MONITOR, INTERNAL_SITE) for manager-to-manager communication.
 *
 * @example
 *
 * ```typescript
 * const isMonitorEvent = isEventOfCategory("monitor:up", "MONITOR"); // Returns true
 * const isInternalEvent = isEventOfCategory(
 *     "internal:site:added",
 *     "INTERNAL_SITE"
 * ); // Returns true
 * const invalidCategory = isEventOfCategory("monitor:up", "NONEXISTENT"); // Returns false
 * ```
 *
 * @param eventName - The event name to categorize. Must be a key of
 *   {@link UptimeEvents}.
 * @param category - The category to check against. Must be a key of
 *   {@link EVENT_CATEGORIES}.
 *
 * @returns True if the event belongs to the specified category, false if the
 *   category doesn't exist or event doesn't match.
 *
 * @public
 *
 * @see {@link EVENT_CATEGORIES}
 */
export function isEventOfCategory(
    eventName: keyof UptimeEvents,
    category: keyof typeof EVENT_CATEGORIES
): boolean {
    const eventNameStr = String(eventName);

    // Type-safe category checking using string-based comparison
    switch (category) {
        case "CACHE": {
            return (EVENT_CATEGORIES.CACHE as readonly string[]).includes(
                eventNameStr
            );
        }
        case "CONFIG": {
            return (EVENT_CATEGORIES.CONFIG as readonly string[]).includes(
                eventNameStr
            );
        }
        case "DATABASE": {
            return (EVENT_CATEGORIES.DATABASE as readonly string[]).includes(
                eventNameStr
            );
        }
        case "INTERNAL_DATABASE": {
            return (
                EVENT_CATEGORIES.INTERNAL_DATABASE as readonly string[]
            ).includes(eventNameStr);
        }
        case "INTERNAL_MONITOR": {
            return (
                EVENT_CATEGORIES.INTERNAL_MONITOR as readonly string[]
            ).includes(eventNameStr);
        }
        case "INTERNAL_SITE": {
            return (
                EVENT_CATEGORIES.INTERNAL_SITE as readonly string[]
            ).includes(eventNameStr);
        }
        case "MONITOR": {
            return (EVENT_CATEGORIES.MONITOR as readonly string[]).includes(
                eventNameStr
            );
        }
        case "MONITORING": {
            return (EVENT_CATEGORIES.MONITORING as readonly string[]).includes(
                eventNameStr
            );
        }
        case "PERFORMANCE": {
            return (EVENT_CATEGORIES.PERFORMANCE as readonly string[]).includes(
                eventNameStr
            );
        }
        case "SITE": {
            return (EVENT_CATEGORIES.SITE as readonly string[]).includes(
                eventNameStr
            );
        }
        case "SYSTEM": {
            return (EVENT_CATEGORIES.SYSTEM as readonly string[]).includes(
                eventNameStr
            );
        }
        default: {
            return false;
        }
    }
}
