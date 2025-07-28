# Function: safeParseFloat()

> **safeParseFloat**(`value`, `defaultValue`): `number`

Defined in: [shared/utils/safeConversions.ts:69](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/utils/safeConversions.ts#L69)

Safely converts a value to a float with fallback.

## Parameters

### value

`unknown`

Value to convert to floating-point number

### defaultValue

`number` = `0`

Fallback value if conversion fails (default: 0)

## Returns

`number`

Valid floating-point number or the default value

## Remarks

Uses parseFloat() for string conversion, which stops parsing at the first
invalid character and returns the parsed portion. For non-string, non-number
values, returns the default value.

## Example

```typescript
safeParseFloat("123.45") // 123.45
safeParseFloat("12.34px") // 12.34
safeParseFloat("invalid") // 0
safeParseFloat({}, 1.5) // 1.5
```
