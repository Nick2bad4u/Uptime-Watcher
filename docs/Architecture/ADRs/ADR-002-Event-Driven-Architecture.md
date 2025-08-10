# ADR-002: Event-Driven Architecture with TypedEventBus

## Status

**Accepted** - Core communication mechanism with advanced middleware and memory management

## Context

The application needed a way to decouple components and enable reactive communication between:

- Backend services and frontend UI
- Different services within the backend
- Multiple UI components reacting to state changes
- Cross-cutting concerns like logging, monitoring, and error handling

Traditional direct method calls would create tight coupling, make the system difficult to extend and test, and provide no mechanism for monitoring or debugging inter-component communication.

## Decision

We will use an **Event-Driven Architecture** based on a custom `TypedEventBus` with the following characteristics:

### 1. Enhanced Type Safety

```typescript
interface UptimeEvents extends Record<string, unknown> {
 "sites:added": {
  site: Site;
  timestamp: number;
  correlationId: string;
 };
 "monitor:status-changed": {
  monitor: Monitor;
  newStatus: "up" | "down";
  previousStatus: "up" | "down";
  timestamp: number;
  responseTime?: number;
  error?: string;
 };
 "database:transaction-completed": {
  duration: number;
  operation: string;
  success: boolean;
  timestamp: number;
 };
 "system:error": {
  error: Error;
  context: string;
  severity: "low" | "medium" | "high" | "critical";
  recovery?: string;
  timestamp: number;
 };
}

// Usage with compile-time type checking
await eventBus.emitTyped("sites:added", {
 site: newSite,
 timestamp: Date.now(),
 correlationId: generateCorrelationId(),
});
```

### 2. Advanced Metadata and Correlation

- **Unique correlation IDs** for request tracing across system boundaries
- **Automatic timestamps** for event ordering and debugging
- **Bus identification** for multi-bus architectures
- **Event metadata** enrichment for comprehensive monitoring

### 3. Consistent Event Naming

- **Domain-based naming**: `domain:action` (e.g., `sites:added`, `monitor:status-changed`)
- **Hierarchical structure**: Major category followed by specific action
- **Past tense verbs** for completed actions

### 4. Production-Ready Middleware Support

```typescript
// Logging middleware with correlation tracking
eventBus.use(async (eventName, data, next) => {
 const correlationId = data._meta?.correlationId;
 logger.debug(`[Event] ${eventName} [${correlationId}]`, data);
 await next();
 logger.debug(`[Event] ${eventName} completed [${correlationId}]`);
});

// Rate limiting middleware
eventBus.use(
 createRateLimitMiddleware({
  maxEventsPerSecond: 100,
  burstLimit: 10,
  onRateLimit: (eventName, data) => {
   logger.warn(`Rate limit exceeded for ${eventName}`);
  },
 })
);

// Validation middleware
eventBus.use(
 createValidationMiddleware({
  "monitor:status-changed": (data) => validateMonitorStatusData(data),
  "sites:added": (data) => validateSiteData(data),
 })
);
```

### 5. Memory-Safe IPC Event Forwarding

Events are automatically forwarded from backend to frontend with proper cleanup:

```typescript
// Backend emits event with automatic IPC forwarding
await this.eventBus.emitTyped("monitor:status-changed", eventData);

// Frontend receives with automatic cleanup functions
const cleanup = window.electronAPI.events.onMonitorStatusChanged((data) => {
 // Handle event
});

// Cleanup prevents memory leaks
useEffect(() => cleanup, []);
```

### 6. Advanced Memory Management

- **Max listeners**: Configurable limit (default: 50) prevents memory leaks
- **Automatic cleanup**: All event listeners provide cleanup functions
- **Middleware limits**: Configurable middleware chain size (default: 20)
- **Event validation**: Type-safe event structures prevent runtime errors

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
- **Enhanced type safety** - Compile-time checking prevents runtime errors
- **Extensibility** - Easy to add new event listeners without modifying emitters
- **Advanced debugging** - Correlation IDs and metadata enable comprehensive request tracing
- **Superior testability** - Easy to mock and verify event emissions
- **Memory safety** - Automatic cleanup and configurable limits prevent leaks
- **Production monitoring** - Middleware enables comprehensive observability
- **Cross-cutting concerns** - Logging, validation, and rate limiting handled declaratively

### Negative

- **Initial complexity** - Indirect flow can be harder to follow initially
- **Minimal performance overhead** - Event processing adds negligible latency
- **Learning curve** - Developers need to understand event-driven patterns
- **Debugging complexity** - Async event flows require correlation tracking

## Quality Assurance

### Memory Management

- **Automatic cleanup**: All event listeners return cleanup functions
- **Configurable limits**: Max listeners and middleware prevent resource exhaustion
- **Leak prevention**: Proper cleanup in component unmount lifecycle

### Error Handling

- **Middleware isolation**: Errors in one middleware don't affect others
- **Event validation**: Type-safe structures prevent runtime errors
- **Error propagation**: Failed events don't crash the event bus

### Performance

- **Rate limiting**: Middleware prevents event flooding
- **Efficient forwarding**: IPC events use optimized serialization
- **Minimal overhead**: Event processing designed for production use

## Implementation Requirements

### Event Emission

```typescript
// In services/managers
await this.eventBus.emitTyped("domain:action", {
 // Event-specific data
 timestamp: Date.now(),
 // ... other properties
});
```

### Event Listening

```typescript
// Type-safe event listening
eventBus.onTyped("domain:action", (data) => {
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
