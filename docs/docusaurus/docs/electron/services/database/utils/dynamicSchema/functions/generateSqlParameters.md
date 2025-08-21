# Function: generateSqlParameters()

> **generateSqlParameters**(): `SqlParameters`

Defined in: [electron/services/database/utils/dynamicSchema.ts:561](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/utils/dynamicSchema.ts#L561)

Generates SQL parameter columns and placeholders for INSERT/UPDATE
operations.

## Returns

`SqlParameters`

Object containing `columns` (array of column names) and
  `placeholders` (comma-separated string).

## Remarks

Combines static and dynamic columns for parameterized queries.

## Example

```typescript
const { columns, placeholders } = generateSqlParameters();
```
