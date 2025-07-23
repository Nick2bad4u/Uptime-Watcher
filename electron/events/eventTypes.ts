/**
 * Type definitions for all events in the Uptime Watcher application.
 *
 * @remarks
 * Provides compile-time type safety for event data across the application.
 * Events are organized by domain (site, monitor, database, system) and include
 * comprehensive metadata for debugging and auditing purposes.
 *
 * @packageDocumentation
 */

import type { Monitor, Site, StatusUpdate } from "../types";

/**
 * Category for grouping related events.
 *
 * @public
 */
export type EventCategory = "database" | "monitoring" | "system" | "ui";

/**
 * Type of monitoring check that triggered an event.
 *
 * @public
 */
export type EventCheckType = "manual" | "scheduled";

/**
 * Runtime environment where event occurred.
 *
 * @public
 */
export type EventEnvironment = "development" | "production" | "test";

/**
 * Reason for an event occurrence.
 *
 * @public
 */
export type EventReason = "error" | "shutdown" | "user";

/**
 * Severity level of an event for prioritization.
 *
 * @public
 */
export type EventSeverity = "critical" | "high" | "low" | "medium";

/**
 * Source that triggered an event.
 *
 * @public
 */
export type EventSource = "import" | "migration" | "system" | "user";

/**
 * What triggered a monitoring or system event.
 *
 * @public
 */
export type EventTriggerType = "manual" | "scheduled" | "shutdown";

/**
 * Comprehensive event map for the Uptime Watcher application.
 *
 * @remarks
 * Defines all events that can be emitted throughout the application lifecycle,
 * organized by functional domains. Each event includes strongly typed data
 * for compile-time safety and comprehensive metadata for debugging.
 *
 * Event Categories:
 * - **Site Events**: Site CRUD operations and lifecycle
 * - **Monitor Events**: Individual monitor status and operations
 * - **Database Events**: Data persistence and backup operations
 * - **System Events**: Application lifecycle and errors
 * - **Internal Events**: Manager-to-manager communication
 * - **Performance Events**: Metrics and warnings
 *
 * @public
 */
export interface UptimeEvents extends Record<string, unknown> {
    // Site events

    "cache:invalidated": {
        identifier?: string;
        reason: "delete" | "expiry" | "manual" | "update";
        timestamp: number;
        type: "all" | "monitor" | "site";
    };

    "config:changed": {
        newValue: unknown;
        oldValue: unknown;
        setting: string;
        source: "migration" | "system" | "user";
        timestamp: number;
    };

    "database:backup-created": {
        fileName: string;
        size: number;
        timestamp: number;
        triggerType: "manual" | "scheduled" | "shutdown";
    };

    // Monitor events

    "database:error": {
        [key: string]: unknown;
        error: Error;
        operation: string;
        timestamp: number;
    };

    // Database operation events
    "database:retry": {
        [key: string]: unknown;
        attempt: number;
        operation: string;
        timestamp: number;
    };

    "database:success": {
        [key: string]: unknown;
        duration?: number;
        operation: string;
        timestamp: number;
    };

    "database:transaction-completed": {
        duration: number;
        operation: string;
        recordsAffected?: number;
        success: boolean;
        timestamp: number;
    };

    "internal:database:backup-downloaded": {
        fileName?: string;
        operation: "backup-downloaded";
        success: boolean;
        timestamp: number;
    };

    "internal:database:data-exported": {
        fileName?: string;
        operation: "data-exported";
        success: boolean;
        timestamp: number;
    };

    // Database events

    "internal:database:data-imported": {
        operation: "data-imported";
        recordCount?: number;
        success: boolean;
        timestamp: number;
    };

    "internal:database:get-sites-from-cache-requested": {
        operation: "get-sites-from-cache-requested";
        timestamp: number;
    };

    "internal:database:get-sites-from-cache-response": {
        operation: "get-sites-from-cache-response";
        sites: Site[];
        timestamp: number;
    };

    "internal:database:history-limit-updated": {
        limit: number;
        operation: "history-limit-updated";
        timestamp: number;
    };

    "internal:database:initialized": {
        operation: "initialized";
        success: boolean;
        timestamp: number;
    };

    "internal:database:sites-refreshed": {
        operation: "sites-refreshed";
        siteCount: number;
        timestamp: number;
    };

    "internal:database:update-sites-cache-requested": {
        operation: "update-sites-cache-requested";
        sites?: Site[];
        timestamp: number;
    };

    // Configuration events

    "internal:monitor:all-started": {
        monitorCount: number;
        operation: "all-started";
        siteCount: number;
        timestamp: number;
    };

    // Performance events

    "internal:monitor:all-stopped": {
        activeMonitors: number;
        operation: "all-stopped";
        reason: EventReason;
        timestamp: number;
    };

    "internal:monitor:manual-check-completed": {
        identifier: string;
        monitorId?: string;
        operation: "manual-check-completed";
        result: StatusUpdate;
        timestamp: number;
    };

