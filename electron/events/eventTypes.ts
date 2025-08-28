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
import type { UnknownRecord } from "type-fest";

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
export interface UptimeEvents extends UnknownRecord {
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
        /**
         * Optional unique identifier for the cache entry.
         *
         * @remarks
         * Specifies which cache entry was invalidated when the invalidation is
         * targeted to a specific entry rather than a broad invalidation.
         */
        identifier?: string;

        /**
         * Reason for invalidation.
         *
         * @remarks
         * Indicates why the cache was invalidated: "delete" for item removal,
         * "expiry" for TTL timeout, "manual" for user-initiated refresh, or
         * "update" for data changes.
         */
        reason: "delete" | "expiry" | "manual" | "update";

        /**
         * Unix timestamp (ms) when invalidation occurred.
         *
         * @remarks
         * Provides precise timing for invalidation events to support debugging
         * and audit trails.
         */
        timestamp: number;

        /**
         * Type of cache invalidated.
         *
         * @remarks
         * Specifies the scope of invalidation: "all" for full cache clear,
         * "monitor" for monitor-specific cache, or "site" for site-specific
         * cache.
         */
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
        /**
         * The new value of the setting.
         *
         * @remarks
         * Contains the updated value after the configuration change. Type is
         * unknown to support any configuration value type.
         */
        newValue: unknown;

        /**
         * The previous value of the setting.
         *
         * @remarks
         * Contains the value before the configuration change for comparison and
         * potential rollback scenarios.
         */
        oldValue: unknown;

        /**
         * The name of the setting that changed.
         *
         * @remarks
         * Identifies which specific configuration setting was modified. Used
         * for targeted event handling and change tracking.
         */
        setting: string;

        /**
         * The origin of the change.
         *
         * @remarks
         * Indicates what initiated the configuration change: "migration" for
         * database migrations, "system" for automatic updates, or "user" for
         * manual changes.
         */
        source: "migration" | "system" | "user";

        /**
         * Unix timestamp (ms) when the change occurred.
         *
         * @remarks
         * Provides precise timing for configuration changes to support
         * debugging and audit trails.
         */
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
        /**
         * Name of the backup file.
         *
         * @remarks
         * The filename of the created backup file, typically including
         * timestamp information for identification purposes.
         */
        fileName: string;

        /**
         * Size of the backup file in bytes.
         *
         * @remarks
         * The total size of the backup file in bytes, useful for monitoring
         * backup size trends and storage management.
         */
        size: number;

        /**
         * Unix timestamp (ms) when backup was created.
         *
         * @remarks
         * Precise timing of backup creation for audit trails and backup
         * scheduling verification.
         */
        timestamp: number;

        /**
         * What triggered the backup.
         *
         * @remarks
         * Indicates the source of the backup operation: "manual" for
         * user-initiated backups, "scheduled" for automatic backups, or
         * "shutdown" for application shutdown backups.
         */
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

        /**
         * The error object that caused the database operation to fail.
         *
         * @remarks
         * Contains the specific error information including message, stack
         * trace, and any additional error details for debugging purposes.
         */
        error: Error;

        /**
         * The database operation that failed.
         *
         * @remarks
         * Identifies which specific database operation encountered the error,
         * such as "insert", "update", "delete", or "select".
         */
        operation: string;

        /**
         * Unix timestamp (ms) when the error occurred.
         *
         * @remarks
         * Provides precise timing of when the database error was encountered
         * for debugging and audit trail purposes.
         */
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

        /**
         * The retry attempt number.
         *
         * @remarks
         * Indicates which retry attempt this is, starting from 1 for the first
         * retry after the initial failure. Used for tracking retry patterns.
         */
        attempt: number;

        /**
         * The database operation being retried.
         *
         * @remarks
         * Identifies which specific database operation is being retried after a
         * previous failure, such as "insert", "update", "delete", or "select".
         */
        operation: string;

        /**
         * Unix timestamp (ms) when the retry occurred.
         *
         * @remarks
         * Provides precise timing of when the retry was attempted for debugging
         * and performance analysis purposes.
         */
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

        /**
         * Optional duration (ms) of the operation.
         *
         * @remarks
         * When available, provides the time in milliseconds that the database
         * operation took to complete. Used for performance monitoring and
         * optimization.
         */
        duration?: number;

        /**
         * The database operation that succeeded.
         *
         * @remarks
         * Identifies which specific database operation completed successfully,
         * such as "insert", "update", "delete", or "select".
         */
        operation: string;

