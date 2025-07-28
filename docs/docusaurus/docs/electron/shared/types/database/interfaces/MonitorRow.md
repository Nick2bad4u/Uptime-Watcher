# Interface: MonitorRow

Defined in: [shared/types/database.ts:59](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/types/database.ts#L59)

Represents a row in the `monitor` table.

## Remarks

Stores configuration and runtime state for each monitor.

## Extends

- [`BaseRow`](BaseRow.md)

## Properties

### check\_interval?

> `optional` **check\_interval**: `number`

Defined in: [shared/types/database.ts:63](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/types/database.ts#L63)

Interval between checks, in seconds.

***

### created\_at?

> `optional` **created\_at**: `number`

Defined in: [shared/types/database.ts:67](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/types/database.ts#L67)

Timestamp (epoch ms) when the monitor was created.

***

### enabled?

> `optional` **enabled**: `number`

Defined in: [shared/types/database.ts:71](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/types/database.ts#L71)

Whether the monitor is enabled (1) or disabled (0).

***

### host?

> `optional` **host**: `string`

Defined in: [shared/types/database.ts:75](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/types/database.ts#L75)

Hostname or IP address being monitored.

***

### id?

> `optional` **id**: `number`

Defined in: [shared/types/database.ts:79](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/types/database.ts#L79)

Unique monitor ID (autoincrement).

#### Overrides

[`BaseRow`](BaseRow.md).[`id`](BaseRow.md#id)

***

### last\_checked?

> `optional` **last\_checked**: `number`

Defined in: [shared/types/database.ts:83](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/types/database.ts#L83)

Timestamp (epoch ms) of the last check.

***

### last\_error?

> `optional` **last\_error**: `string`

Defined in: [shared/types/database.ts:87](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/types/database.ts#L87)

Last error message encountered by the monitor.

***

### monitoring?

> `optional` **monitoring**: `number`

Defined in: [shared/types/database.ts:91](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/types/database.ts#L91)

Whether monitoring is active (1) or inactive (0).

***

### next\_check?

> `optional` **next\_check**: `number`

Defined in: [shared/types/database.ts:95](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/types/database.ts#L95)

Timestamp (epoch ms) for the next scheduled check.

***

### port?

> `optional` **port**: `number`

Defined in: [shared/types/database.ts:99](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/types/database.ts#L99)

Port number being monitored (if applicable).

***

### response\_time?

> `optional` **response\_time**: `number`

Defined in: [shared/types/database.ts:103](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/types/database.ts#L103)

Last recorded response time, in milliseconds.

***

### retry\_attempts?

> `optional` **retry\_attempts**: `number`

Defined in: [shared/types/database.ts:107](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/types/database.ts#L107)

Number of retry attempts for failed checks.

***

### site\_identifier?

> `optional` **site\_identifier**: `string`

Defined in: [shared/types/database.ts:111](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/types/database.ts#L111)

Identifier of the site this monitor belongs to.

***

### status?

> `optional` **status**: `string`

Defined in: [shared/types/database.ts:115](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/types/database.ts#L115)

Current status of the monitor ("up", "down", etc.).

***

### timeout?

> `optional` **timeout**: `number`

Defined in: [shared/types/database.ts:119](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/types/database.ts#L119)

Timeout for checks, in milliseconds.

***

### type?

> `optional` **type**: `string`

Defined in: [shared/types/database.ts:123](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/types/database.ts#L123)

Monitor type (e.g., "http", "tcp").

***

### updated\_at?

> `optional` **updated\_at**: `number`

Defined in: [shared/types/database.ts:127](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/types/database.ts#L127)

Timestamp (epoch ms) when the monitor was last updated.

***

### url?

> `optional` **url**: `string`

Defined in: [shared/types/database.ts:131](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/types/database.ts#L131)

URL being monitored (for HTTP/HTTPS monitors).
