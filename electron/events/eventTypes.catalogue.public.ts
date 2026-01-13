/**
 * Uptime event catalogue: public.
 *
 * @remarks
 * This file augments {@link UptimeEvents} from `eventTypes.ts` with renderer/
 * public-facing events (monitoring, site, system, performance).
 */

import type { Monitor, Site, StatusUpdate } from "@shared/types";
import type {
    HistoryLimitUpdatedEventData,
    MonitorDownEventData,
    MonitoringStartedEventData,
    MonitoringStoppedEventData,
    MonitorStatusChangedEventData,
    MonitorUpEventData,
    SiteAddedSource,
    StateSyncEventData,
} from "@shared/types/events";

import type { EventPayloadValue } from "./TypedEventBus";

type UptimeEventPayload<TPayload extends object> = EventPayloadValue & TPayload;

declare module "./eventTypes" {
    interface UptimeEvents {
        /**
         * Emitted when a monitor is added.
         *
         * @param monitor - The monitor object added.
         * @param siteIdentifier - The identifier of the site the monitor
         *   belongs to.
         * @param timestamp - Unix timestamp (ms) when the monitor was added.
         */
        "monitor:added": {
            /** The monitor object added. */
            monitor: Monitor;
            /** The identifier of the site the monitor belongs to. */
            siteIdentifier: string;
            /** Unix timestamp (ms) when the monitor was added. */
            timestamp: number;
        };

        /** Scheduler backoff applied for a monitor following failure/timeout. */
        "monitor:backoff-applied": {
            backoffAttempt: number;
            correlationId: string;
            delayMs: number;
            monitorId: string;
            siteIdentifier: string;
            timestamp: number;
        };

        /**
         * Emitted when a monitor check is completed.
         *
         * @param checkType - The type of check ("manual" or "scheduled").
         * @param monitorId - The monitor ID.
         * @param result - The status update result.
         * @param siteIdentifier - The identifier of the site the monitor
         *   belongs to.
         * @param timestamp - Unix timestamp (ms) when the check completed.
         */
        "monitor:check-completed": {
            /** The type of check ("manual" or "scheduled"). */
            checkType: "manual" | "scheduled";
            /** The monitor ID. */
            monitorId: string;
            /** The status update result. */
            result: StatusUpdate;
            /** The identifier of the site the monitor belongs to. */
            siteIdentifier: string;
            /** Unix timestamp (ms) when the check completed. */
            timestamp: number;
        };

        /**
         * Emitted when a monitor goes down.
         *
         * @see {@link MonitorDownEventData} for payload details.
         */
        "monitor:down": UptimeEventPayload<MonitorDownEventData>;

        /** Manual check dispatched for a monitor (pre-empts scheduled job). */
        "monitor:manual-check-started": {
            correlationId: string;
            monitorId: string;
            siteIdentifier: string;
            timestamp: number;
        };

        /**
         * Emitted when a monitor is removed.
         *
         * @param monitorId - The monitor ID.
         * @param siteIdentifier - The identifier of the site the monitor
         *   belonged to.
         * @param timestamp - Unix timestamp (ms) when the monitor was removed.
         */
        "monitor:removed": {
            /** The monitor ID. */
            monitorId: string;
            /** The identifier of the site the monitor belonged to. */
            siteIdentifier: string;
            /** Unix timestamp (ms) when the monitor was removed. */
            timestamp: number;
        };

        /** Scheduler emitted when a monitor job is scheduled or rescheduled. */
        "monitor:schedule-updated": {
            backoffAttempt: number;
            correlationId: string;
            delayMs: number;
            monitorId: string;
            siteIdentifier: string;
            timestamp: number;
        };

        /**
         * Emitted when a monitor's status changes.
         *
         * @see {@link MonitorStatusChangedEventData} for payload details.
         */
        "monitor:status-changed": UptimeEventPayload<MonitorStatusChangedEventData>;

        /** Emitted when a monitor check times out before completion. */
        "monitor:timeout": {
            correlationId: string;
            monitorId: string;
            siteIdentifier: string;
            timeoutMs: number;
            timestamp: number;
        };

        /**
         * Emitted when a monitor goes up.
         *
         * @see {@link MonitorUpEventData} for payload details.
         */
        "monitor:up": UptimeEventPayload<MonitorUpEventData>;

        /**
         * Emitted when monitoring is started.
         *
         * @see MonitoringControlEventData (shared/types/events) for common metadata fields.
         */
        "monitoring:started": UptimeEventPayload<MonitoringStartedEventData>;

        /**
         * Emitted when monitoring is stopped.
         *
         * @see MonitoringControlEventData (shared/types/events) for common metadata fields.
         */
        "monitoring:stopped": UptimeEventPayload<MonitoringStoppedEventData>;

        /**
         * Emitted when a system notification is dispatched for a monitor status
         * change.
         */
        "notification:sent": {
            /** Correlation identifier for the notification emission. */
            correlationId: string;
            /** Identifier of the monitor that triggered the notification. */
            monitorId: string;
            /** Identifier of the site that owns the monitor. */
            siteIdentifier: string;
            /** Monitor status associated with the notification. */
            status: "down" | "up";
            /** Unix timestamp (ms) when the notification was dispatched. */
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
            /** The metric category ("database", "monitoring", "system", or
"ui"). */
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
         * @param timestamp - Unix timestamp (ms) when the warning was
         *   triggered.
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
         * Emitted when the database history retention limit changes.
         *
         * @remarks
         * Forwarded to renderer clients so settings views remain synchronized
         * when imports or backend tooling adjust the configured limit.
         *
         * @see {@link HistoryLimitUpdatedEventData} for payload structure.
         */
        "settings:history-limit-updated": UptimeEventPayload<HistoryLimitUpdatedEventData>;

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
            source: SiteAddedSource;
            /** Unix timestamp (ms) when the site was added. */
            timestamp: number;
        };

        /**
         * Emitted when a site is removed.
         *
         * @param cascade - Whether the removal was cascaded.
         * @param siteIdentifier - The identifier of the site removed.
         * @param siteName - The name of the site removed.
         * @param timestamp - Unix timestamp (ms) when the site was removed.
         */
        "site:removed": {
            /** Whether the removal was cascaded. */
            cascade: boolean;
            /** The identifier of the site removed. */
            siteIdentifier: string;
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
        "sites:state-synchronized": StateSyncEventData;

        /**
         * Emitted when a system error occurs.
         *
         * @param context - The error context string.
         * @param error - The error object.
         * @param recovery - Optional recovery suggestion.
         * @param severity - The severity of the error ("critical", "high",
         *   "low", or "medium").
         * @param timestamp - Unix timestamp (ms) when the error occurred.
         */
        "system:error": {
            /** The error context string. */
            context: string;
            /** The error object. */
            error: Error;
            /** Optional recovery suggestion. */
            recovery?: string;
            /** The severity of the error ("critical", "high", "low", or
"medium"). */
            severity: "critical" | "high" | "low" | "medium";
            /** Unix timestamp (ms) when the error occurred. */
            timestamp: number;
        };

        /**
         * Emitted when the system is shutting down.
         *
         * @param reason - The reason for shutdown ("error", "update", or
         *   "user").
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
}
