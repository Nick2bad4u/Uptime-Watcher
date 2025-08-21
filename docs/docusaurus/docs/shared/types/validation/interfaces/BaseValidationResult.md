# Interface: BaseValidationResult

Defined in: [shared/types/validation.ts:20](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/validation.ts#L20)

Base validation result interface.

## Remarks

Provides the core structure for validation results across the application.
Other validation interfaces can extend this for domain-specific needs.

## Extended by

- [`FormValidationResult`](FormValidationResult.md)
- [`MonitorConfigValidationResult`](MonitorConfigValidationResult.md)
- [`ThemeValidationResult`](ThemeValidationResult.md)
- [`ValidationResult`](ValidationResult.md)

## Properties

### errors

> **errors**: `string`[]

Defined in: [shared/types/validation.ts:22](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/validation.ts#L22)

Array of validation error messages

***

### success

> **success**: `boolean`

Defined in: [shared/types/validation.ts:24](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/validation.ts#L24)

Whether validation passed (no errors)

***

### warnings?

> `optional` **warnings**: `string`[]

Defined in: [shared/types/validation.ts:26](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/validation.ts#L26)

Optional warning messages that don't prevent validation success
