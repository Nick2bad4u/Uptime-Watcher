# src/types/monitorFormData

Type definitions for monitor form data. Provides type-safe interfaces for
form handling and validation.

## Remarks

These interfaces define the structure of form data used throughout the
application for creating and editing monitors. They help avoid index
signature access issues while maintaining type safety for form operations.

## Interfaces

- [BaseFormData](interfaces/BaseFormData.md)
- [DynamicFormData](interfaces/DynamicFormData.md)
- [HttpFormData](interfaces/HttpFormData.md)
- [PingFormData](interfaces/PingFormData.md)
- [PortFormData](interfaces/PortFormData.md)
- [DnsFormData](interfaces/DnsFormData.md)

## Type Aliases

- [MonitorFormData](type-aliases/MonitorFormData.md)

## Functions

- [createDefaultFormData](functions/createDefaultFormData.md)
- [isHttpFormData](functions/isHttpFormData.md)
- [isDnsFormData](functions/isDnsFormData.md)
- [isPingFormData](functions/isPingFormData.md)
- [isPortFormData](functions/isPortFormData.md)
- [isValidMonitorFormData](functions/isValidMonitorFormData.md)
- [safeGetFormProperty](functions/safeGetFormProperty.md)
- [safeSetFormProperty](functions/safeSetFormProperty.md)
