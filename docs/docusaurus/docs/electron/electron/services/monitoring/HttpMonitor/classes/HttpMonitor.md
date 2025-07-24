# Class: HttpMonitor

Defined in: [electron/services/monitoring/HttpMonitor.ts:84](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/services/monitoring/HttpMonitor.ts#L84)

Service for performing HTTP/HTTPS monitoring checks.

## Remarks

Implements the IMonitorService interface to provide HTTP endpoint monitoring
with advanced features for reliability and performance. Uses Axios with custom
interceptors for precise timing and comprehensive error handling.

The service is designed for monitoring use cases where response time accuracy
and failure detection are critical. It includes intelligent status code
interpretation suitable for uptime monitoring scenarios.

## Implements

- [`IMonitorService`](../../types/interfaces/IMonitorService.md)

## Constructors

### Constructor

> **new HttpMonitor**(`config`): `HttpMonitor`

Defined in: [electron/services/monitoring/HttpMonitor.ts:99](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/services/monitoring/HttpMonitor.ts#L99)

Initialize the HTTP monitor with optional configuration.

#### Parameters

##### config

[`MonitorConfig`](../../types/interfaces/MonitorConfig.md) = `{}`

Optional configuration overrides for HTTP monitoring

#### Returns

`HttpMonitor`

#### Remarks

Creates an Axios instance with optimized settings for monitoring,
including timing interceptors, appropriate timeouts, and security limits.

## Methods

### check()

> **check**(`monitor`): `Promise`\<[`MonitorCheckResult`](../../types/interfaces/MonitorCheckResult.md)\>

Defined in: [electron/services/monitoring/HttpMonitor.ts:128](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/services/monitoring/HttpMonitor.ts#L128)

Perform an HTTP health check on the given monitor.

#### Parameters

##### monitor

[`Monitor`](../../../../../shared/types/interfaces/Monitor.md)

Monitor configuration of type [Site](../../../../../shared/types/interfaces/Site.md)["monitors"][0] containing URL and settings

#### Returns

`Promise`\<[`MonitorCheckResult`](../../types/interfaces/MonitorCheckResult.md)\>

Promise resolving to check result with status and timing data

#### Throws

Error when monitor type is not "http"

#### Remarks

Uses per-monitor retry attempts and timeout configuration for robust
connectivity checking. Falls back to service defaults when monitor-specific
values are not provided. Utilizes operational hooks for retry logic and
comprehensive error handling.

#### Implementation of

[`IMonitorService`](../../types/interfaces/IMonitorService.md).[`check`](../../types/interfaces/IMonitorService.md#check)

***

### getConfig()

> **getConfig**(): [`MonitorConfig`](../../types/interfaces/MonitorConfig.md)

Defined in: [electron/services/monitoring/HttpMonitor.ts:147](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/services/monitoring/HttpMonitor.ts#L147)

Get the current configuration.

#### Returns

[`MonitorConfig`](../../types/interfaces/MonitorConfig.md)

***

### getType()

> **getType**(): `"http"` \| `"port"`

Defined in: [electron/services/monitoring/HttpMonitor.ts:154](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/services/monitoring/HttpMonitor.ts#L154)

Get the monitor type this service handles.

#### Returns

`"http"` \| `"port"`

#### Implementation of

[`IMonitorService`](../../types/interfaces/IMonitorService.md).[`getType`](../../types/interfaces/IMonitorService.md#gettype)

***

### updateConfig()

> **updateConfig**(`config`): `void`

Defined in: [electron/services/monitoring/HttpMonitor.ts:174](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/services/monitoring/HttpMonitor.ts#L174)

Update the configuration for this monitor.

#### Parameters

##### config

`Partial`\<[`MonitorConfig`](../../types/interfaces/MonitorConfig.md)\>

Partial configuration to merge with existing settings

#### Returns

`void`

#### Remarks

Updates the monitor's configuration by performing a shallow merge of the provided
partial configuration with existing settings. This recreates the underlying Axios
instance with the updated configuration to ensure all changes take effect.

The merge is shallow - nested objects are not deeply merged. Only validates
that provided values are of correct types but does not validate ranges or
other business logic constraints.

#### Throws

Error if config contains invalid property types

#### Implementation of

[`IMonitorService`](../../types/interfaces/IMonitorService.md).[`updateConfig`](../../types/interfaces/IMonitorService.md#updateconfig)
