# Variable: monitorLogger

> `const` **monitorLogger**: `Logger`

Defined in: [electron/utils/logger.ts:187](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/logger.ts#L187)

Monitor-specific logger for monitoring operations and health checks.

## Remarks

Uses "MONITOR" prefix for clear categorization of monitoring-related logs.
Perfect for logging health check results, monitor configuration changes, and
monitoring system performance metrics.

## Example

```typescript
import { monitorLogger } from "./logger";

monitorLogger.info("Monitor check started", { siteId: "abc123" });
monitorLogger.debug("Response time recorded", {
    time: 245,
    url: "https://example.com",
});
monitorLogger.error("Monitor check failed", {
    siteId: "abc123",
    error: "timeout",
});
```
