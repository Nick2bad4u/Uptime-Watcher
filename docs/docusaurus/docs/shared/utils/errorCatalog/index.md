# shared/utils/errorCatalog

Centralized error message catalog for consistent error handling across the
application.

## Remarks

This module provides a comprehensive collection of standardized error
messages organized by domain and operation type. Using these constants
ensures consistent error messaging across frontend, backend, and shared code
while improving maintainability and preventing typos.

The error messages are categorized by functional domain:

- **Site Operations**: Site CRUD and management operations
- **Monitor Operations**: Monitor configuration and management
- **Validation Errors**: Data validation and constraint violations
- **System Errors**: General system and infrastructure errors
- **Network Errors**: Connection and communication errors
- **Database Errors**: Data persistence and retrieval errors

## Example

```typescript
import { ERROR_CATALOG } from "@shared/utils/errorCatalog";

// Use categorized error messages
throw new Error(ERROR_CATALOG.sites.notFound);
throw new Error(ERROR_CATALOG.monitors.configurationInvalid);
```

## Interfaces

- [ErrorCatalogInterface](interfaces/ErrorCatalogInterface.md)

## Type Aliases

- [ErrorMessage](type-aliases/ErrorMessage.md)

## Variables

- [SITE\_ERRORS](variables/SITE_ERRORS.md)
- [MONITOR\_ERRORS](variables/MONITOR_ERRORS.md)
- [VALIDATION\_ERRORS](variables/VALIDATION_ERRORS.md)
- [SYSTEM\_ERRORS](variables/SYSTEM_ERRORS.md)
- [NETWORK\_ERRORS](variables/NETWORK_ERRORS.md)
- [DATABASE\_ERRORS](variables/DATABASE_ERRORS.md)
- [IPC\_ERRORS](variables/IPC_ERRORS.md)
- [ERROR\_CATALOG](variables/ERROR_CATALOG.md)

## Functions

- [formatErrorMessage](functions/formatErrorMessage.md)
- [isKnownErrorMessage](functions/isKnownErrorMessage.md)
