# Function: formatErrorMessage()

> **formatErrorMessage**(`template`, `params`): `string`

Defined in: [shared/utils/errorCatalog.ts:382](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/utils/errorCatalog.ts#L382)

Helper function to create parameterized error messages.

## Parameters

### template

`string`

Error message template with placeholders

### params

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `number` \| `string`\>

Parameters to substitute in the template

## Returns

`string`

Formatted error message string

## Example

```typescript
const message = formatErrorMessage("Invalid monitor status: {status}", {
    status: "invalid",
});
// Returns: "Invalid monitor status: invalid"

const message = formatErrorMessage(
    "Validator error for event '{event}': {error}",
    {
        event: "user:login",
        error: "User ID required",
    }
);
// Returns: "Validator error for event 'user:login': User ID required"
```
