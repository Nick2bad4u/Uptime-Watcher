# Interface: PortCheckErrorResult

Defined in: [electron/services/monitoring/utils/portErrorHandling.ts:25](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/services/monitoring/utils/portErrorHandling.ts#L25)

Result structure for failed port check operations.

## Properties

### details

> **details**: `string`

Defined in: [electron/services/monitoring/utils/portErrorHandling.ts:27](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/services/monitoring/utils/portErrorHandling.ts#L27)

Port number that was being checked

***

### error

> **error**: `string`

Defined in: [electron/services/monitoring/utils/portErrorHandling.ts:29](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/services/monitoring/utils/portErrorHandling.ts#L29)

Standardized error message for frontend consumption

***

### responseTime

> **responseTime**: `number`

Defined in: [electron/services/monitoring/utils/portErrorHandling.ts:31](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/services/monitoring/utils/portErrorHandling.ts#L31)

Response time in milliseconds, -1 if measurement failed

***

### status

> **status**: `"down"`

Defined in: [electron/services/monitoring/utils/portErrorHandling.ts:33](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/services/monitoring/utils/portErrorHandling.ts#L33)

Always "down" for error results
