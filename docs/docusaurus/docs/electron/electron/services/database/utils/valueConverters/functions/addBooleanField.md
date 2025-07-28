# Function: addBooleanField()

> **addBooleanField**(`fieldName`, `value`, `updateFields`, `updateValues`): `void`

Defined in: [electron/services/database/utils/valueConverters.ts:33](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/utils/valueConverters.ts#L33)

Add a boolean field to update arrays if the value is defined.

## Parameters

### fieldName

`string`

The database field name to update

### value

The boolean value to add, or undefined to skip

`undefined` | `boolean`

### updateFields

`string`[]

Array to append the field update clause

### updateValues

[`DbValue`](../type-aliases/DbValue.md)[]

Array to append the database value

## Returns

`void`

## Remarks

Converts boolean values to database-compatible integers (1 for true, 0 for false).
Only adds the field if the value is not undefined, allowing for optional updates.
