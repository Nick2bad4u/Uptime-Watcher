# Function: safeParseInt()

> **safeParseInt**(`value`, `defaultValue`): `number`

Defined in: [shared/utils/safeConversions.ts:103](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/utils/safeConversions.ts#L103)

Safely converts a value to an integer with fallback.

## Parameters

### value

`unknown`

Value to convert to integer

### defaultValue

`number` = `0`

Fallback value if conversion fails (default: 0)

## Returns

`number`

Valid integer or the default value

## Remarks

For numbers, applies Math.floor() to ensure integer result. For strings,
uses parseInt() with base 10. Returns the default value for any value
that cannot be converted to a valid integer.

## Example

```typescript
safeParseInt("123") // 123
safeParseInt("123.99") // 123
safeParseInt(45.67) // 45
safeParseInt("invalid") // 0
safeParseInt(null, 10) // 10
```
