# Function: safeInteger()

> **safeInteger**(`value`, `defaultValue`, `min?`, `max?`): `number`

Defined in: [shared/validation/validatorUtils.ts:322](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/validation/validatorUtils.ts#L322)

Safely converts a value to a positive integer with bounds checking.

## Parameters

### value

`unknown`

Value to convert

### defaultValue

`number`

Default value if conversion fails

### min?

`number`

Minimum allowed value

### max?

`number`

Maximum allowed value

## Returns

`number`

Converted integer or default value

## Example

```typescript
safeInteger("123", 0, 1, 1000); // 123
safeInteger("abc", 0, 1, 1000); // 0
safeInteger("2000", 0, 1, 1000); // 1000 (clamped)
```
