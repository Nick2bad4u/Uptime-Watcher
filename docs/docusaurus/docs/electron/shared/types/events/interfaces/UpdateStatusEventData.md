# Interface: UpdateStatusEventData

Defined in: [shared/types/events.ts:77](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/shared/types/events.ts#L77)

Event data for update status changes

## Properties

### error?

> `optional` **error**: `string`

Defined in: [shared/types/events.ts:79](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/shared/types/events.ts#L79)

Error message if status is error

***

### status

> **status**: `"error"` \| `"available"` \| `"checking"` \| `"downloaded"` \| `"downloading"` \| `"idle"`

Defined in: [shared/types/events.ts:81](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/shared/types/events.ts#L81)

Current update status
