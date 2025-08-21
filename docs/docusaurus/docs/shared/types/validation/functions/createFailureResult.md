# Function: createFailureResult()

> **createFailureResult**(`errors`, `metadata?`): [`ValidationResult`](../interfaces/ValidationResult.md)

Defined in: [shared/types/validation.ts:123](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/validation.ts#L123)

Helper function to create a failed validation result.

## Parameters

### errors

`string`[]

Array of error messages

### metadata?

[`ValidationMetadata`](../interfaces/ValidationMetadata.md)

Optional metadata about the validation

## Returns

[`ValidationResult`](../interfaces/ValidationResult.md)

A failed ValidationResult
