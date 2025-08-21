# Interface: UpdateStatusEventData

Defined in: [src/types/events.ts:92](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/types/events.ts#L92)

Event data for update status changes

## Properties

### error?

> `optional` **error**: `string`

Defined in: [src/types/events.ts:94](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/types/events.ts#L94)

Error message if status is error

***

### info?

> `optional` **info**: [`UpdateReleaseInfo`](UpdateReleaseInfo.md)

Defined in: [src/types/events.ts:96](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/types/events.ts#L96)

Update information if available

***

### progress?

> `optional` **progress**: `number`

Defined in: [src/types/events.ts:98](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/types/events.ts#L98)

Progress percentage (0-100)

***

### status

> **status**: `"error"` \| `"available"` \| `"checking"` \| `"downloaded"` \| `"downloading"` \| `"idle"`

Defined in: [src/types/events.ts:100](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/types/events.ts#L100)

Current update status
