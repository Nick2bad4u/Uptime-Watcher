# Function: isArray()

> **isArray**(`value`): `value is unknown[]`

Defined in: [shared/utils/typeHelpers.ts:50](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/utils/typeHelpers.ts#L50)

Safely checks if an unknown value is an array.

## Parameters

### value

`unknown`

Value to check

## Returns

`value is unknown[]`

True if value is an array, false otherwise

## Remarks

Type guard function for arrays. Use this to validate arrays before accessing
array methods.
