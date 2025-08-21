# Variable: FormField

> `const` **FormField**: [`React.NamedExoticComponent`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/80449050d0e5e84f44ffa3fd3dc5651e4747e589/types/react/index.d.ts#L571)\<[`FormFieldProperties`](../interfaces/FormFieldProperties.md)\>

Defined in: [src/components/AddSiteForm/FormField.tsx:93](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/AddSiteForm/FormField.tsx#L93)

Reusable form field wrapper component with label, error handling, and
accessibility features.

## Remarks

This component provides consistent styling and accessibility for all form
fields. It displays a label with optional required indicator, error/help
text, and wraps the input element. The component uses proper ARIA attributes
for accessibility and is memoized for performance.

## Example

```tsx
<FormField
    id="password"
    label="Password"
    required={true}
    error={validationError}
>
    <input type="password" id="password" />
</FormField>;
```

## Param

The component properties

## Returns

JSX element containing labeled form field with error/help text
