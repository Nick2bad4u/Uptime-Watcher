# Function: stopAllMonitoring()

> **stopAllMonitoring**(`config`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`boolean`\>

Defined in: [electron/utils/monitoring/monitorLifecycle.ts:156](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/utils/monitoring/monitorLifecycle.ts#L156)

Stop all monitoring and return updated monitoring state.

## Parameters

### config

[`MonitoringLifecycleConfig`](../interfaces/MonitoringLifecycleConfig.md)

Configuration object with required dependencies

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`boolean`\>

boolean - New monitoring state (always false)

## Remarks

**Side Effects:**
- Sets all monitors to "paused" status regardless of previous state
- Disables monitoring flag for all actively monitoring monitors
- Stops all monitor scheduling system-wide

This intentionally sets all monitors to "paused" to indicate that monitoring
has been stopped system-wide, providing a clear signal that the system is
transitioning to an inactive monitoring state.
