# Type Alias: Site

> **Site** = `object`

Defined in: [shared/validation/schemas.ts:337](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/validation/schemas.ts#L337)

Type representing a validated site.

## Type declaration

### identifier

> **identifier**: `string`

### monitoring

> **monitoring**: `boolean`

### monitors

> **monitors**: (\` `checkInterval`: `number`; `id`: `string`; `lastChecked?`: [`Date`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Date); `monitoring`: `boolean`; `responseTime`: `number`; `retryAttempts`: `number`; `status`: `"down"` \| `"paused"` \| `"pending"` \| `"up"`; `timeout`: `number`; `type`: `"http"`; `url`: `string`; \` \| \` `checkInterval`: `number`; `host`: `string`; `id`: `string`; `lastChecked?`: [`Date`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Date); `monitoring`: `boolean`; `port`: `number`; `responseTime`: `number`; `retryAttempts`: `number`; `status`: `"down"` \| `"paused"` \| `"pending"` \| `"up"`; `timeout`: `number`; `type`: `"port"`; \` \| \` `checkInterval`: `number`; `host`: `string`; `id`: `string`; `lastChecked?`: [`Date`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Date); `monitoring`: `boolean`; `responseTime`: `number`; `retryAttempts`: `number`; `status`: `"down"` \| `"paused"` \| `"pending"` \| `"up"`; `timeout`: `number`; `type`: `"ping"`; \` \| \` `checkInterval`: `number`; `expectedValue?`: `string`; `host`: `string`; `id`: `string`; `lastChecked?`: [`Date`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Date); `monitoring`: `boolean`; `recordType`: `"A"` \| `"AAAA"` \| `"ANY"` \| `"CAA"` \| `"CNAME"` \| `"MX"` \| `"NAPTR"` \| `"NS"` \| `"PTR"` \| `"SOA"` \| `"SRV"` \| `"TLSA"` \| `"TXT"`; `responseTime`: `number`; `retryAttempts`: `number`; `status`: `"down"` \| `"paused"` \| `"pending"` \| `"up"`; `timeout`: `number`; `type`: `"dns"`; \`)[]

### name

> **name**: `string`

## See

[siteSchema](../variables/siteSchema.md)
