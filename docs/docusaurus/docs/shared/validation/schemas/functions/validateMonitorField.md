# Function: validateMonitorField()

> **validateMonitorField**(`type`, `fieldName`, `value`): [`ValidationResult`](../../../types/validation/interfaces/ValidationResult.md)

Defined in: [shared/validation/schemas.ts:523](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/validation/schemas.ts#L523)

Validates a specific field of a monitor using the appropriate schema.

## Parameters

### type

`string`

The monitor type string ("http" or "port").

### fieldName

`string`

The name of the field to validate.

### value

`unknown`

The value of the field to validate.

## Returns

[`ValidationResult`](../../../types/validation/interfaces/ValidationResult.md)

The validation result object for the field.

## Remarks

Useful for real-time validation during form input. Only validates the
specified field.

## Throws

z.ZodError If validation fails and is not handled internally.

## Throws

Error If the field name is unknown for the given monitor type.
