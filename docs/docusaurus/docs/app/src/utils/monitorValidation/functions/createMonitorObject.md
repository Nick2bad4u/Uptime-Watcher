# Function: createMonitorObject()

> **createMonitorObject**(`type`, `fields`): `Record`\<`string`, `unknown`\>

Defined in: [src/utils/monitorValidation.ts:23](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/utils/monitorValidation.ts#L23)

Create monitor object with proper field mapping.

## Parameters

### type

Monitor type

`"http"` | `"port"`

### fields

`Record`\<`string`, `unknown`\>

Field values

## Returns

`Record`\<`string`, `unknown`\>

Monitor object with type-specific fields
