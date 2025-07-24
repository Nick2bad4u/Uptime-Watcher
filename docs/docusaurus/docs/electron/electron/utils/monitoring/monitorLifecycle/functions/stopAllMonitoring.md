# Function: stopAllMonitoring()

> **stopAllMonitoring**(`config`): `Promise`\<`boolean`\>

Defined in: [electron/utils/monitoring/monitorLifecycle.ts:114](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/utils/monitoring/monitorLifecycle.ts#L114)

Stop all monitoring and return updated monitoring state.

## Parameters

### config

[`MonitoringLifecycleConfig`](../interfaces/MonitoringLifecycleConfig.md)

Configuration object with required dependencies

## Returns

`Promise`\<`boolean`\>

boolean - New monitoring state (always false)
