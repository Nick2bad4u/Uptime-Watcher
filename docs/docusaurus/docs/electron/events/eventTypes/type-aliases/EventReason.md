# Type Alias: EventReason

> **EventReason** = `"error"` \| `"shutdown"` \| `"user"`

Defined in: [electron/events/eventTypes.ts:902](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/events/eventTypes.ts#L902)

Reason for an event occurrence.

## Remarks

Used to indicate the cause or initiator of an event, such as user action or
system error.

## Example

```typescript
const reason: EventReason = "user";
```
