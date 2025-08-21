# Function: validateSite()

> **validateSite**(`site`): `site is Site`

Defined in: [shared/utils/validation.ts:310](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/utils/validation.ts#L310)

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
