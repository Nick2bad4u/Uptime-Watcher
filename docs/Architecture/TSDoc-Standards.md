# TSDoc Standardization Guide

This document standardizes inline code examples and TSDoc patterns across the Uptime-Watcher codebase.

## TSDoc Standards

### Basic Format
```typescript
/**
 * Brief one-line description of the function/class/interface.
 *
 * @remarks
 * Detailed explanation of the purpose, behavior, and usage patterns.
 * Include important notes about thread safety, performance, or architectural decisions.
 * Use this section to explain the "why" behind the implementation.
 *
 * @param paramName - Description of the parameter, including type constraints
 * @param optionalParam - Description with indication of optional nature
 * @returns Description of return value and any important details
 * @throws Error type and conditions that cause the error
 *
 * @example
 * ```typescript
 * // Basic usage example
 * const result = await functionName(requiredParam, optionalParam);
 * console.log(result);
 * ```
 *
 * @example
 * ```typescript
 * // Advanced usage example with error handling
 * try {
 *   const result = await functionName(param);
 *   // Handle success
 * } catch (error) {
 *   // Handle error
 * }
 * ```
 *
 * @see {@link RelatedFunction} for related functionality
 * @since Version 1.2.0
 * @public
 */
```

### Repository Pattern Documentation

#### Repository Class
```typescript
/**
 * Repository for managing [ENTITY] data persistence.
 *
 * @remarks
 * Handles all CRUD operations for [ENTITY] in the database using the repository pattern.
 * All mutations are wrapped in transactions for consistency and error handling.
 * 
 * **Transaction Safety**: All write operations use `executeTransaction()` to ensure atomicity.
 * **Dual Methods**: Public async methods create transactions, internal sync methods work within existing transactions.
 * **Error Handling**: Uses `withDatabaseOperation()` for retry logic and event emission.
 *
 * @example
 * ```typescript
 * // Basic repository usage
 * const repository = new ExampleRepository({ databaseService });
 * 
 * // Create a new entity
 * await repository.create({
 *   id: "unique-id",
 *   name: "Example Entity",
 *   createdAt: Date.now()
 * });
 * 
 * // Find all entities
 * const entities = await repository.findAll();
 * 
 * // Find specific entity
 * const entity = await repository.findById("unique-id");
 * ```
 *
 * @example
 * ```typescript
 * // Transaction usage with multiple operations
 * await databaseService.executeTransaction(async (db) => {
 *   repository.createInternal(db, entity1);
 *   repository.createInternal(db, entity2);
 *   repository.updateInternal(db, existingId, updates);
 * });
 * ```
 *
 * @public
 */
```

#### Repository Methods
```typescript
/**
 * Creates a new [ENTITY] in the database.
 *
 * @param data - The [ENTITY] data to create
 * @returns Promise that resolves when the [ENTITY] is created
 * @throws Error if the database operation fails or data validation fails
 *
 * @remarks
 * **Transaction Behavior**: Creates a new transaction for this operation.
 * **Data Validation**: Validates required fields and applies normalization.
 * **Event Emission**: Emits creation events for monitoring and UI updates.
 * **Retry Logic**: Includes automatic retry on transient failures.
 *
 * @example
 * ```typescript
 * // Create a new entity
 * await repository.create({
 *   id: generateId(),
 *   name: "New Entity",
 *   category: "example",
 *   createdAt: Date.now()
 * });
 * ```
 *
 * @example
 * ```typescript
 * // Create with error handling
 * try {
 *   await repository.create(entityData);
 *   console.log("Entity created successfully");
 * } catch (error) {
 *   if (error.code === 'SQLITE_CONSTRAINT') {
 *     console.error("Entity already exists");
 *   } else {
 *     console.error("Failed to create entity:", error.message);
 *   }
 * }
 * ```
 *
 * @see {@link createInternal} for transaction-context usage
 * @public
 */
```

### Event System Documentation