        /**
         * Unix timestamp (ms) when the operation succeeded.
         *
         * @remarks
         * Provides precise timing of when the database operation completed
         * successfully for audit trails and performance tracking.
         */
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
        /**
         * Duration (ms) of the transaction.
         *
         * @remarks
         * The total time in milliseconds that the database transaction took to
         * complete, including all operations within the transaction.
         */
        duration: number;

        /**
         * The database operation performed in the transaction.
         *
         * @remarks
         * Describes the type of operation that was performed within the
         * transaction, such as "bulk-insert", "migration", or "backup".
         */
        operation: string;

        /**
         * Optional number of records affected.
         *
         * @remarks
         * When available, indicates how many database records were affected by
         * the transaction operations.
         */
        recordsAffected?: number;

        /**
         * Whether the transaction was successful.
         *
         * @remarks
         * Indicates if the transaction completed successfully (true) or was
         * rolled back due to an error (false).
         */
        success: boolean;

        /**
         * Unix timestamp (ms) when the transaction completed.
         *
         * @remarks
         * Provides precise timing of when the transaction finished, regardless
         * of success or failure status.
         */
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
        /**
         * Optional name of the backup file.
         *
         * @remarks
         * When available, specifies the filename of the downloaded backup. May
         * be undefined if the backup download operation failed.
         */
        fileName?: string;

        /**
         * The operation type (always "backup-downloaded").
         *
         * @remarks
         * Constant value identifying this specific database operation type for
         * event filtering and routing purposes.
         */
        operation: "backup-downloaded";

        /**
         * Whether the download was successful.
         *
         * @remarks
         * Indicates if the backup download completed successfully (true) or
         * encountered an error (false).
         */
        success: boolean;

        /**
         * Unix timestamp (ms) when the download completed.
         *
         * @remarks
         * Provides precise timing of when the backup download operation
         * finished, regardless of success or failure status.
         */
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
        /**
         * Optional name of the exported file.
         *
         * @remarks
         * When available, specifies the filename of the exported data file. May
         * be undefined if the export operation failed.
         */
        fileName?: string;

        /**
         * The operation type (always "data-exported").
         *
         * @remarks
         * Constant value identifying this specific database operation type for
         * event filtering and routing purposes.
         */
        operation: "data-exported";

        /**
         * Whether the export was successful.
         *
         * @remarks
         * Indicates if the data export completed successfully (true) or
         * encountered an error (false).
         */
        success: boolean;

        /**
         * Unix timestamp (ms) when the export completed.
         *
         * @remarks
         * Provides precise timing of when the data export operation finished,
         * regardless of success or failure status.
         */
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
        /**
         * The operation type (always "data-imported").
         *
         * @remarks
         * Constant identifier for this specific internal database operation.
         */
        operation: "data-imported";

        /**
         * Optional number of records imported.
         *
         * @remarks
         * Provides count of successfully imported records for tracking and
         * reporting purposes. May be undefined if count is not available.
         */
        recordCount?: number;

        /**
         * Whether the import was successful.
         *
         * @remarks
         * Indicates overall success status of the import operation. False
         * indicates the operation failed or was aborted.
         */
        success: boolean;

        /**
         * Unix timestamp (ms) when the import completed.
         *
         * @remarks
         * Precise timing of when the import operation finished for audit trails
         * and performance monitoring.
         */
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
        /**
         * The operation type (always "get-sites-from-cache-requested").
         *
         * @remarks
         * Constant identifier for this specific internal database operation.
         */
        operation: "get-sites-from-cache-requested";

        /**
         * Unix timestamp (ms) when the request was made.
         *
         * @remarks
         * Precise timing of when the cache request was initiated for
         * performance monitoring and debugging.
         */
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
        /**
         * The operation type (always "get-sites-from-cache-response").
         *
         * @remarks
         * Constant identifier for this specific internal database operation.
         */
        operation: "get-sites-from-cache-response";

        /**
         * The list of sites returned from the cache.
         *
         * @remarks
         * Array of site objects retrieved from the cache in response to a
         * get-sites-from-cache request.
         */
        sites: Site[];

