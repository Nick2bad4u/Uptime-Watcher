# Type Alias: HttpMonitor

> **HttpMonitor** = `object`

Defined in: [shared/validation/schemas.ts:160](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/validation/schemas.ts#L160)

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

> **type**: `"http"`

### url

> **url**: `string`

## See

[httpMonitorSchema](../variables/httpMonitorSchema.md)
