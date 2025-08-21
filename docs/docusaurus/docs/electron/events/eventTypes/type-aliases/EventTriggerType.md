# Type Alias: EventTriggerType

> **EventTriggerType** = `"manual"` \| `"scheduled"` \| `"shutdown"`

Defined in: [electron/events/eventTypes.ts:952](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/events/eventTypes.ts#L952)

What triggered a monitoring or system event.

## Remarks

Used to distinguish between manual, scheduled, or shutdown triggers for
events.

## Example

```typescript
const trigger: EventTriggerType = "scheduled";
```
