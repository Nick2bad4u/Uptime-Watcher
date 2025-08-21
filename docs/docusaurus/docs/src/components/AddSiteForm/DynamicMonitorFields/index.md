# src/components/AddSiteForm/DynamicMonitorFields

Dynamic form component that generates monitor fields based on type
configuration. Loads field definitions from backend and renders appropriate
form fields.

## Remarks

- Loads monitor field definitions from the backend using the monitor type.
- Eliminates hard-coded form field rendering.
- Handles loading and error states for monitor type configuration.
- Each field is rendered dynamically based on its definition.

## Interfaces

- [DynamicMonitorFieldsProps](interfaces/DynamicMonitorFieldsProps.md)

## Functions

- [DynamicMonitorFields](functions/DynamicMonitorFields.md)
