# Interface: MonitorRow

Defined in: [shared/types/database.ts:61](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/database.ts#L61)

Represents a row in the `monitor` table.

## Remarks

Stores configuration and runtime state for each monitor.

## Extends

- [`BaseRow`](BaseRow.md)

## Properties

### active\_operations?

> `optional` **active\_operations**: `string`

Defined in: [shared/types/database.ts:65](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/database.ts#L65)

JSON string containing an array of active operation identifiers.

***

### check\_interval?

> `optional` **check\_interval**: `number`

Defined in: [shared/types/database.ts:69](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/database.ts#L69)

Interval between checks, in seconds.

***

### created\_at?

> `optional` **created\_at**: `number`

Defined in: [shared/types/database.ts:73](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/database.ts#L73)

Timestamp (epoch ms) when the monitor was created.

***

### enabled?

> `optional` **enabled**: `number`

Defined in: [shared/types/database.ts:77](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/database.ts#L77)

Whether the monitor is enabled (1) or disabled (0).

***

### host?

> `optional` **host**: `string`

Defined in: [shared/types/database.ts:81](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/database.ts#L81)

Hostname or IP address being monitored.

***

### id?

> `optional` **id**: `number`

Defined in: [shared/types/database.ts:85](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/database.ts#L85)

Unique monitor ID (autoincrement).

#### Overrides

[`BaseRow`](BaseRow.md).[`id`](BaseRow.md#id)

***

### last\_checked?

> `optional` **last\_checked**: `number`

Defined in: [shared/types/database.ts:89](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/database.ts#L89)

Timestamp (epoch ms) of the last check.

***

### last\_error?

> `optional` **last\_error**: `string`

Defined in: [shared/types/database.ts:93](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/database.ts#L93)

Last error message encountered by the monitor.

***

### monitoring?

> `optional` **monitoring**: `number`

Defined in: [shared/types/database.ts:97](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/database.ts#L97)

Whether monitoring is active (1) or inactive (0).

***

### next\_check?

> `optional` **next\_check**: `number`

Defined in: [shared/types/database.ts:101](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/database.ts#L101)

Timestamp (epoch ms) for the next scheduled check.

***

### port?

> `optional` **port**: `number`

Defined in: [shared/types/database.ts:105](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/database.ts#L105)

Port number being monitored (if applicable).

***

### response\_time?

> `optional` **response\_time**: `number`

Defined in: [shared/types/database.ts:109](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/database.ts#L109)

Last recorded response time, in milliseconds.

***

### retry\_attempts?

> `optional` **retry\_attempts**: `number`

Defined in: [shared/types/database.ts:113](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/database.ts#L113)

Number of retry attempts for failed checks.

***

### site\_identifier?

> `optional` **site\_identifier**: `string`

Defined in: [shared/types/database.ts:117](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/database.ts#L117)

Identifier of the site this monitor belongs to.

***

### status?

> `optional` **status**: `string`

Defined in: [shared/types/database.ts:121](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/database.ts#L121)

Current status of the monitor ("up", "down", etc.).

***

### timeout?

> `optional` **timeout**: `number`

Defined in: [shared/types/database.ts:125](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/database.ts#L125)

Timeout for checks, in milliseconds.

***

### type?

> `optional` **type**: `string`

Defined in: [shared/types/database.ts:129](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/database.ts#L129)

Monitor type (e.g., "http", "tcp").

***

### updated\_at?

> `optional` **updated\_at**: `number`

Defined in: [shared/types/database.ts:133](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/database.ts#L133)

Timestamp (epoch ms) when the monitor was last updated.

***

### url?

> `optional` **url**: `string`

Defined in: [shared/types/database.ts:137](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/database.ts#L137)

URL being monitored (for HTTP/HTTPS monitors).
