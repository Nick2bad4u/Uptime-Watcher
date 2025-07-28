# Type Alias: EventSeverity

> **EventSeverity** = `"critical"` \| `"high"` \| `"low"` \| `"medium"`

Defined in: [electron/events/eventTypes.ts:83](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/events/eventTypes.ts#L83)

Severity level of an event for prioritization and alerting.

## Remarks

Used to prioritize event handling and alerting in middleware and UI.

## Example

```typescript
const severity: EventSeverity = "critical";
```
