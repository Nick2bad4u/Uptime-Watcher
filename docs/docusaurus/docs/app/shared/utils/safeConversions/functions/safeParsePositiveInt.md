# Function: safeParsePositiveInt()

> **safeParsePositiveInt**(`value`, `defaultValue`): `number`

Defined in: [shared/utils/safeConversions.ts:185](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/utils/safeConversions.ts#L185)

Safely converts a value to a positive integer with fallback.

## Parameters

### value

`unknown`

Value to convert to positive integer

### defaultValue

`number` = `1`

Fallback value if conversion fails (default: 1)

## Returns

`number`

Valid positive integer (\> 0), or the default value

## Remarks

Ensures the result is a positive integer greater than zero. Useful for
counts, IDs, and other values that must be positive. Zero and negative
values are considered invalid and will return the default.

## Example

```typescript
safeParsePositiveInt("5") // 5
safeParsePositiveInt("0") // 1 (not positive)
safeParsePositiveInt("-3") // 1 (not positive)
safeParsePositiveInt("invalid") // 1
```
