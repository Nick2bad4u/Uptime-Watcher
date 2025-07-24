# Interface: UpdateStatusEventData

Defined in: [src/types/events.ts:77](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/src/types/events.ts#L77)

Event data for update status changes

## Properties

### error?

> `optional` **error**: `string`

Defined in: [src/types/events.ts:79](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/src/types/events.ts#L79)

Error message if status is error

***

### info?

> `optional` **info**: `object`

Defined in: [src/types/events.ts:81](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/src/types/events.ts#L81)

Update information if available

#### releaseDate

> **releaseDate**: `string`

#### releaseName

> **releaseName**: `string`

#### releaseNotes

> **releaseNotes**: `string`

#### version

> **version**: `string`

***

### progress?

> `optional` **progress**: `number`

Defined in: [src/types/events.ts:88](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/src/types/events.ts#L88)

Progress percentage (0-100)

***

### status

> **status**: `"error"` \| `"available"` \| `"checking"` \| `"downloaded"` \| `"downloading"` \| `"idle"`

Defined in: [src/types/events.ts:90](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/src/types/events.ts#L90)

Current update status
