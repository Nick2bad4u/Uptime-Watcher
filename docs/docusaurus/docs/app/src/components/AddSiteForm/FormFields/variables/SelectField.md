# Variable: SelectField

> `const` **SelectField**: [`NamedExoticComponent`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/1a60e1b9a9062ff9c48c681ca3d8b6f717b616b9/types/react/index.d.ts#L571)\<[`SelectFieldProperties`](../interfaces/SelectFieldProperties.md)\>

Defined in: [src/components/AddSiteForm/FormFields.tsx:265](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/AddSiteForm/FormFields.tsx#L265)

Select dropdown field component with accessibility and validation.

## Remarks

Renders a select dropdown with options, error/help text, and ARIA attributes.

## Param

[SelectFieldProperties](../interfaces/SelectFieldProperties.md)

## Returns

JSX element containing an accessible select dropdown.

## Example

```tsx
<SelectField
  id="monitorType"
  label="Monitor Type"
  options={[{ label: "HTTP", value: "http" }]}
  value={monitorType}
  onChange={setMonitorType}
/>
```
