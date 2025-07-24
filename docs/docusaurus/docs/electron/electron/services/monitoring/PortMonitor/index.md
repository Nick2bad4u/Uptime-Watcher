# electron/services/monitoring/PortMonitor

TCP/UDP port monitoring service for network connectivity health checks.

## Remarks

Provides comprehensive port monitoring capabilities for TCP and UDP endpoints
with configurable timeouts, retry logic, and intelligent connection handling.
Designed for reliable network connectivity verification across various protocols.

## See

 - [IMonitorService](../types/interfaces/IMonitorService.md) for interface contract
 - [MonitorConfig](../types/interfaces/MonitorConfig.md) for configuration options

## Example

```typescript
const portMonitor = new PortMonitor({ timeout: 5000 });
const result = await portMonitor.check({
  id: "mon_1",
  type: "port",
  host: "example.com",
  port: 443,
  status: "pending",
  // ... other monitor properties
});
console.log(`Status: ${result.status}, Response time: ${result.responseTime}ms`);
```

## Classes

- [PortMonitor](classes/PortMonitor.md)
