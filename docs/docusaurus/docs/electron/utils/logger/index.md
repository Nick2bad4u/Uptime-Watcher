# electron/utils/logger

Centralized logging utilities for the Electron main process.

## Remarks

Provides structured logging with consistent formatting and categorization.
Supports multiple specialized loggers with distinct prefixes for easy
identification and filtering of log messages during development and
debugging.

## Example

```typescript
import { logger, dbLogger, monitorLogger } from "./logger";

logger.info("Application started");
dbLogger.debug("Query executed", { sql: "SELECT * FROM users" });
monitorLogger.error("Monitor check failed", error);
```

## Variables

- [logger](variables/logger.md)
- [dbLogger](variables/dbLogger.md)
- [monitorLogger](variables/monitorLogger.md)
