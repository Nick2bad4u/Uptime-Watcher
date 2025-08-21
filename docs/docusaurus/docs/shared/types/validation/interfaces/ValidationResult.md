# Interface: ValidationResult

Defined in: [shared/types/validation.ts:106](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/validation.ts#L106)

Enhanced validation result with metadata and data.

## Remarks

Used for complex validation scenarios that need to return validated data and
contextual information.

## Extends

- [`BaseValidationResult`](BaseValidationResult.md)

## Properties

### errors

> **errors**: `string`[]

Defined in: [shared/types/validation.ts:22](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/validation.ts#L22)

Array of validation error messages

#### Inherited from

[`BaseValidationResult`](BaseValidationResult.md).[`errors`](BaseValidationResult.md#errors)

***

### success

> **success**: `boolean`

Defined in: [shared/types/validation.ts:24](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/validation.ts#L24)

Whether validation passed (no errors)

#### Inherited from

[`BaseValidationResult`](BaseValidationResult.md).[`success`](BaseValidationResult.md#success)

***

### warnings?

> `optional` **warnings**: `string`[]

Defined in: [shared/types/validation.ts:26](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/validation.ts#L26)

Optional warning messages that don't prevent validation success

#### Inherited from

[`BaseValidationResult`](BaseValidationResult.md).[`warnings`](BaseValidationResult.md#warnings)

***

### data?

> `optional` **data**: `unknown`

Defined in: [shared/types/validation.ts:108](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/validation.ts#L108)

The validated data, if validation succeeded

***

### metadata?

> `optional` **metadata**: [`ValidationMetadata`](ValidationMetadata.md)

Defined in: [shared/types/validation.ts:110](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/validation.ts#L110)

Metadata about the validation process
