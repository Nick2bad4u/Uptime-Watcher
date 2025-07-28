# Type Alias: Site

> **Site** = `object`

Defined in: [shared/validation/schemas.ts:181](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/validation/schemas.ts#L181)

Type representing a validated site.

## Type declaration

### identifier

> **identifier**: `string`

### monitoring

> **monitoring**: `boolean`

### monitors

> **monitors**: (\` `checkInterval`: `number`; `id`: `string`; `lastChecked?`: [`Date`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Date); `monitoring`: `boolean`; `responseTime`: `number`; `retryAttempts`: `number`; `status`: `"down"` \| `"paused"` \| `"pending"` \| `"up"`; `timeout`: `number`; `type`: `"http"`; `url`: `string`; \` \| \` `checkInterval`: `number`; `host`: `string`; `id`: `string`; `lastChecked?`: [`Date`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Date); `monitoring`: `boolean`; `port`: `number`; `responseTime`: `number`; `retryAttempts`: `number`; `status`: `"down"` \| `"paused"` \| `"pending"` \| `"up"`; `timeout`: `number`; `type`: `"port"`; \`)[]

### name

> **name**: `string`

## See

[siteSchema](../variables/siteSchema.md)
