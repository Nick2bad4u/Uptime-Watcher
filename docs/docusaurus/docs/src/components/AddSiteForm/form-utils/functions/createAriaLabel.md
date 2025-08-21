# Function: createAriaLabel()

> **createAriaLabel**(`label`, `required`): `string`

Defined in: [src/components/AddSiteForm/form-utils.ts:53](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/AddSiteForm/form-utils.ts#L53)

Creates an accessible aria-label string, appending a required indicator if
needed.

## Parameters

### label

`string`

The base label text for the field.

### required

`boolean`

Whether the field is required.

## Returns

`string`

The formatted aria-label string.

## Example

```ts
createAriaLabel("Site Name", true); // "Site Name (required)"
```
