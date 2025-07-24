# Function: stopMonitoringForSite()

> **stopMonitoringForSite**(`config`, `identifier`, `monitorId?`, `callback?`): `Promise`\<`boolean`\>

Defined in: [electron/utils/monitoring/monitorLifecycle.ts:158](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/utils/monitoring/monitorLifecycle.ts#L158)

Stop monitoring for a specific site or monitor.

## Parameters

### config

[`MonitoringLifecycleConfig`](../interfaces/MonitoringLifecycleConfig.md)

Configuration object with required dependencies

### identifier

`string`

Site identifier

### monitorId?

`string`

Optional monitor ID (if not provided, stops all monitors for the site)

### callback?

[`MonitoringCallback`](../type-aliases/MonitoringCallback.md)

Callback function for recursive calls

## Returns

`Promise`\<`boolean`\>

Promise`boolean` - True if monitoring was stopped successfully
