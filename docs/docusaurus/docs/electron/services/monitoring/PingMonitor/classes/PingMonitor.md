# Class: PingMonitor

Defined in: [electron/services/monitoring/PingMonitor.ts:98](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/PingMonitor.ts#L98)

Service for performing ping monitoring checks.

## Remarks

Implements the [IMonitorService](../../types/interfaces/IMonitorService.md) interface to provide ICMP ping
connectivity monitoring with advanced features for reliability and
performance. Uses the node-ping wrapper around system ping utilities for
cross-platform compatibility.

The service automatically handles different types of network failures and
provides detailed error reporting for troubleshooting connectivity issues.
All ping operations use only cross-platform options for maximum
compatibility.

Key features:

- Cross-platform ping execution using only compatible options
- Configurable timeout and retry behavior
- Detailed response time measurement
- Comprehensive error handling with meaningful messages
- Integration with operational hooks for monitoring and debugging

## Example

```typescript
const monitor = new PingMonitor({
    timeout: 10000,
    retryAttempts: 3,
});

const result = await monitor.check(pingMonitorData);
if (result.status === "up") {
    console.log(`Ping successful: ${result.responseTime}ms`);
}
```

## Implements

- [`IMonitorService`](../../types/interfaces/IMonitorService.md)

## Constructors

### Constructor

> **new PingMonitor**(`config`): `PingMonitor`

Defined in: [electron/services/monitoring/PingMonitor.ts:208](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/PingMonitor.ts#L208)

Creates a new PingMonitor instance with the specified configuration.

#### Parameters

##### config

[`MonitorConfig`](../../types/interfaces/MonitorConfig.md) = `{}`

Configuration options for the monitor service

#### Returns

`PingMonitor`

#### Remarks

Initializes the monitor with default timeout and retry values, merging
any provided configuration options. The monitor uses sensible defaults if
no configuration is provided, making it safe to instantiate without
parameters.

Default configuration:

- Timeout: 30000ms (30 seconds)
- RetryAttempts: 3

#### Example

```typescript
// Use default configuration
const monitor = new PingMonitor();

// Custom configuration
const monitor = new PingMonitor({
    timeout: 5000,
    retryAttempts: 5,
});
```

## Methods

### check()

> **check**(`monitor`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`MonitorCheckResult`](../../types/interfaces/MonitorCheckResult.md)\>

Defined in: [electron/services/monitoring/PingMonitor.ts:151](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/PingMonitor.ts#L151)

Performs a ping connectivity check on the specified monitor.

#### Parameters

##### monitor

[`Monitor`](../../../../../shared/types/interfaces/Monitor.md)

Monitor configuration containing host and ping settings

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`MonitorCheckResult`](../../types/interfaces/MonitorCheckResult.md)\>

Promise resolving to [MonitorCheckResult](../../types/interfaces/MonitorCheckResult.md) with status,
  timing, and error data

#### Remarks

Validates the monitor configuration before performing the ping check,
ensuring the monitor type is "ping" and a valid host is provided. Uses
monitor-specific timeout and retry settings when available, falling back
to service defaults.

The check process:

1. Validates monitor type and required fields
2. Extracts timeout and retry configuration
3. Performs ping with retry logic using [performPingCheckWithRetry](../../utils/pingRetry/functions/performPingCheckWithRetry.md) 4.
   Returns standardized result with status, response time, and details

Response time measurement includes the complete ping operation duration,
from initiation to completion or failure.

#### Example

```typescript
const monitor = {
    id: "ping_001",
    type: "ping" as const,
    host: "google.com",
    timeout: 5000,
    retryAttempts: 3,
    // ... other required monitor properties
};

const result = await pingMonitor.check(monitor);
console.log(
    `Ping ${monitor.host}: ${result.status} (${result.responseTime}ms)`
);
```

#### Throws

Error When monitor validation fails (wrong type or
  missing host)

#### See

 - hasValidHost - Host validation utility
 - getMonitorTimeout - Timeout extraction utility
 - getMonitorRetryAttempts - Retry attempts extraction utility
 - [performPingCheckWithRetry](../../utils/pingRetry/functions/performPingCheckWithRetry.md) - Core ping functionality

#### Implementation of

[`IMonitorService`](../../types/interfaces/IMonitorService.md).[`check`](../../types/interfaces/IMonitorService.md#check)

***

### getConfig()

> **getConfig**(): [`MonitorConfig`](../../types/interfaces/MonitorConfig.md)

Defined in: [electron/services/monitoring/PingMonitor.ts:227](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/PingMonitor.ts#L227)

Get the current configuration.

#### Returns

[`MonitorConfig`](../../types/interfaces/MonitorConfig.md)

A shallow copy of the current monitor configuration

#### Remarks

Returns a defensive shallow copy of the current configuration to prevent
external modification. This ensures configuration immutability and
prevents accidental state corruption. Note that this is a shallow copy -
only the top-level properties are copied. If nested objects are added to
MonitorConfig in the future, they would be referenced, not cloned.

***

### getType()

> **getType**(): `"http"` \| `"port"` \| `"ping"` \| `"dns"`

Defined in: [electron/services/monitoring/PingMonitor.ts:241](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/PingMonitor.ts#L241)

Get the monitor type this service handles.

#### Returns

`"http"` \| `"port"` \| `"ping"` \| `"dns"`

The monitor type identifier

#### Remarks

Returns the string identifier used to route monitoring requests to this
service implementation. Uses the [MonitorType](../../../../../shared/types/type-aliases/MonitorType.md) union type for type
safety and consistency across the application.

#### Implementation of

[`IMonitorService`](../../types/interfaces/IMonitorService.md).[`getType`](../../types/interfaces/IMonitorService.md#gettype)

***

### updateConfig()

> **updateConfig**(`config`): `void`

Defined in: [electron/services/monitoring/PingMonitor.ts:255](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/PingMonitor.ts#L255)

Update the configuration for this monitor service.

#### Parameters

##### config

[`Partial`](https://www.typescriptlang.org/docs/handbook/utility-types.html#partialtype)\<[`MonitorConfig`](../../types/interfaces/MonitorConfig.md)\>

Partial configuration to update

#### Returns

`void`

#### Remarks

Merges the provided configuration with the existing configuration. Only
specified properties are updated; undefined properties are ignored. Used
for runtime configuration updates without service recreation.

#### Implementation of

[`IMonitorService`](../../types/interfaces/IMonitorService.md).[`updateConfig`](../../types/interfaces/IMonitorService.md#updateconfig)
