# Interface: ValidationResult

Defined in: [shared/validation/schemas.ts:189](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/validation/schemas.ts#L189)

Result object returned by validation functions.

## Remarks

Contains the validated data (if successful), errors, warnings, and metadata.

## Properties

### data?

> `optional` **data**: `unknown`

Defined in: [shared/validation/schemas.ts:193](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/validation/schemas.ts#L193)

The validated data, if validation succeeded.

***

### errors

> **errors**: `string`[]

Defined in: [shared/validation/schemas.ts:197](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/validation/schemas.ts#L197)

Array of validation error messages.

***

### metadata

> **metadata**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

Defined in: [shared/validation/schemas.ts:201](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/validation/schemas.ts#L201)

Metadata about the validation process (e.g., monitor type, field name).

***

### success

> **success**: `boolean`

Defined in: [shared/validation/schemas.ts:205](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/validation/schemas.ts#L205)

Indicates whether validation was successful.

***

### warnings

> **warnings**: `string`[]

Defined in: [shared/validation/schemas.ts:209](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/validation/schemas.ts#L209)

Array of validation warnings (e.g., optional fields missing).
