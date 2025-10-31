# ADR-003: Comprehensive Error Handling Strategy

## Status

__Accepted__ - Implemented across all layers with production-grade resilience and monitoring

## Context

A robust error handling strategy was needed to:

* Prevent cascading failures and system crashes
* Provide consistent error reporting and user feedback
* Enable comprehensive debugging and monitoring
* Maintain application stability under error conditions
* Preserve error context and stack traces for troubleshooting
* Support production monitoring and alerting
* Handle race conditions and concurrent operation failures

## Decision

We will implement a __comprehensive multi-layered error handling strategy__ with shared utilities, consistent patterns, and production-grade resilience across frontend and backend.

### 1. Enhanced Shared Error Handling Utility

The `withErrorHandling()` function provides unified error handling with context-aware overloads:

```typescript
// Frontend usage with store integration
await withErrorHandling(async () => {
 return await performAsyncOperation();
}, errorStore);

// Backend usage with logger integration and operation naming
await withErrorHandling(
 async () => {
  return await performAsyncOperation();
 },
 {
  logger,
  operationName: "database-operation",
  correlationId: "op-12345",
 }
);

// Utility operations with minimal overhead
await withUtilityErrorHandling(
 async () => doUtilityWork(),
 "utility-operation",
 undefined,
 false // silent mode for non-critical operations
);
```

### 2. Production-Grade Operational Hooks

All database operations use `withDatabaseOperation()` which provides:

* __Exponential backoff retry logic__ with jitter
* __Event emission__ for operation lifecycle and monitoring
* __Consistent error handling__ across all database operations
* __Performance monitoring__ and comprehensive logging
* __Correlation tracking__ for distributed debugging
* __Circuit breaker pattern__ for failing operations

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

* __Stack traces__ are maintained
* __Error types__ are preserved
* __Error properties__ remain intact
* __Re-throwing__ after logging/handling

## Error Handling Layers

### Error Handling Architecture Overview

````mermaid
graph TB
    subgraph "Frontend (React + Zustand)"
        UI["User Interface"]
        Store["Zustand Stores"]
        Components["React Components"]
        ErrorBoundary["Error Boundaries"]
    end

    subgraph "IPC Layer"
        IPC["IPC Communication"]
        ContextBridge["Context Bridge"]
    end

    subgraph "Backend (Electron Main)"
        Services["Service Layer"]
        Repositories["Repository Layer"]
        Database["Database Layer"]
        EventBus["Event Bus"]
    end

    subgraph "Error Handling Utilities"
        WithErrorHandling["withErrorHandling"]
        WithDatabaseOp["withDatabaseOperation"]
        WithUtilityError["withUtilityErrorHandling"]
        SafeStoreOp["safeStoreOperation"]
    end

    subgraph "Monitoring & Observability"
        Correlation["Correlation IDs"]
        Events["Error Events"]
        Metrics["Performance Metrics"]
        Logging["Structured Logging"]
    end

    UI --> Components
    Components --> Store
    Components --> ErrorBoundary
    Store --> WithErrorHandling
    Components --> WithErrorHandling

    WithErrorHandling --> IPC
    IPC --> ContextBridge
    ContextBridge --> Services

    Services --> WithDatabaseOp
    Services --> EventBus
    Repositories --> WithDatabaseOp
    WithDatabaseOp --> Database

    WithErrorHandling --> Events
    WithDatabaseOp --> Events
    WithUtilityError --> Events
    SafeStoreOp --> Logging

    Events --> Correlation
    Events --> Metrics
    Events --> Logging

    classDef frontend fill:#dbeafe,stroke:#2563eb,stroke-width:2px,color:#1e3a8a
    classDef backend fill:#dcfce7,stroke:#16a34a,stroke-width:2px,color:#14532d
    classDef utility fill:#fef3c7,stroke:#d97706,stroke-width:2px,color:#92400e
    classDef monitoring fill:#f3e8ff,stroke:#9333ea,stroke-width:2px,color:#6b21a8

    class UI,Store,Components,ErrorBoundary frontend
    class Services,Repositories,Database,EventBus backend
    class WithErrorHandling,WithDatabaseOp,WithUtilityError,SafeStoreOp utility
    class Correlation,Events,Metrics,Logging monitoring
