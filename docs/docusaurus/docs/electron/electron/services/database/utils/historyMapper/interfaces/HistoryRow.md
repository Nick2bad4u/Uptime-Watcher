# Interface: HistoryRow

Defined in: [electron/services/database/utils/historyMapper.ts:30](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/utils/historyMapper.ts#L30)

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

Defined in: [electron/services/database/utils/historyMapper.ts:31](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/utils/historyMapper.ts#L31)

***

### id

> **id**: `string`

Defined in: [electron/services/database/utils/historyMapper.ts:32](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/utils/historyMapper.ts#L32)

***

### monitorId

> **monitorId**: `string`

Defined in: [electron/services/database/utils/historyMapper.ts:33](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/utils/historyMapper.ts#L33)

***

### responseTime

> **responseTime**: `number`

Defined in: [electron/services/database/utils/historyMapper.ts:34](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/utils/historyMapper.ts#L34)

***

### status

> **status**: `"down"` \| `"up"`

Defined in: [electron/services/database/utils/historyMapper.ts:35](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/utils/historyMapper.ts#L35)

***

### timestamp

> **timestamp**: `number`

Defined in: [electron/services/database/utils/historyMapper.ts:36](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/utils/historyMapper.ts#L36)
