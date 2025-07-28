# Function: safeNumberConvert()

> **safeNumberConvert**(`value`): `undefined` \| `number`

Defined in: [electron/services/database/utils/valueConverters.ts:151](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/utils/valueConverters.ts#L151)

Safely convert a value to number or return undefined.

## Parameters

### value

`unknown`

The value to convert to a number

## Returns

`undefined` \| `number`

Converted number value, or undefined if conversion fails or value is nullish

## Remarks

Provides safe number conversion with explicit handling of edge cases:
- Already a number: returned as-is (including 0, NaN, Infinity)
- Truthy values: converted using Number() constructor
- Falsy values (null, undefined, "", false, 0): returns undefined

Note: This function treats 0 as a valid number that should be preserved,
unlike some truthy/falsy checks that would convert 0 to undefined.
