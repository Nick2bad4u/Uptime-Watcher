# Type Alias: PortMonitor

> **PortMonitor** = `object`

Defined in: [shared/validation/schemas.ts:174](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/validation/schemas.ts#L174)

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

Response time in milliseconds.

#### Remarks

Uses -1 as a sentinel value to indicate "never checked" state.
Positive values represent actual response times in milliseconds.

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
