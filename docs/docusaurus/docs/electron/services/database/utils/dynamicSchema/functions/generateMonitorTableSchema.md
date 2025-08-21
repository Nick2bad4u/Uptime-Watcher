# Function: generateMonitorTableSchema()

> **generateMonitorTableSchema**(): `string`

Defined in: [electron/services/database/utils/dynamicSchema.ts:514](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/utils/dynamicSchema.ts#L514)

Generates the CREATE TABLE SQL statement for the monitors table, including
all static and dynamic fields.

## Returns

`string`

SQL string for creating the monitors table.

## Remarks

Static fields are always present; dynamic fields are generated from monitor
type registry.

## Example

```typescript
const sql = generateMonitorTableSchema();
```
