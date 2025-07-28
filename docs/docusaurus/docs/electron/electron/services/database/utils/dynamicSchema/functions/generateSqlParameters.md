# Function: generateSqlParameters()

> **generateSqlParameters**(): `object`

Defined in: [electron/services/database/utils/dynamicSchema.ts:164](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/utils/dynamicSchema.ts#L164)

Generates SQL parameter columns and placeholders for INSERT/UPDATE operations.

## Returns

`object`

Object containing `columns` (array of column names) and `placeholders` (comma-separated string).

### columns

> **columns**: `string`[]

### placeholders

> **placeholders**: `string`

## Remarks

Combines static and dynamic columns for parameterized queries.

## Example

```typescript
const { columns, placeholders } = generateSqlParameters();
```
