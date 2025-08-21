# Class: EnhancedMonitorChecker

Defined in: [electron/services/monitoring/EnhancedMonitorChecker.ts:256](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/EnhancedMonitorChecker.ts#L256)

Enhanced monitor checker with advanced operation correlation and race
condition prevention.

## Remarks

This class is the core monitoring engine that provides robust, race
condition-safe monitor checking capabilities. It coordinates with multiple
service layers to ensure safe concurrent operations and maintains operation
state throughout the monitoring lifecycle.

**Key Features:**

- **Operation Correlation**: Prevents duplicate operations on the same monitor
- **Race Condition Prevention**: Ensures safe concurrent monitoring operations
- **Advanced Timeout Management**: Handles operation timeouts with proper
  cleanup
- **Status Update Safety**: Prevents conflicting status updates from concurrent
  checks
- **Comprehensive Logging**: Detailed operation tracking for debugging and
  monitoring

**Operation Lifecycle:**

1. Validate monitor and operation prerequisites
2. Register operation in correlation registry
3. Configure timeout management and cleanup
4. Execute monitor-specific checking logic
5. Process results and update status safely
6. Clean up resources and unregister operation

**Supported Monitor Types:**

- HTTP/HTTPS monitors with full request/response validation
- Ping monitors with network connectivity testing
- Port monitors with TCP/UDP connection testing

## Examples

```typescript
const checker = new EnhancedMonitorChecker(config);

// Scheduled check with operation correlation
const result = await checker.checkMonitor(site, monitorId, false);

// Manual check (bypasses operation correlation)
const manualResult = await checker.checkMonitor(site, monitorId, true);
```

```typescript
try {
    const result = await checker.checkMonitor(site, monitorId);
    if (result) {
        console.log("Monitor check successful:", result.status);
    }
} catch (error) {
    console.error("Monitor check failed:", error);
}
```

## See

 - [MonitorOperationRegistry](../../MonitorOperationRegistry/classes/MonitorOperationRegistry.md) for operation correlation details
 - [MonitorStatusUpdateService](../../MonitorStatusUpdateService/classes/MonitorStatusUpdateService.md) for status update safety mechanisms
 - [OperationTimeoutManager](../../OperationTimeoutManager/classes/OperationTimeoutManager.md) for timeout and cleanup management
 - [EnhancedMonitorCheckConfig](../interfaces/EnhancedMonitorCheckConfig.md) for configuration requirements

## Constructors

### Constructor

> **new EnhancedMonitorChecker**(`config`): `EnhancedMonitorChecker`

Defined in: [electron/services/monitoring/EnhancedMonitorChecker.ts:982](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/EnhancedMonitorChecker.ts#L982)

#### Parameters

##### config

[`EnhancedMonitorCheckConfig`](../interfaces/EnhancedMonitorCheckConfig.md)

#### Returns

`EnhancedMonitorChecker`

## Methods

### checkMonitor()

> **checkMonitor**(`site`, `monitorId`, `isManualCheck`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`undefined` \| [`StatusUpdate`](../../../../../shared/types/interfaces/StatusUpdate.md)\>

Defined in: [electron/services/monitoring/EnhancedMonitorChecker.ts:348](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/EnhancedMonitorChecker.ts#L348)

Performs a comprehensive monitor status check with advanced operation
correlation.

#### Parameters

##### site

[`Site`](../../../../../shared/types/interfaces/Site.md)

The site object containing the monitor configuration

##### monitorId

`string`

Unique identifier of the monitor to check

##### isManualCheck

`boolean` = `false`

Whether this is a user-initiated manual check
  (default: false)

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`undefined` \| [`StatusUpdate`](../../../../../shared/types/interfaces/StatusUpdate.md)\>

A promise that resolves to a StatusUpdate object if the check
  succeeds, or undefined if the check fails, is cancelled, or encounters
  conflicts

#### Remarks

This is the primary entry point for all monitor checking operations. The
method provides two distinct operation modes: correlated checks for
scheduled operations that prevent race conditions, and direct checks for
manual operations that bypass correlation.

**Operation Modes:**

**Scheduled Checks (isManualCheck = false):**

- Uses operation correlation to prevent duplicate checks
- Validates monitor is actively monitoring before proceeding
- Registers operation in correlation registry
- Provides timeout management and automatic cleanup
- Handles concurrent operation conflicts gracefully

**Manual Checks (isManualCheck = true):**

- Bypasses operation correlation for immediate execution
- Ignores monitor monitoring state
- Provides immediate feedback for user-initiated actions
- Still benefits from enhanced error handling and logging

**Error Handling:**

- Validates monitor configuration before execution
- Handles operation conflicts and duplicate registrations
- Provides comprehensive error logging with operation context
- Ensures proper resource cleanup on failures

**Timeout Management:**

- Applies monitor-specific or default timeout values
- Includes buffer time for cleanup operations
- Automatically cancels operations that exceed timeout
- Releases resources and updates operation status

#### Examples

```typescript
const result = await checker.checkMonitor(
    site,
    "monitor-123",
    false
);
if (result) {
    console.log(
        `Monitor ${result.monitorId} status: ${result.status}`
    );
}
```

```typescript
const result = await checker.checkMonitor(site, "monitor-123", true);
// Manual checks bypass operation correlation for immediate execution
```

#### Throws

Throws detailed errors for configuration issues, operation
  failures, or system-level problems that prevent check execution

#### See

 - MonitorOperationRegistry.registerOperation for operation registration
 - OperationTimeoutManager.createTimeout for timeout management
 - MonitorStatusUpdateService.updateStatus for status update safety

***

### startMonitoring()

> **startMonitoring**(`siteIdentifier`, `monitorId`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`boolean`\>

Defined in: [electron/services/monitoring/EnhancedMonitorChecker.ts:381](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/EnhancedMonitorChecker.ts#L381)

Start monitoring for a specific monitor.

#### Parameters

##### siteIdentifier

`string`

Site identifier

##### monitorId

`string`

Monitor ID

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`boolean`\>

Promise resolving to true if started successfully

***

### stopMonitoring()

> **stopMonitoring**(`siteIdentifier`, `monitorId`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`boolean`\>

Defined in: [electron/services/monitoring/EnhancedMonitorChecker.ts:431](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/EnhancedMonitorChecker.ts#L431)

Stop monitoring for a specific monitor.

#### Parameters

##### siteIdentifier

`string`

Site identifier

##### monitorId

`string`

Monitor ID

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`boolean`\>

Promise resolving to true if stopped successfully
