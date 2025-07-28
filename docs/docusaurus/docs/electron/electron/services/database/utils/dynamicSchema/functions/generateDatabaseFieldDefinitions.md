# Function: generateDatabaseFieldDefinitions()

> **generateDatabaseFieldDefinitions**(): [`DatabaseFieldDefinition`](../interfaces/DatabaseFieldDefinition.md)[]

Defined in: [electron/services/database/utils/dynamicSchema.ts:79](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/utils/dynamicSchema.ts#L79)

Generates database field definitions from the monitor type registry.

## Returns

[`DatabaseFieldDefinition`](../interfaces/DatabaseFieldDefinition.md)[]

Array of [DatabaseFieldDefinition](../interfaces/DatabaseFieldDefinition.md) objects for all monitor types.

## Remarks

Avoids duplicate columns by tracking seen field names.
Converts field names to snake_case for database compatibility.

## Example

```typescript
const fields = generateDatabaseFieldDefinitions();
```
