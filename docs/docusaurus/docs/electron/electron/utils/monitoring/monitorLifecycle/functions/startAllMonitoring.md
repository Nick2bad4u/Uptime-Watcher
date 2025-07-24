# Function: startAllMonitoring()

> **startAllMonitoring**(`config`, `isMonitoring`): `Promise`\<`boolean`\>

Defined in: [electron/utils/monitoring/monitorLifecycle.ts:41](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/utils/monitoring/monitorLifecycle.ts#L41)

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
