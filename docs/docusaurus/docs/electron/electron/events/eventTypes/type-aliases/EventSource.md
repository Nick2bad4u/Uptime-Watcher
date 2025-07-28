# Type Alias: EventSource

> **EventSource** = `"import"` \| `"migration"` \| `"system"` \| `"user"`

Defined in: [electron/events/eventTypes.ts:97](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/events/eventTypes.ts#L97)

Source that triggered an event.

## Remarks

Indicates the origin of an event, such as user action, system process, or data migration.

## Example

```typescript
const source: EventSource = "system";
```
