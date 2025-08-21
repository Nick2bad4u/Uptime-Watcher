# Type Alias: Monitor

> **Monitor** = \` `checkInterval`: `number`; `id`: `string`; `lastChecked?`: [`Date`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Date); `monitoring`: `boolean`; `responseTime`: `number`; `retryAttempts`: `number`; `status`: `"down"` \| `"paused"` \| `"pending"` \| `"up"`; `timeout`: `number`; `type`: `"http"`; `url`: `string`; \` \| \` `checkInterval`: `number`; `host`: `string`; `id`: `string`; `lastChecked?`: [`Date`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Date); `monitoring`: `boolean`; `port`: `number`; `responseTime`: `number`; `retryAttempts`: `number`; `status`: `"down"` \| `"paused"` \| `"pending"` \| `"up"`; `timeout`: `number`; `type`: `"port"`; \` \| \` `checkInterval`: `number`; `host`: `string`; `id`: `string`; `lastChecked?`: [`Date`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Date); `monitoring`: `boolean`; `responseTime`: `number`; `retryAttempts`: `number`; `status`: `"down"` \| `"paused"` \| `"pending"` \| `"up"`; `timeout`: `number`; `type`: `"ping"`; \` \| \` `checkInterval`: `number`; `expectedValue?`: `string`; `host`: `string`; `id`: `string`; `lastChecked?`: [`Date`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Date); `monitoring`: `boolean`; `recordType`: `"A"` \| `"AAAA"` \| `"ANY"` \| `"CAA"` \| `"CNAME"` \| `"MX"` \| `"NAPTR"` \| `"NS"` \| `"PTR"` \| `"SOA"` \| `"SRV"` \| `"TLSA"` \| `"TXT"`; `responseTime`: `number`; `retryAttempts`: `number`; `status`: `"down"` \| `"paused"` \| `"pending"` \| `"up"`; `timeout`: `number`; `type`: `"dns"`; \`

Defined in: [shared/validation/schemas.ts:316](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/validation/schemas.ts#L316)

Type representing a validated monitor (HTTP, port, ping, or DNS).

## See

[monitorSchema](../variables/monitorSchema.md)
