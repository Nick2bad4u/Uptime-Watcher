# Function: addNumberField()

> **addNumberField**(`fieldName`, `value`, `updateFields`, `updateValues`): `void`

Defined in: [electron/services/database/utils/valueConverters.ts:60](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/utils/valueConverters.ts#L60)

Add a number field to update arrays if the value is defined.

## Parameters

### fieldName

`string`

The database field name to update

### value

The number value to add, or undefined to skip

`undefined` | `number`

### updateFields

`string`[]

Array to append the field update clause

### updateValues

[`DbValue`](../type-aliases/DbValue.md)[]

Array to append the database value

## Returns

`void`

## Remarks

Converts the value to a number type for database storage.
Only adds the field if the value is not undefined, allowing for optional updates.
Zero values are treated as valid and will be included.
