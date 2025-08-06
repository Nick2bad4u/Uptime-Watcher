# ADR-003: Comprehensive Error Handling Strategy

## Status
**Accepted** - Implemented across all layers of the application

## Context
A robust error handling strategy was needed to:
- Prevent cascading failures
- Provide consistent error reporting
- Enable proper debugging and monitoring
- Maintain application stability under error conditions
- Preserve error context and stack traces

## Decision
We will implement a **multi-layered error handling strategy** with shared utilities and consistent patterns across frontend and backend.

### 1. Shared Error Handling Utility
The `withErrorHandling()` function provides unified error handling with overloads for different contexts:

```typescript
// Frontend usage with store integration
await withErrorHandling(async () => {
    return await performAsyncOperation();
}, errorStore);

// Backend usage with logger integration  
await withErrorHandling(async () => {
    return await performAsyncOperation();
}, { logger, operationName: "database-operation" });
```

### 2. Operational Hooks for Database Operations
All database operations use `withDatabaseOperation()` which provides:
- **Retry logic** with exponential backoff
- **Event emission** for operation lifecycle
- **Consistent error handling** across all database operations
- **Performance monitoring** and logging

```typescript
return withDatabaseOperation(
    async () => this.databaseService.executeTransaction(operation),
    "SiteRepository.deleteAll"
);
```

### 3. Frontend Store Error Protection
Frontend stores implement safe error handling to prevent UI crashes:

```typescript
function safeStoreOperation(storeOperation: () => void, operationName: string) {
    try {
        storeOperation();
    } catch (error) {
        console.warn("Store operation failed for:", operationName, error);
    }
}
```

### 4. Error Preservation Principle
All error handling utilities preserve original errors:
- **Stack traces** are maintained
- **Error types** are preserved
- **Error properties** remain intact
- **Re-throwing** after logging/handling

## Error Handling Layers

### Layer 1: Utility Level
```typescript
// Frontend utilities
export async function withUtilityErrorHandling<T>(
    operation: () => Promise<T>,
    operationName: string,
    fallbackValue?: T
): Promise<T> {
    try {
        return await operation();
    } catch (error) {
        logger.error(`${operationName} failed`, error);
        if (fallbackValue !== undefined) {
            return fallbackValue;
        }
        throw error;
    }
}
```

### Layer 2: Repository Level
```typescript
// Database operations with transaction safety
public async deleteAll(): Promise<void> {
    return withDatabaseOperation(async () => {
        return this.databaseService.executeTransaction((db) => {
            this.deleteAllInternal(db);
            return Promise.resolve();
        });
    }, "Repository.deleteAll");
}
```

### Layer 3: Service Level
```typescript
// Service operations with event emission
async performOperation() {
    try {
        const result = await this.repository.operation();
        await this.eventBus.emitTyped('operation:completed', { result });
        return result;
    } catch (error) {
        await this.eventBus.emitTyped('operation:failed', { error: error.message });
        throw error;
    }
}
```

### Layer 4: UI Level
```typescript
// Frontend operations with store integration
const handleAction = async () => {
    await withErrorHandling(async () => {
        const result = await window.electronAPI.sites.addSite(siteData);
        // Success handling
        return result;
    }, errorStore);
};
```

## Error Categories and Handling

### 1. Database Errors
- **Transaction rollback** on failure
- **Retry logic** for transient failures
- **Event emission** for monitoring
- **Structured logging** with operation context

### 2. Network Errors
- **Timeout handling** with configurable limits
- **Retry strategies** based on error type
- **Fallback mechanisms** for offline scenarios
- **Connection state tracking**

### 3. Validation Errors
- **Type-safe validation** at boundaries
- **User-friendly error messages**
- **Field-specific error reporting**
- **Prevention of invalid state propagation**

### 4. UI Errors
- **Error boundaries** for component isolation
- **Graceful degradation** with fallback UI
- **User notification** without technical details
- **State recovery** mechanisms

## Monitoring and Observability

### Event-Driven Error Tracking
```typescript
// Automatic error event emission
await eventBus.emitTyped('database:error', {
    operation: 'query',
    error: error.message,
    correlationId: generateId(),
    timestamp: Date.now()
});
```

### Correlation ID Tracking
All operations include correlation IDs for request tracing across system boundaries.

### Performance Metrics
Operations include timing and retry metrics for performance monitoring.

## Consequences

### Positive
- **System stability** - Errors don't cascade or crash the application
- **Debugging capability** - Rich error context and correlation tracking
- **User experience** - Graceful error handling with appropriate messaging
- **Monitoring** - Comprehensive error tracking and metrics
- **Maintainability** - Consistent error handling patterns

### Negative
- **Code complexity** - Multiple error handling layers
- **Performance overhead** - Error handling adds minimal processing time
- **Learning curve** - Developers need to understand error handling patterns

## Implementation Guidelines

### 1. Always Preserve Errors
```typescript
// ✅ Good - preserves original error
try {
    return await operation();
} catch (error) {
    logger.error("Operation failed", error);
    throw error; // Re-throw original error
}

// ❌ Bad - loses error context
try {
    return await operation();
} catch (error) {
    throw new Error("Operation failed"); // Loses original error
}
```

### 2. Use Appropriate Error Handling Level
- **Utilities**: `withUtilityErrorHandling()`
- **Database**: `withDatabaseOperation()`
- **Frontend**: `withErrorHandling()` with store
- **Backend**: `withErrorHandling()` with logger

### 3. Emit Events for Failures
All significant operations should emit failure events for monitoring.

## Compliance
All layers implement this error handling strategy:
- Repository operations use `withDatabaseOperation()`
- Frontend operations use `withErrorHandling()` with stores
- Utilities provide fallback mechanisms
- Services emit error events

## Related ADRs
- [ADR-001: Repository Pattern](./ADR-001-Repository-Pattern.md)
- [ADR-002: Event-Driven Architecture](./ADR-002-Event-Driven-Architecture.md)
- [ADR-005: IPC Communication Protocol](./ADR-005-IPC-Communication-Protocol.md)