        /**
         * Unix timestamp (ms) when the response was sent.
         *
         * @remarks
         * Precise timing of when the cache response was generated for
         * performance monitoring and request tracking.
         */
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
        /**
         * The new history limit value.
         *
         * @remarks
         * Property value for this event data structure.
         */
        limit: number;
        /**
         * The operation type (always "history-limit-updated").
         */
        operation: "history-limit-updated";
        /**
         * Unix timestamp (ms) when the update occurred.
         */
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
        /**
         * The operation type (always "initialized").
         */
        operation: "initialized";
        /**
         * Whether initialization was successful.
         *
         * @remarks
         * Boolean flag indicating the outcome of the operation.
         */
        success: boolean;
        /**
         * Unix timestamp (ms) when initialization completed.
         */
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
        /**
         * The operation type (always "sites-refreshed").
         */
        operation: "sites-refreshed";
        /**
         * The number of sites refreshed.
         *
         * @remarks
         * Numerical value for tracking and reporting purposes.
         */
        siteCount: number;
        /**
         * Unix timestamp (ms) when the refresh completed.
         */
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
        /**
         * The operation type (always "update-sites-cache-requested").
         */
        operation: "update-sites-cache-requested";
        /**
         * Optional list of sites to update in the cache.
         *
         * @remarks
         * Cache-related data for performance optimization.
         */
        sites?: Site[];
        /**
         * Unix timestamp (ms) when the request was made.
         */
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
        /**
         * The number of monitors started.
         *
         * @remarks
         * Numerical value for tracking and reporting purposes.
         */
        monitorCount: number;
        /**
         * The operation type (always "all-started").
         */
        operation: "all-started";
        /**
         * The number of sites involved.
         *
         * @remarks
         * Numerical value for tracking and reporting purposes.
         */
        siteCount: number;
        /**
         * Unix timestamp (ms) when the operation completed.
         */
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
        /**
         * The number of monitors that were active.
         *
         * @remarks
         * Numerical value for tracking and reporting purposes.
         */
        activeMonitors: number;
        /**
         * The operation type (always "all-stopped").
         */
        operation: "all-stopped";
        /**
         * The reason for stopping.
         *
         * @remarks
         * Indicates the cause or trigger for this operation.
         */
        reason: EventReason;
        /**
         * Unix timestamp (ms) when the operation completed.
         */
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
        /**
         * Unique identifier for tracking this manual check operation.
         */
        identifier: string;

        /**
         * Optional monitor ID that was checked.
         */
        monitorId?: string;

        /**
         * Operation type constant for this event.
         */
        operation: "manual-check-completed";

        /**
         * Status update result from the manual check operation.
         */
        result: StatusUpdate;

        /**
         * Unix timestamp (ms) when the manual check completed.
         */
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
        /**
         * Unique identifier for the site that had setup completed.
         */
        identifier: string;

        /**
         * Operation type constant for this event.
         */
        operation: "site-setup-completed";

