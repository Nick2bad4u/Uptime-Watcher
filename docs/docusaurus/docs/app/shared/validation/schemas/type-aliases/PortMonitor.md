# Type Alias: PortMonitor

> **PortMonitor** = `object`

Defined in: [shared/validation/schemas.ts:114](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/shared/validation/schemas.ts#L114)

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
