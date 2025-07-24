# Function: validateMonitorData()

> **validateMonitorData**(`type`, `data`): `object`

Defined in: [electron/services/monitoring/MonitorTypeRegistry.ts:160](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/monitoring/MonitorTypeRegistry.ts#L160)

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

> **metadata**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

### success

> **success**: `boolean`

### warnings

> **warnings**: `string`[]
