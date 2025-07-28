# Function: safeParseTimeout()

> **safeParseTimeout**(`value`, `defaultValue`): `number`

Defined in: [shared/utils/safeConversions.ts:235](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/utils/safeConversions.ts#L235)

Safely converts a value to a timeout value (positive number) with fallback.

## Parameters

### value

`unknown`

Value to convert to timeout in milliseconds

### defaultValue

`number` = `10_000`

Fallback value if conversion fails (default: 10000)

## Returns

`number`

Valid positive timeout value in milliseconds, or the default value

## Remarks

Ensures the result is a positive number suitable for timeout operations.
Zero and negative values are considered invalid for timeouts and will
return the default value. Accepts fractional values for sub-millisecond precision.

## Example

```typescript
safeParseTimeout("5000") // 5000 (5 seconds)
safeParseTimeout("0") // 10000 (invalid timeout)
safeParseTimeout("-1000") // 10000 (negative timeout)
safeParseTimeout("invalid") // 10000
```
