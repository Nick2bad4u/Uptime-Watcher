# electron/events/eventTypes

Type definitions for all events in the Uptime Watcher application.

## Remarks

Provides compile-time type safety for event data across the application.
Events are organized by domain (site, monitor, database, system) and include
comprehensive metadata for debugging and auditing purposes.

## Interfaces

- [UptimeEvents](interfaces/UptimeEvents.md)

## Type Aliases

- [EventCategory](type-aliases/EventCategory.md)
- [EventCheckType](type-aliases/EventCheckType.md)
- [EventEnvironment](type-aliases/EventEnvironment.md)
- [EventReason](type-aliases/EventReason.md)
- [EventSeverity](type-aliases/EventSeverity.md)
- [EventSource](type-aliases/EventSource.md)
- [EventTriggerType](type-aliases/EventTriggerType.md)

## Variables

- [EVENT\_CATEGORIES](variables/EVENT_CATEGORIES.md)
- [EVENT\_PRIORITIES](variables/EVENT_PRIORITIES.md)

## Functions

- [getEventPriority](functions/getEventPriority.md)
- [isEventOfCategory](functions/isEventOfCategory.md)
