# electron/utils/operationalHooks

Operational hooks utility for standardizing error handling, retries, and
event emission across the Electron backend.

## Remarks

Provides consistent patterns for async operations with observability, retry
logic, and event-driven architecture support. This utility standardizes how
backend operations handle failures, emit events, and provide monitoring
visibility across the application.

Key features:

- Consistent error handling patterns for all backend operations
- Configurable retry logic with exponential/linear backoff strategies
- Automatic event emission for operation lifecycle tracking
- Performance monitoring and observability hooks
- Standardized logging with operation context
- Type-safe operation contracts and event payloads

## Examples

```typescript
import { withHooks } from "./operationalHooks";
import { eventBus } from "../events/TypedEventBus";

const result = await withHooks(
    async () => await database.createSite(siteData),
    {
        operationName: "createSite",
        maxRetries: 3,
        backoff: "exponential",
        eventBus,
        context: { userId: "123", siteUrl: "example.com" },
    }
);
```

```typescript
const config: OperationalHooksConfig = {
    operationName: "updateMonitorStatus",
    onError: (error, attempt, config) => {
        logger.warn(
            `Attempt ${attempt} failed for ${config.operationName}`,
            error
        );
        return attempt < 2; // Only retry first 2 failures
    },
    onSuccess: (result, config) => {
        logger.info(
            `Operation ${config.operationName} completed successfully`
        );
    },
};
```

## Interfaces

- [OperationalHooksConfig](interfaces/OperationalHooksConfig.md)

## Functions

- [withOperationalHooks](functions/withOperationalHooks.md)
- [withDatabaseOperation](functions/withDatabaseOperation.md)