```### Layer 1: Utility Level

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
````

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
import { SiteService } from "src/services/SiteService";

const handleAction = async () => {
 await withErrorHandling(async () => {
  const result = await SiteService.addSite(siteData);
  // Success handling
  return result;
 }, errorStore);
};
```

## Error Categories and Handling

### Error Processing Pipeline

```mermaid
flowchart TD
    ErrorOccurs["Error Occurs"] --> ErrorType{"Classify Error Type"}

    ErrorType -->|Database Error| DatabaseError["Database Error Handler"]
    ErrorType -->|Network Error| NetworkError["Network Error Handler"]
    ErrorType -->|Validation Error| ValidationError["Validation Error Handler"]
    ErrorType -->|UI Error| UIError["UI Error Handler"]

    subgraph "Database Error Flow"
        DatabaseError --> DatabaseRetry{Retryable?}
        DatabaseRetry -->|Yes| ExponentialBackoff[Apply Exponential Backoff]
        DatabaseRetry -->|No| DatabaseRollback[Transaction Rollback]
        ExponentialBackoff --> DatabaseOperation[Retry Database Operation]
        DatabaseOperation --> DatabaseSuccess{Success?}
        DatabaseSuccess -->|Yes| DatabaseComplete[Operation Complete]
        DatabaseSuccess -->|No| DatabaseRetry
        DatabaseRollback --> DatabaseEvent[Emit Database Error Event]
        DatabaseEvent --> DatabaseComplete
    end

    subgraph Network Error Flow
        NetworkError --> NetworkRetry{Network Available?}
        NetworkRetry -->|Yes| TimeoutCheck[Check Timeout]
        NetworkRetry -->|No| OfflineFallback[Apply Offline Fallback]
        TimeoutCheck --> NetworkOperation[Retry Network Call]
        NetworkOperation --> NetworkSuccess{Success?}
        NetworkSuccess -->|Yes| NetworkComplete[Operation Complete]
        NetworkSuccess -->|No| NetworkRetry
        OfflineFallback --> NetworkComplete
    end

    subgraph Validation Error Flow
        ValidationError --> ValidationCheck["Type-Safe Validation"]
        ValidationCheck --> UserFriendly["Generate User-Friendly Message"]
        UserFriendly --> PreventPropagation[Prevent Invalid State Propagation]
        PreventPropagation --> ValidationComplete["Show Field-Specific Error"]
    end

    subgraph UI Error Flow
        UIError --> ErrorBoundary[Error Boundary Catches]
        ErrorBoundary --> GracefulDegradation[Graceful UI Degradation]
        GracefulDegradation --> FallbackUI[Show Fallback UI]
        FallbackUI --> StateRecovery[Attempt State Recovery]
        StateRecovery --> UIComplete[User Notification]
    end

    DatabaseComplete --> MonitoringSystem["Monitoring & Observability"]
    NetworkComplete --> MonitoringSystem
    ValidationComplete --> MonitoringSystem
    UIComplete --> MonitoringSystem

    subgraph Monitoring System
        MonitoringSystem --> CorrelationTracking[Correlation ID Tracking]
        MonitoringSystem --> EventEmission[Error Event Emission]
        MonitoringSystem --> MetricsCollection[Metrics Collection]
        MonitoringSystem --> StructuredLogging[Structured Logging]
    end

    classDef error fill:#fee2e2,stroke:#dc2626,stroke-width:2px,color:#991b1b
    classDef success fill:#dcfce7,stroke:#16a34a,stroke-width:2px,color:#14532d
    classDef process fill:#dbeafe,stroke:#2563eb,stroke-width:2px,color:#1e3a8a
    classDef monitoring fill:#f3e8ff,stroke:#9333ea,stroke-width:2px,color:#6b21a8

    class ErrorOccurs,DatabaseError,NetworkError,ValidationError,UIError error
    class DatabaseComplete,NetworkComplete,ValidationComplete,UIComplete success
    class ExponentialBackoff,TimeoutCheck,ValidationCheck,ErrorBoundary process
    class MonitoringSystem,CorrelationTracking,EventEmission,MetricsCollection,StructuredLogging monitoring
```

