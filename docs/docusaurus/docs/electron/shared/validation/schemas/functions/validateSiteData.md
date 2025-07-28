# Function: validateSiteData()

> **validateSiteData**(`data`): [`ValidationResult`](../interfaces/ValidationResult.md)

Defined in: [shared/validation/schemas.ts:369](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/validation/schemas.ts#L369)

Validates site data using the shared Zod schema.

## Parameters

### data

`unknown`

The site data to validate.

## Returns

[`ValidationResult`](../interfaces/ValidationResult.md)

The validation result object for the site.

## Remarks

Validates the complete site structure, including all monitors.
Ensures data integrity for site operations.

## Throws

z.ZodError If validation fails and is not handled internally.
