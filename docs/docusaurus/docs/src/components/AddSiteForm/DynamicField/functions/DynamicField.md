# Function: DynamicField()

> **DynamicField**(`props`): [`Element`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/80449050d0e5e84f44ffa3fd3dc5651e4747e589/types/react/jsx-runtime.d.ts#L6)

Defined in: [src/components/AddSiteForm/DynamicField.tsx:116](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/AddSiteForm/DynamicField.tsx#L116)

Renders a single form field based on its definition.

## Parameters

### props

[`DynamicFieldProps`](../interfaces/DynamicFieldProps.md)

The component properties

## Returns

[`Element`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/80449050d0e5e84f44ffa3fd3dc5651e4747e589/types/react/jsx-runtime.d.ts#L6)

The rendered field as a React element

## Remarks

This component renders appropriate form fields based on the field type
definition. Supports "number", "text", and "url" field types with proper
validation. For unsupported field types, displays an error message. Numeric
fields handle automatic conversion and validation of input values.

## Example

```tsx
<DynamicField
    disabled={false}
    field={{
        name: "port",
        label: "Port",
        type: "number",
        required: true,
        min: 1,
        max: 65535,
    }}
    onChange={setPort}
    value={8080}
/>;
```
