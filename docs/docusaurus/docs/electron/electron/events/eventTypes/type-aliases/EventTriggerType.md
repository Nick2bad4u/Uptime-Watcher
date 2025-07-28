# Type Alias: EventTriggerType

> **EventTriggerType** = `"manual"` \| `"scheduled"` \| `"shutdown"`

Defined in: [electron/events/eventTypes.ts:111](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/events/eventTypes.ts#L111)

What triggered a monitoring or system event.

## Remarks

Used to distinguish between manual, scheduled, or shutdown triggers for events.

## Example

```typescript
const trigger: EventTriggerType = "scheduled";
```
