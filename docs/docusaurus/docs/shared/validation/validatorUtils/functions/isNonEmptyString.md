# Function: isNonEmptyString()

> **isNonEmptyString**(`value`): `value is string`

Defined in: [shared/validation/validatorUtils.ts:52](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/validation/validatorUtils.ts#L52)

Validates that a value is a non-empty string.

## Parameters

### value

`unknown`

Value to validate

## Returns

`value is string`

True if value is a non-empty string

## Example

```typescript
isNonEmptyString("hello"); // true
isNonEmptyString(""); // false
isNonEmptyString(null); // false
```
