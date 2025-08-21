# Function: safePropertyAccess()

> **safePropertyAccess**(`obj`, `key`): `unknown`

Defined in: [shared/utils/typeHelpers.ts:81](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/utils/typeHelpers.ts#L81)

Safely extracts a property from an unknown object.

## Parameters

### obj

`unknown`

Unknown object to extract from

### key

`string`

Property key to extract

## Returns

`unknown`

Property value or undefined

## Remarks

Provides safe property access from unknown objects without type assertions.
Returns undefined if object is not an object or property doesn't exist.
