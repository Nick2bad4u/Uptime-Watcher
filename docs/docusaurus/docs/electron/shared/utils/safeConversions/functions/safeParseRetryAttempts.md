# Function: safeParseRetryAttempts()

> **safeParseRetryAttempts**(`value`, `defaultValue`): `number`

Defined in: [shared/utils/safeConversions.ts:210](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/utils/safeConversions.ts#L210)

Safely converts a value to a retry attempts count (0-10) with fallback.

## Parameters

### value

`unknown`

Value to convert to retry attempts count

### defaultValue

`number` = `3`

Fallback value if conversion fails (default: 3)

## Returns

`number`

Valid retry attempts count between 0 and 10, or the default value

## Remarks

Validates that the converted integer falls within a reasonable range for
retry attempts. Zero retries means no retries will be attempted. Values
outside the 0-10 range are considered unreasonable and will return the default.

## Example

```typescript
safeParseRetryAttempts("3") // 3
safeParseRetryAttempts("0") // 0 (no retries)
safeParseRetryAttempts("15") // 3 (out of range)
safeParseRetryAttempts("invalid") // 3
```
