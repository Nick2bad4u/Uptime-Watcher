# Function: createMonitorObject()

> **createMonitorObject**(`type`, `fields`): [`MonitorCreationData`](../interfaces/MonitorCreationData.md)

Defined in: [src/utils/monitorValidation.ts:55](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/utils/monitorValidation.ts#L55)

Create monitor object with proper field mapping and type safety.

## Parameters

### type

Monitor type

`"http"` | `"port"` | `"ping"` | `"dns"`

### fields

[`Partial`](https://www.typescriptlang.org/docs/handbook/utility-types.html#partialtype)\<[`MonitorFormData`](../../../types/monitorFormData/type-aliases/MonitorFormData.md)\>

Field values to merge with defaults

## Returns

[`MonitorCreationData`](../interfaces/MonitorCreationData.md)

Monitor creation data with type-specific fields and guaranteed
  required fields
