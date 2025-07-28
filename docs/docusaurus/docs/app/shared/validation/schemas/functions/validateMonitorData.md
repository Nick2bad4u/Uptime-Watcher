# Function: validateMonitorData()

> **validateMonitorData**(`type`, `data`): [`ValidationResult`](../interfaces/ValidationResult.md)

Defined in: [shared/validation/schemas.ts:237](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/validation/schemas.ts#L237)

Validates monitor data using the appropriate Zod schema.

## Parameters

### type

`string`

The monitor type string ("http" or "port").

### data

`unknown`

The monitor data to validate.

## Returns

[`ValidationResult`](../interfaces/ValidationResult.md)

The validation result object.

## Remarks

Selects the schema based on monitor type ("http" or "port").
Returns a [ValidationResult](../interfaces/ValidationResult.md) with success status, validated data, errors, and warnings.

## Example

```typescript
const result = validateMonitorData("http", {
  url: "https://example.com",
  timeout: 5000
});
if (result.success) {
  console.log("Valid monitor:", result.data);
} else {
  console.error("Validation errors:", result.errors);
}
```

## Throws

z.ZodError If validation fails and is not handled internally.
