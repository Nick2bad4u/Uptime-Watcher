# Function: historyEntryToRow()

> **historyEntryToRow**(`monitorId`, `entry`, `details?`): `Record`\<`string`, `unknown`\>

Defined in: [electron/services/database/utils/historyMapper.ts:40](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/services/database/utils/historyMapper.ts#L40)

Convert StatusHistory to database row format.

## Parameters

### monitorId

`string`

Monitor ID

### entry

[`StatusHistory`](../../../../../../shared/types/interfaces/StatusHistory.md)

StatusHistory object

### details?

`string`

Optional details string

## Returns

`Record`\<`string`, `unknown`\>

Database row format
