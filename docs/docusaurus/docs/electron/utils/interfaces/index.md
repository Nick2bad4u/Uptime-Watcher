# electron/utils/interfaces

Shared interfaces and contracts for utility modules in the Electron backend.

## Remarks

Contains common interface definitions used across multiple utility files
providing consistent contracts for logging, error handling, and operations.
These interfaces ensure standardized behavior patterns throughout the backend
service layer.

Key interfaces:

- Logger: Standardized logging interface for consistent log formatting
- Error handling contracts for utilities and services
- Common operation patterns for backend utilities
- Shared contracts for service communication

## Example

```typescript
import { Logger } from "./interfaces";

class MyUtility {
    constructor(private logger: Logger) {}

    async performOperation(): Promise<void> {
        this.logger.info("Starting operation");
        try {
            // Operation logic
            this.logger.debug("Operation completed successfully");
        } catch (error) {
            this.logger.error("Operation failed", error);
            throw error;
        }
    }
}
```

## Interfaces

- [Logger](interfaces/Logger.md)
