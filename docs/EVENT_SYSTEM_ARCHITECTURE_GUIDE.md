# Comprehensive Event System Architecture Guide

<!-- markdownlint-disable -->

## Overview

The Uptime Watcher application implements a sophisticated, type-safe event system built on a custom `TypedEventBus` that enhances Node.js's EventEmitter with compile-time type safety, middleware processing, and comprehensive observability features.

## Architecture Components

### 1. Core Event Bus (`TypedEventBus`)

**Location**: `electron/events/TypedEventBus.ts`

The `TypedEventBus` is the foundation of the event system, providing:

- **Type Safety**: Compile-time verification of event names and data structures
- **Middleware Support**: Pluggable processing pipeline for cross-cutting concerns
- **Enhanced Metadata**: Automatic correlation IDs, timestamps, and bus identification
- **Diagnostic Capabilities**: Built-in monitoring and debugging features

#### Key Features:

```typescript
class TypedEventBus<EventMap extends Record<string, unknown>> extends EventEmitter {
 // Middleware processing chain
 private readonly middlewares: EventMiddleware[] = [];

 // Unique bus identifier for tracking
 private readonly busId: string;

 // Type-safe event emission
 async emitTyped<K extends keyof EventMap>(event: K, data: EventMap[K]): Promise<void>;
}
```

#### Automatic Event Enhancement:

Every emitted event automatically receives:

- **Correlation ID**: Unique identifier for tracing
- **Bus ID**: Source bus identification
- **Timestamp**: Event creation time
- **Event Name**: For middleware processing

### 2. Event Type System (`eventTypes.ts`)

**Location**: `electron/events/eventTypes.ts`

#### Event Categories:

1. **Site Events** - Site lifecycle management

   - `site:added`, `site:updated`, `site:removed`
   - `site:cache-updated`, `site:cache-miss`

2. **Monitor Events** - Monitor status and lifecycle

   - `monitor:added`, `monitor:removed`, `monitor:status-changed`
   - `monitor:check-completed`

3. **Database Events** - Database operations and transactions

   - `database:transaction-completed`, `database:backup-created`
   - `database:retry`, `database:error`, `database:success`

4. **System Events** - Application lifecycle

   - `system:startup`, `system:shutdown`, `system:error`

5. **Monitoring Service Events** - Service state management

   - `monitoring:started`, `monitoring:stopped`

6. **Internal Events** - Manager-to-manager communication
   - `internal:site:*`, `internal:monitor:*`, `internal:database:*`

#### Type Safety Implementation:

```typescript
export interface UptimeEvents extends Record<string, unknown> {
 "site:cache-updated": {
  identifier: string;
  operation: "background-load" | "cache-updated" | "manual-refresh";
  timestamp: number;
 };

 "database:retry": {
  operation: string;
  attempt: number;
  timestamp: number;
  [key: string]: unknown; // Extensible context
 };
 // ... 50+ more typed events
}
```

#### Event Priority System:

```typescript
export const EVENT_PRIORITIES = {
 CRITICAL: ["performance:warning", "system:error", "system:shutdown"],
 HIGH: ["database:transaction-completed", "monitor:status-changed"],
 LOW: ["performance:metric"],
 MEDIUM: ["config:changed", "monitor:added"],
} as const;
```

### 3. Middleware System (`middleware.ts`)

**Location**: `electron/events/middleware.ts`

The middleware system provides cross-cutting concerns processing:

#### Available Middleware:

1. **Logging Middleware**

   ```typescript
   createLoggingMiddleware({
    level: "info",
    includeData: false,
    filter: (eventName) => !eventName.startsWith("internal:"),
   });
   ```

2. **Error Handling Middleware**

   ```typescript
   createErrorHandlingMiddleware({
    onError: (error, event, data) => logger.error(`Event error: ${event}`, error),
    continueOnError: true,
   });
   ```

3. **Metrics Middleware**

   ```typescript
   createMetricsMiddleware({
    trackCounts: true,
    trackTiming: true,
    metricsCallback: (metric) => telemetry.record(metric),
   });
   ```

