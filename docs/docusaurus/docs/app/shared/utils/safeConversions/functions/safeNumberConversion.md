# Function: safeNumberConversion()

> **safeNumberConversion**(`value`, `defaultValue`): `number`

Defined in: [shared/utils/safeConversions.ts:28](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/utils/safeConversions.ts#L28)

Safely converts any value to a number with fallback.

## Parameters

### value

`unknown`

Value to convert (can be any type)

### defaultValue

`number` = `0`

Fallback value if conversion fails (default: 0)

## Returns

`number`

Valid number or the default value

## Remarks

Handles conversion from strings using Number() constructor, which supports
various formats including scientific notation, hexadecimal, and decimal.
Returns the default value for any value that cannot be converted to a valid number.

## Example

```typescript
safeNumberConversion("123") // 123
safeNumberConversion("12.34") // 12.34
safeNumberConversion("invalid") // 0
safeNumberConversion(null, 42) // 42
```
