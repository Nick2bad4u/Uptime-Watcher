# Function: startAllMonitoring()

> **startAllMonitoring**(`config`, `isMonitoring`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`boolean`\>

Defined in: [electron/utils/monitoring/monitorLifecycle.ts:68](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/utils/monitoring/monitorLifecycle.ts#L68)

Start monitoring for all sites.

## Parameters

### config

[`MonitoringLifecycleConfig`](../interfaces/MonitoringLifecycleConfig.md)

Configuration object with required dependencies

### isMonitoring

`boolean`

Current monitoring state

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`boolean`\>

Promise`boolean` - New monitoring state

## Remarks

**Side Effects:**
- Sets all monitors to "pending" status regardless of previous state
- Enables monitoring flag for all monitors
- Starts monitor scheduling for all sites

This intentionally sets all monitors to "pending" to indicate they are being
initialized for monitoring startup, providing a clear signal that the system
is transitioning to an active monitoring state.