#### Event Bus
```typescript
/**
 * Enhanced event bus with type safety and middleware support.
 *
 * @remarks
 * Provides compile-time type checking for events, automatic correlation tracking,
 * middleware processing, and comprehensive debugging capabilities. Events are
 * processed through a middleware chain before emission.
 *
 * **Type Safety**: All events are validated at compile-time using TypeScript.
 * **Metadata Injection**: Automatically adds correlation IDs, timestamps, and context.
 * **Middleware Support**: Events can be processed, logged, or transformed via middleware.
 * **Error Handling**: Failed middleware or listeners don't break the event system.
 *
 * @typeParam EventMap - Map of event names to their data types
 *
 * @example
 * ```typescript
 * // Define typed event map
 * interface MyEvents {
 *   'user:login': { userId: string; timestamp: number };
 *   'data:updated': { entityId: string; changes: string[] };
 * }
 * 
 * // Create typed event bus
 * const eventBus = new TypedEventBus<MyEvents>();
 * 
 * // Emit typed event
 * await eventBus.emitTyped('user:login', {
 *   userId: '123',
 *   timestamp: Date.now()
 * });
 * ```
 *
 * @example
 * ```typescript
 * // Listen to events with type safety
 * eventBus.onTyped('user:login', (data) => {
 *   // data is properly typed: { userId: string; timestamp: number; _meta: EventMetadata }
 *   console.log(`User ${data.userId} logged in at ${data.timestamp}`);
 *   console.log(`Correlation ID: ${data._meta.correlationId}`);
 * });
 * 
 * // Add middleware for logging
 * eventBus.use(async (eventName, data, correlationId, next) => {
 *   console.log(`[Event] ${eventName} [${correlationId}]`);
 *   await next();
 * });
 * ```
 *
 * @public
 */
```

#### Event Emission
```typescript
/**
 * Emits a typed event with automatic metadata injection.
 *
 * @param event - Event name from the EventMap
 * @param data - Event data matching the event type
 * @returns Promise that resolves when all listeners have processed the event
 * @throws Error when middleware processing fails
 *
 * @remarks
 * **Metadata Injection**: Automatically adds `_meta` property with correlation ID, timestamp, and context.
 * **Middleware Processing**: Runs all registered middleware before emitting to listeners.
 * **Type Safety**: Ensures data matches the expected type for the event name.
 * **Error Propagation**: Middleware errors are thrown to the caller, listener errors are logged.
 *
 * @example
 * ```typescript
 * // Object event (typical case)
 * await bus.emitTyped('user:login', { userId: '123', timestamp: Date.now() });
 * // Listener receives: { userId: '123', timestamp: Date.now(), _meta: {...} }
 * 
 * // Array event
 * await bus.emitTyped('data:batch', [1, 2, 3]);
 * // Listener receives: [1, 2, 3] with _meta property attached
 * 
 * // Primitive event
 * await bus.emitTyped('count:updated', 42);
 * // Listener receives: { value: 42, _meta: {...} }
 * ```
 *
 * @example
 * ```typescript
 * // Event emission with error handling
 * try {
 *   await eventBus.emitTyped('operation:completed', {
 *     operationId: 'op-123',
 *     result: operationResult,
 *     duration: Date.now() - startTime
 *   });
 * } catch (error) {
 *   console.error('Event emission failed:', error);
 *   // Handle middleware failures
 * }
 * ```
 *
 * @public
 */
```

### Frontend Store Documentation

