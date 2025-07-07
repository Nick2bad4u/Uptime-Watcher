<!-- markdownlint-disable -->

# Backend Operational Hooks

This implementation provides a set of reusable hooks for common backend operation patterns, promoting consistency and reliability across the application.

## Overview

The Backend Operational Hooks pattern introduces server-side hooks similar to React hooks but designed for backend operations. These hooks encapsulate common patterns like transaction management, retry logic, and validation.

## Implemented Hooks

### 1. useTransaction

Provides automatic transaction management with correlation IDs and comprehensive logging.

**Features:**

- Automatic transaction wrapping
- Correlation ID generation for tracing
- Start/completion timing
- Error logging with context
- Automatic rollback on failure

**Usage:**

```typescript
import { useTransaction } from "../hooks";

const transaction = useTransaction();

const result = await transaction(async (db) => {
 // All database operations here are wrapped in a transaction
 return await someDbOperation(db);
});
```

### 2. useRetry

Provides intelligent retry logic with exponential/linear backoff strategies.

**Features:**

- Configurable max attempts
- Linear or exponential backoff
- Detailed logging of retry attempts
- Correlation ID tracking
- Customizable delay patterns

**Usage:**

```typescript
import { useRetry } from "../hooks";

const retry = useRetry();

const result = await retry(
 async () => {
  // Operation that might fail
  return await unreliableOperation();
 },
 {
  maxAttempts: 3,
  delay: 1000,
  backoff: "exponential",
 }
);
```

### 3. useValidation

Provides consistent validation patterns with integration to the existing configuration manager.

**Features:**

- Site validation integration
- Monitor validation integration
- Streamlined validation + operation pattern
- ValidationError with detailed error reporting
- Type-safe validation functions

**Usage:**

```typescript
import { useValidation, ValidationError } from "../hooks";

const validation = useValidation();

// Direct validation
const siteResult = validation.validateSite(siteData);
if (!siteResult.isValid) {
 throw new ValidationError(siteResult.errors);
}

// Validation + operation pattern
const result = await validation.withValidation(
 data,
 (data) => validation.validateSite(data as Site),
 async () => {
  // Operation only runs if validation passes
  return await processValidatedData(data);
 }
);
```

## Support Utilities

### Correlation IDs

Every hook operation generates a unique correlation ID for tracing and debugging:

```typescript
import { generateCorrelationId } from "../hooks";

const correlationId = generateCorrelationId();
// Returns: "20240101-1234567890-abc123"
```

### ValidationError

Specialized error class for validation failures:

```typescript
import { ValidationError } from "../hooks";

throw new ValidationError(["Invalid field", "Missing required data"]);
```

## Testing

All hooks are thoroughly tested with comprehensive test suites:

- **useTransaction.test.ts**: Transaction management, error handling, timing
- **useRetry.test.ts**: Retry logic, backoff strategies, edge cases
- **useValidation.test.ts**: Validation patterns, error handling, async operations
- **correlationUtils.test.ts**: Utility functions and error classes
- **index.test.ts**: Module exports and consistency

Run tests with:

```bash
npm test -- electron/test/hooks
```

## Examples

See `electron/hooks/examples.ts` for comprehensive usage examples demonstrating:

1. Individual hook usage patterns
2. Error handling strategies
3. Combining multiple hooks
4. Best practices and common patterns

## Benefits

### 1. Consistency

All operations use standardized patterns for:

- Error handling and logging
- Transaction management
- Retry logic
- Validation

### 2. Observability

Built-in features for monitoring:

- Correlation IDs for request tracing
- Structured logging with timing
- Operation success/failure tracking
- Performance metrics

### 3. Reliability

Improved application reliability through:

- Automatic transaction rollback
- Intelligent retry strategies
- Comprehensive error handling
- Input validation

### 4. Maintainability

Better code organization with:

- Reusable operation patterns
- Centralized error handling
- Testable components
- Clear separation of concerns

### 5. Developer Experience

Enhanced development workflow:

- Consistent APIs across operations
- Comprehensive error messages
- Easy testing and mocking
- Clear documentation and examples

## Integration with Existing Code

The hooks are designed to integrate seamlessly with existing managers and services:

```typescript
export class SiteManager extends EventEmitter {
 private readonly transaction = useTransaction();
 private readonly validation = useValidation();
 private readonly retry = useRetry();

 public async addSite(siteData: Site): Promise<Site> {
  return this.validation.withValidation(
   siteData,
   (data) => this.validation.validateSite(data as Site),
   () =>
    this.transaction(async (db) => {
     // Existing site creation logic here
     return createSite({
      /* existing params */
     });
    })
  );
 }
}
```

## Future Enhancements

This implementation provides a solid foundation for additional operational patterns:

- Caching hooks
- Rate limiting hooks
- Circuit breaker patterns
- Metrics collection hooks
- Distributed tracing integration

The hook pattern makes it easy to add new operational concerns without modifying existing business logic.
