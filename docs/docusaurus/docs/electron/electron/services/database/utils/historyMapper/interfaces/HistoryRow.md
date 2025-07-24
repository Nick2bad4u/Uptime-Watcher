# Interface: HistoryRow

Defined in: [electron/services/database/utils/historyMapper.ts:21](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/services/database/utils/historyMapper.ts#L21)

History row interface for database operations.

## Remarks

Represents a database row containing history data with the following fields:
- details: Optional additional information about the history entry
- id: Unique identifier for the history record
- monitorId: Identifier of the monitor this history belongs to
- responseTime: Response time in milliseconds
- status: Monitor status ("up" or "down")
- timestamp: Unix timestamp of when the check occurred

## Properties

### details?

> `optional` **details**: `string`

Defined in: [electron/services/database/utils/historyMapper.ts:22](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/services/database/utils/historyMapper.ts#L22)

***

### id

> **id**: `string`

Defined in: [electron/services/database/utils/historyMapper.ts:23](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/services/database/utils/historyMapper.ts#L23)

***

### monitorId

> **monitorId**: `string`

Defined in: [electron/services/database/utils/historyMapper.ts:24](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/services/database/utils/historyMapper.ts#L24)

***

### responseTime

> **responseTime**: `number`

Defined in: [electron/services/database/utils/historyMapper.ts:25](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/services/database/utils/historyMapper.ts#L25)

***

### status

> **status**: `"down"` \| `"up"`

Defined in: [electron/services/database/utils/historyMapper.ts:26](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/services/database/utils/historyMapper.ts#L26)

***

### timestamp

> **timestamp**: `number`

Defined in: [electron/services/database/utils/historyMapper.ts:27](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/services/database/utils/historyMapper.ts#L27)
