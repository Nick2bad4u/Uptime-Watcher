# Interface: ValidationResult

Defined in: [src/utils/monitorValidation.ts:29](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/utils/monitorValidation.ts#L29)

Standard validation result interface for consistency across all validation functions.

## Properties

### errors

> **errors**: `string`[]

Defined in: [src/utils/monitorValidation.ts:31](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/utils/monitorValidation.ts#L31)

Array of error messages, empty if validation passes

***

### success

> **success**: `boolean`

Defined in: [src/utils/monitorValidation.ts:33](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/utils/monitorValidation.ts#L33)

Whether validation was successful

***

### warnings

> **warnings**: `string`[]

Defined in: [src/utils/monitorValidation.ts:35](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/utils/monitorValidation.ts#L35)

Array of warning messages (non-blocking issues)
