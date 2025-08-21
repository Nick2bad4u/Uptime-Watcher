# shared/types/validation

Unified validation result types for the Uptime Watcher application.

## Remarks

This module provides a single source of truth for validation result
interfaces, eliminating the duplication that existed across multiple files.

## Interfaces

- [BaseValidationResult](interfaces/BaseValidationResult.md)
- [FormValidationResult](interfaces/FormValidationResult.md)
- [MonitorConfigValidationResult](interfaces/MonitorConfigValidationResult.md)
- [ThemeValidationResult](interfaces/ThemeValidationResult.md)
- [ValidationMetadata](interfaces/ValidationMetadata.md)
- [ValidationResult](interfaces/ValidationResult.md)

## Functions

- [createFailureResult](functions/createFailureResult.md)
- [createSuccessResult](functions/createSuccessResult.md)
- [isValidationResult](functions/isValidationResult.md)
