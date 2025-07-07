/**
 * Type definitions for all events in the Uptime Watcher application.
 * Provides compile-time type safety for event data.
 */

import type { Monitor, Site, StatusUpdate } from "../types";

/**
 * Common type aliases for event data.
 */
export type EventReason = "user" | "error" | "shutdown";
export type EventSource = "user" | "import" | "migration" | "system";
export type EventSeverity = "low" | "medium" | "high" | "critical";
export type EventEnvironment = "development" | "production" | "test";
export type EventCategory = "database" | "monitoring" | "ui" | "system";
export type EventCheckType = "scheduled" | "manual";
export type EventTriggerType = "manual" | "scheduled" | "shutdown";

/**
 * Main event map for the application.
 * Each key represents an event name and its value represents the expected data type.
 */
export interface UptimeEvents extends Record<string, unknown> {
    // Site events
    "site:added": {
        site: Site;
        timestamp: number;
        source: "user" | "import" | "migration";
    };

    "site:updated": {
        site: Site;
        previousSite: Site;
        timestamp: number;
        updatedFields: string[];
    };

    "site:removed": {
        siteId: string;
        siteName: string;
        timestamp: number;
        cascade: boolean;
    };

    // Monitor events
    "monitor:added": {
        monitor: Monitor;
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

    "monitor:removed": {
        monitorId: string;
        siteId: string;
        timestamp: number;
    };

    "monitor:check-completed": {
        monitorId: string;
        siteId: string;
        result: StatusUpdate;
        timestamp: number;
        checkType: "scheduled" | "manual";
    };

    // Database events
    "database:transaction-completed": {
        operation: string;
        duration: number;
        timestamp: number;
        success: boolean;
        recordsAffected?: number;
    };

    "database:backup-created": {
        fileName: string;
        size: number;
        timestamp: number;
        triggerType: "manual" | "scheduled" | "shutdown";
    };

    // System events
    "system:startup": {
        version: string;
        timestamp: number;
        environment: "development" | "production" | "test";
    };

    "system:shutdown": {
        timestamp: number;
        reason: "user" | "error" | "update";
        uptime: number;
    };

    "system:error": {
        error: Error;
        context: string;
        timestamp: number;
        severity: "low" | "medium" | "high" | "critical";
        recovery?: string;
    };

    // Monitoring service events
    "monitoring:started": {
        siteCount: number;
        monitorCount: number;
        timestamp: number;
    };

    "monitoring:stopped": {
        reason: "user" | "error" | "shutdown";
        timestamp: number;
        activeMonitors: number;
    };

    // Configuration events
    "config:changed": {
        setting: string;
        oldValue: unknown;
        newValue: unknown;
        timestamp: number;
        source: "user" | "system" | "migration";
    };

    // Performance events
    "performance:metric": {
        metric: string;
        value: number;
        unit: string;
        timestamp: number;
        category: "database" | "monitoring" | "ui" | "system";
    };

    "performance:warning": {
        metric: string;
        threshold: number;
        actual: number;
        timestamp: number;
        suggestion?: string;
    };

    // Internal events for manager-to-manager communication
    "internal:site:added": {
        identifier: string;
        site: Site;
        operation: "added";
        timestamp: number;
    };

    "internal:site:removed": {
        identifier: string;
        operation: "removed";
        timestamp: number;
    };

    "internal:site:updated": {
        identifier: string;
        site: Site;
        operation: "updated";
        timestamp: number;
        updatedFields?: string[];
    };

    "internal:site:cache-updated": {
        identifier: string;
        operation: "cache-updated";
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

    "internal:site:is-monitoring-active-requested": {
        identifier: string;
        monitorId: string;
        operation: "is-monitoring-active-requested";
        timestamp: number;
    };

    "internal:site:restart-monitoring-requested": {
        identifier: string;
        monitor: Monitor;
        operation: "restart-monitoring-requested";
        timestamp: number;
    };

    "internal:site:is-monitoring-active-response": {
        identifier: string;
        isActive: boolean;
        monitorId: string;
        operation: "is-monitoring-active-response";
        timestamp: number;
    };

    "internal:site:restart-monitoring-response": {
        identifier: string;
        monitorId: string;
        operation: "restart-monitoring-response";
        success: boolean;
        timestamp: number;
    };

    "internal:monitor:all-started": {
        operation: "all-started";
        timestamp: number;
        siteCount: number;
        monitorCount: number;
    };

    "internal:monitor:all-stopped": {
        operation: "all-stopped";
        timestamp: number;
        activeMonitors: number;
        reason: EventReason;
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
        timestamp: number;
        reason: EventReason;
    };

    "internal:monitor:manual-check-completed": {
        identifier: string;
        monitorId?: string;
        result: StatusUpdate;
        operation: "manual-check-completed";
        timestamp: number;
    };

    "internal:monitor:site-setup-completed": {
        identifier: string;
        operation: "site-setup-completed";
        timestamp: number;
    };

    "internal:database:initialized": {
        operation: "initialized";
        timestamp: number;
        success: boolean;
    };

    "internal:database:history-limit-updated": {
        operation: "history-limit-updated";
        limit: number;
        timestamp: number;
    };

    "internal:database:data-exported": {
        operation: "data-exported";
        timestamp: number;
        success: boolean;
        fileName?: string;
    };

    "internal:database:data-imported": {
        operation: "data-imported";
        timestamp: number;
        success: boolean;
        recordCount?: number;
    };

    "internal:database:backup-downloaded": {
        operation: "backup-downloaded";
        timestamp: number;
        success: boolean;
        fileName?: string;
    };

    "internal:database:sites-refreshed": {
        operation: "sites-refreshed";
        timestamp: number;
        siteCount: number;
    };

    "internal:database:update-sites-cache-requested": {
        operation: "update-sites-cache-requested";
        sites?: Site[];
        timestamp: number;
    };

    "internal:database:get-sites-from-cache-requested": {
        operation: "get-sites-from-cache-requested";
        timestamp: number;
        sites?: Site[];
    };
}

/**
 * Event categories for filtering and middleware processing.
 */
export const EVENT_CATEGORIES = {
    CONFIG: ["config:changed"],
    DATABASE: ["database:backup-created", "database:transaction-completed"],
    MONITOR: ["monitor:added", "monitor:check-completed", "monitor:removed", "monitor:status-changed"],
    MONITORING: ["monitoring:started", "monitoring:stopped"],
    PERFORMANCE: ["performance:metric", "performance:warning"],
    SITE: ["site:added", "site:removed", "site:updated"],
    SYSTEM: ["system:error", "system:shutdown", "system:startup"],
} as const;

/**
 * Priority levels for events.
 */
export const EVENT_PRIORITIES = {
    CRITICAL: ["performance:warning", "system:error", "system:shutdown"],
    HIGH: ["database:transaction-completed", "monitor:status-changed", "site:removed"],
    LOW: ["performance:metric"],
    MEDIUM: ["config:changed", "monitor:added", "site:added", "site:updated"],
} as const;

/**
 * Type guard to check if an event is of a specific category.
 */
export function isEventOfCategory(eventName: keyof UptimeEvents, category: keyof typeof EVENT_CATEGORIES): boolean {
    return EVENT_CATEGORIES[category].includes(eventName as never);
}

/**
 * Get the priority level of an event.
 */
export function getEventPriority(eventName: keyof UptimeEvents): keyof typeof EVENT_PRIORITIES {
    for (const [priority, events] of Object.entries(EVENT_PRIORITIES)) {
        if (events.includes(eventName as never)) {
            return priority as keyof typeof EVENT_PRIORITIES;
        }
    }
    return "MEDIUM"; // Default priority
}
