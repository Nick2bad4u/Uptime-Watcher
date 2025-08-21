# Variable: TextField

> `const` **TextField**: [`React.NamedExoticComponent`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/80449050d0e5e84f44ffa3fd3dc5651e4747e589/types/react/index.d.ts#L571)\<[`TextFieldProperties`](../interfaces/TextFieldProperties.md)\>

Defined in: [src/components/AddSiteForm/TextField.tsx:123](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/AddSiteForm/TextField.tsx#L123)

Text input field component with accessibility, validation, and themed
styling.

## Remarks

Supports "text", "url", and "number" input types with proper validation and
error display. The component is memoized for performance and integrates with
FormField for consistent styling. Provides ARIA attributes and handles
various input scenarios including min/max for numbers.

## Example

```tsx
<TextField
    id="siteName"
    label="Site Name"
    value={siteName}
    onChange={setSiteName}
    required={true}
    placeholder="Enter site name"
/>;
```

## Param

The component properties

## Returns

JSX element containing an accessible text input field
