# Function: isValidIdentifierArray()

> **isValidIdentifierArray**(`value`): `value is string[]`

Defined in: [shared/validation/validatorUtils.ts:125](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/validation/validatorUtils.ts#L125)

Validates that an array contains only valid string identifiers.

## Parameters

### value

`unknown`

Array to validate

## Returns

`value is string[]`

True if array contains only valid identifiers

## Example

```typescript
isValidIdentifierArray(["abc", "def-123"]); // true
isValidIdentifierArray(["abc", 123]); // false
isValidIdentifierArray(["abc", ""]); // false
```
