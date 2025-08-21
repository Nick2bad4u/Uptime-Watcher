# shared/validation/validatorUtils

Shared validation utilities using the validator package.

## Remarks

This module provides validation functions that can be used by both frontend
and backend to ensure consistent validation behavior. Uses the well-tested
validator.js package for reliable validation.

The functions in this module replace manual validation patterns throughout
the codebase, providing consistent validation behavior and better security.

## Example

```typescript
// Replace manual string validation
// Old: typeof value === "string" && value.trim().length > 0
// New: isNonEmptyString(value)

// Replace manual URL validation
// Old: /^https?:///.test(url)
// New: isValidUrl(url)

// Replace manual array validation
// Old: Array.isArray(arr) && arr.every(item => typeof item === "string")
// New: isValidIdentifierArray(arr)
```

## See

[https://github.com/validatorjs/validator.js](https://github.com/validatorjs/validator.js) - Validator.js documentation

## Functions

- [isNonEmptyString](functions/isNonEmptyString.md)
- [isValidFQDN](functions/isValidFQDN.md)
- [isValidIdentifier](functions/isValidIdentifier.md)
- [isValidIdentifierArray](functions/isValidIdentifierArray.md)
- [isValidInteger](functions/isValidInteger.md)
- [isValidNumeric](functions/isValidNumeric.md)
- [isValidHost](functions/isValidHost.md)
- [isValidPort](functions/isValidPort.md)
- [isValidUrl](functions/isValidUrl.md)
- [safeInteger](functions/safeInteger.md)
