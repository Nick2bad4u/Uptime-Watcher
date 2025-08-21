# electron/services/database/MonitorRepository

Database repository for monitor persistence and management using the
repository pattern.

## Remarks

Handles CRUD operations for site monitoring configurations using the
repository pattern. All operations are wrapped in transactions and use the
DatabaseService for transaction management. All mutations are atomic to
ensure data consistency and proper error handling.

Key features:

- Type-safe monitor CRUD operations with comprehensive validation
- Transaction support for atomic operations and rollback safety
- Dynamic SQL generation for flexible queries and updates
- Performance optimization through prepared statements and caching
- Comprehensive error handling with operational hooks
- Site-monitor relationship management and integrity constraints
- Development mode debugging with detailed logging

## Examples

```typescript
const monitorRepo = new MonitorRepository({ databaseService });

// Create a monitor for a site
const monitor = await monitorRepo.createMonitor({
    siteId: "site123",
    checkInterval: 60000,
    retryAttempts: 3,
    timeout: 30000,
});

// Get all monitors for a site
const monitors = await monitorRepo.getMonitorsBySiteId("site123");
```

```typescript
await databaseService.executeTransaction(async (db) => {
    const monitor1 = await monitorRepo.createMonitor(data1, db);
    const monitor2 = await monitorRepo.createMonitor(data2, db);
    // Both operations committed together
});
```

## Classes

- [MonitorRepository](classes/MonitorRepository.md)

## Interfaces

- [MonitorRepositoryDependencies](interfaces/MonitorRepositoryDependencies.md)
