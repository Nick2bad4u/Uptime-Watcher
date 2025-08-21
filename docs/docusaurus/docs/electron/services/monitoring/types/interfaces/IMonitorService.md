# Interface: IMonitorService

Defined in: [electron/services/monitoring/types.ts:55](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/types.ts#L55)

Interface for monitor services that perform health checks.

## Remarks

All monitor implementations must implement this interface to provide
consistent behavior across different monitoring types (HTTP, port, etc.).

## Properties

### check()

> **check**: (`monitor`) => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`MonitorCheckResult`](MonitorCheckResult.md)\>

Defined in: [electron/services/monitoring/types.ts:72](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/types.ts#L72)

Perform a health check on a monitor.

#### Parameters

##### monitor

[`Monitor`](../../../../../shared/types/interfaces/Monitor.md)

The monitor configuration to check

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`MonitorCheckResult`](MonitorCheckResult.md)\>

Promise resolving to the check result

#### Remarks

Implementations should handle timeouts, retries, and error conditions
gracefully. Failed checks should return a result with `status: "down"`
rather than throwing, unless the monitor configuration itself is
invalid.

#### Throws

Error When monitor configuration is invalid or check
  fails catastrophically

***

### getType()

> **getType**: () => `"http"` \| `"port"` \| `"ping"` \| `"dns"`

Defined in: [electron/services/monitoring/types.ts:83](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/types.ts#L83)

Get the type of monitor this service handles.

#### Returns

`"http"` \| `"port"` \| `"ping"` \| `"dns"`

The monitor type this service is responsible for

#### Remarks

Used by the monitor factory to route checks to the appropriate service.
Must match one of the values in the monitor's `type` field.

***

### updateConfig()

> **updateConfig**: (`config`) => `void`

Defined in: [electron/services/monitoring/types.ts:94](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/types.ts#L94)

Update the configuration for this monitor service.

#### Parameters

##### config

[`Partial`](https://www.typescriptlang.org/docs/handbook/utility-types.html#partialtype)\<[`MonitorConfig`](MonitorConfig.md)\>

Partial configuration to update

#### Returns

`void`

#### Remarks

Allows runtime configuration updates without recreating the service
instance. Only the provided configuration properties will be updated.
