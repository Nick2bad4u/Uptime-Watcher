# Function: validateSiteData()

> **validateSiteData**(`data`): [`ValidationResult`](../../../types/validation/interfaces/ValidationResult.md)

Defined in: [shared/validation/schemas.ts:590](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/validation/schemas.ts#L590)

Validates site data using the shared Zod schema.

## Parameters

### data

`unknown`

The site data to validate.

## Returns

[`ValidationResult`](../../../types/validation/interfaces/ValidationResult.md)

The validation result object for the site.

## Remarks

Validates the complete site structure, including all monitors. Ensures data
integrity for site operations.

## Throws

z.ZodError If validation fails and is not handled internally.
