# Type Alias: EventCategory

> **EventCategory** = `"database"` \| `"monitoring"` \| `"system"` \| `"ui"`

Defined in: [electron/events/eventTypes.ts:27](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/events/eventTypes.ts#L27)

Category for grouping related events by functional domain.

## Remarks

Used for event filtering, routing, and middleware processing.

## Example

```typescript
const category: EventCategory = "database";
```
