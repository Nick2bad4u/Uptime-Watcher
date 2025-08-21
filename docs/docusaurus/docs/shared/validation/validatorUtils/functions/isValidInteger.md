# Function: isValidInteger()

> **isValidInteger**(`value`, `options?`): `value is string`

Defined in: [shared/validation/validatorUtils.ts:151](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/validation/validatorUtils.ts#L151)

Validates that a value is a valid integer within optional bounds.

## Parameters

### value

`unknown`

Value to validate

### options?

[`IsIntOptions`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/ffdb7d4ed9dea9062bb2d488d1d68bb7ac7499dd/types/validator/index.d.ts#L650)

Integer validation options

## Returns

`value is string`

True if value is a valid integer

## Example

```typescript
isValidInteger("123"); // true
isValidInteger("123.45"); // false
isValidInteger("123", { min: 100, max: 200 }); // true
```
