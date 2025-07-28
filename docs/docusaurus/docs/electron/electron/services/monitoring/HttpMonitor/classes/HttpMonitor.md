# Class: HttpMonitor

Defined in: [electron/services/monitoring/HttpMonitor.ts:94](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/monitoring/HttpMonitor.ts#L94)

HTTP/HTTPS monitoring service implementing [IMonitorService](../../types/interfaces/IMonitorService.md) for endpoint health checks.

## Remarks

Provides endpoint health checks with retry logic, timing, and error handling. Uses Axios for requests, with custom interceptors for timing. All configuration is managed via shallow merging and validated on update. All errors are standardized for frontend consumption.

## Implements

- [`IMonitorService`](../../types/interfaces/IMonitorService.md)

## Constructors

### Constructor

> **new HttpMonitor**(`config`): `HttpMonitor`

Defined in: [electron/services/monitoring/HttpMonitor.ts:124](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/monitoring/HttpMonitor.ts#L124)

Constructs a new HttpMonitor instance.

#### Parameters

##### config

[`MonitorConfig`](../../types/interfaces/MonitorConfig.md) = `{}`

Optional configuration overrides for HTTP monitoring. See [MonitorConfig](../../types/interfaces/MonitorConfig.md).

#### Returns

`HttpMonitor`

#### Remarks

Initializes Axios instance with timing interceptors and merged configuration. All configuration values are shallow-merged with defaults.

#### Default Value

```ts
timeout: DEFAULT_REQUEST_TIMEOUT, userAgent: USER_AGENT
@public
```

## Methods

### check()

> **check**(`monitor`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`MonitorCheckResult`](../../types/interfaces/MonitorCheckResult.md)\>

Defined in: [electron/services/monitoring/HttpMonitor.ts:159](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/monitoring/HttpMonitor.ts#L159)

Performs an HTTP health check for the given monitor configuration.

#### Parameters

##### monitor

[`Monitor`](../../../../../shared/types/interfaces/Monitor.md)

Monitor configuration object (must be type "http").

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`MonitorCheckResult`](../../types/interfaces/MonitorCheckResult.md)\>

Promise resolving to [MonitorCheckResult](../../types/interfaces/MonitorCheckResult.md) with status and timing.

#### Remarks

Uses per-monitor timeout and retryAttempts if provided, otherwise falls back to defaults.
All requests use retry logic and exponential backoff via [withOperationalHooks](../../../../utils/operationalHooks/functions/withOperationalHooks.md).
Returns a standardized result for all error cases.

Now uses type guards to safely handle potentially undefined configuration values.

#### Example

```typescript
const result = await httpMonitor.check({ type: "http", url: "https://example.com" });
```

#### Throws

Error if monitor type is not "http".

#### Implementation of

[`IMonitorService`](../../types/interfaces/IMonitorService.md).[`check`](../../types/interfaces/IMonitorService.md#check)

***

### getConfig()

> **getConfig**(): [`MonitorConfig`](../../types/interfaces/MonitorConfig.md)

Defined in: [electron/services/monitoring/HttpMonitor.ts:181](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/monitoring/HttpMonitor.ts#L181)

Returns the current configuration for this monitor service.

#### Returns

[`MonitorConfig`](../../types/interfaces/MonitorConfig.md)

A shallow copy of the current [MonitorConfig](../../types/interfaces/MonitorConfig.md).

***

### getType()

> **getType**(): `"http"` \| `"port"`

Defined in: [electron/services/monitoring/HttpMonitor.ts:193](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/monitoring/HttpMonitor.ts#L193)

Returns the monitor type handled by this service.

#### Returns

`"http"` \| `"port"`

The string "http".

#### Remarks

Used by the monitor factory to route checks to the appropriate service.

#### Implementation of

[`IMonitorService`](../../types/interfaces/IMonitorService.md).[`getType`](../../types/interfaces/IMonitorService.md#gettype)

***

### updateConfig()

> **updateConfig**(`config`): `void`

Defined in: [electron/services/monitoring/HttpMonitor.ts:207](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/monitoring/HttpMonitor.ts#L207)

Updates the configuration for this monitor service.

#### Parameters

##### config

[`Partial`](https://www.typescriptlang.org/docs/handbook/utility-types.html#partialtype)\<[`MonitorConfig`](../../types/interfaces/MonitorConfig.md)\>

Partial configuration to merge with existing settings.

#### Returns

`void`

#### Remarks

Performs a shallow merge and recreates the Axios instance. Only validates types, not value ranges. Throws if invalid types are provided.

#### Throws

Error if config contains invalid property types.

#### Implementation of

[`IMonitorService`](../../types/interfaces/IMonitorService.md).[`updateConfig`](../../types/interfaces/IMonitorService.md#updateconfig)
