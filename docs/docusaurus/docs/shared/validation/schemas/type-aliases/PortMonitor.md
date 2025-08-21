# Type Alias: PortMonitor

> **PortMonitor** = `object`

Defined in: [shared/validation/schemas.ts:330](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/validation/schemas.ts#L330)

Type representing a validated port monitor.

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

### port

> **port**: `number`

### responseTime

> **responseTime**: `number`

### retryAttempts

> **retryAttempts**: `number`

### status

> **status**: `"down"` \| `"paused"` \| `"pending"` \| `"up"`

### timeout

> **timeout**: `number`

### type

> **type**: `"port"`

## See

[portMonitorSchema](../variables/portMonitorSchema.md)
