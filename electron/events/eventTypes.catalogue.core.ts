/**
 * Uptime event catalogue: core.
 *
 * @remarks
 * This file augments {@link UptimeEvents} from `eventTypes.ts` with baseline
 * public events (cache/config/database/diagnostics) and a small set of internal
 * cache lifecycle events.
 */

import type { CacheInvalidatedEventData } from "@shared/types/events";
import type { SerializedError } from "@shared/utils/logger/common";
import type { JsonValue } from "type-fest";

import type { EventPayloadValue } from "./TypedEventBus";

type UptimeEventPayload<TPayload extends object> = EventPayloadValue & TPayload;

declare module "./eventTypes" {
    interface UptimeEvents {
        // Site events

        /**
         * Emitted when a cache entry is invalidated for a site or monitor.
         *
         * @remarks
         * Used to trigger cache refreshes or notify listeners of data changes.
         *
         * @see {@link CacheInvalidatedEventData} for payload structure.
         */
        "cache:invalidated": UptimeEventPayload<CacheInvalidatedEventData>;

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
            /** The new value of the setting. */
            newValue: JsonValue | undefined;
            /** The previous value of the setting. */
            oldValue: JsonValue | undefined;
            /** The configuration key that changed. */
            setting: string;
            /** Origin of the change (user, system, migration). */
            source: "migration" | "system" | "user";
            /** Unix timestamp (ms) when the change occurred. */
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
         * @param triggerType - What triggered the backup ("manual",
         *   "scheduled", or "shutdown").
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

        /**
         * Emitted when a database backup is restored.
         */
        "database:backup-restored": {
            checksum: string;
            fileName: string;
            schemaVersion: number;
            size: number;
            timestamp: number;
            triggerType: "manual" | "scheduled" | "shutdown";
        };

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
            [key: string]: EventPayloadValue;

            /**
             * The error object that caused the database operation to fail.
             *
             * @remarks
             * Contains the specific error information including message, stack
             * trace, and any additional error details for debugging purposes.
             */
            error: SerializedError;

            /**
             * The database operation that failed.
             *
             * @remarks
             * Identifies which specific database operation encountered the
             * error, such as "insert", "update", "delete", or "select".
             */
            operation: string;

            /**
             * Unix timestamp (ms) when the error occurred.
             *
             * @remarks
             * Provides precise timing of when the database error was
             * encountered for debugging and audit trail purposes.
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
            [key: string]: EventPayloadValue;

            /**
             * The retry attempt number.
             *
             * @remarks
             * Indicates which retry attempt this is, starting from 1 for the
             * first retry after the initial failure. Used for tracking retry
             * patterns.
             */
            attempt: number;

            /**
             * The database operation being retried.
             *
             * @remarks
             * Identifies which specific database operation is being retried
             * after a previous failure, such as "insert", "update", "delete",
             * or "select".
             */
            operation: string;

            /**
             * Unix timestamp (ms) when the retry occurred.
             *
             * @remarks
             * Provides precise timing of when the retry was attempted for
             * debugging and performance analysis purposes.
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
            [key: string]: EventPayloadValue;

            /**
             * Optional duration (ms) of the operation.
             *
             * @remarks
             * When available, provides the time in milliseconds that the
             * database operation took to complete. Used for performance
             * monitoring and optimization.
             */
            duration?: number;

            /**
             * The database operation that succeeded.
             *
             * @remarks
             * Identifies which specific database operation completed
             * successfully, such as "insert", "update", "delete", or "select".
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
         * @param operation - The database operation performed in the
         *   transaction.
         * @param recordsAffected - Optional number of records affected.
         * @param success - Whether the transaction was successful.
         * @param timestamp - Unix timestamp (ms) when the transaction
         *   completed.
         */
        "database:transaction-completed": {
            /**
             * Duration (ms) of the transaction.
             *
             * @remarks
             * The total time in milliseconds that the database transaction took
             * to complete, including all operations within the transaction.
             */
            duration: number;

            /**
             * Optional lifecycle tagging for instrumentation consumers.
             *
             * @remarks
             * When present, indicates whether the emission represents the
             * "start", "success", or "failure" stage of a tracked operation.
             */
            lifecycleStage?: "failure" | "start" | "success";

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
             * When available, indicates how many database records were affected
             * by the transaction operations.
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
             * Provides precise timing of when the transaction finished,
             * regardless of success or failure status.
             */
            timestamp: number;
        };

        /**
         * Emitted whenever a diagnostics report is captured from preload.
         */
        "diagnostics:report-created": {
            /** The sanitized channel associated with the diagnostics payload. */
            channel: string;
            /** Correlation identifier shared with structured logs. */
            correlationId: string;
            /** Name of the guard that produced the diagnostics payload. */
            guard: string;
            /** True when metadata was omitted due to byte limits. */
            metadataTruncated: boolean;
            /** Length of the sanitized payload preview string. */
            payloadPreviewLength: number;
            /** True when the payload preview was truncated due to byte limits. */
            payloadPreviewTruncated: boolean;
            /** Optional rejection reason reported by the guard. */
            reason?: string;
            /** Timestamp supplied by the preload report. */
            timestamp: number;
        };

        /**
         * Emitted when every cache entry is invalidated.
         */
        "internal:cache:all-invalidated": {
            /** Name of the cache instance emitting the event. */
            cacheName: string;
            /** Number of entries invalidated. */
            itemCount: number;
            /** Unix timestamp (ms) when invalidation occurred. */
            timestamp: number;
        };

        /**
         * Emitted when multiple cache entries are updated in a batch operation.
         */
        "internal:cache:bulk-updated": {
            /** Name of the cache instance emitting the event. */
            cacheName: string;
            /** Number of items affected by the bulk update. */
            itemCount: number;
            /** Unix timestamp (ms) when the bulk update completed. */
            timestamp: number;
        };

        /**
         * Emitted after expired cache entries have been cleaned up.
         */
        "internal:cache:cleanup-completed": {
            /** Name of the cache instance emitting the event. */
            cacheName: string;
            /** Number of entries removed during cleanup. */
            itemCount: number;
            /** Unix timestamp (ms) when cleanup finished. */
            timestamp: number;
        };

        /**
         * Emitted when the entire cache is cleared.
         */
        "internal:cache:cleared": {
            /** Name of the cache instance emitting the event. */
            cacheName: string;
            /** Number of entries removed. */
            itemCount: number;
            /** Unix timestamp (ms) when the clear action occurred. */
            timestamp: number;
        };
    }
}
