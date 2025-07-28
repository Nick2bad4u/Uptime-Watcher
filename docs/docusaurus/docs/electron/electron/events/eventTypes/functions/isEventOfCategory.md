# Function: isEventOfCategory()

> **isEventOfCategory**(`eventName`, `category`): `boolean`

Defined in: [electron/events/eventTypes.ts:1059](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/events/eventTypes.ts#L1059)

Determines if an event belongs to a specific category.

## Parameters

### eventName

keyof [`UptimeEvents`](../interfaces/UptimeEvents.md)

The event name to categorize. Must be a key of [UptimeEvents](../interfaces/UptimeEvents.md).

### category

The category to check against. Must be a key of [EVENT\_CATEGORIES](../variables/EVENT_CATEGORIES.md).

`"CACHE"` | `"CONFIG"` | `"DATABASE"` | `"INTERNAL_DATABASE"` | `"INTERNAL_MONITOR"` | `"INTERNAL_SITE"` | `"MONITOR"` | `"MONITORING"` | `"PERFORMANCE"` | `"SITE"` | `"SYSTEM"`

## Returns

`boolean`

True if the event belongs to the specified category, false if the category doesn't exist or event doesn't match.

## Remarks

Provides type-safe event categorization for filtering and routing. Internal events are separated into their own categories
(INTERNAL_DATABASE, INTERNAL_MONITOR, INTERNAL_SITE) for manager-to-manager communication.

## Example

```typescript
const isMonitorEvent = isEventOfCategory("monitor:up", "MONITOR"); // Returns true
const isInternalEvent = isEventOfCategory("internal:site:added", "INTERNAL_SITE"); // Returns true
const invalidCategory = isEventOfCategory("monitor:up", "NONEXISTENT"); // Returns false
```

## See

[EVENT\_CATEGORIES](../variables/EVENT_CATEGORIES.md)
