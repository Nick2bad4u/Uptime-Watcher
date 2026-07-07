/**
 * Type definitions and event contracts for all events in the Uptime Watcher
 * app.
 *
 * @remarks
 * Provides compile-time type safety for event data and event names across the
 * app. Events are organized by domain (site, monitor, database, system, etc.)
 * and include comprehensive metadata for debugging, auditing, and middleware
 * processing.
 *
 * @public
 *
 * @see {@link UptimeEvents}
 */

/**
 * Comprehensive event map for the Uptime Watcher app.
 *
 * @remarks
 * Defines all events that can be emitted throughout the app lifecycle,
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
/* eslint-disable @typescript-eslint/no-empty-object-type -- Interface is intentionally augmented in eventTypes.catalogue.*.ts */
// biome-ignore lint/suspicious/noEmptyInterface: Interface is intentionally augmented in eventTypes.catalogue.*.ts.
export interface UptimeEvents {}
/* eslint-enable @typescript-eslint/no-empty-object-type -- Re-enable after augmented event map declaration. */

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
export type EventCategory =
    | "database"
    | "monitoring"
    | "system"
    | "ui";

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
export type EventEnvironment =
    | "development"
    | "production"
    | "test";

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
export type EventReason =
    | "error"
    | "shutdown"
    | "user";

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
export type EventSeverity =
    | "critical"
    | "high"
    | "low"
    | "medium";

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
export type EventSource =
    | "import"
    | "migration"
    | "system"
    | "user";

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
export type EventTriggerType =
    | "manual"
    | "scheduled"
    | "shutdown";