    "internal:monitor:site-setup-completed": {
        identifier: string;
        operation: "site-setup-completed";
        timestamp: number;
    };

    "internal:monitor:started": {
        identifier: string;
        monitorId?: string;
        operation: "started";
        timestamp: number;
    };

    "internal:monitor:stopped": {
        identifier: string;
        monitorId?: string;
        operation: "stopped";
        reason: EventReason;
        timestamp: number;
    };

    // Internal events for manager-to-manager communication
    "internal:site:added": {
        identifier: string;
        operation: "added";
        site: Site;
        timestamp: number;
    };

    "internal:site:cache-updated": {
        identifier: string;
        operation: "cache-updated";
        timestamp: number;
    };

    "internal:site:is-monitoring-active-requested": {
        identifier: string;
        monitorId: string;
        operation: "is-monitoring-active-requested";
        timestamp: number;
    };

    "internal:site:is-monitoring-active-response": {
        identifier: string;
        isActive: boolean;
        monitorId: string;
        operation: "is-monitoring-active-response";
        timestamp: number;
    };

    "internal:site:removed": {
        identifier: string;
        operation: "removed";
        timestamp: number;
    };

    "internal:site:restart-monitoring-requested": {
        identifier: string;
        monitor: Monitor;
        operation: "restart-monitoring-requested";
        timestamp: number;
    };

    "internal:site:restart-monitoring-response": {
        identifier: string;
        monitorId: string;
        operation: "restart-monitoring-response";
        success: boolean;
        timestamp: number;
    };

    "internal:site:start-monitoring-requested": {
        identifier: string;
        monitorId?: string;
        operation: "start-monitoring-requested";
        timestamp: number;
    };

    "internal:site:stop-monitoring-requested": {
        identifier: string;
        monitorId?: string;
        operation: "stop-monitoring-requested";
        timestamp: number;
    };

    "internal:site:updated": {
        identifier: string;
        operation: "updated";
        site: Site;
        timestamp: number;
        updatedFields?: string[];
    };

    "monitor:added": {
        monitor: Monitor;
        siteId: string;
        timestamp: number;
    };

    "monitor:check-completed": {
        checkType: "manual" | "scheduled";
        monitorId: string;
        result: StatusUpdate;
        siteId: string;
        timestamp: number;
    };

    "monitor:down": {
        monitor: Monitor;
        site: Site;
        siteId: string;
        timestamp: number;
    };

    "monitor:removed": {
        monitorId: string;
        siteId: string;
        timestamp: number;
    };

    "monitor:status-changed": {
        monitor: Monitor;
        newStatus: string;
        previousStatus: string;
        responseTime?: number;
        site: Site;
        siteId: string;
        timestamp: number;
    };

    "monitor:up": {
        monitor: Monitor;
        site: Site;
        siteId: string;
        timestamp: number;
    };

    // Monitoring service events
    "monitoring:started": {
        monitorCount: number;
        siteCount: number;
        timestamp: number;
    };

    "monitoring:stopped": {
        activeMonitors: number;
        reason: "error" | "shutdown" | "user";
        timestamp: number;
    };

    "performance:metric": {
        category: "database" | "monitoring" | "system" | "ui";
        metric: string;
        timestamp: number;
        unit: string;
        value: number;
    };

    "performance:warning": {
        actual: number;
        metric: string;
        suggestion?: string;
        threshold: number;
        timestamp: number;
    };

    "site:added": {
        site: Site;
        source: "import" | "migration" | "user";
        timestamp: number;
    };

    "site:cache-miss": {
        backgroundLoading: boolean;
        identifier: string;
        operation: "cache-lookup";
        timestamp: number;
    };

    // Cache operation events
    "site:cache-updated": {
        identifier: string;
        operation: "background-load" | "cache-updated" | "manual-refresh";
        timestamp: number;
    };

    "site:removed": {
        cascade: boolean;
        siteId: string;
        siteName: string;
        timestamp: number;
    };

    "site:updated": {
        previousSite: Site;
        site: Site;
        timestamp: number;
        updatedFields: string[];
    };

    // State synchronization events
    "sites:state-synchronized": {
        action: "bulk-sync" | "delete" | "update";
        siteIdentifier?: string;
        source?: "cache" | "database" | "frontend";
        timestamp: number;
    };

    "system:error": {
        context: string;
        error: Error;
        recovery?: string;
        severity: "critical" | "high" | "low" | "medium";
        timestamp: number;
    };

    "system:shutdown": {
        reason: "error" | "update" | "user";
        timestamp: number;
        uptime: number;
    };

    // System events
    "system:startup": {
        environment: "development" | "production" | "test";
        timestamp: number;
        version: string;
    };
}

/**
 * Event categories for filtering and middleware processing.
 *
 * @remarks
 * Organizes all events by functional domain for filtering, routing, and middleware processing.
 * Internal events are intentionally separated for manager-to-manager communication.
 */
