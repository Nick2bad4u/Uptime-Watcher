# Function: startAllMonitoring()

> **startAllMonitoring**(`config`, `isMonitoring`): `Promise`\<`boolean`\>

Defined in: [electron/utils/monitoring/monitorLifecycle.ts:41](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/utils/monitoring/monitorLifecycle.ts#L41)

Start monitoring for all sites.

## Parameters

### config

[`MonitoringLifecycleConfig`](../interfaces/MonitoringLifecycleConfig.md)

Configuration object with required dependencies

### isMonitoring

`boolean`

Current monitoring state

## Returns

`Promise`\<`boolean`\>

Promise`boolean` - New monitoring state
