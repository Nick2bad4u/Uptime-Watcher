# Variable: RadioGroup

> `const` **RadioGroup**: [`React.NamedExoticComponent`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/80449050d0e5e84f44ffa3fd3dc5651e4747e589/types/react/index.d.ts#L571)\<[`RadioGroupProperties`](../interfaces/RadioGroupProperties.md)\>

Defined in: [src/components/AddSiteForm/RadioGroup.tsx:126](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/AddSiteForm/RadioGroup.tsx#L126)

RadioGroup component for selecting one option from multiple choices with
accessibility support.

## Remarks

Provides an accessible radio button group with ARIA attributes and keyboard
navigation. The component is memoized for performance and integrates with
FormField for consistent styling. Each radio option is rendered with proper
labeling and event handling.

## Example

```tsx
<RadioGroup
    id="protocol"
    label="Protocol"
    name="protocol"
    value={formData.protocol}
    onChange={(value) =>
        setFormData((prev) => ({ ...prev, protocol: value }))
    }
    options={[
        { label: "HTTP", value: "http" },
        { label: "HTTPS", value: "https" },
    ]}
    required
/>;
```

## Param

The component properties

## Returns

JSX element containing a radio button group
