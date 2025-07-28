# Interface: MonitorRow

Defined in: [electron/services/database/utils/monitorMapper.ts:24](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/utils/monitorMapper.ts#L24)

Represents a monitor row as stored in the database.

## Remarks

Used for low-level database operations and mapping.
Field names use camelCase for consistency with TypeScript conventions.

## Properties

### checkInterval

> **checkInterval**: `number`

Defined in: [electron/services/database/utils/monitorMapper.ts:26](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/utils/monitorMapper.ts#L26)

The interval (in ms) between checks.

***

### createdAt

> **createdAt**: `number`

Defined in: [electron/services/database/utils/monitorMapper.ts:28](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/utils/monitorMapper.ts#L28)

The creation timestamp (ms since epoch).

***

### enabled

> **enabled**: `boolean`

Defined in: [electron/services/database/utils/monitorMapper.ts:30](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/utils/monitorMapper.ts#L30)

Whether the monitor is enabled for checking.

***

### id

> **id**: `string`

Defined in: [electron/services/database/utils/monitorMapper.ts:32](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/utils/monitorMapper.ts#L32)

Unique identifier for the monitor.

***

### lastChecked?

> `optional` **lastChecked**: [`Date`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Date)

Defined in: [electron/services/database/utils/monitorMapper.ts:34](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/utils/monitorMapper.ts#L34)

The last time this monitor was checked, if available.

***

### lastError?

> `optional` **lastError**: `string`

Defined in: [electron/services/database/utils/monitorMapper.ts:36](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/utils/monitorMapper.ts#L36)

The last error message, if any.

***

### responseTime?

> `optional` **responseTime**: `number`

Defined in: [electron/services/database/utils/monitorMapper.ts:38](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/utils/monitorMapper.ts#L38)

The last recorded response time in ms, if available.

***

### retryAttempts

> **retryAttempts**: `number`

Defined in: [electron/services/database/utils/monitorMapper.ts:40](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/utils/monitorMapper.ts#L40)

Number of retry attempts for failed checks.

***

### siteIdentifier

> **siteIdentifier**: `string`

Defined in: [electron/services/database/utils/monitorMapper.ts:42](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/utils/monitorMapper.ts#L42)

The identifier of the site this monitor belongs to.

***

### status

> **status**: [`MonitorStatus`](../../../../../../shared/types/type-aliases/MonitorStatus.md)

Defined in: [electron/services/database/utils/monitorMapper.ts:44](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/utils/monitorMapper.ts#L44)

The current status of the monitor ("up" or "down").

***

### timeout

> **timeout**: `number`

Defined in: [electron/services/database/utils/monitorMapper.ts:46](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/utils/monitorMapper.ts#L46)

The timeout (in ms) for checks.

***

### type

> **type**: `"http"` \| `"port"`

Defined in: [electron/services/database/utils/monitorMapper.ts:48](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/utils/monitorMapper.ts#L48)

The monitor type (e.g., "http").

***

### updatedAt

> **updatedAt**: `number`

Defined in: [electron/services/database/utils/monitorMapper.ts:50](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/utils/monitorMapper.ts#L50)

The last updated timestamp (ms since epoch).
