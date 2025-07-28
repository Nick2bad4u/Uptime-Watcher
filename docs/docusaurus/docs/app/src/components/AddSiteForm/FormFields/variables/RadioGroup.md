# Variable: RadioGroup

> `const` **RadioGroup**: [`NamedExoticComponent`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/1a60e1b9a9062ff9c48c681ca3d8b6f717b616b9/types/react/index.d.ts#L571)\<[`RadioGroupProperties`](../interfaces/RadioGroupProperties.md)\>

Defined in: [src/components/AddSiteForm/FormFields.tsx:370](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/AddSiteForm/FormFields.tsx#L370)

RadioGroup component for selecting one option from multiple choices.

## Remarks

Provides an accessible radio button group with ARIA attributes and keyboard navigation.

## Param

[RadioGroupProperties](../interfaces/RadioGroupProperties.md)

## Returns

JSX element containing a radio button group.

## Example

```tsx
<RadioGroup
  id="protocol"
  label="Protocol"
  name="protocol"
  value={formData.protocol}
  onChange={(value) => setFormData(prev => ({ ...prev, protocol: value }))}
  options={[
    { label: 'HTTP', value: 'http' },
    { label: 'HTTPS', value: 'https' }
  ]}
  required
/>
```