4. **Rate Limiting Middleware**

   ```typescript
   createRateLimitMiddleware({
    maxEventsPerSecond: 100,
    burstLimit: 10,
   });
   ```

5. **Validation Middleware**
   ```typescript
   createValidationMiddleware({
    "site:added": (data) => data.site && data.timestamp,
    "database:error": (data) => data.operation && data.error,
   });
   ```

#### Middleware Composition:

```typescript
// Middleware executes in registration order
eventBus.use(createErrorHandlingMiddleware({ continueOnError: true }));
eventBus.use(createLoggingMiddleware({ includeData: false, level: "info" }));
eventBus.use(createMetricsMiddleware({ trackCounts: true }));
```

### 4. Event Emission Patterns

#### Standard Event Emission:

```typescript
// Type-safe emission with automatic enhancement
await this.eventEmitter.emitTyped("site:cache-updated", {
 identifier: siteId,
 operation: "background-load",
 timestamp: Date.now(),
});
```

#### Operational Hooks Integration:

```typescript
// Events emitted through operational hooks framework
return withDatabaseOperation(async () => performDatabaseQuery(), "monitor-lookup", this.eventEmitter, {
 monitorId: "123",
});
// Automatically emits: database:retry, database:success/error
```

#### Silent Event Emission:

```typescript
// Non-blocking event emission with error isolation
this.eventEmitter
 .emitTyped("site:cache-miss", { identifier, operation: "cache-lookup" })
 .catch((error) => logger.debug("Event emission failed", error));
```

### 5. Event Consumption Patterns

#### Direct Event Listeners:

```typescript
eventBus.on("site:cache-updated", (enhancedData) => {
 const { identifier, operation } = enhancedData;
 const { correlationId, timestamp } = enhancedData._meta;

 // React to cache update
 updateUIForSite(identifier);
});
```

#### Frontend Integration (IPC Bridge):

```typescript
// Preload script exposes events to renderer
contextBridge.exposeInMainWorld("electronAPI", {
 events: {
  onTyped: (eventName, callback) => {
   ipcRenderer.on(`event:${eventName}`, (_, data) => callback(data));
  },
 },
});
```

#### React Hook Integration:

```typescript
useEffect(() => {
 const unsubscribe = window.electronAPI?.events.onTyped?.("site:cache-updated", (data) => {
  // Trigger UI update when cache updates
  refreshSites();
 });
 return unsubscribe;
}, [refreshSites]);
```

## Return Pattern Analysis Results

### Analyzed Return Patterns:

After comprehensive analysis of the codebase, I identified the following return statement patterns:

#### 1. **Guard Clause Returns (✅ KEEP AS-IS)**

These are appropriate early returns for safety:

```typescript
// WindowService - Guard against missing window
if (!this.mainWindow) return;

// NotificationService - Feature flag checks
if (!this.config.showDownAlerts) return;

// Database operations - Transaction safety
if (!monitor.id) return;
```

**Analysis**: These are legitimate guard clauses that prevent errors and should remain unchanged.

#### 2. **Data Retrieval Returns (✅ MODERNIZED)**

These represent actual data lookup failures:

```typescript
// BEFORE: Silent null returns
public getSiteFromCache(identifier: string): Site | undefined {
    return this.sites.get(identifier);
}

// AFTER: Smart cache with background loading
public getSiteFromCache(identifier: string): Site | undefined {
    const site = this.sites.get(identifier);
    if (!site) {
        // Emit event + trigger background loading
        this.eventEmitter.emitTyped("site:cache-miss", { identifier });
        this.loadSiteInBackground(identifier);
    }
    return site;
}
```

#### 3. **Utility Function Returns (✅ KEEP AS-IS)**

These are legitimate undefined/null returns for utilities:

```typescript
// Value converters - Legitimate type conversion failures
function safeNumberConvert(value: unknown): number | undefined {
 if (typeof value === "number") return value;
 return undefined; // Appropriate for type conversion
}

// React components - Standard React pattern
if (!data) return null; // React convention for "render nothing"
```

