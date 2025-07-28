# Function: getEventPriority()

> **getEventPriority**(`eventName`): `"CRITICAL"` \| `"HIGH"` \| `"LOW"` \| `"MEDIUM"`

Defined in: [electron/events/eventTypes.ts:1028](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/events/eventTypes.ts#L1028)

Gets the priority level of an event with type safety.

## Parameters

### eventName

keyof [`UptimeEvents`](../interfaces/UptimeEvents.md)

The event name to check priority for. Must be a key of [UptimeEvents](../interfaces/UptimeEvents.md).

## Returns

`"CRITICAL"` \| `"HIGH"` \| `"LOW"` \| `"MEDIUM"`

The priority level of the event as a key of [EVENT\_PRIORITIES](../variables/EVENT_PRIORITIES.md). Returns "MEDIUM" for uncategorized events.

## Remarks

Uses type-safe lookup to determine event priority. Events not explicitly categorized default to MEDIUM priority.
This ensures all events have a priority assigned for consistent middleware and filtering behavior.

## Example

```typescript
const priority = getEventPriority("system:error"); // Returns "CRITICAL"
const defaultPriority = getEventPriority("unknown:event"); // Returns "MEDIUM"
```

## See

[EVENT\_PRIORITIES](../variables/EVENT_PRIORITIES.md)
