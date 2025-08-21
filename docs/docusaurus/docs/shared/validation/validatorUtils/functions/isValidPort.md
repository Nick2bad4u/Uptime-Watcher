# Function: isValidPort()

> **isValidPort**(`value`): `boolean`

Defined in: [shared/validation/validatorUtils.ts:246](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/validation/validatorUtils.ts#L246)

Validates that a value is a valid port number.

## Parameters

### value

`unknown`

Value to validate (number or string)

## Returns

`boolean`

True if value is a valid port number (1-65535)

## Example

```typescript
isValidPort(80); // true
isValidPort("443"); // true
isValidPort(0); // false
isValidPort(70000); // false
```
