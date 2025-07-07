/**
 * Type-Safe Event Bus with Middleware support.
 * Provides enhanced EventEmitter functionality with compile-time type safety.
 */

export { TypedEventBus, createTypedEventBus } from "./TypedEventBus";
export type { EventMiddleware, EventMetadata, EventBusDiagnostics } from "./TypedEventBus";

// Export the full event types with complete type safety
export type { UptimeEvents } from "./eventTypes";
export { EVENT_CATEGORIES, EVENT_PRIORITIES, isEventOfCategory, getEventPriority } from "./eventTypes";
export type {
    EventReason,
    EventSource,
    EventSeverity,
    EventEnvironment,
    EventCategory,
    EventCheckType,
    EventTriggerType,
} from "./eventTypes";

// Constants for event names - maintain backward compatibility
export const DATABASE_EVENTS = {
    BACKUP_DOWNLOADED: "database:backup-downloaded" as const,
    DATA_EXPORTED: "database:data-exported" as const,
    DATA_IMPORTED: "database:data-imported" as const,
    HISTORY_LIMIT_UPDATED: "database:history-limit-updated" as const,
    INITIALIZED: "database:initialized" as const,
    SITES_REFRESHED: "database:sites-refreshed" as const,
} as const;

export const SITE_EVENTS = {
    CACHE_UPDATED: "internal:site:cache-updated" as const,
    SITE_UPDATED: "internal:site:updated" as const,
    START_MONITORING_REQUESTED: "internal:site:start-monitoring-requested" as const,
    STOP_MONITORING_REQUESTED: "internal:site:stop-monitoring-requested" as const,
} as const;

// Export the full middleware system
export {
    createLoggingMiddleware,
    createErrorHandlingMiddleware,
    createMetricsMiddleware,
    createRateLimitMiddleware,
    createValidationMiddleware,
    createFilterMiddleware,
    createDebugMiddleware,
    composeMiddleware,
    MIDDLEWARE_STACKS,
} from "./middleware";
