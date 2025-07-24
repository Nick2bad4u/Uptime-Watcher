# electron/utils/monitoring/monitorStatusChecker

**`Alpha`**

Monitor status checking utilities for individual monitor health verification.

## Remarks

Provides comprehensive monitor checking capabilities with automatic status updates,
history tracking, and event emission. Extracted from UptimeMonitor for improved
modularity and maintainability with full transaction safety and error handling.

This API is in active development and may change frequently.

## See

 - [MonitorCheckConfig](interfaces/MonitorCheckConfig.md) for configuration options
 - [StatusUpdate](../../../../shared/types/interfaces/StatusUpdate.md) for result types

## Example

```typescript
const config: MonitorCheckConfig = {
  repositories: { monitor, history, site },
  databaseService,
  sites: siteCache,
  eventEmitter,
  logger,
  historyLimit: 500
};

const result = await checkMonitor(config, site, "monitor_123");
if (result) {
  logger.info(`Monitor ${result.monitorId} is ${result.status}`);
}
```

## Interfaces

- [MonitorCheckConfig](interfaces/MonitorCheckConfig.md)

## Functions

- [checkMonitor](functions/checkMonitor.md)
- [checkSiteManually](functions/checkSiteManually.md)
