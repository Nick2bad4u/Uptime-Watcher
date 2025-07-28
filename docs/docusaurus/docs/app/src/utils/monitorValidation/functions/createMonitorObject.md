# Function: createMonitorObject()

> **createMonitorObject**(`type`, `fields`): [`MonitorCreationData`](../interfaces/MonitorCreationData.md)

Defined in: [src/utils/monitorValidation.ts:45](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/utils/monitorValidation.ts#L45)

Create monitor object with proper field mapping and type safety.

## Parameters

### type

Monitor type

`"http"` | `"port"`

### fields

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

Field values to merge with defaults

## Returns

[`MonitorCreationData`](../interfaces/MonitorCreationData.md)

Monitor creation data with type-specific fields and guaranteed required fields
