# Function: isValidUrl()

> **isValidUrl**(`value`, `options?`): `value is string`

Defined in: [shared/validation/validatorUtils.ts:277](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/validation/validatorUtils.ts#L277)

Validates that a value is a valid URL.

## Parameters

### value

`unknown`

Value to validate

### options?

[`IsURLOptions`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/ffdb7d4ed9dea9062bb2d488d1d68bb7ac7499dd/types/validator/lib/isURL.d.ts#L8)

URL validation options

## Returns

`value is string`

True if value is a valid URL

## Example

```typescript
isValidUrl("https://example.com"); // true
isValidUrl("not-a-url"); // false
```
