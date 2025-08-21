# Interface: DnsMonitorFields

Defined in: [src/types/monitor-forms.ts:102](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/types/monitor-forms.ts#L102)

DNS monitor specific fields

## Extends

- [`BaseMonitorFields`](BaseMonitorFields.md)

## Properties

### checkInterval?

> `optional` **checkInterval**: `number`

Defined in: [src/types/monitor-forms.ts:13](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/types/monitor-forms.ts#L13)

Check interval in milliseconds

#### Inherited from

[`BaseMonitorFields`](BaseMonitorFields.md).[`checkInterval`](BaseMonitorFields.md#checkinterval)

***

### name?

> `optional` **name**: `string`

Defined in: [src/types/monitor-forms.ts:15](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/types/monitor-forms.ts#L15)

Monitor name

#### Inherited from

[`BaseMonitorFields`](BaseMonitorFields.md).[`name`](BaseMonitorFields.md#name)

***

### retryAttempts?

> `optional` **retryAttempts**: `number`

Defined in: [src/types/monitor-forms.ts:17](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/types/monitor-forms.ts#L17)

Number of retry attempts

#### Inherited from

[`BaseMonitorFields`](BaseMonitorFields.md).[`retryAttempts`](BaseMonitorFields.md#retryattempts)

***

### timeout?

> `optional` **timeout**: `number`

Defined in: [src/types/monitor-forms.ts:19](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/types/monitor-forms.ts#L19)

Timeout in milliseconds

#### Inherited from

[`BaseMonitorFields`](BaseMonitorFields.md).[`timeout`](BaseMonitorFields.md#timeout)

***

### expectedValue?

> `optional` **expectedValue**: `string`

Defined in: [src/types/monitor-forms.ts:104](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/types/monitor-forms.ts#L104)

Expected value for the DNS response (optional)

***

### host

> **host**: `string`

Defined in: [src/types/monitor-forms.ts:106](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/types/monitor-forms.ts#L106)

Host to query

***

### recordType

> **recordType**: `"A"` \| `"AAAA"` \| `"ANY"` \| `"CAA"` \| `"CNAME"` \| `"MX"` \| `"NAPTR"` \| `"NS"` \| `"PTR"` \| `"SOA"` \| `"SRV"` \| `"TLSA"` \| `"TXT"`

Defined in: [src/types/monitor-forms.ts:108](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/types/monitor-forms.ts#L108)

DNS record type to query
