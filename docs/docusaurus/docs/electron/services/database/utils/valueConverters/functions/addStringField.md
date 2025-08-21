# Function: addStringField()

> **addStringField**(`fieldName`, `value`, `updateFields`, `updateValues`): `void`

Defined in: [electron/services/database/utils/valueConverters.ts:126](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/utils/valueConverters.ts#L126)

Add a string field to update arrays if the value is defined.

## Parameters

### fieldName

`string`

The database field name to update

### value

The string value to add, or undefined to skip

`undefined` | `string`

### updateFields

`string`[]

Array to append the field update clause

### updateValues

[`DbValue`](../type-aliases/DbValue.md)[]

Array to append the database value

## Returns

`void`

## Remarks

Handles string values for database storage with explicit empty string
handling. - If value is undefined: field is not added (skipped)

- If value is empty string: stores empty string (preserved as-is)
- Otherwise: stores the string value after conversion

Only adds the field if the value is not undefined, allowing for optional
updates. Empty strings are preserved to maintain data integrity.
