# Type Alias: MonitoringCallback()

> **MonitoringCallback** = (`identifier`, `monitorId?`) => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`boolean`\>

Defined in: [electron/utils/monitoring/monitorLifecycle.ts:31](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/utils/monitoring/monitorLifecycle.ts#L31)

Type for the monitoring lifecycle callback functions.

## Parameters

### identifier

`string`

Site identifier for the monitoring operation

### monitorId?

`string`

Optional specific monitor ID, if not provided operates on all site monitors

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`boolean`\>

Promise resolving to true if operation succeeded, false otherwise

## Remarks

Used for recursive calls in monitoring operations. The callback should handle
both individual monitor operations (when monitorId is provided) and bulk
operations (when monitorId is undefined). Error handling should be managed
within the callback implementation.
