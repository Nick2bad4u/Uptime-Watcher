# Type Alias: HttpMonitor

> **HttpMonitor** = `object`

Defined in: [shared/validation/schemas.ts:302](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/validation/schemas.ts#L302)

Type representing a validated HTTP monitor.

## Type declaration

### checkInterval

> **checkInterval**: `number`

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

> **type**: `"http"`

### url

> **url**: `string`

## See

[httpMonitorSchema](../variables/httpMonitorSchema.md)
