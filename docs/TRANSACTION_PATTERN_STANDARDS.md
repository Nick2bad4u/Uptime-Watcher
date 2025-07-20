# Transaction Pattern Standardization Guide

## Standard Transaction Wrapping Pattern

All repository methods should follow this consistent pattern:

### For methods that return data:
```typescript
public async methodName(params): Promise<ReturnType> {
    return withDatabaseOperation(
        async () => {
            return this.databaseService.executeTransaction((db) => {
                const result = this.methodNameInternal(db, params);
                return Promise.resolve(result);
            });
        },
        "operation-name",
        undefined,
        { contextData }
    );
}
```

### For void methods:
```typescript
public async methodName(params): Promise<void> {
    return withDatabaseOperation(
        async () => {
            return this.databaseService.executeTransaction((db) => {
                this.methodNameInternal(db, params);
                return Promise.resolve();
            });
        },
        "operation-name",
        undefined,
        { contextData }
    );
}
```

### Key Standards:
1. Always use `withDatabaseOperation` wrapper
2. Always use `this.databaseService.executeTransaction` for database operations
3. For data-returning methods: `return Promise.resolve(result)`
4. For void methods: call internal method, then `return Promise.resolve()`
5. Always provide meaningful operation names
6. Include context data for debugging when relevant

### Benefits:
- Consistent error handling and logging
- Uniform transaction management
- Predictable Promise handling
- Better debugging and monitoring
