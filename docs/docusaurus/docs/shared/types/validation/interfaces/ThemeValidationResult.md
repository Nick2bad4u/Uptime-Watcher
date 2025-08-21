# Interface: ThemeValidationResult

Defined in: [shared/types/validation.ts:66](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/validation.ts#L66)

Theme validation result.

## Remarks

Specialized validation result for theme configuration validation.

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

### missingProperties?

> `optional` **missingProperties**: `string`[]

Defined in: [shared/types/validation.ts:68](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/validation.ts#L68)

Missing theme properties

***

### themeErrors?

> `optional` **themeErrors**: `string`[]

Defined in: [shared/types/validation.ts:70](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/validation.ts#L70)

Theme-specific validation errors
