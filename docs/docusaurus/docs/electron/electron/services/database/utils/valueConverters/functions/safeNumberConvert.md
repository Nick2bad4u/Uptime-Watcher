# Function: safeNumberConvert()

> **safeNumberConvert**(`value`): `undefined` \| `number`

Defined in: [electron/services/database/utils/valueConverters.ts:147](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/services/database/utils/valueConverters.ts#L147)

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