        /**
         * Unix timestamp (ms) when setup completed.
         */
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
        /** The unique identifier for the site. */
        identifier: string;
        /** The monitor ID. */
        monitorId: string;
        /** The operation type (always "is-monitoring-active-requested"). */
        operation: "is-monitoring-active-requested";
        /** Unix timestamp (ms) when the request was made. */
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
        /** The unique identifier for the site. */
        identifier: string;
        /** Whether monitoring is active. */
        isActive: boolean;
        /** The monitor ID. */
        monitorId: string;
        /** The operation type (always "is-monitoring-active-response"). */
        operation: "is-monitoring-active-response";
        /** Unix timestamp (ms) when the response was sent. */
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
        /** The unique identifier for the site. */
        identifier: string;
        /** The monitor object. */
        monitor: Monitor;
        /** The operation type (always "restart-monitoring-requested"). */
        operation: "restart-monitoring-requested";
        /** Unix timestamp (ms) when the request was made. */
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
        /** The unique identifier for the site. */
        identifier: string;
        /** The monitor ID. */
        monitorId: string;
        /** The operation type (always "restart-monitoring-response"). */
        operation: "restart-monitoring-response";
        /** Whether the restart was successful. */
        success: boolean;
        /** Unix timestamp (ms) when the response was sent. */
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
        /** The unique identifier for the site. */
        identifier: string;
        /** Optional monitor ID. */
        monitorId?: string;
        /** The operation type (always "start-monitoring-requested"). */
        operation: "start-monitoring-requested";
        /** Unix timestamp (ms) when the request was made. */
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
        /** The unique identifier for the site. */
        identifier: string;
        /** Optional monitor ID. */
        monitorId?: string;
        /** The operation type (always "stop-monitoring-requested"). */
        operation: "stop-monitoring-requested";
        /** Unix timestamp (ms) when the request was made. */
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
        /** The unique identifier for the site. */
        identifier: string;
        /** The operation type (always "updated"). */
        operation: "updated";
        /** The updated site object. */
        site: Site;
        /** Unix timestamp (ms) when the update occurred. */
        timestamp: number;
        /** Optional list of updated field names. */
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
        /** The monitor object added. */
        monitor: Monitor;
        /** The ID of the site the monitor belongs to. */
        siteId: string;
        /** Unix timestamp (ms) when the monitor was added. */
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
        /** The type of check ("manual" or "scheduled"). */
        checkType: "manual" | "scheduled";
        /** The monitor ID. */
        monitorId: string;
        /** The status update result. */
        result: StatusUpdate;
        /** The ID of the site the monitor belongs to. */
        siteId: string;
        /** Unix timestamp (ms) when the check completed. */
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
        /** The monitor object. */
        monitor: Monitor;
        /** The site object. */
        site: Site;
        /** The ID of the site. */
        siteId: string;
        /** Unix timestamp (ms) when the monitor went down. */
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
        /** The monitor ID. */
        monitorId: string;
        /** The ID of the site the monitor belonged to. */
        siteId: string;
        /** Unix timestamp (ms) when the monitor was removed. */
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
        /** The monitor object. */
        monitor: Monitor;
        /** The new status string. */
        newStatus: string;
        /** The previous status string. */
        previousStatus: string;
        /** Optional response time in ms. */
        responseTime?: number;
        /** The site object. */
        site: Site;
        /** The ID of the site. */
        siteId: string;
        /** Unix timestamp (ms) when the status changed. */
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
        /** The monitor object. */
        monitor: Monitor;
        /** The site object. */
        site: Site;
        /** The ID of the site. */
        siteId: string;
        /** Unix timestamp (ms) when the monitor went up. */
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
        /** The number of monitors started. */
        monitorCount: number;
        /** The number of sites involved. */
        siteCount: number;
        /** Unix timestamp (ms) when monitoring started. */
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
        /** The number of monitors that were active. */
        activeMonitors: number;
        /** The reason for stopping. */
        reason: "error" | "shutdown" | "user";
        /** Unix timestamp (ms) when monitoring stopped. */
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
        /** The metric category ("database", "monitoring", "system", or "ui"). */
        category: "database" | "monitoring" | "system" | "ui";
        /** The metric name. */
        metric: string;
        /** Unix timestamp (ms) when the metric was recorded. */
        timestamp: number;
        /** The unit of the metric. */
        unit: string;
        /** The value of the metric. */
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
        /** The actual value that triggered the warning. */
        actual: number;
        /** The metric name. */
        metric: string;
        /** Optional suggestion for remediation. */
        suggestion?: string;
        /** The threshold value for the warning. */
        threshold: number;
        /** Unix timestamp (ms) when the warning was triggered. */
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
        /** The site object added. */
        site: Site;
        /** The source of the addition ("import", "migration", or "user"). */
        source: "import" | "migration" | "user";
        /** Unix timestamp (ms) when the site was added. */
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
        /** Whether background loading is in progress. */
        backgroundLoading: boolean;
        /** The unique identifier for the site. */
        identifier: string;
        /** The operation type (always "cache-lookup"). */
        operation: "cache-lookup";
        /** Unix timestamp (ms) when the cache miss occurred. */
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
        /** The unique identifier for the site. */
        identifier: string;
        /**
         * The operation type ("background-load", "cache-updated", or
         * "manual-refresh").
         */
        operation: "background-load" | "cache-updated" | "manual-refresh";
        /** Unix timestamp (ms) when the cache was updated. */
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
        /** Whether the removal was cascaded. */
        cascade: boolean;
        /** The ID of the site removed. */
        siteId: string;
        /** The name of the site removed. */
        siteName: string;
        /** Unix timestamp (ms) when the site was removed. */
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
        /** The previous site object. */
        previousSite: Site;
        /** The updated site object. */
        site: Site;
        /** Unix timestamp (ms) when the update occurred. */
        timestamp: number;
        /** List of updated field names. */
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
        /** The synchronization action ("bulk-sync", "delete", or "update"). */
        action: "bulk-sync" | "delete" | "update";
        /** Optional site identifier. */
        siteIdentifier?: string;
        /**
         * Optional source of the synchronization ("cache", "database", or
         * "frontend").
         */
        source?: "cache" | "database" | "frontend";
        /** Unix timestamp (ms) when synchronization occurred. */
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
        /** The error context string. */
        context: string;
        /** The error object. */
        error: Error;
        /** Optional recovery suggestion. */
        recovery?: string;
        /** The severity of the error ("critical", "high", "low", or "medium"). */
        severity: "critical" | "high" | "low" | "medium";
        /** Unix timestamp (ms) when the error occurred. */
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
        /** The reason for shutdown ("error", "update", or "user"). */
        reason: "error" | "update" | "user";
        /** Unix timestamp (ms) when shutdown started. */
        timestamp: number;
        /** The system uptime in ms. */
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
        /** The runtime environment ("development", "production", or "test"). */
        environment: "development" | "production" | "test";
        /** Unix timestamp (ms) when startup completed. */
        timestamp: number;
        /** The application version string. */
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
    /**
     * Cache-related events for cache invalidation and updates.
     *
     * @remarks
     * Events related to cache management, including invalidation notifications
     * and cache state changes for sites and monitors.
     */
    CACHE: [
        "cache:invalidated",
        "site:cache-miss",
        "site:cache-updated",
    ] as const,

