# ADR-002: Event-Driven Architecture with TypedEventBus

## Status
**Accepted** - Core communication mechanism throughout the application

## Context
The application needed a way to decouple components and enable reactive communication between:
- Backend services and frontend UI
- Different services within the backend
- Multiple UI components reacting to state changes

Traditional direct method calls would create tight coupling and make the system difficult to extend and test.

## Decision
We will use an **Event-Driven Architecture** based on a custom `TypedEventBus` with the following characteristics:

### 1. Type Safety
```typescript
interface UptimeEvents extends Record<string, unknown> {
    'sites:added': {
        site: Site;
        timestamp: number;
    };
    'monitor:status-changed': {
        monitor: Monitor;
        newStatus: string;
        previousStatus: string;
        timestamp: number;
    };
    'database:transaction-completed': {
        duration: number;
        operation: string;
        success: boolean;
        timestamp: number;
    };
}

// Usage with compile-time type checking
await eventBus.emitTyped('sites:added', {
    site: newSite,
    timestamp: Date.now()
});
```

### 2. Automatic Metadata Injection
- **Correlation IDs** for request tracing
- **Timestamps** for event ordering
- **Event metadata** for debugging and monitoring

### 3. Consistent Event Naming
- **Domain-based naming**: `domain:action` (e.g., `sites:added`, `monitor:status-changed`)
- **Hierarchical structure**: Major category followed by specific action
- **Past tense verbs** for completed actions

### 4. Middleware Support
```typescript
eventBus.use(async (eventName, data, correlationId, next) => {
    logger.debug(`[Event] ${eventName} [${correlationId}]`);
    await next();
});
```

### 5. IPC Event Forwarding
Events are automatically forwarded from backend to frontend through IPC:
```typescript
// Backend emits event
await this.eventBus.emitTyped('monitor:status-changed', eventData);

// Automatically forwarded to frontend via IPC
webContents.send('monitor:status-changed', eventData);
```

## Architecture Flow

```mermaid
Backend Service → TypedEventBus → IPC → Frontend Store → UI Update
     ↓
Other Backend Services (via event listeners)
```

## Event Categories

### 1. Site Events
- `sites:added`
- `sites:updated` 
- `sites:removed`
- `sites:state-synchronized`

### 2. Monitor Events
- `monitor:status-changed`
- `monitor:up`
- `monitor:down`
- `monitor:check-started`
- `monitor:check-completed`

### 3. Database Events
- `database:transaction-completed`
- `database:connection-changed`
- `database:error`

### 4. System Events
- `monitoring:started`
- `monitoring:stopped`
- `app:ready`

## Consequences

### Positive
- **Decoupled architecture** - Components don't need direct references
- **Type safety** - Compile-time checking prevents runtime errors
- **Extensibility** - Easy to add new event listeners without modifying emitters
- **Debugging** - Correlation IDs and metadata enable request tracing
- **Testability** - Easy to mock and verify event emissions

### Negative
- **Complexity** - Indirect flow can be harder to follow initially
- **Performance overhead** - Event processing adds minimal latency
- **Learning curve** - Developers need to understand event-driven patterns

## Implementation Requirements

### Event Emission
```typescript
// In services/managers
await this.eventBus.emitTyped('domain:action', {
    // Event-specific data
    timestamp: Date.now(),
    // ... other properties
});
```

### Event Listening
```typescript
// Type-safe event listening
eventBus.onTyped('domain:action', (data) => {
    // data is properly typed
    // _meta is automatically available
});
```

### IPC Integration
```typescript
// Automatic forwarding in IpcService
private async forwardEventToRenderer(eventName: string, data: unknown) {
    this.webContents?.send(eventName, data);
}
```

## Compliance
All communication follows this pattern:
- Service layer emits domain events
- UI components listen to events via IPC
- Database operations emit lifecycle events
- Error handling emits failure events

## Related ADRs
- [ADR-001: Repository Pattern](./ADR-001-Repository-Pattern.md)
- [ADR-003: Error Handling Strategy](./ADR-003-Error-Handling-Strategy.md)
- [ADR-004: Frontend State Management](./ADR-004-Frontend-State-Management.md)
