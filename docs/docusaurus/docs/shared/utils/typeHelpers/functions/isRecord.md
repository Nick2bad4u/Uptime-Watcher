# Function: isRecord()

> **isRecord**(`value`): `value is Record`string, unknown``

Defined in: [shared/utils/typeHelpers.ts:65](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/utils/typeHelpers.ts#L65)

Safely checks if an unknown value is a record (object with string keys).

## Parameters

### value

`unknown`

Value to check

## Returns

`value is Record`string, unknown``

True if value is a record, false otherwise

## Remarks

Type guard function for `Record`string, unknown`` types. Use this to validate
objects before accessing their properties.
