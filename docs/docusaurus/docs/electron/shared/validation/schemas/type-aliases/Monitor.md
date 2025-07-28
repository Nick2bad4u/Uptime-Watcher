# Type Alias: Monitor

> **Monitor** = \` `checkInterval`: `number`; `id`: `string`; `lastChecked?`: [`Date`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Date); `monitoring`: `boolean`; `responseTime`: `number`; `retryAttempts`: `number`; `status`: `"down"` \| `"paused"` \| `"pending"` \| `"up"`; `timeout`: `number`; `type`: `"http"`; `url`: `string`; \` \| \` `checkInterval`: `number`; `host`: `string`; `id`: `string`; `lastChecked?`: [`Date`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Date); `monitoring`: `boolean`; `port`: `number`; `responseTime`: `number`; `retryAttempts`: `number`; `status`: `"down"` \| `"paused"` \| `"pending"` \| `"up"`; `timeout`: `number`; `type`: `"port"`; \`

Defined in: [shared/validation/schemas.ts:167](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/validation/schemas.ts#L167)

Type representing a validated monitor (HTTP or port).

## Type declaration

\` `checkInterval`: `number`; `id`: `string`; `lastChecked?`: [`Date`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Date); `monitoring`: `boolean`; `responseTime`: `number`; `retryAttempts`: `number`; `status`: `"down"` \| `"paused"` \| `"pending"` \| `"up"`; `timeout`: `number`; `type`: `"http"`; `url`: `string`; \`

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

\` `checkInterval`: `number`; `host`: `string`; `id`: `string`; `lastChecked?`: [`Date`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Date); `monitoring`: `boolean`; `port`: `number`; `responseTime`: `number`; `retryAttempts`: `number`; `status`: `"down"` \| `"paused"` \| `"pending"` \| `"up"`; `timeout`: `number`; `type`: `"port"`; \`

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

[monitorSchema](../variables/monitorSchema.md)
