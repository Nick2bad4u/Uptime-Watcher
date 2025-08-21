# Function: DynamicMonitorFields()

> **DynamicMonitorFields**(`props`): [`Element`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/80449050d0e5e84f44ffa3fd3dc5651e4747e589/types/react/jsx-runtime.d.ts#L6)

Defined in: [src/components/AddSiteForm/DynamicMonitorFields.tsx:77](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/AddSiteForm/DynamicMonitorFields.tsx#L77)

Renders form fields dynamically based on monitor type configuration loaded
from backend.

## Parameters

### props

[`DynamicMonitorFieldsProps`](../interfaces/DynamicMonitorFieldsProps.md)

[DynamicMonitorFieldsProps](../interfaces/DynamicMonitorFieldsProps.md)

## Returns

[`Element`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/80449050d0e5e84f44ffa3fd3dc5651e4747e589/types/react/jsx-runtime.d.ts#L6)

The rendered dynamic monitor fields as a React element.

## Remarks

- Fetches monitor type configuration using getMonitorTypeConfig.
- Displays loading and error states as appropriate.
- For each field in the configuration, renders a [DynamicField](../../DynamicField/functions/DynamicField.md).
- If a field's onChange handler is missing, logs an error.

## Example

```tsx
<DynamicMonitorFields
    isLoading={false}
    monitorType="http"
    onChange={{ url: setUrl }}
    values={{ url: "https://example.com" }}
/>;
```

## Throws

If monitor type configuration fails to load, displays an error
  message.
