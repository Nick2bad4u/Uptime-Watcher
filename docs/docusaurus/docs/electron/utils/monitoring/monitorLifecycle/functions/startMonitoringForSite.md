# Function: startMonitoringForSite()

> **startMonitoringForSite**(`config`, `identifier`, `monitorId?`, `callback?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`boolean`\>

Defined in: [electron/utils/monitoring/monitorLifecycle.ts:522](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/monitoring/monitorLifecycle.ts#L522)

Start monitoring for a specific site or monitor.

## Parameters

### config

[`MonitoringLifecycleConfig`](../interfaces/MonitoringLifecycleConfig.md)

Configuration object with required dependencies

### identifier

`string`

Site identifier

### monitorId?

`string`

Optional monitor ID (if not provided, starts all monitors
  for the site)

### callback?

[`MonitoringCallback`](../type-aliases/MonitoringCallback.md)

Callback function for recursive calls

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`boolean`\>

Promise`boolean` - True if monitoring was started successfully
