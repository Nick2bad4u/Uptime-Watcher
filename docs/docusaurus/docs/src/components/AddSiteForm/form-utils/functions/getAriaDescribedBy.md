# Function: getAriaDescribedBy()

> **getAriaDescribedBy**(`id`, `error?`, `helpText?`): `undefined` \| `string`

Defined in: [src/components/AddSiteForm/form-utils.ts:70](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/AddSiteForm/form-utils.ts#L70)

Determines the appropriate aria-describedby value for a form field.

## Parameters

### id

`string`

The unique field ID.

### error?

`string`

Error message, if present.

### helpText?

`string`

Help text, if present.

## Returns

`undefined` \| `string`

The aria-describedby value or undefined if neither error nor
  helpText is present.

## Remarks

If both error and helpText are present, error takes precedence for
accessibility.
