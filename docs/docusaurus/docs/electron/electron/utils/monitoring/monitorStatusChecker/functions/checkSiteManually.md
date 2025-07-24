# Function: checkSiteManually()

> **checkSiteManually**(`config`, `identifier`, `monitorId?`): `Promise`\<`undefined` \| [`StatusUpdate`](../../../../../shared/types/interfaces/StatusUpdate.md)\>

Defined in: [electron/utils/monitoring/monitorStatusChecker.ts:294](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/utils/monitoring/monitorStatusChecker.ts#L294)

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

`Promise`\<`undefined` \| [`StatusUpdate`](../../../../../shared/types/interfaces/StatusUpdate.md)\>

Promise\<StatusUpdate | undefined\> - Status update result or undefined if error
