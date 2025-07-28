# Variable: TextField

> `const` **TextField**: [`NamedExoticComponent`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/1a60e1b9a9062ff9c48c681ca3d8b6f717b616b9/types/react/index.d.ts#L571)\<[`TextFieldProperties`](../interfaces/TextFieldProperties.md)\>

Defined in: [src/components/AddSiteForm/FormFields.tsx:165](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/AddSiteForm/FormFields.tsx#L165)

Text input field component with accessibility and validation.

## Remarks

Supports "text", "url", and "number" input types. Handles error and help text display.

## Param

[TextFieldProperties](../interfaces/TextFieldProperties.md)

## Returns

JSX element containing an accessible text input field.

## Example

```tsx
<TextField
  id="siteName"
  label="Site Name"
  value={siteName}
  onChange={setSiteName}
  required
/>
```
