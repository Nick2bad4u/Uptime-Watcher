# Function: generateDatabaseFieldDefinitions()

> **generateDatabaseFieldDefinitions**(): [`DatabaseFieldDefinition`](../interfaces/DatabaseFieldDefinition.md)[]

Defined in: [electron/services/database/utils/dynamicSchema.ts:398](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/utils/dynamicSchema.ts#L398)

Generates database field definitions from the monitor type registry.

## Returns

[`DatabaseFieldDefinition`](../interfaces/DatabaseFieldDefinition.md)[]

Array of [DatabaseFieldDefinition](../interfaces/DatabaseFieldDefinition.md) objects for all monitor
  types.

## Remarks

Avoids duplicate columns by tracking seen field names. Converts field names
to snake_case for database compatibility.

## Example

```typescript
const fields = generateDatabaseFieldDefinitions();
```
