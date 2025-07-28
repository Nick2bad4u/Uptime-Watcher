# Function: validateSite()

> **validateSite**(`site`): `site is Site`

Defined in: [shared/utils/validation.ts:72](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/utils/validation.ts#L72)

Validates site data structure.

## Parameters

### site

[`Partial`](https://www.typescriptlang.org/docs/handbook/utility-types.html#partialtype)\<[`Site`](../../../types/interfaces/Site.md)\>

Partial site data to validate

## Returns

`site is Site`

Type predicate indicating if the site is valid

## Remarks

Performs comprehensive validation of site structure including all monitors.
Uses proper type guards to ensure runtime safety.
