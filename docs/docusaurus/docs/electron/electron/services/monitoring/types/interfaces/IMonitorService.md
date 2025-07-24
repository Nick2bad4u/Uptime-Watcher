# Interface: IMonitorService

Defined in: [electron/services/monitoring/types.ts:53](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/services/monitoring/types.ts#L53)

Interface for monitor services that perform health checks.

## Remarks

All monitor implementations must implement this interface to provide
consistent behavior across different monitoring types (HTTP, port, etc.).

## Methods

### check()

> **check**(`monitor`): `Promise`\<[`MonitorCheckResult`](MonitorCheckResult.md)\>

Defined in: [electron/services/monitoring/types.ts:67](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/services/monitoring/types.ts#L67)

Perform a health check on a monitor.

#### Parameters

##### monitor

[`Monitor`](../../../../../shared/types/interfaces/Monitor.md)

The monitor configuration to check

#### Returns

`Promise`\<[`MonitorCheckResult`](MonitorCheckResult.md)\>

Promise resolving to the check result

#### Throws

Error When monitor configuration is invalid or check fails catastrophically

#### Remarks

Implementations should handle timeouts, retries, and error conditions gracefully.
Failed checks should return a result with `status: "down"` rather than throwing,
unless the monitor configuration itself is invalid.

***

### getType()

> **getType**(): `"http"` \| `"port"`

Defined in: [electron/services/monitoring/types.ts:78](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/services/monitoring/types.ts#L78)

Get the type of monitor this service handles.

#### Returns

`"http"` \| `"port"`

The monitor type this service is responsible for

#### Remarks

Used by the monitor factory to route checks to the appropriate service.
Must match one of the values in the monitor's `type` field.

***

### updateConfig()

> **updateConfig**(`config`): `void`

Defined in: [electron/services/monitoring/types.ts:89](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/services/monitoring/types.ts#L89)

Update the configuration for this monitor service.

#### Parameters

##### config

`Partial`\<[`MonitorConfig`](MonitorConfig.md)\>

Partial configuration to update

#### Returns

`void`

#### Remarks

Allows runtime configuration updates without recreating the service instance.
Only the provided configuration properties will be updated.
