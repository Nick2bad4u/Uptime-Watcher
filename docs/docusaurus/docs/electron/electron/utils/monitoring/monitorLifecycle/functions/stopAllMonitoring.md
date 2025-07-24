# Function: stopAllMonitoring()

> **stopAllMonitoring**(`config`): `Promise`\<`boolean`\>

Defined in: [electron/utils/monitoring/monitorLifecycle.ts:114](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/utils/monitoring/monitorLifecycle.ts#L114)

Stop all monitoring and return updated monitoring state.

## Parameters

### config

[`MonitoringLifecycleConfig`](../interfaces/MonitoringLifecycleConfig.md)

Configuration object with required dependencies

## Returns

`Promise`\<`boolean`\>

boolean - New monitoring state (always false)
