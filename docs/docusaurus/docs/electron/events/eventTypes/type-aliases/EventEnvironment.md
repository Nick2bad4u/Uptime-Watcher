# Type Alias: EventEnvironment

> **EventEnvironment** = `"development"` \| `"production"` \| `"test"`

Defined in: [electron/events/eventTypes.ts:885](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/events/eventTypes.ts#L885)

Runtime environment where the event occurred.

## Remarks

Used for distinguishing between development, production, and test
environments in event payloads.

## Example

```typescript
const env: EventEnvironment = "production";
```
