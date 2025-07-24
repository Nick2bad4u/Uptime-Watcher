# Function: checkSiteManually()

> **checkSiteManually**(`config`, `identifier`, `monitorId?`): `Promise`\<`undefined` \| [`StatusUpdate`](../../../../../shared/types/interfaces/StatusUpdate.md)\>

Defined in: [electron/utils/monitoring/monitorStatusChecker.ts:294](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/utils/monitoring/monitorStatusChecker.ts#L294)

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
