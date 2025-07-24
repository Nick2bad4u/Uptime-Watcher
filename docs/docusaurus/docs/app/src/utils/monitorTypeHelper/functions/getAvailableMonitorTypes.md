# Function: getAvailableMonitorTypes()

> **getAvailableMonitorTypes**(): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`MonitorTypeConfig`](../interfaces/MonitorTypeConfig.md)[]\>

Defined in: [src/utils/monitorTypeHelper.ts:62](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/utils/monitorTypeHelper.ts#L62)

Get all available monitor types from backend via IPC.
Results are cached for performance.

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`MonitorTypeConfig`](../interfaces/MonitorTypeConfig.md)[]\>
