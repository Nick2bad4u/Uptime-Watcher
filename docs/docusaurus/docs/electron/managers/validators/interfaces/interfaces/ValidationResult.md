# Interface: ValidationResult

Defined in: [electron/managers/validators/interfaces.ts:30](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/managers/validators/interfaces.ts#L30)

Represents the result of a validation operation, providing error details and
validity status.

## Remarks

Used by validators throughout the application to return standardized results.
Enables consistent error handling and user feedback by encapsulating both
error messages and overall validity.

## Example

```typescript
const result: ValidationResult = {
    errors: [],
    success: true,
};
// or
const result: ValidationResult = {
    errors: ["Field is required"],
    success: false,
};
```

Base validation interface.

## Properties

### errors

> **errors**: `string`[]

Defined in: [electron/managers/validators/interfaces.ts:31](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/managers/validators/interfaces.ts#L31)

***

### success

> **success**: `boolean`

Defined in: [electron/managers/validators/interfaces.ts:32](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/managers/validators/interfaces.ts#L32)
