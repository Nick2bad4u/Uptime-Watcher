# ADR-001: Repository Pattern for Database Access

## Status
**Accepted** - Implemented across all database operations

## Context
The application needed a consistent, testable, and transaction-safe approach to database operations. Direct database access throughout the codebase would lead to:
- Inconsistent error handling
- Difficult testing due to tight coupling
- Lack of transaction safety
- Code duplication

## Decision
We will use the **Repository Pattern** for all database access with the following characteristics:

### 1. Dual Method Pattern
- **Public async methods** that create transactions (`deleteAll()`)
- **Internal sync methods** for use within existing transactions (`deleteAllInternal()`)

### 2. Transaction Safety
- All mutations wrapped in `DatabaseService.executeTransaction()`
- All operations use `withDatabaseOperation()` for retry logic and event emission

### 3. Consistent Structure
```typescript
export class ExampleRepository {
    private readonly databaseService: DatabaseService;
    
    constructor(dependencies: ExampleRepositoryDependencies) {
        this.databaseService = dependencies.databaseService;
    }
    
    // Public async method with transaction
    public async deleteAll(): Promise<void> {
        return withDatabaseOperation(async () => {
            return this.databaseService.executeTransaction((db) => {
                this.deleteAllInternal(db);
                return Promise.resolve();
            });
        }, "ExampleRepository.deleteAll");
    }
    
    // Internal sync method for transaction contexts
    public deleteAllInternal(db: Database): void {
        db.run(QUERIES.DELETE_ALL);
        logger.debug("[ExampleRepository] All records deleted (internal)");
    }
    
    private getDb(): Database {
        return this.databaseService.getDatabase();
    }
}
```

### 4. Query Constants
- Centralized query strings in constants object
- Prevents SQL duplication and improves maintainability

## Consequences

### Positive
- **Consistent error handling** across all database operations
- **Easy testing** through dependency injection and mocking
- **Transaction safety** prevents data corruption
- **Clear separation** between transactional and non-transactional operations
- **Retry logic** and event emission through operational hooks

### Negative
- **Slight complexity increase** with dual method pattern
- **Learning curve** for developers unfamiliar with repository pattern

## Compliance
All repository classes implement this pattern:
- `SiteRepository`
- `MonitorRepository` 
- `HistoryRepository`
- `SettingsRepository`

## Related ADRs
- [ADR-002: Event-Driven Architecture](./ADR-002-Event-Driven-Architecture.md)
- [ADR-003: Error Handling Strategy](./ADR-003-Error-Handling-Strategy.md)
