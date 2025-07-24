# Function: checkSiteManually()

> **checkSiteManually**(`config`, `identifier`, `monitorId?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`undefined` \| [`StatusUpdate`](../../../../../shared/types/interfaces/StatusUpdate.md)\>

Defined in: [electron/utils/monitoring/monitorStatusChecker.ts:294](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/utils/monitoring/monitorStatusChecker.ts#L294)

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

Promise\<StatusUpdate | undefined\> - Status update result or undefined if error
