# Function: isValidFQDN()

> **isValidFQDN**(`value`, `options?`): `value is string`

Defined in: [shared/validation/validatorUtils.ts:73](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/validation/validatorUtils.ts#L73)

Validates that a value is a valid FQDN (Fully Qualified Domain Name).

## Parameters

### value

`unknown`

Value to validate

### options?

[`IsFQDNOptions`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/ffdb7d4ed9dea9062bb2d488d1d68bb7ac7499dd/types/validator/lib/isFQDN.d.ts#L1)

FQDN validation options

## Returns

`value is string`

True if value is a valid FQDN

## Example

```typescript
isValidFQDN("example.com"); // true
isValidFQDN("localhost"); // false (no TLD by default)
```
