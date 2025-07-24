# Interface: ValidationResult

Defined in: [electron/managers/validators/interfaces.ts:8](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/managers/validators/interfaces.ts#L8)

Validation result interface for consistent error reporting across the application.

## Remarks

Used by validators to return standardized validation results with error details
and validity status. Enables consistent error handling and user feedback.

## Properties

### errors

> **errors**: `string`[]

Defined in: [electron/managers/validators/interfaces.ts:10](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/managers/validators/interfaces.ts#L10)

Array of validation error messages (empty if valid)

***

### isValid

> **isValid**: `boolean`

Defined in: [electron/managers/validators/interfaces.ts:12](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/managers/validators/interfaces.ts#L12)

True if validation passed, false if any errors were found
