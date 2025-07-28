# Function: safeParsePercentage()

> **safeParsePercentage**(`value`, `defaultValue`): `number`

Defined in: [shared/utils/safeConversions.ts:135](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/utils/safeConversions.ts#L135)

Safely converts a value to a percentage (0-100) with fallback.

## Parameters

### value

`unknown`

Value to convert to percentage

### defaultValue

`number` = `0`

Fallback value if conversion fails (default: 0)

## Returns

`number`

Valid percentage clamped between 0 and 100, or the default value

## Remarks

First converts the value to a float, then clamps the result to the valid
percentage range of 0-100. Useful for progress indicators and completion ratios.

## Example

```typescript
safeParsePercentage("75") // 75
safeParsePercentage("150") // 100 (clamped)
safeParsePercentage("-10") // 0 (clamped)
safeParsePercentage("invalid") // 0
```
