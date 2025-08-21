# Function: isValidIdentifier()

> **isValidIdentifier**(`value`): `value is string`

Defined in: [shared/validation/validatorUtils.ts:98](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/validation/validatorUtils.ts#L98)

Validates that a value is a valid identifier (alphanumeric with
hyphens/underscores).

## Parameters

### value

`unknown`

Value to validate

## Returns

`value is string`

True if value is a valid identifier

## Example

```typescript
isValidIdentifier("abc123"); // true
isValidIdentifier("abc-123_def"); // true
isValidIdentifier("abc@123"); // false
```
