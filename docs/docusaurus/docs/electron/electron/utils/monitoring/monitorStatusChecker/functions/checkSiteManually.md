# Function: checkSiteManually()

> **checkSiteManually**(`config`, `identifier`, `monitorId?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`undefined` \| [`StatusUpdate`](../../../../../shared/types/interfaces/StatusUpdate.md)\>

Defined in: [electron/utils/monitoring/monitorStatusChecker.ts:233](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/utils/monitoring/monitorStatusChecker.ts#L233)

**`Alpha`**

Check a site's monitor manually.

## Parameters

### config

[`MonitorCheckConfig`](../interfaces/MonitorCheckConfig.md)

Configuration object with required dependencies

### identifier

`string`

Site identifier

### monitorId?

`string`

Optional monitor ID, uses first monitor if not provided

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`undefined` \| [`StatusUpdate`](../../../../../shared/types/interfaces/StatusUpdate.md)\>

Promise resolving to StatusUpdate or undefined if error occurs

## Remarks

Performs a manual health check on the specified monitor or the first monitor
if no specific monitor ID is provided. Manual checks preserve the "paused" status
for monitors that are intentionally stopped, while still recording the actual
check result in history for diagnostic purposes.

This function follows the same error handling pattern as checkMonitor,
returning undefined for errors rather than throwing, to provide consistent
error handling behavior across the module.

## Example

```typescript
// Check specific monitor manually
const result = await checkSiteManually(config, "site-1", "monitor-123");
if (result) {
  console.log(`Manual check result: ${result.status}`);
}

// Check first monitor if no ID specified
const result = await checkSiteManually(config, "site-1");
```
