# Function: validateAndConvert()

> **validateAndConvert**\<`T`\>(`value`, `validator`, `errorMessage?`): `T`

Defined in: [shared/utils/typeHelpers.ts:103](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/utils/typeHelpers.ts#L103)

Type-safe conversion from unknown to a specific type with validation.

## Type Parameters

### T

`T`

## Parameters

### value

`unknown`

Unknown value to convert

### validator

(`val`) => `val is T`

Validation function that returns true if value is of type
  T

### errorMessage?

`string`

## Returns

`T`

Validated value of type T

## Remarks

Use this instead of direct type assertions when you can validate the type.
Provides runtime safety in addition to compile-time types.

## Throws

Error if validation fails
