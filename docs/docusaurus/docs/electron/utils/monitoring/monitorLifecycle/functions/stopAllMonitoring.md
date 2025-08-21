# Function: stopAllMonitoring()

> **stopAllMonitoring**(`config`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`boolean`\>

Defined in: [electron/utils/monitoring/monitorLifecycle.ts:557](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/monitoring/monitorLifecycle.ts#L557)

Stop all monitoring and return updated monitoring state.

## Parameters

### config

[`MonitoringLifecycleConfig`](../interfaces/MonitoringLifecycleConfig.md)

Configuration object with required dependencies

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`boolean`\>

Boolean - New monitoring state (always false)

## Remarks

**Side Effects:**

- Sets all monitors to "paused" status regardless of previous state
- Disables monitoring flag for all actively monitoring monitors
- Stops all monitor scheduling system-wide

This intentionally sets all monitors to "paused" to indicate that monitoring
has been stopped system-wide, providing a clear signal that the system is
transitioning to an inactive monitoring state.