#### 4. **Error Handling Returns (🔄 MODERNIZED)**

These were enhanced with operational hooks:

```typescript
// BEFORE: Silent failure returns
catch (error) {
    logger.error("Operation failed", error);
    return undefined;
}

// AFTER: Retry with event emission
return withOperationalHooks(operation, {
    onRetry: (attempt) => emit("database:retry", { attempt }),
    onFailure: (error) => emit("database:error", { error })
});
```

### Summary of Return Pattern Modernization:

| Pattern Type      | Count | Action Taken  | Event Integration                  |
| ----------------- | ----- | ------------- | ---------------------------------- |
| Guard Clauses     | 15+   | ✅ Keep as-is | None needed                        |
| Cache Misses      | 3     | 🔄 Modernized | `cache-miss`, `cache-updated`      |
| Database Errors   | 8+    | 🔄 Modernized | `database:retry`, `database:error` |
| React Components  | 5+    | ✅ Keep as-is | Standard React pattern             |
| Utility Functions | 10+   | ✅ Keep as-is | Legitimate null/undefined          |

## Event Flow Examples

### 1. Cache Miss to Background Loading Flow:

```folder
User Request → getSiteFromCache() → Cache Miss Detected
    ↓
Event: "site:cache-miss" → Middleware Processing → Logging
    ↓
Background Loading → Database Query → Site Found
    ↓
Event: "site:cache-updated" → UI Re-render → Data Appears
```

### 2. Database Operation with Retry Flow:

```folder
Database Operation → withOperationalHooks() → First Attempt Fails
    ↓
Event: "database:retry" → Wait (Exponential Backoff) → Retry
    ↓
Second Attempt Succeeds → Event: "database:success" → Operation Complete
```

### 3. Monitor Status Change Flow:

```folder
Monitor Check → Status Change Detected → Update Database
    ↓
Event: "monitor:status-changed" → Middleware Chain → Logging + Metrics
    ↓
Notification Service → User Alert → UI Update
```

## Best Practices

### 1. Event Naming Conventions:

- **Domain prefix**: `site:`, `monitor:`, `database:`, `system:`
- **Action description**: `added`, `updated`, `removed`, `failed`
- **Hierarchical structure**: `internal:site:cache-updated`

### 2. Event Data Standards:

- **Always include timestamp**: `timestamp: Date.now()`
- **Include operation context**: `operation: "background-load"`
- **Use extensible patterns**: `[key: string]: unknown`

### 3. Error Handling:

- **Non-blocking emission**: Use `.catch()` for fire-and-forget events
- **Event isolation**: Event emission failures should not break operations
- **Comprehensive context**: Include all relevant data for debugging

### 4. Performance Considerations:

- **Async emission**: All events are emitted asynchronously
- **Middleware optimization**: Order middleware by performance impact
- **Debouncing**: Use rate limiting middleware for high-frequency events

## Integration Points

### Frontend Integration:

The event system integrates with React through:

- **IPC bridge** in preload script
- **React hooks** for state synchronization
- **Error boundaries** for event-driven error handling

### Database Integration:

Events are tightly integrated with database operations:

- **Transaction events** for all database operations
- **Retry events** for failed operations
- **Cache events** for data synchronization

### Monitoring Integration:

The monitoring system is event-driven:

- **Status change events** trigger notifications
- **Check completion events** update UI
- **Service lifecycle events** manage monitoring state

## Conclusion

The Uptime Watcher event system provides a robust, type-safe, observable foundation for the application's reactive architecture. The comprehensive return pattern analysis shows that the application correctly distinguishes between legitimate null/undefined returns (guard clauses, type conversions) and operational patterns that benefit from modernization (cache misses, database errors).

The event system successfully transforms cache miss scenarios and database error patterns into a proactive, observable system while preserving appropriate null/undefined returns where they serve legitimate purposes.
