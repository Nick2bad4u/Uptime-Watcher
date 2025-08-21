# Variable: logger

> `const` **logger**: `Logger`

Defined in: [electron/utils/logger.ts:137](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/logger.ts#L137)

Main backend logger for general application operations.

## Remarks

Uses "BACKEND" prefix to distinguish from specialized loggers. This is the
primary logger for general application events, startup/shutdown,
configuration changes, and other non-specific operations.

## Example

```typescript
import { logger } from "./logger";

logger.info("Application initializing");
logger.warn("Configuration value missing, using default");
logger.error("Unexpected application error", error);
```