#### Store Interface
```typescript
/**
 * [DOMAIN] store for managing [DESCRIPTION] state and interactions.
 *
 * @remarks
 * This store manages [DETAILED DESCRIPTION]. It uses Zustand with [persistence/modular composition]
 * to provide [SPECIFIC CAPABILITIES].
 * 
 * **State Management**: Uses immutable updates with automatic action logging.
 * **Error Handling**: Integrates with `withErrorHandling()` for consistent error management.
 * **IPC Integration**: Communicates with backend via `window.electronAPI`.
 * **Persistence**: [Describe what gets persisted and why]
 *
 * @example
 * ```typescript
 * // Basic store usage
 * import { useExampleStore } from './stores/useExampleStore';
 * 
 * function MyComponent() {
 *   const { items, addItem, removeItem, isLoading } = useExampleStore();
 * 
 *   const handleAdd = async () => {
 *     const newItem = await useExampleStore.getState().createItem({
 *       name: 'New Item',
 *       category: 'example'
 *     });
 *     console.log('Created:', newItem);
 *   };
 * 
 *   return (
 *     <div>
 *       {isLoading ? <Spinner /> : null}
 *       {items.map(item => <ItemCard key={item.id} item={item} />)}
 *       <button onClick={handleAdd}>Add Item</button>
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Advanced usage with selectors
 * // Efficient selector for derived state
 * const activeItems = useExampleStore(state => 
 *   state.items.filter(item => item.status === 'active')
 * );
 * 
 * // Subscription to specific state changes
 * useEffect(() => {
 *   const unsubscribe = useExampleStore.subscribe(
 *     state => state.items.length,
 *     (itemCount) => console.log(`Item count: ${itemCount}`)
 *   );
 *   return unsubscribe;
 * }, []);
 * ```
 *
 * @public
 */
```

### Error Handling Documentation

#### withErrorHandling Function
```typescript
/**
 * Shared error handling utility for async operations with context-aware behavior.
 *
 * @param operation - Async operation to execute with error handling
 * @param context - Either frontend store or backend context for appropriate error handling
 * @returns Promise resolving to operation result
 * @throws Re-throws the original error after handling (logging or state management)
 *
 * @remarks
 * This utility provides two overloaded signatures for different contexts:
 * 
 * **Frontend Context**: Integrates with store state management (loading, error states).
 * **Backend Context**: Integrates with logging infrastructure for operation tracking.
 * 
 * **Error Preservation**: Always re-throws original errors to maintain stack traces.
 * **State Safety**: Frontend store operations are protected from cascading failures.
 * **Correlation Tracking**: Backend operations include correlation IDs for debugging.
 *
 * @example
 * ```typescript
 * // Frontend usage with store integration
 * const handleUserAction = async () => {
 *   await withErrorHandling(async () => {
 *     const result = await window.electronAPI.sites.addSite(siteData);
 *     setSites(prevSites => [...prevSites, result]);
 *     return result;
 *   }, errorStore); // Automatically manages loading/error state
 * };
 * ```
 *
 * @example
 * ```typescript
 * // Backend usage with logger integration
 * async performBackendOperation() {
 *   return withErrorHandling(async () => {
 *     const result = await this.repository.performComplexOperation();
 *     await this.eventBus.emitTyped('operation:completed', { result });
 *     return result;
 *   }, { 
 *     logger, 
 *     operationName: "performBackendOperation" 
 *   });
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Error handling with specific error types
 * try {
 *   await withErrorHandling(async () => {
 *     return await riskyOperation();
 *   }, context);
 * } catch (error) {
 *   if (error instanceof ValidationError) {
 *     // Handle validation errors
 *   } else if (error instanceof NetworkError) {
 *     // Handle network errors
 *   } else {
 *     // Handle unexpected errors
 *   }
 * }
 * ```
 *
 * @public
 */
```

### IPC Documentation

#### Handler Registration
```typescript
/**
 * Registers standardized IPC handler with validation and error handling.
 *
 * @param channel - IPC channel name following domain:action pattern
 * @param handler - Async function to handle the IPC request
 * @param validator - Optional validation function for request parameters
 * @throws Error if channel is already registered or handler registration fails
 *
 * @remarks
 * **Channel Naming**: Must follow `domain:action` pattern (e.g., 'sites:create', 'monitors:update').
 * **Validation**: Parameters are validated before handler execution if validator provided.
 * **Error Handling**: Automatic error logging and consistent error response format.
 * **Type Safety**: Handler and validator types are checked at compile time.
 * **Duplicate Prevention**: Prevents multiple handlers for the same channel.
 *
 * @example
 * ```typescript
 * // Simple handler without parameters
 * ipcService.registerStandardizedIpcHandler(
 *   'sites:get-all',
 *   async () => {
 *     const sites = await siteManager.getAllSites();
 *     return sites;
 *   }
 * );
 * ```
 *
 * @example
 * ```typescript
 * // Handler with validation
 * ipcService.registerStandardizedIpcHandler(
 *   'sites:create',
 *   async (params: SiteCreationData) => {
 *     const site = await siteManager.createSite(params);
 *     return site;
 *   },
 *   isSiteCreationData // Type guard function
 * );
 * ```
 *
 * @example
 * ```typescript
 * // Complex handler with error handling
 * ipcService.registerStandardizedIpcHandler(
 *   'sites:bulk-update',
 *   async (params: BulkUpdateParams) => {
 *     const results = [];
 *     for (const update of params.updates) {
 *       try {
 *         const result = await siteManager.updateSite(update.id, update.data);
 *         results.push({ success: true, id: update.id, result });
 *       } catch (error) {
 *         results.push({ success: false, id: update.id, error: error.message });
 *       }
 *     }
 *     return { results, total: params.updates.length };
 *   },
 *   isBulkUpdateParams
 * );
 * ```
 *
 * @internal
 */
```

## Code Example Standards

### Inline Examples Format

#### Simple Examples
```typescript
/**
 * @example
 * ```typescript
 * // Brief description of what this example shows
 * const result = await functionName(param1, param2);
 * console.log(result);
 * ```
 */
```

#### Complex Examples
```typescript
/**
 * @example
 * ```typescript
 * // Comprehensive example with error handling
 * try {
 *   const repository = new ExampleRepository({ databaseService });
 *   
 *   // Create multiple entities in a transaction
 *   const entities = await repository.bulkCreate([
 *     { name: "Entity 1", category: "test" },
 *     { name: "Entity 2", category: "prod" }
 *   ]);
 *   
 *   console.log(`Created ${entities.length} entities`);
 * } catch (error) {
 *   console.error("Bulk creation failed:", error.message);
 * }
 * ```
 */
```

#### Usage Pattern Examples
```typescript
/**
 * @example
 * ```typescript
 * // Basic usage pattern
 * const store = useExampleStore();
 * const { items, addItem, isLoading } = store;
 * 
 * // React component integration
 * useEffect(() => {
 *   store.fetchItems();
 * }, []);
 * 
 * const handleAdd = () => {
 *   addItem({ name: "New Item", category: "default" });
 * };
 * ```
 */
```

### Example Categories

#### 1. Basic Usage
Show the most common, straightforward usage:
```typescript
/**
 * @example
 * ```typescript
 * // Basic repository usage
 * const user = await userRepository.findById("user-123");
 * if (user) {
 *   console.log(`Found user: ${user.name}`);
 * }
 * ```
 */
```

#### 2. Error Handling
Demonstrate proper error handling patterns:
```typescript
/**
 * @example
 * ```typescript
 * // Proper error handling
 * try {
 *   await repository.create(userData);
 * } catch (error) {
 *   if (error.code === 'SQLITE_CONSTRAINT') {
 *     throw new Error('User already exists');
 *   }
 *   throw error; // Re-throw unexpected errors
 * }
 * ```
 */
```

#### 3. Advanced Usage
Show complex scenarios and integration patterns:
```typescript
/**
 * @example
 * ```typescript
 * // Advanced usage with transaction coordination
 * await databaseService.executeTransaction(async (db) => {
 *   // Create user
 *   userRepository.createInternal(db, userData);
 *   
 *   // Create initial settings
 *   settingsRepository.createInternal(db, defaultSettings);
 *   
 *   // Log creation event
 *   await eventBus.emitTyped('user:created', { userId: userData.id });
 * });
 * ```
 */
```

## TSDoc Tags Reference

### Standard Tags
- `@param` - Parameter description
- `@returns` - Return value description  
- `@throws` - Exception conditions
- `@example` - Code examples (always use)
- `@remarks` - Detailed implementation notes
- `@see` - Cross-references to related items
- `@since` - Version when feature was added
- `@deprecated` - Mark obsolete APIs

### Visibility Tags
- `@public` - Public API (exported)
- `@internal` - Internal implementation (not exported)
- `@readonly` - Read-only property
- `@override` - Method overrides parent

### Custom Tags (Project-Specific)
- `@typeParam` - Generic type parameter description
- `@template` - Alternative to @typeParam

## Validation Checklist

When documenting code, ensure:

- [ ] Brief description is clear and specific
- [ ] `@remarks` explains the "why" and important behaviors
- [ ] All parameters are documented with types and constraints
- [ ] Return value is clearly described
- [ ] Error conditions are documented with `@throws`
- [ ] At least one `@example` showing basic usage
- [ ] Complex scenarios have additional examples
- [ ] Error handling patterns are demonstrated
- [ ] Related functions are cross-referenced with `@see`
- [ ] Visibility tags (`@public`, `@internal`) are used appropriately
- [ ] Examples use realistic data and variable names
- [ ] Code examples are syntactically correct TypeScript
- [ ] Examples follow the established patterns from the codebase