    /**
     * Configuration change events.
     *
     * @remarks
     * Events emitted when application configuration settings are modified,
     * including user preferences and system settings.
     */
    CONFIG: ["config:changed"] as const,

    /**
     * Database operation events.
     *
     * @remarks
     * Events related to database operations including backups, errors, retries,
     * and successful operations.
     */
    DATABASE: [
        "database:backup-created",
        "database:error",
        "database:retry",
        "database:success",
        "database:transaction-completed",
    ] as const,

    /**
     * Internal database management events.
     *
     * @remarks
     * Internal events for database initialization, data import/export, and
     * cache management operations. These are typically system-level events not
     * exposed to end users.
     */
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

    /**
     * Internal monitor management events.
     *
     * @remarks
     * Internal events for monitor lifecycle management including starting,
     * stopping, and setup operations. These are system-level events for monitor
     * orchestration.
     */
    INTERNAL_MONITOR: [
        "internal:monitor:all-started",
        "internal:monitor:all-stopped",
        "internal:monitor:manual-check-completed",
        "internal:monitor:site-setup-completed",
        "internal:monitor:started",
        "internal:monitor:stopped",
    ] as const,

    /**
     * Internal site management events.
     *
     * @remarks
     * Internal events for site lifecycle management including adding, removing,
     * updating sites and monitoring state management.
     */
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

    /**
     * Monitor status and lifecycle events.
     *
     * @remarks
     * Events related to monitor operations including status changes, check
     * completions, and monitor up/down state changes.
     */
    MONITOR: [
        "monitor:added",
        "monitor:check-completed",
        "monitor:removed",
        "monitor:status-changed",
        "monitor:up",
        "monitor:down",
    ] as const,

    /**
     * Overall monitoring system events.
     *
     * @remarks
     * High-level events for the entire monitoring system, including global
     * start and stop operations.
     */
    MONITORING: ["monitoring:started", "monitoring:stopped"] as const,

    /**
     * Performance monitoring and metrics events.
     *
     * @remarks
     * Events related to performance metrics collection and performance warnings
     * when thresholds are exceeded.
     */
    PERFORMANCE: ["performance:metric", "performance:warning"] as const,

    /**
     * Site management events.
     *
     * @remarks
     * Events related to site operations including adding, removing, updating
     * sites and state synchronization.
     */
    SITE: [
        "site:added",
        "site:removed",
        "site:updated",
        "sites:state-synchronized",
    ] as const,

    /**
     * System-level events.
     *
     * @remarks
     * Events related to system operations including startup, shutdown, and
     * system-level errors that affect the entire application.
     */
    SYSTEM: [
        "system:error",
        "system:shutdown",
        "system:startup",
    ] as const,
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
    /**
     * Critical priority events that require immediate attention.
     *
     * @remarks
     * Events that indicate system-level issues, performance problems, or
     * application shutdown scenarios that need immediate processing.
     */
    CRITICAL: [
        "performance:warning",
        "system:error",
        "system:shutdown",
    ] as const,

    /**
     * High priority events for important state changes.
     *
     * @remarks
     * Events that represent significant changes to monitoring state, database
     * transactions, or site availability that should be processed promptly.
     */
    HIGH: [
        "database:transaction-completed",
        "monitor:status-changed",
        "monitor:up",
        "monitor:down",
        "site:removed",
    ] as const,

    /**
     * Low priority events for routine data collection.
     *
     * @remarks
     * Events that represent routine metrics and data collection activities that
     * can be processed with lower priority.
     */
    LOW: ["performance:metric"] as const,

    /**
     * Medium priority events for standard operations.
     *
     * @remarks
     * Events that represent normal operational activities like configuration
     * changes and site management operations.
     */
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
