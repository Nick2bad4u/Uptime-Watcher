# Variable: RadioGroup

> `const` **RadioGroup**: `NamedExoticComponent`\<[`RadioGroupProperties`](../interfaces/RadioGroupProperties.md)\>

Defined in: [src/components/AddSiteForm/FormFields.tsx:299](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/components/AddSiteForm/FormFields.tsx#L299)

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
