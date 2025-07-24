# Function: validateMonitorData()

> **validateMonitorData**(`type`, `data`): `object`

Defined in: [electron/services/monitoring/MonitorTypeRegistry.ts:160](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/services/monitoring/MonitorTypeRegistry.ts#L160)

Validate monitor data using shared Zod schemas.

## Parameters

### type

`string`

Monitor type

### data

`unknown`

Monitor data to validate

## Returns

`object`

Validation result

### data?

> `optional` **data**: `unknown`

### errors

> **errors**: `string`[]

### metadata

> **metadata**: `Record`\<`string`, `unknown`\>

### success

> **success**: `boolean`

### warnings

> **warnings**: `string`[]
