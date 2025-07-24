# Function: rowToHistoryEntry()

> **rowToHistoryEntry**(`row`): [`StatusHistory`](../../../../../../shared/types/interfaces/StatusHistory.md)

Defined in: [electron/services/database/utils/historyMapper.ts:95](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/services/database/utils/historyMapper.ts#L95)

Convert database row to history entry.

## Parameters

### row

`Record`\<`string`, `unknown`\>

Raw database row

## Returns

[`StatusHistory`](../../../../../../shared/types/interfaces/StatusHistory.md)

Mapped StatusHistory object

## Throws

Error When row mapping fails

## Remarks

Uses safe number conversion and status validation to ensure data integrity.
Invalid numbers default to 0, invalid status values default to "down" with logging.
