# electron/utils/correlation

Correlation ID utilities and validation error handling for tracking
operations across the backend.

## Remarks

Provides unique identifiers for request/operation tracking and debugging in
the Electron main process. Includes validation error handling for business
rule violations. Uses Node.js built-in crypto module for secure random ID
generation.

Key features:

- Cryptographically secure correlation ID generation
- Validation error class with multiple error support
- Backend-specific utilities for Electron main process
- Operation tracking across service boundaries
- Debugging aid for distributed operations

## Example

```typescript
import { generateCorrelationId, ValidationError } from "./correlation";

// Generate secure correlation ID
const operationId = generateCorrelationId();
console.log(operationId); // "a1b2c3d4e5f67890"

// Throw validation errors with multiple messages
throw new ValidationError([
    "Invalid email format",
    "Password too short",
]);
```

## Classes

- [ValidationError](classes/ValidationError.md)

## Functions

- [generateCorrelationId](functions/generateCorrelationId.md)
