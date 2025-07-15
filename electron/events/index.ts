/**
 * Type-Safe Event Bus with Middleware support.
 *
 * @remarks
 * Provides enhanced EventEmitter functionality with compile-time type safety,
 * middleware processing, and comprehensive event handling capabilities.
 *
 * @public
 *
 * @see {@link TypedEventBus} for the main event bus implementation
 * @see {@link EventMiddleware} for middleware patterns
 * @see {@link UptimeEvents} for event type definitions
 *
 * @packageDocumentation
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
