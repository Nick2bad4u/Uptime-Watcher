# Function: getEventPriority()

> **getEventPriority**(`eventName`): `"CRITICAL"` \| `"HIGH"` \| `"LOW"` \| `"MEDIUM"`

Defined in: [electron/events/eventTypes.ts:554](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/events/eventTypes.ts#L554)

Get the priority level of an event with type safety.

## Parameters

### eventName

keyof [`UptimeEvents`](../interfaces/UptimeEvents.md)

The event name to check priority for

## Returns

`"CRITICAL"` \| `"HIGH"` \| `"LOW"` \| `"MEDIUM"`

The priority level of the event. Returns "MEDIUM" for uncategorized events as a safe default.

## Remarks

Uses type-safe lookup to determine event priority. Events not explicitly categorized
default to MEDIUM priority. This ensures all events have a priority assigned for
consistent middleware and filtering behavior.

## Example

```typescript
const priority = getEventPriority("system:error"); // Returns "CRITICAL"
const defaultPriority = getEventPriority("unknown:event"); // Returns "MEDIUM"
```
