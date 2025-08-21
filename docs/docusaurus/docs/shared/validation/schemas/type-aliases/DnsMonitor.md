# Type Alias: DnsMonitor

> **DnsMonitor** = `object`

Defined in: [shared/validation/schemas.ts:309](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/validation/schemas.ts#L309)

Type representing a validated DNS monitor.

## Type declaration

### checkInterval

> **checkInterval**: `number`

### expectedValue?

> `optional` **expectedValue**: `string`

### host

> **host**: `string`

### id

> **id**: `string`

### lastChecked?

> `optional` **lastChecked**: [`Date`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Date)

### monitoring

> **monitoring**: `boolean`

### recordType

> **recordType**: `"A"` \| `"AAAA"` \| `"ANY"` \| `"CAA"` \| `"CNAME"` \| `"MX"` \| `"NAPTR"` \| `"NS"` \| `"PTR"` \| `"SOA"` \| `"SRV"` \| `"TLSA"` \| `"TXT"`

### responseTime

> **responseTime**: `number`

### retryAttempts

> **retryAttempts**: `number`

### status

> **status**: `"down"` \| `"paused"` \| `"pending"` \| `"up"`

### timeout

> **timeout**: `number`

### type

> **type**: `"dns"`

## See

[dnsMonitorSchema](../variables/dnsMonitorSchema.md)
