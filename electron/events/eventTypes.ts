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

import type { EventPayloadValue } from "./TypedEventBus";

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
// eslint-disable-next-line @typescript-eslint/no-empty-object-type -- Interface is intentionally augmented in eventTypes.catalogue.*.ts
export interface UptimeEvents extends Record<string, EventPayloadValue> {}

/**
 * String literal union of all registered uptime event names.
 *
 * @remarks
 * Useful for authoring utilities that operate on the event catalogue without
 * requiring a full `UptimeEvents` map.
 */
export type UptimeEventName = Extract<keyof UptimeEvents, string>;

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
    CACHE: ["cache:invalidated"] as const,

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
        "database:backup-restored",
        "database:error",
        "database:retry",
        "database:success",
        "database:transaction-completed",
    ] as const,

    /** Diagnostics events for preload guard reports and validation. */
    DIAGNOSTICS: ["diagnostics:report-created"] as const,

    /**
     * Internal cache management events.
     */
    INTERNAL_CACHE: [
        "internal:cache:all-invalidated",
        "internal:cache:bulk-updated",
        "internal:cache:cleanup-completed",
        "internal:cache:cleared",
        "internal:cache:item-cached",
        "internal:cache:item-deleted",
        "internal:cache:item-evicted",
        "internal:cache:item-expired",
        "internal:cache:item-invalidated",
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
        "internal:database:backup-restored",
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
        "internal:site:cache-miss",
        "internal:site:cache-updated",
        "internal:site:is-monitoring-active-requested",
        "internal:site:is-monitoring-active-response",
        "internal:site:removed",
        "internal:site:restart-monitoring-requested",
        "internal:site:restart-monitoring-response",
        "internal:site:start-monitoring-requested",
        "internal:site:stop-monitoring-requested",
        "internal:site:stop-monitoring-response",
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
        "monitor:manual-check-started",
        "monitor:schedule-updated",
        "monitor:backoff-applied",
        "monitor:timeout",
        "monitor:removed",
        "monitor:status-changed",
        "monitor:up",
        "monitor:down",
        "notification:sent",
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
    /**
     * Settings and configuration change events.
     */
    SETTINGS: ["settings:history-limit-updated"] as const,

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
        "monitor:timeout",
        "site:removed",
    ] as const,

    /**
     * Low priority events for routine data collection.
     *
     * @remarks
     * Events that represent routine metrics and data collection activities that
     * can be processed with lower priority.
     */
    LOW: [
        "performance:metric",
        "internal:cache:all-invalidated",
        "internal:cache:bulk-updated",
        "internal:cache:cleanup-completed",
        "internal:cache:cleared",
        "internal:cache:item-cached",
        "internal:cache:item-deleted",
        "internal:cache:item-evicted",
        "internal:cache:item-expired",
        "internal:cache:item-invalidated",
    ] as const,

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
        "monitor:manual-check-started",
        "monitor:schedule-updated",
        "monitor:backoff-applied",
        "notification:sent",
        "settings:history-limit-updated",
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
    eventName: UptimeEventName
): keyof typeof EVENT_PRIORITIES {
    const eventNameStr = eventName;

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
    eventName: UptimeEventName,
    category: keyof typeof EVENT_CATEGORIES
): boolean {
    const eventNameStr = eventName;

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
        case "DIAGNOSTICS": {
            return (EVENT_CATEGORIES.DIAGNOSTICS as readonly string[]).includes(
                eventNameStr
            );
        }
        case "INTERNAL_CACHE": {
            return (
                EVENT_CATEGORIES.INTERNAL_CACHE as readonly string[]
            ).includes(eventNameStr);
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
        case "SETTINGS": {
            return (EVENT_CATEGORIES.SETTINGS as readonly string[]).includes(
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
