# Function: interpolateLogTemplate()

> **interpolateLogTemplate**(`template`, `variables`): `string`

Defined in: [shared/utils/logTemplates.ts:414](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/utils/logTemplates.ts#L414)

Helper function to interpolate template variables in log messages.

## Parameters

### template

`string`

Log template string with variable placeholders

### variables

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `number` \| `string`\>

Object containing variable values for interpolation

## Returns

`string`

Interpolated log message

## Example

```typescript
const message = interpolateLogTemplate(
    "Site {identifier} loaded with {count} monitors",
    { identifier: "example.com", count: 3 }
);
// Returns: "Site example.com loaded with 3 monitors"
```
