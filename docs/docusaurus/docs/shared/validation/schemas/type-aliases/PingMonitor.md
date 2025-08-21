# Type Alias: PingMonitor

> **PingMonitor** = `object`

Defined in: [shared/validation/schemas.ts:323](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/validation/schemas.ts#L323)

Type representing a validated ping monitor.

## Type declaration

### checkInterval

> **checkInterval**: `number`

### host

> **host**: `string`

### id

> **id**: `string`

### lastChecked?

> `optional` **lastChecked**: [`Date`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Date)

### monitoring

> **monitoring**: `boolean`

### responseTime

> **responseTime**: `number`

### retryAttempts

> **retryAttempts**: `number`

### status

> **status**: `"down"` \| `"paused"` \| `"pending"` \| `"up"`

### timeout

> **timeout**: `number`

### type

> **type**: `"ping"`

## See

[pingMonitorSchema](../variables/pingMonitorSchema.md)
