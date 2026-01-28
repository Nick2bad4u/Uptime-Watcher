/**
 * Uptime event catalogue: internal cache + database.
 *
 * @remarks
 * This file augments {@link UptimeEvents} from `eventTypes.ts` with internal
 * cache item lifecycle events and internal database operation events.
 */

import type { Site } from "@shared/types";

declare module "./eventTypes" {
    interface UptimeEvents {
        // Monitor events

        /**
         * Emitted when a cache entry is cached or updated.
         */
        "internal:cache:item-cached": {
            /** Name of the cache instance emitting the event. */
            cacheName: string;
            /** Cache key that was stored. */
            key: string;
            /** Unix timestamp (ms) when the item was cached. */
            timestamp: number;
            /** Optional TTL for the cached entry in milliseconds. */
            ttl?: number;
        };

        /**
         * Emitted when a cache entry is explicitly deleted.
         */
        "internal:cache:item-deleted": {
            /** Name of the cache instance emitting the event. */
            cacheName: string;
            /** Cache key that was deleted. */
            key: string;
            /** Unix timestamp (ms) when the item was deleted. */
            timestamp: number;
        };

        /**
         * Emitted when a cache entry is evicted, typically due to LRU strategy.
         */
        "internal:cache:item-evicted": {
            /** Name of the cache instance emitting the event. */
            cacheName: string;
            /** Cache key that was evicted. */
            key: string;
            /** Reason the entry was evicted ("lru" for least-recently-used). */
            reason: "lru" | "manual";
            /** Unix timestamp (ms) when the eviction occurred. */
            timestamp: number;
        };

        /**
         * Emitted when a cache entry expires.
         */
        "internal:cache:item-expired": {
            /** Name of the cache instance emitting the event. */
            cacheName: string;
            /** Cache key that expired. */
            key: string;
            /** Unix timestamp (ms) when the item expired. */
            timestamp: number;
        };

        /**
         * Emitted when a cache entry is invalidated.
         */
        "internal:cache:item-invalidated": {
            /** Name of the cache instance emitting the event. */
            cacheName: string;
            /** Cache key that was invalidated. */
            key: string;
            /** Unix timestamp (ms) when the item was invalidated. */
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
             * When available, specifies the filename of the downloaded backup.
             * May be undefined if the backup download operation failed.
             */
            fileName?: string;

            /**
             * The operation type (always "backup-downloaded").
             *
             * @remarks
             * Constant value identifying this specific database operation type
             * for event filtering and routing purposes.
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
         * Emitted when a database backup restore completes.
         */
        "internal:database:backup-restored": {
            fileName: string;
            operation: "backup-restored";
            schemaVersion: number;
            sizeBytes: number;
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
            /**
             * Optional name of the exported file.
             *
             * @remarks
             * When available, specifies the filename of the exported data file.
             * May be undefined if the export operation failed.
             */
            fileName?: string;

            /**
             * The operation type (always "data-exported").
             *
             * @remarks
             * Constant value identifying this specific database operation type
             * for event filtering and routing purposes.
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
             * Provides precise timing of when the data export operation
             * finished, regardless of success or failure status.
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
             * Constant identifier for this specific internal database
             * operation.
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
             * Precise timing of when the import operation finished for audit
             * trails and performance monitoring.
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
             * Constant identifier for this specific internal database
             * operation.
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
             * Constant identifier for this specific internal database
             * operation.
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
         * @param operation - The operation type (always
         *   "history-limit-updated").
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
    }
}
