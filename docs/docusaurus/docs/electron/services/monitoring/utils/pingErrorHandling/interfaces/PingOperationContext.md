# Interface: PingOperationContext

Defined in: [electron/services/monitoring/utils/pingErrorHandling.ts:25](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/utils/pingErrorHandling.ts#L25)

Context information for ping operations.

## Remarks

Used to provide additional context when handling ping errors.

## Properties

### host

> **host**: `string`

Defined in: [electron/services/monitoring/utils/pingErrorHandling.ts:27](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/utils/pingErrorHandling.ts#L27)

Target host being pinged

***

### maxRetries

> **maxRetries**: `number`

Defined in: [electron/services/monitoring/utils/pingErrorHandling.ts:29](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/utils/pingErrorHandling.ts#L29)

Maximum number of retry attempts

***

### timeout

> **timeout**: `number`

Defined in: [electron/services/monitoring/utils/pingErrorHandling.ts:31](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/utils/pingErrorHandling.ts#L31)

Timeout in milliseconds
