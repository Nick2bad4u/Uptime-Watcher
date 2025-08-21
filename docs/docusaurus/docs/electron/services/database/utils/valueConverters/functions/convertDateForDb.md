# Function: convertDateForDb()

> **convertDateForDb**(`value`): `null` \| `string`

Defined in: [electron/services/database/utils/valueConverters.ts:161](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/utils/valueConverters.ts#L161)

Convert a date-like value to ISO string or null for database storage.

## Parameters

### value

The date value to convert (Date object, string, null, or
  undefined)

`undefined` | `null` | `string` | [`Date`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Date)

## Returns

`null` \| `string`

ISO string representation for valid dates, null for invalid/empty
  values

## Remarks

Handles various date input types for consistent database storage:

- Date objects: converted to ISO string format
- String values: preserved as-is (assumed to be valid date strings)
- Null/undefined/falsy values: converted to null for database NULL storage

The function prioritizes data safety by converting uncertain values to null
rather than attempting invalid date parsing.
