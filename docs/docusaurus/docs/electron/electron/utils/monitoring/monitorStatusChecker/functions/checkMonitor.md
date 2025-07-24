# Function: checkMonitor()

> **checkMonitor**(`config`, `site`, `monitorId`, `isManualCheck`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`undefined` \| [`StatusUpdate`](../../../../../shared/types/interfaces/StatusUpdate.md)\>

Defined in: [electron/utils/monitoring/monitorStatusChecker.ts:115](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/utils/monitoring/monitorStatusChecker.ts#L115)

**`Alpha`**

Check a specific monitor and update its status.

## Parameters

### config

[`MonitorCheckConfig`](../interfaces/MonitorCheckConfig.md)

Configuration object with required dependencies

### site

[`Site`](../../../../../shared/types/interfaces/Site.md)

Site containing the monitor to check

### monitorId

`string`

ID of the monitor to check

### isManualCheck

`boolean` = `false`

Whether this is a manual check (preserves paused state)

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`undefined` \| [`StatusUpdate`](../../../../../shared/types/interfaces/StatusUpdate.md)\>

Promise resolving to status update result or undefined if error occurs

## Remarks

Performs a comprehensive health check on the specified monitor, including:
- Monitor validation and existence verification
- Health check execution using appropriate monitor service
- Status comparison and change detection
- Database updates with transaction safety
- History tracking with automatic pruning
- Event emission for status changes and notifications
- Cache synchronization for performance

For manual checks on paused monitors, the monitor status remains "paused"
but the actual check result is recorded in history for diagnostic purposes.

The function is designed to be resilient to errors and will return undefined
if critical failures occur, while logging appropriate error messages for debugging.

## Example

```typescript
const result = await checkMonitor(config, site, "monitor_123");
if (result) {
  logger.info(`Monitor status: ${result.status}`);
  logger.info(`Response time: ${result.responseTime}ms`);
}
```
