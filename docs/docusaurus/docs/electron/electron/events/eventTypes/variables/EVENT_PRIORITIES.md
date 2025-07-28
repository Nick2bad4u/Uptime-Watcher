# Variable: EVENT\_PRIORITIES

> `const` **EVENT\_PRIORITIES**: `object`

Defined in: [electron/events/eventTypes.ts:988](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/events/eventTypes.ts#L988)

Priority levels for events.

## Type declaration

### CRITICAL

> `readonly` **CRITICAL**: readonly \[`"performance:warning"`, `"system:error"`, `"system:shutdown"`\]

### HIGH

> `readonly` **HIGH**: readonly \[`"database:transaction-completed"`, `"monitor:status-changed"`, `"monitor:up"`, `"monitor:down"`, `"site:removed"`\]

### LOW

> `readonly` **LOW**: readonly \[`"performance:metric"`\]

### MEDIUM

> `readonly` **MEDIUM**: readonly \[`"config:changed"`, `"monitor:added"`, `"site:added"`, `"site:updated"`\]

## Remarks

Categorizes events by operational importance for filtering and middleware processing.
Higher priority events should receive immediate attention and processing.

## Example

```typescript
const isCritical = EVENT_PRIORITIES.CRITICAL.includes("system:error");
```
