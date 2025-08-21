# shared/utils/logTemplates

Standardized log message templates for consistent logging across the
application.

## Remarks

This module provides templates for common log messages to ensure consistency
while maintaining flexibility for dynamic content. Unlike ERROR_CATALOG,
these templates support interpolation and contextual information.

**Usage Guidelines:**

- Use for repeated log patterns across the codebase
- Templates support string interpolation for dynamic content
- Keep ERROR_CATALOG for user-facing errors
- Keep contextual debug logs as-is for performance

## Example

```typescript
import { LOG_TEMPLATES } from "@shared/utils/logTemplates";

// Instead of: logger.info(`[SiteManager] Initialized with ${count} sites in cache`);
logger.info(LOG_TEMPLATES.services.SITE_MANAGER_INITIALIZED, { count });
```

## Interfaces

- [LogTemplatesInterface](interfaces/LogTemplatesInterface.md)

## Type Aliases

- [LogTemplate](type-aliases/LogTemplate.md)

## Variables

- [SERVICE\_LOGS](variables/SERVICE_LOGS.md)
- [DEBUG\_LOGS](variables/DEBUG_LOGS.md)
- [ERROR\_LOGS](variables/ERROR_LOGS.md)
- [WARNING\_LOGS](variables/WARNING_LOGS.md)
- [LOG\_TEMPLATES](variables/LOG_TEMPLATES.md)

## Functions

- [interpolateLogTemplate](functions/interpolateLogTemplate.md)
- [createTemplateLogger](functions/createTemplateLogger.md)
