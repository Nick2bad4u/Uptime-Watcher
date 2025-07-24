# Function: startMonitoringForSite()

> **startMonitoringForSite**(`config`, `identifier`, `monitorId?`, `callback?`): `Promise`\<`boolean`\>

Defined in: [electron/utils/monitoring/monitorLifecycle.ts:91](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/utils/monitoring/monitorLifecycle.ts#L91)

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

Optional monitor ID (if not provided, starts all monitors for the site)

### callback?

[`MonitoringCallback`](../type-aliases/MonitoringCallback.md)

Callback function for recursive calls

## Returns

`Promise`\<`boolean`\>

Promise`boolean` - True if monitoring was started successfully
