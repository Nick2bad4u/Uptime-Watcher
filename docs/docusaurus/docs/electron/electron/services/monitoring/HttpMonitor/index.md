# electron/services/monitoring/HttpMonitor

HTTP/HTTPS monitoring service for web endpoint health checks.

## Remarks

Provides comprehensive HTTP monitoring capabilities with advanced Axios features
for optimal performance and reliability. Supports precise response time measurement,
per-monitor timeout configuration, and intelligent status code interpretation.

## See

 - [IMonitorService](../types/interfaces/IMonitorService.md) for interface contract
 - [MonitorConfig](../types/interfaces/MonitorConfig.md) for configuration options
 - [MonitorCheckResult](../types/interfaces/MonitorCheckResult.md) for result types

## Example

```typescript
const httpMonitor = new HttpMonitor({ timeout: 5000 });
const result = await httpMonitor.check({
  id: "mon_1",
  type: "http",
  url: "https://example.com",
  status: "pending",
  // ... other monitor properties
});
console.log(`Status: ${result.status}, Response time: ${result.responseTime}ms`);
```

## Classes

- [HttpMonitor](classes/HttpMonitor.md)
