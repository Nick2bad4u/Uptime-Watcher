# Type Alias: EventSource

> **EventSource** = `"import"` \| `"migration"` \| `"system"` \| `"user"`

Defined in: [electron/events/eventTypes.ts:935](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/events/eventTypes.ts#L935)

Source that triggered an event.

## Remarks

Indicates the origin of an event, such as user action, system process, or
data migration.

## Example

```typescript
const source: EventSource = "system";
```
