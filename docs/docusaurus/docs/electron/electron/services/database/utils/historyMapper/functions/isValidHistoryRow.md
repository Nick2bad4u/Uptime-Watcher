# Function: isValidHistoryRow()

> **isValidHistoryRow**(`row`): `boolean`

Defined in: [electron/services/database/utils/historyMapper.ts:83](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/utils/historyMapper.ts#L83)

Validates that a database row contains the minimum required fields for a history entry.

## Parameters

### row

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

The database row to validate.

## Returns

`boolean`

`true` if the row is valid for a history entry, otherwise `false`.

## Remarks

Ensures that the row has a valid monitor ID, status, and timestamp.

## Example

```typescript
if (isValidHistoryRow(row)) { ... }
```
