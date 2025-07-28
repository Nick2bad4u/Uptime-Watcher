# Type Alias: EventEnvironment

> **EventEnvironment** = `"development"` \| `"production"` \| `"test"`

Defined in: [electron/events/eventTypes.ts:55](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/events/eventTypes.ts#L55)

Runtime environment where the event occurred.

## Remarks

Used for distinguishing between development, production, and test environments in event payloads.

## Example

```typescript
const env: EventEnvironment = "production";
```
