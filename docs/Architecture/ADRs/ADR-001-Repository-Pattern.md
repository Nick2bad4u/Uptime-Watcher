# ADR-001: Repository Pattern for Database Access

## Status

**Accepted** - Implemented across all database operations with comprehensive transaction safety and race condition prevention

## Context

The application needed a consistent, testable, and transaction-safe approach to database operations. Direct database access throughout the codebase would lead to:

- Inconsistent error handling
- Difficult testing due to tight coupling
- Lack of transaction safety
- Code duplication
- Race conditions in concurrent data access
- Poor separation of concerns between business logic and data access

## Decision

We will use the **Repository Pattern** for all database access with the following characteristics:

### 1. Dual Method Pattern

- **Public async methods** that create transactions (`deleteAll()`)
- **Internal sync methods** for use within existing transactions (`deleteAllInternal()`)

### 2. Enhanced Transaction Safety

- All mutations wrapped in `DatabaseService.executeTransaction()`
- All operations use `withDatabaseOperation()` for retry logic and event emission
- **Synchronous database operations** (node-sqlite3-wasm) eliminate race conditions
- **Atomic cache updates** prevent inconsistent state during concurrent access

### 3. Consistent Structure

````typescript
/**
 * Example repository demonstrating the standard repository pattern implementation.
 *
 * @remarks
 * This repository follows the dual method pattern with public async methods that create
 * transactions and internal sync methods for use within existing transaction contexts.
 * All database operations are wrapped with proper error handling and event emission.
 *
 * @example
 * ```typescript
 * const repository = new ExampleRepository({ databaseService });
 *
 * // Public async method - creates its own transaction
 * await repository.deleteAll();
 *
 * // Internal sync method - used within existing transaction
 * await databaseService.executeTransaction((db) => {
 *     repository.deleteAllInternal(db);
 *     // other operations...
 * });
 * ```
 *
 * @public
 */
export class ExampleRepository {
 /**
  * Database service instance for executing database operations.
  *
  * @readonly
  * @private
  */
 private readonly databaseService: DatabaseService;

 /**
  * Creates a new ExampleRepository instance.
  *
  * @param dependencies - Required dependencies for repository operations
  * @param dependencies.databaseService - The {@link DatabaseService} instance for database access
  *
  * @example
  * ```typescript
  * const repository = new ExampleRepository({
  *     databaseService: serviceContainer.getDatabaseService()
  * });
  * ```
  */
 constructor(dependencies: ExampleRepositoryDependencies) {
  this.databaseService = dependencies.databaseService;
 }

 /**
  * Deletes all records from the repository table.
  *
  * @remarks
  * This is a public async method that creates its own database transaction.
  * Uses {@link withDatabaseOperation} for retry logic and event emission.
  * For use within existing transactions, use {@link deleteAllInternal} instead.
  *
  * @returns Promise that resolves when all records are successfully deleted
  *
  * @throws {@link Error} When database operation fails or transaction cannot be completed
  *
  * @example
  * ```typescript
  * // Delete all records with automatic transaction handling
  * await repository.deleteAll();
  * ```
  *
  * @see {@link deleteAllInternal} for transaction-internal operations
  * @public
  */
 public async deleteAll(): Promise<void> {
  return withDatabaseOperation(async () => {
   return this.databaseService.executeTransaction((db) => {
    this.deleteAllInternal(db);
    return Promise.resolve();
   });
  }, "ExampleRepository.deleteAll");
 }

 /**
  * Deletes all records from the repository table within an existing transaction context.
  *
  * @remarks
  * This is an internal sync method designed for use within existing database transactions.
  * Does not create its own transaction - must be called within a transaction context.
  * Logs debug information about the operation completion.
  *
  * @param db - The active {@link Database} connection within a transaction
  *
  * @throws {@link Error} When the SQL execution fails
  *
  * @example
  * ```typescript
  * // Use within an existing transaction
  * await databaseService.executeTransaction((db) => {
  *     repository.deleteAllInternal(db);
  *     // other transactional operations...
  * });
  * ```
  *
  * @see {@link deleteAll} for standalone operation with automatic transaction
  * @public
  */
 public deleteAllInternal(db: Database): void {
  db.run(QUERIES.DELETE_ALL);
  logger.debug("[ExampleRepository] All records deleted (internal)");
 }

 /**
  * Gets the current database connection instance.
  *
  * @remarks
  * Provides access to the underlying database connection through the database service.
  * Should be used sparingly and only when the repository pattern methods are insufficient.
  *
  * @returns The active {@link Database} connection instance
  *
  * @example
  * ```typescript
  * const db = repository.getDb();
  * // Use for complex queries not covered by repository methods
  * ```
  *
  * @private
  */
 private getDb(): Database {
  return this.databaseService.getDatabase();
 }
}

/**
 * Dependencies required for {@link ExampleRepository} instantiation.
 *
 * @remarks
 * Defines the dependency injection contract for the repository,
 * ensuring proper service availability and testability.
 *
 * @public
 */
interface ExampleRepositoryDependencies {
 /**
  * Database service instance for executing database operations.
  *
  * @remarks
  * Must be a properly initialized {@link DatabaseService} with an active database connection.
  */
 readonly databaseService: DatabaseService;
}

/**
 * Centralized SQL query constants for the example repository.
 *
 * @remarks
 * Prevents SQL duplication across repository methods and improves maintainability.
 * All queries should be defined here rather than inline in methods.
 *
 * @private
 */
const QUERIES = {
 /**
  * SQL query to delete all records from the repository table.
  *
  * @defaultValue "DELETE FROM example_table"
  */
 DELETE_ALL: "DELETE FROM example_table",
} as const;
````

### 4. Query Constants

- Centralized query strings in constants object
- Prevents SQL duplication and improves maintainability

## Consequences

### Positive

- **Consistent error handling** across all database operations
- **Easy testing** through dependency injection and mocking
- **Enhanced transaction safety** prevents data corruption and race conditions
- **Clear separation** between transactional and non-transactional operations
- **Retry logic** and event emission through operational hooks
- **Race condition prevention** through synchronous database operations (node-sqlite3-wasm)
- **Atomic cache updates** ensure data consistency during concurrent access
- **Comprehensive logging** and monitoring of all database operations

### Negative

- **Slight complexity increase** with dual method pattern
- **Learning curve** for developers unfamiliar with repository pattern
- **Additional abstraction layer** may seem unnecessary for simple operations

## Implementation Quality Assurance

### Race Condition Prevention
- **Synchronous Operations**: node-sqlite3-wasm ensures all database operations complete synchronously
- **Atomic Transactions**: BEGIN/COMMIT/ROLLBACK operations are atomic
- **Cache Consistency**: Atomic cache replacement patterns prevent race conditions

### Memory Management
- **Proper Cleanup**: All repositories implement proper resource cleanup
- **Event Listener Management**: Event emissions are handled asynchronously with proper error handling
- **Connection Pooling**: Single database connection managed by DatabaseService singleton

## Compliance

All repository classes implement this pattern:

- `SiteRepository`
- `MonitorRepository`
- `HistoryRepository`
- `SettingsRepository`

## Related ADRs

- [ADR-002: Event-Driven Architecture](./ADR-002-Event-Driven-Architecture.md)
- [ADR-003: Error Handling Strategy](./ADR-003-Error-Handling-Strategy.md)
