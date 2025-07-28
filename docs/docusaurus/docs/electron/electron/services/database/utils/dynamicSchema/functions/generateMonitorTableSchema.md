# Function: generateMonitorTableSchema()

> **generateMonitorTableSchema**(): `string`

Defined in: [electron/services/database/utils/dynamicSchema.ts:124](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/utils/dynamicSchema.ts#L124)

Generates the CREATE TABLE SQL statement for the monitors table,
including all static and dynamic fields.

## Returns

`string`

SQL string for creating the monitors table.

## Remarks

Static fields are always present; dynamic fields are generated from monitor type registry.

## Example

```typescript
const sql = generateMonitorTableSchema();
```
