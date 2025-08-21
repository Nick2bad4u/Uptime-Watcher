# Class: DnsMonitor

Defined in: [electron/services/monitoring/DnsMonitor.ts:112](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/DnsMonitor.ts#L112)

Service for performing DNS monitoring checks.

## Remarks

Implements the [IMonitorService](../../types/interfaces/IMonitorService.md) interface to provide DNS resolution
monitoring with advanced features for reliability and performance. Uses the
native Node.js dns module for cross-platform DNS resolution.

The service automatically handles different types of DNS failures and
provides detailed error reporting for troubleshooting resolution issues. All
DNS operations support various record types and optional value matching.

Key features:

- Cross-platform DNS resolution using Node.js dns module
- Support for A, AAAA, CNAME, MX, TXT, NS, and SRV record types
- Configurable timeout and retry behavior
- Detailed response time measurement
- Optional expected value matching for verification
- Comprehensive error handling with meaningful messages

## Example

```typescript
const monitor = new DnsMonitor({
    timeout: 10000,
    retryAttempts: 3,
});

const result = await monitor.check(dnsMonitorData);
if (result.status === "up") {
    console.log(`DNS resolution successful: ${result.responseTime}ms`);
}
```

## Implements

- [`IMonitorService`](../../types/interfaces/IMonitorService.md)

## Constructors

### Constructor

> **new DnsMonitor**(`config`): `DnsMonitor`

Defined in: [electron/services/monitoring/DnsMonitor.ts:362](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/DnsMonitor.ts#L362)

Creates a new DnsMonitor instance with the specified configuration.

#### Parameters

##### config

[`MonitorConfig`](../../types/interfaces/MonitorConfig.md) = `{}`

Configuration options for the monitor service

#### Returns

`DnsMonitor`

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
const monitor = new DnsMonitor();

// Custom configuration
const monitor = new DnsMonitor({
    timeout: 5000,
    retryAttempts: 5,
});
```

## Methods

### check()

> **check**(`monitor`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`MonitorCheckResult`](../../types/interfaces/MonitorCheckResult.md)\>

Defined in: [electron/services/monitoring/DnsMonitor.ts:166](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/DnsMonitor.ts#L166)

Performs a DNS resolution check on the specified monitor.

#### Parameters

##### monitor

[`Monitor`](../../../../../shared/types/interfaces/Monitor.md)

Monitor configuration containing hostname and DNS
  settings

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`MonitorCheckResult`](../../types/interfaces/MonitorCheckResult.md)\>

Promise resolving to [MonitorCheckResult](../../types/interfaces/MonitorCheckResult.md) with status,
  timing, and error data

#### Remarks

Validates the monitor configuration before performing the DNS check,
ensuring the monitor type is "dns" and a valid hostname is provided. Uses
monitor-specific timeout and retry settings when available, falling back
to service defaults.

The check process:

1. Validates monitor type and required fields
2. Extracts timeout and retry configuration
3. Performs DNS resolution with retry logic
4. Returns standardized result with status, response time, and details

Response time measurement includes the complete DNS resolution duration,
from query initiation to completion or failure.

#### Example

```typescript
const monitor = {
    id: "dns_001",
    type: "dns" as const,
    hostname: "example.com",
    recordType: "A",
    timeout: 5000,
    retryAttempts: 3,
    // ... other required monitor properties
};

const result = await dnsMonitor.check(monitor);
console.log(
    `DNS ${monitor.hostname}: ${result.status} (${result.responseTime}ms)`
);
```

#### Throws

Error When monitor validation fails (wrong type or
  missing hostname)

#### See

 - validateMonitorHost - Host validation utility
 - [extractMonitorConfig](../../shared/monitorServiceHelpers/functions/extractMonitorConfig.md) - Config extraction utility
 - performDnsCheckWithRetry - Core DNS functionality

#### Implementation of

[`IMonitorService`](../../types/interfaces/IMonitorService.md).[`check`](../../types/interfaces/IMonitorService.md#check)

***

### getConfig()

> **getConfig**(): [`MonitorConfig`](../../types/interfaces/MonitorConfig.md)

Defined in: [electron/services/monitoring/DnsMonitor.ts:379](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/DnsMonitor.ts#L379)

Get the current configuration.

#### Returns

[`MonitorConfig`](../../types/interfaces/MonitorConfig.md)

A shallow copy of the current monitor configuration

#### Remarks

Returns a defensive shallow copy of the current configuration to prevent
external modification. This ensures configuration immutability and
prevents accidental state corruption.

***

### getType()

> **getType**(): `"http"` \| `"port"` \| `"ping"` \| `"dns"`

Defined in: [electron/services/monitoring/DnsMonitor.ts:393](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/DnsMonitor.ts#L393)

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

Defined in: [electron/services/monitoring/DnsMonitor.ts:407](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/DnsMonitor.ts#L407)

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
