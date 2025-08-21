# Interface: MonitorConfigValidationResult

Defined in: [shared/types/validation.ts:51](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/validation.ts#L51)

Monitor configuration validation result.

## Remarks

Specialized validation result for monitor configuration validation.

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

### configErrors?

> `optional` **configErrors**: `string`[]

Defined in: [shared/types/validation.ts:53](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/validation.ts#L53)

Configuration error messages

***

### monitorTypeErrors?

> `optional` **monitorTypeErrors**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `string`[]\>

Defined in: [shared/types/validation.ts:55](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/validation.ts#L55)

Monitor type specific validation errors
