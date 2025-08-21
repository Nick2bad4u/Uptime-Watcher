# Type Alias: EventCategory

> **EventCategory** = `"database"` \| `"monitoring"` \| `"system"` \| `"ui"`

Defined in: [electron/events/eventTypes.ts:851](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/events/eventTypes.ts#L851)

Category for grouping related events by functional domain.

## Remarks

Used for event filtering, routing, and middleware processing.

## Example

```typescript
const category: EventCategory = "database";
```
