# Interface: ValidationResult

Defined in: [electron/managers/validators/interfaces.ts:23](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/managers/validators/interfaces.ts#L23)

Represents the result of a validation operation, providing error details and validity status.

## Remarks

Used by validators throughout the application to return standardized results.
Enables consistent error handling and user feedback by encapsulating both error messages and overall validity.

## Example

```typescript
const result: ValidationResult = {
  errors: [],
  isValid: true
};
// or
const result: ValidationResult = {
  errors: ["Field is required"],
  isValid: false
};
```

## Properties

### errors

> **errors**: `string`[]

Defined in: [electron/managers/validators/interfaces.ts:30](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/managers/validators/interfaces.ts#L30)

An array of validation error messages.

#### Remarks

If validation passes, this array will be empty. If validation fails, it contains one or more error messages describing each failure.

***

### isValid

> **isValid**: `boolean`

Defined in: [electron/managers/validators/interfaces.ts:39](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/managers/validators/interfaces.ts#L39)

Indicates whether the validation passed.

#### Remarks

`true` if validation passed (no errors), `false` if any errors were found.

#### Default Value

```ts
false
```
