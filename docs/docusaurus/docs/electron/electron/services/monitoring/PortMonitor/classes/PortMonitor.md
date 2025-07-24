# Class: PortMonitor

Defined in: [electron/services/monitoring/PortMonitor.ts:47](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/monitoring/PortMonitor.ts#L47)

Service for performing port monitoring checks.

## Remarks

Implements the IMonitorService interface to provide TCP/UDP port connectivity
monitoring with advanced features for reliability and performance. Uses native
Node.js networking APIs with custom timeout and retry logic.

The service automatically handles different types of network failures and
provides detailed error reporting for troubleshooting connectivity issues.

## Implements

- [`IMonitorService`](../../types/interfaces/IMonitorService.md)

## Constructors

### Constructor

> **new PortMonitor**(`config`): `PortMonitor`

Defined in: [electron/services/monitoring/PortMonitor.ts:60](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/monitoring/PortMonitor.ts#L60)

Create a new PortMonitor instance.

#### Parameters

##### config

[`MonitorConfig`](../../types/interfaces/MonitorConfig.md) = `{}`

Configuration options for the monitor

#### Returns

`PortMonitor`

#### Remarks

Initializes the monitor with default timeout values and merges any
provided configuration options. Safe to instantiate multiple times
with different configurations for various monitoring needs.

## Methods

### check()

> **check**(`monitor`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`MonitorCheckResult`](../../types/interfaces/MonitorCheckResult.md)\>

Defined in: [electron/services/monitoring/PortMonitor.ts:85](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/monitoring/PortMonitor.ts#L85)

Perform a port connectivity check on the given monitor.

#### Parameters

##### monitor

[`Monitor`](../../../../../shared/types/interfaces/Monitor.md)

Monitor configuration of type [Site](../../../../../shared/types/interfaces/Site.md)["monitors"][0] containing host, port, and connection settings

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`MonitorCheckResult`](../../types/interfaces/MonitorCheckResult.md)\>

Promise resolving to check result with status and timing data

#### Throws

Error when monitor type is not "port"

#### Remarks

Uses per-monitor retry attempts and timeout configuration for robust
connectivity checking. Falls back to service defaults when monitor-specific
values are not provided. Validates monitor configuration before attempting
connection and provides detailed error information for failures.

The check will use the monitor's configured timeout if available,
falling back to the service default. Response time includes the full
connection establishment time for accurate performance metrics.

#### Implementation of

[`IMonitorService`](../../types/interfaces/IMonitorService.md).[`check`](../../types/interfaces/IMonitorService.md#check)

***

### getConfig()

> **getConfig**(): [`MonitorConfig`](../../types/interfaces/MonitorConfig.md)

Defined in: [electron/services/monitoring/PortMonitor.ts:118](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/monitoring/PortMonitor.ts#L118)

Get the current configuration.

#### Returns

[`MonitorConfig`](../../types/interfaces/MonitorConfig.md)

A shallow copy of the current monitor configuration

#### Remarks

Returns a defensive shallow copy of the current configuration to prevent
external modification. This ensures configuration immutability and prevents
accidental state corruption. Note that this is a shallow copy - only the
top-level properties are copied. If nested objects are added to MonitorConfig
in the future, they would be referenced, not cloned.

***

### getType()

> **getType**(): `"http"` \| `"port"`

Defined in: [electron/services/monitoring/PortMonitor.ts:132](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/monitoring/PortMonitor.ts#L132)

Get the monitor type this service handles.

#### Returns

`"http"` \| `"port"`

The monitor type identifier

#### Remarks

Returns the string identifier used to route monitoring requests
to this service implementation. Uses the [MonitorType](../../../../../shared/types/type-aliases/MonitorType.md) union type
for type safety and consistency across the application.

#### Implementation of

[`IMonitorService`](../../types/interfaces/IMonitorService.md).[`getType`](../../types/interfaces/IMonitorService.md#gettype)

***

### updateConfig()

> **updateConfig**(`config`): `void`

Defined in: [electron/services/monitoring/PortMonitor.ts:152](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/monitoring/PortMonitor.ts#L152)

Update the configuration for this monitor.

#### Parameters

##### config

[`Partial`](https://www.typescriptlang.org/docs/handbook/utility-types.html#partialtype)\<[`MonitorConfig`](../../types/interfaces/MonitorConfig.md)\>

Partial configuration to merge with existing settings

#### Returns

`void`

#### Remarks

Updates the monitor's configuration by performing a shallow merge of the provided
partial configuration with existing settings. This allows dynamic reconfiguration
of timeout values and other parameters without recreating the monitor instance.

The merge is shallow - nested objects are not deeply merged. Only validates
that provided values are of correct types but does not validate ranges or
other business logic constraints.

#### Throws

Error if config contains invalid property types

#### Implementation of

[`IMonitorService`](../../types/interfaces/IMonitorService.md).[`updateConfig`](../../types/interfaces/IMonitorService.md#updateconfig)
