/**
 * Uptime event catalogue: internal monitoring + site.
 *
 * @remarks
 * This file augments {@link UptimeEvents} from `eventTypes.ts` with internal
 * monitor lifecycle events and internal site orchestration events.
 */

import type {
    Monitor,
    MonitoringStartSummary,
    MonitoringStopSummary,
    Site,
    StatusUpdate,
} from "@shared/types";
import type { SiteAddedSource } from "@shared/types/events";

declare module "./eventTypes" {
    interface UptimeEvents {
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
            reason: "error" | "shutdown" | "user";
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
         * @param operation - The operation type (always
         *   "manual-check-completed").
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
         * @param operation - The operation type (always
         *   "site-setup-completed").
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
            summary?: MonitoringStartSummary;
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
            reason: "error" | "shutdown" | "user";
            summary?: MonitoringStopSummary;
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
            source: SiteAddedSource;
            timestamp: number;
        };

        /**
         * Emitted when a site lookup misses the cache internally.
         *
         * @param backgroundLoading - Whether a background refresh was
         *   triggered.
         * @param identifier - The unique identifier for the site.
         * @param operation - The operation type (always "cache-lookup").
         * @param timestamp - Unix timestamp (ms) when the cache miss occurred.
         */
        "internal:site:cache-miss": {
            backgroundLoading: boolean;
            identifier: string;
            operation: "cache-lookup";
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
            operation: "background-load" | "cache-updated" | "manual-refresh";
            timestamp: number;
        };

        /**
         * Emitted when a request is made to check if monitoring is active for a
         * site.
         *
         * @param identifier - The unique identifier for the site.
         * @param monitorId - Optional monitor ID.
         * @param operation - The operation type (always
         *   "is-monitoring-active-requested").
         * @param timestamp - Unix timestamp (ms) when the request was made.
         */
        "internal:site:is-monitoring-active-requested": {
            /** The unique identifier for the site. */
            identifier: string;
            /** Optional monitor ID. */
            monitorId?: string;
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
         * @param identifier - The unique identifier for the site (optional when
         *   unavailable).
         * @param operation - The operation type (always "removed").
         * @param site - Optional site snapshot captured prior to removal.
         * @param timestamp - Unix timestamp (ms) when the site was removed.
         */
        "internal:site:removed": {
            /** Whether the removal was part of a cascade/bulk operation. */
            cascade?: boolean;
            identifier?: string;
            operation: "removed";
            site?: Site;
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
         * @param monitorId - Optional monitor ID.
         * @param operation - The operation type (always
         *   "restart-monitoring-response").
         * @param success - Whether the restart was successful.
         * @param timestamp - Unix timestamp (ms) when the response was sent.
         */
        "internal:site:restart-monitoring-response": {
            /** The unique identifier for the site. */
            identifier: string;
            /** Optional monitor ID. */
            monitorId?: string;
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
         * Emitted in response to a start monitoring request.
         */
        "internal:site:start-monitoring-response": {
            /** The unique identifier for the site. */
            identifier: string;
            /** Optional monitor ID. */
            monitorId?: string;
            /** The operation type (always "start-monitoring-response"). */
            operation: "start-monitoring-response";
            /** Whether the start operation was successful. */
            success: boolean;
            /** Unix timestamp (ms) when the response was sent. */
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
         * Emitted in response to a stop monitoring request.
         *
         * @param identifier - The unique identifier for the site.
         * @param monitorId - Optional monitor ID.
         * @param operation - The operation type (always
         *   "stop-monitoring-response").
         * @param success - Whether the stop operation was successful.
         * @param timestamp - Unix timestamp (ms) when the response was sent.
         */
        "internal:site:stop-monitoring-response": {
            /** The unique identifier for the site. */
            identifier: string;
            /** Optional monitor ID. */
            monitorId?: string;
            /** The operation type (always "stop-monitoring-response"). */
            operation: "stop-monitoring-response";
            /** Whether the stop operation was successful. */
            success: boolean;
            /** Unix timestamp (ms) when the response was sent. */
            timestamp: number;
        };

        /**
         * Emitted when a site is updated internally.
         *
         * @param identifier - The unique identifier for the site.
         * @param operation - The operation type (always "updated").
         * @param site - The updated site object.
         * @param previousSite - Optional snapshot of the site before the
         *   update.
         * @param timestamp - Unix timestamp (ms) when the update occurred.
         * @param updatedFields - Optional list of updated field names.
         */
        "internal:site:updated": {
            /** The unique identifier for the site. */
            identifier: string;
            /** The operation type (always "updated"). */
            operation: "updated";
            /** Previous site snapshot before the update (optional). */
            previousSite?: Site;
            /** The updated site object. */
            site: Site;
            /** Unix timestamp (ms) when the update occurred. */
            timestamp: number;
            /** Optional list of updated field names. */
            updatedFields?: string[];
        };
    }
}
