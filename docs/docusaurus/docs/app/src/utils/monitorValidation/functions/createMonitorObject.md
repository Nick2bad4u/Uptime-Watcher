# Function: createMonitorObject()

> **createMonitorObject**(`type`, `fields`): [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

Defined in: [src/utils/monitorValidation.ts:23](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/utils/monitorValidation.ts#L23)

Create monitor object with proper field mapping.

## Parameters

### type

Monitor type

`"http"` | `"port"`

### fields

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

Field values

## Returns

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

Monitor object with type-specific fields
