# shared/types/formData

Form data type definitions for Uptime Watcher monitor forms.

## Remarks

These interfaces provide type-safe form data structures for creating and
editing monitors. Each monitor type has its own specific form data interface
that extends the base form data. This ensures proper validation and type
checking throughout the form handling pipeline.

## Interfaces

- [AddSiteFormState](interfaces/AddSiteFormState.md)
- [BaseFormData](interfaces/BaseFormData.md)
- [DefaultFormData](interfaces/DefaultFormData.md)
- [HttpFormData](interfaces/HttpFormData.md)
- [MonitorFieldValidation](interfaces/MonitorFieldValidation.md)
- [PingFormData](interfaces/PingFormData.md)
- [PortFormData](interfaces/PortFormData.md)
- [SiteFormData](interfaces/SiteFormData.md)

## Type Aliases

- [FormMode](type-aliases/FormMode.md)
- [MonitorFormData](type-aliases/MonitorFormData.md)

## Variables

- [DEFAULT\_FORM\_DATA](variables/DEFAULT_FORM_DATA.md)

## Functions

- [isHttpFormData](functions/isHttpFormData.md)
- [isPingFormData](functions/isPingFormData.md)
- [isPortFormData](functions/isPortFormData.md)
