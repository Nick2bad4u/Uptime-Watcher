# Function: isValidNumeric()

> **isValidNumeric**(`value`, `options?`): `value is string`

Defined in: [shared/validation/validatorUtils.ts:175](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/validation/validatorUtils.ts#L175)

Validates that a value is a valid numeric string within optional bounds.

## Parameters

### value

`unknown`

Value to validate

### options?

[`IsFloatOptions`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/ffdb7d4ed9dea9062bb2d488d1d68bb7ac7499dd/types/validator/index.d.ts#L503)

Numeric validation options

## Returns

`value is string`

True if value is a valid number

## Example

```typescript
isValidNumeric("123.45"); // true
isValidNumeric("abc"); // false
```