### 1. Database Errors

* __Transaction rollback__ on failure
* __Retry logic__ for transient failures
* __Event emission__ for monitoring
* __Structured logging__ with operation context

### 2. Network Errors

* __Timeout handling__ with configurable limits
* __Retry strategies__ based on error type
* __Fallback mechanisms__ for offline scenarios
* __Connection state tracking__

### 3. Validation Errors

* __Type-safe validation__ at boundaries
* __User-friendly error messages__
* __Field-specific error reporting__
* __Prevention of invalid state propagation__

### 4. UI Errors

* __Error boundaries__ for component isolation
* __Graceful degradation__ with fallback UI
* __User notification__ without technical details
* __State recovery__ mechanisms

## Monitoring and Observability

### Error Event Flow and Correlation Tracking

```mermaid
sequenceDiagram
    participant UI as Frontend UI
    participant Store as Zustand Store
    participant IPC as IPC Layer
    participant Service as Service Layer
    participant Repo as Repository
    participant DB as Database
    participant EventBus as Event Bus
    participant Monitor as Monitoring System

    Note over UI, Monitor: Error Handling with Full Observability

    UI->>Store: User Action
    Store->>+IPC: API Call with Correlation ID
    Note right of IPC: correlationId: "op-12345"

    IPC->>+Service: Service Operation
    Service->>EventBus: Emit operation:started
    EventBus->>Monitor: Log operation start

    Service->>+Repo: Repository Call
    Repo->>+DB: Database Operation

    alt Database Operation Fails
        DB-->>Repo: ❌ Database Error
        Repo->>EventBus: Emit database:error
        EventBus->>Monitor: Log database failure
        Repo->>Repo: Apply Retry Logic
        Repo->>+DB: Retry Operation

        alt Retry Succeeds
            DB-->>Repo: ✅ Success
            Repo-->>Service: ✅ Result
        else Retry Fails
            DB-->>Repo: ❌ Final Failure
            Repo->>EventBus: Emit operation:failed
            EventBus->>Monitor: Record failure metrics
            Repo-->>Service: ❌ Error (preserved)
        end
    else Database Operation Succeeds
        DB-->>Repo: ✅ Success
        Repo-->>Service: ✅ Result
    end

    alt Service Error Handling
        Service->>EventBus: Emit operation:completed
        EventBus->>Monitor: Record success metrics
        Service-->>-IPC: ✅ Result
        IPC-->>-Store: ✅ Success Response
        Store->>UI: Update UI State
    else Service Fails
        Service->>EventBus: Emit operation:failed
        EventBus->>Monitor: Track failure correlation
        Service-->>-IPC: ❌ Error Response
        IPC-->>-Store: ❌ Error (with correlation)
        Store->>Store: Handle Error Gracefully
        Store->>UI: Show Error Message
    end

    Note over Monitor: All events tracked with correlation ID "op-12345"
    Monitor->>Monitor: Generate Error Report
    Monitor->>Monitor: Update System Metrics
```

### Event-Driven Error Tracking

```typescript
// Automatic error event emission
await eventBus.emitTyped("database:error", {
 operation: "query",
 error: error.message,
 correlationId: generateId(),
 timestamp: Date.now(),
});
```

### Advanced Memory Safety and Resource Management

Error handling utilities ensure proper resource cleanup:

```typescript
// Automatic cleanup in event handlers
import { EventsService } from "src/services/EventsService";

const registerStatusListener = async () =>
 await EventsService.onMonitorStatusChanged((data) => {
  try {
   handleStatusChange(data);
  } catch (error) {
   logger.error("Status change handler failed", error);
   // Handler failure doesn't affect cleanup
  }
 });

// Cleanup always called even if handler throws
useEffect(() => {
 let cleanup: (() => void) | undefined;

 void registerStatusListener().then((unsubscribe) => {
  cleanup = unsubscribe;
 });

 return () => {
  cleanup?.();
 };
}, []);
```

### Race Condition Protection

