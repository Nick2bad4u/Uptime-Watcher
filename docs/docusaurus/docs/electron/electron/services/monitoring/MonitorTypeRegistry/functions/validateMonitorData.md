# Function: validateMonitorData()

> **validateMonitorData**(`type`, `data`): `object`

Defined in: [electron/services/monitoring/MonitorTypeRegistry.ts:214](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/monitoring/MonitorTypeRegistry.ts#L214)

Validates monitor data using shared Zod schemas for the specified monitor type.

## Parameters

### type

`string`

The monitor type identifier.

### data

`unknown`

The monitor data to validate.

## Returns

`object`

Validation result object with data, errors, warnings, metadata, and success flag.

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

## Remarks

Uses the shared validation logic to validate monitor data against the schema for the given type. Returns a structured result with errors, warnings, and metadata.