export const EVENT_CATEGORIES = {
    CACHE: ["cache:invalidated", "site:cache-miss", "site:cache-updated"] as const,
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
    SITE: ["site:added", "site:removed", "site:updated", "sites:state-synchronized"] as const,
    SYSTEM: ["system:error", "system:shutdown", "system:startup"] as const,
} as const;

/**
 * Priority levels for events.
 *
 * @remarks
 * Categorizes events by operational importance for filtering and middleware processing.
 * Higher priority events should receive immediate attention and processing.
 */
export const EVENT_PRIORITIES = {
    CRITICAL: ["performance:warning", "system:error", "system:shutdown"] as const,
    HIGH: [
        "database:transaction-completed",
        "monitor:status-changed",
        "monitor:up",
        "monitor:down",
        "site:removed",
    ] as const,
    LOW: ["performance:metric"] as const,
    MEDIUM: ["config:changed", "monitor:added", "site:added", "site:updated"] as const,
} as const;

// Type-safe helpers for event categorization
type EventPriorityMap = typeof EVENT_PRIORITIES;

/**
 * Get the priority level of an event with type safety.
 *
 * @param eventName - The event name to check priority for
 * @returns The priority level of the event. Returns "MEDIUM" for uncategorized events as a safe default.
 *
 * @remarks
 * Uses type-safe lookup to determine event priority. Events not explicitly categorized
 * default to MEDIUM priority. This ensures all events have a priority assigned for
 * consistent middleware and filtering behavior.
 *
 * @example
 * ```typescript
 * const priority = getEventPriority("system:error"); // Returns "CRITICAL"
 * const defaultPriority = getEventPriority("unknown:event"); // Returns "MEDIUM"
 * ```
 */
export function getEventPriority(eventName: keyof UptimeEvents): keyof typeof EVENT_PRIORITIES {
    for (const [priority, events] of Object.entries(EVENT_PRIORITIES) as Array<
        [keyof EventPriorityMap, readonly string[]]
    >) {
        if (events.includes(eventName as string)) {
            return priority;
        }
    }
    return "MEDIUM"; // Default priority for uncategorized events
}

/**
 * Type guard to check if an event belongs to a specific category.
 *
 * @param eventName - The event name to categorize
 * @param category - The category to check against
 * Provides type-safe event categorization for filtering and routing.
 * Internal events are separated into their own categories (INTERNAL_DATABASE,
 * INTERNAL_MONITOR, INTERNAL_SITE) for manager-to-manager communication.
 *
 * @param eventName - The event name to categorize
 * @param category - The category to check against
 * @returns True if the event belongs to the specified category, false if the category doesn't exist or event doesn't match
 *
 * @example
 * ```typescript
 * const isMonitorEvent = isEventOfCategory("monitor:up", "MONITOR"); // Returns true
 * const isInternalEvent = isEventOfCategory("internal:site:added", "INTERNAL_SITE"); // Returns true
 * const invalidCategory = isEventOfCategory("monitor:up", "NONEXISTENT"); // Returns false
 * ```
 */
export function isEventOfCategory(eventName: keyof UptimeEvents, category: keyof typeof EVENT_CATEGORIES): boolean {
    // Check if the category exists in EVENT_CATEGORIES
    if (!Object.hasOwn(EVENT_CATEGORIES, category)) {
        return false;
    }

    // Type-safe category lookup - we know category exists from the check above
    switch (category) {
        case "CACHE": {
            return EVENT_CATEGORIES.CACHE.includes(eventName as never);
        }
        case "CONFIG": {
            return EVENT_CATEGORIES.CONFIG.includes(eventName as never);
        }
        case "DATABASE": {
            return EVENT_CATEGORIES.DATABASE.includes(eventName as never);
        }
        case "INTERNAL_DATABASE": {
            return EVENT_CATEGORIES.INTERNAL_DATABASE.includes(eventName as never);
        }
        case "INTERNAL_MONITOR": {
            return EVENT_CATEGORIES.INTERNAL_MONITOR.includes(eventName as never);
        }
        case "INTERNAL_SITE": {
            return EVENT_CATEGORIES.INTERNAL_SITE.includes(eventName as never);
        }
        case "MONITOR": {
            return EVENT_CATEGORIES.MONITOR.includes(eventName as never);
        }
        case "MONITORING": {
            return EVENT_CATEGORIES.MONITORING.includes(eventName as never);
        }
        case "PERFORMANCE": {
            return EVENT_CATEGORIES.PERFORMANCE.includes(eventName as never);
        }
        case "SITE": {
            return EVENT_CATEGORIES.SITE.includes(eventName as never);
        }
        case "SYSTEM": {
            return EVENT_CATEGORIES.SYSTEM.includes(eventName as never);
        }
        default: {
            return false;
        }
    }
}
