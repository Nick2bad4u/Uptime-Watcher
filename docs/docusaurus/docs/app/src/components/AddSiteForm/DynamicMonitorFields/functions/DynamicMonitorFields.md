# Function: DynamicMonitorFields()

> **DynamicMonitorFields**(`props`): [`Element`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/1a60e1b9a9062ff9c48c681ca3d8b6f717b616b9/types/react/jsx-runtime.d.ts#L6)

Defined in: [src/components/AddSiteForm/DynamicMonitorFields.tsx:97](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/AddSiteForm/DynamicMonitorFields.tsx#L97)

Renders form fields dynamically based on monitor type configuration loaded from backend.

## Parameters

### props

[`DynamicMonitorFieldsProps`](../interfaces/DynamicMonitorFieldsProps.md)

[DynamicMonitorFieldsProps](../interfaces/DynamicMonitorFieldsProps.md)

## Returns

[`Element`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/1a60e1b9a9062ff9c48c681ca3d8b6f717b616b9/types/react/jsx-runtime.d.ts#L6)

The rendered dynamic monitor fields as a React element.

## Remarks

- Fetches monitor type configuration using [getMonitorTypeConfig](../../../../utils/monitorTypeHelper/functions/getMonitorTypeConfig.md).
- Displays loading and error states as appropriate.
- For each field in the configuration, renders a DynamicField.
- If a field's onChange handler is missing, logs an error.

## Throws

If monitor type configuration fails to load, displays an error message.

## Example

```tsx
<DynamicMonitorFields
  isLoading={false}
  monitorType="http"
  onChange={{ url: setUrl }}
  values={{ url: "https://example.com" }}
/>
```
