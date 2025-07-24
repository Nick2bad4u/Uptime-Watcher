# Variable: RadioGroup

> `const` **RadioGroup**: [`NamedExoticComponent`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/1a60e1b9a9062ff9c48c681ca3d8b6f717b616b9/types/react/index.d.ts#L571)\<[`RadioGroupProperties`](../interfaces/RadioGroupProperties.md)\>

Defined in: [src/components/AddSiteForm/FormFields.tsx:299](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/components/AddSiteForm/FormFields.tsx#L299)

RadioGroup component for selecting one option from multiple choices.
Provides an accessible radio button group with proper ARIA attributes and keyboard navigation.

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
