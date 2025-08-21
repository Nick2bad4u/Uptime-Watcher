# Variable: SelectField

> `const` **SelectField**: [`React.NamedExoticComponent`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/80449050d0e5e84f44ffa3fd3dc5651e4747e589/types/react/index.d.ts#L571)\<[`SelectFieldProperties`](../interfaces/SelectFieldProperties.md)\>

Defined in: [src/components/AddSiteForm/SelectField.tsx:122](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/AddSiteForm/SelectField.tsx#L122)

Select dropdown field component with accessibility, validation, and themed
styling.

## Remarks

Renders a select dropdown with options, error/help text, and ARIA attributes.
The component is memoized for performance and integrates with FormField for
consistent styling. Supports both string and numeric values with proper event
handling.

## Example

```tsx
<SelectField
    id="monitorType"
    label="Monitor Type"
    options={[
        { label: "HTTP", value: "http" },
        { label: "HTTPS", value: "https" },
    ]}
    value={monitorType}
    onChange={setMonitorType}
    required={true}
/>;
```

## Param

The component properties

## Returns

JSX element containing an accessible select dropdown
