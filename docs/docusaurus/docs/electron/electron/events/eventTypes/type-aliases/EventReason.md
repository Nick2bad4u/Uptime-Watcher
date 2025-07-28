# Type Alias: EventReason

> **EventReason** = `"error"` \| `"shutdown"` \| `"user"`

Defined in: [electron/events/eventTypes.ts:69](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/events/eventTypes.ts#L69)

Reason for an event occurrence.

## Remarks

Used to indicate the cause or initiator of an event, such as user action or system error.

## Example

```typescript
const reason: EventReason = "user";
```
