# Interface: EnhancedMonitoringServices

Defined in: [electron/services/monitoring/EnhancedMonitoringServiceFactory.ts:207](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/EnhancedMonitoringServiceFactory.ts#L207)

Complete bundle of enhanced monitoring services for operation correlation and
race condition prevention.

## Remarks

This interface defines the complete set of enhanced monitoring services that
work together to provide robust, race condition-safe monitoring operations.
All services are pre-configured and ready for use, with proper inter-service
dependencies already established.

**Service Architecture:**

- **Core Engine**: [EnhancedMonitorChecker](../../EnhancedMonitorChecker/classes/EnhancedMonitorChecker.md) provides the main monitoring
  logic - **Operation Tracking**: [MonitorOperationRegistry](../../MonitorOperationRegistry/classes/MonitorOperationRegistry.md) prevents
  race conditions - **Status Management**: [MonitorStatusUpdateService](../../MonitorStatusUpdateService/classes/MonitorStatusUpdateService.md)
  ensures safe concurrent updates - **Resource Management**:
  [OperationTimeoutManager](../../OperationTimeoutManager/classes/OperationTimeoutManager.md) handles timeouts and cleanup

**Usage Pattern:** All services in this bundle are designed to work together.
The checker service is the primary interface for consumers, while the other
services provide supporting functionality that the checker coordinates
automatically.

## Example

```typescript
const services =
    EnhancedMonitoringServiceFactory.createServices(dependencies);

// Primary usage - checker coordinates all other services
const result = await services.checker.checkMonitor(site, monitorId);

// Advanced usage - direct access to supporting services
const isActive = services.registry.isOperationActive(monitorId);
await services.statusUpdateService.updateStatus(monitorId, newStatus);
```

## See

 - [EnhancedMonitoringServiceFactory.createServices](../variables/EnhancedMonitoringServiceFactory.md#createservices) for service creation
 - [EnhancedMonitoringDependencies](EnhancedMonitoringDependencies.md) for required dependencies

## Properties

### checker

> **checker**: [`EnhancedMonitorChecker`](../../EnhancedMonitorChecker/classes/EnhancedMonitorChecker.md)

Defined in: [electron/services/monitoring/EnhancedMonitoringServiceFactory.ts:218](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/EnhancedMonitoringServiceFactory.ts#L218)

Enhanced monitor checker with comprehensive operation correlation and
race condition prevention.

#### Remarks

This is the primary service interface for monitor checking operations. It
coordinates with all other services in the bundle to provide safe,
efficient monitoring capabilities. Most consumers should interact
exclusively with this service.

***

### operationRegistry

> **operationRegistry**: [`MonitorOperationRegistry`](../../MonitorOperationRegistry/classes/MonitorOperationRegistry.md)

Defined in: [electron/services/monitoring/EnhancedMonitoringServiceFactory.ts:229](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/EnhancedMonitoringServiceFactory.ts#L229)

Operation registry for monitoring active operations and preventing race
conditions.

#### Remarks

Tracks all active monitor operations to prevent duplicate or conflicting
checks. Primarily used internally by the checker service, but available
for advanced use cases requiring direct operation state querying.

***

### statusUpdateService

> **statusUpdateService**: [`MonitorStatusUpdateService`](../../MonitorStatusUpdateService/classes/MonitorStatusUpdateService.md)

Defined in: [electron/services/monitoring/EnhancedMonitoringServiceFactory.ts:241](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/EnhancedMonitoringServiceFactory.ts#L241)

Status update service with operation validation and concurrent access
safety.

#### Remarks

Provides safe status update operations that validate against current
operation state to prevent race conditions during concurrent monitor
checks. Ensures status updates are only applied when appropriate and
maintains data consistency.

***

### timeoutManager

> **timeoutManager**: [`OperationTimeoutManager`](../../OperationTimeoutManager/classes/OperationTimeoutManager.md)

Defined in: [electron/services/monitoring/EnhancedMonitoringServiceFactory.ts:252](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/EnhancedMonitoringServiceFactory.ts#L252)

Timeout manager for operation lifecycle management and resource cleanup.

#### Remarks

Handles operation timeouts, automatic cleanup procedures, and resource
management for monitor operations. Ensures that operations don't run
indefinitely and that resources are properly released when operations
complete or are cancelled.
