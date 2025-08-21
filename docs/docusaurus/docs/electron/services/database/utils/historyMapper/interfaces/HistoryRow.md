# Interface: HistoryRow

Defined in: [electron/services/database/utils/historyMapper.ts:36](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/utils/historyMapper.ts#L36)

Represents a single row in the monitor history database table.

## Remarks

Used for low-level database operations and data mapping.

## Param

Optional additional information about the history entry.

## Param

Unique identifier for the history record.

## Param

Identifier of the monitor this history belongs to.

## Param

Response time in milliseconds.

## Param

Monitor status ("up" or "down").

## Param

Unix timestamp of when the check occurred.

## Properties

### details?

> `optional` **details**: `string`

Defined in: [electron/services/database/utils/historyMapper.ts:37](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/utils/historyMapper.ts#L37)

***

### id

> **id**: `string`

Defined in: [electron/services/database/utils/historyMapper.ts:38](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/utils/historyMapper.ts#L38)

***

### monitorId

> **monitorId**: `string`

Defined in: [electron/services/database/utils/historyMapper.ts:39](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/utils/historyMapper.ts#L39)

***

### responseTime

> **responseTime**: `number`

Defined in: [electron/services/database/utils/historyMapper.ts:40](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/utils/historyMapper.ts#L40)

***

### status

> **status**: `"down"` \| `"up"`

Defined in: [electron/services/database/utils/historyMapper.ts:41](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/utils/historyMapper.ts#L41)

***

### timestamp

> **timestamp**: `number`

Defined in: [electron/services/database/utils/historyMapper.ts:42](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/utils/historyMapper.ts#L42)