```mermaid
stateDiagram-v2
    [*] --> OperationInitiated : Start Operation

    OperationInitiated --> OperationRegistered : Register with operationId
    OperationRegistered --> OperationInProgress : Begin Async Work

    OperationInProgress --> ValidationCheck : Operation Completes
    OperationInProgress --> OperationCancelled : Race Condition Detected
    OperationInProgress --> OperationFailed : Operation Error

    ValidationCheck --> OperationValid : Operation Still Active
    ValidationCheck --> OperationInvalid : Operation Superseded

    OperationValid --> StateUpdate : Update Application State
    OperationInvalid --> OperationCancelled : Discard Results

    StateUpdate --> OperationCompleted : Success
    OperationFailed --> ErrorHandling : Handle Error
    OperationCancelled --> CleanupResources : Cleanup

    ErrorHandling --> CleanupResources : After Error Processing
    OperationCompleted --> CleanupResources : After Success

    CleanupResources --> [*] : Operation Finalized

    note right of ValidationCheck
        Correlation ID validation prevents
        race conditions and stale updates
    end note

    note right of ErrorHandling
        Errors preserve context and
        emit events for monitoring
    end note
```

### Correlation ID Tracking

All operations include correlation IDs for distributed tracing:

```typescript
const correlationId = generateCorrelationId();
await this.eventBus.emitTyped("operation:started", {
 operationId,
 correlationId,
 timestamp: Date.now(),
});
```

### Production Monitoring Integration

Operations include comprehensive metrics for observability:

```typescript
const startTime = performance.now();
try {
 const result = await operation();
 metrics.recordSuccess(operationName, performance.now() - startTime);
 return result;
} catch (error) {
 metrics.recordFailure(operationName, error.constructor.name);
 throw error;
}
```

## Consequences

### Positive

* __Enhanced system stability__ - Errors don't cascade or crash the application
* __Superior debugging capability__ - Rich error context and correlation tracking
* __Optimal user experience__ - Graceful error handling with appropriate messaging
* __Comprehensive monitoring__ - Error tracking, metrics, and observability
* __Excellent maintainability__ - Consistent error handling patterns across all layers
* __Memory safety__ - Proper resource cleanup and leak prevention
* __Race condition immunity__ - Operation correlation prevents state corruption
* __Production readiness__ - Circuit breakers and retry mechanisms

### Negative

* __Moderate complexity increase__ - Multiple error handling layers require understanding
* __Minimal performance overhead__ - Error handling adds negligible processing time
* __Learning curve__ - Developers need to understand comprehensive error handling patterns
* __Debugging complexity__ - Rich error context requires proper tooling to interpret

## Quality Assurance

### Memory Management

* __Automatic cleanup__: All error handlers ensure resource cleanup
* __Event listener management__: Cleanup functions prevent memory leaks
* __Resource disposal__: Failed operations properly dispose of allocated resources

### Concurrency Safety

* __Operation correlation__: Prevents race conditions in async operations
* __State validation__: Operations validate state before making changes
* __Atomic operations__: Critical sections use proper synchronization

### Production Monitoring

* __Error classification__: Errors categorized by severity and type
* __Metric collection__: Performance and failure metrics for alerting
* __Distributed tracing__: Correlation IDs enable cross-service debugging

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

* __Utilities__: `withUtilityErrorHandling()`
* __Database__: `withDatabaseOperation()`
* __Frontend__: `withErrorHandling()` with store
* __Backend__: `withErrorHandling()` with logger

### 3. Emit Events for Failures

All significant operations should emit failure events for monitoring.

## Compliance

All layers implement this error handling strategy:

* Repository operations use `withDatabaseOperation()`
* Frontend operations use `withErrorHandling()` with stores
* Utilities provide fallback mechanisms
* Services emit error events

## Related ADRs

* [ADR-001: Repository Pattern](./ADR_001_REPOSITORY_PATTERN.md)
* [ADR-002: Event-Driven Architecture](./ADR_002_EVENT_DRIVEN_ARCHITECTURE.md)
* [ADR-005: IPC Communication Protocol](./ADR_005_IPC_COMMUNICATION_PROTOCOL.md)
