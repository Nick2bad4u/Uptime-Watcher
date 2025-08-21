# Function: isValidHost()

> **isValidHost**(`value`): `value is string`

Defined in: [shared/validation/validatorUtils.ts:201](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/validation/validatorUtils.ts#L201)

Validates that a value is a valid host (IP address, FQDN, or localhost).

## Parameters

### value

`unknown`

Value to validate

## Returns

`value is string`

True if value is a valid host

## Example

```typescript
isValidHost("192.168.1.1"); // true
isValidHost("example.com"); // true
isValidHost("localhost"); // true
isValidHost("invalid..host"); // false
```
