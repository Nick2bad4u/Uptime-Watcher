# Function: isEventOfCategory()

> **isEventOfCategory**(`eventName`, `category`): `boolean`

Defined in: [electron/events/eventTypes.ts:585](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/events/eventTypes.ts#L585)

Type guard to check if an event belongs to a specific category.

## Parameters

### eventName

keyof [`UptimeEvents`](../interfaces/UptimeEvents.md)

The event name to categorize

### category

The category to check against
Provides type-safe event categorization for filtering and routing.
Internal events are separated into their own categories (INTERNAL_DATABASE,
INTERNAL_MONITOR, INTERNAL_SITE) for manager-to-manager communication.

`"CACHE"` | `"CONFIG"` | `"DATABASE"` | `"INTERNAL_DATABASE"` | `"INTERNAL_MONITOR"` | `"INTERNAL_SITE"` | `"MONITOR"` | `"MONITORING"` | `"PERFORMANCE"` | `"SITE"` | `"SYSTEM"`

## Returns

`boolean`

True if the event belongs to the specified category, false if the category doesn't exist or event doesn't match

## Example

```typescript
const isMonitorEvent = isEventOfCategory("monitor:up", "MONITOR"); // Returns true
const isInternalEvent = isEventOfCategory("internal:site:added", "INTERNAL_SITE"); // Returns true
const invalidCategory = isEventOfCategory("monitor:up", "NONEXISTENT"); // Returns false
```
