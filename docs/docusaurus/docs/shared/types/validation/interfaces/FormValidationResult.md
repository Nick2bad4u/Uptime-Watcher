# Interface: FormValidationResult

Defined in: [shared/types/validation.ts:38](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/validation.ts#L38)

Form-specific validation result.

## Remarks

Extends base validation with field-specific error mapping for UI form
validation scenarios.

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

### fieldErrors?

> `optional` **fieldErrors**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `string`[]\>

Defined in: [shared/types/validation.ts:40](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/validation.ts#L40)

Field-specific error messages mapped by field name
