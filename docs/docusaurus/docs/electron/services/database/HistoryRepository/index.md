# electron/services/database/HistoryRepository

Repository for status history data persistence and management using the
repository pattern.

## Remarks

Handles CRUD operations for monitor status history with automatic pruning,
performance optimization, and comprehensive transaction support. Manages
historical monitoring data with configurable retention policies and efficient
querying capabilities.

Key features:

- Status history CRUD operations with automatic timestamp management
- Configurable history pruning to maintain database performance
- Efficient querying with pagination and filtering support
- Transaction support for atomic history operations
- Performance optimization through batch operations
- Monitor-specific history management and cleanup
- Comprehensive error handling with operational hooks

## Examples

```typescript
const historyRepo = new HistoryRepository({ databaseService });

// Add a status entry
await historyRepo.addStatusEntry("monitor123", {
    status: "up",
    responseTime: 250,
    statusCode: 200,
    timestamp: Date.now(),
});

// Get history for a monitor
const history = await historyRepo.getHistoryByMonitorId("monitor123", {
    limit: 100,
    offset: 0,
});
```

```typescript
// Prune old history entries
await historyRepo.pruneHistoryForMonitor("monitor123", 1000);

// Get latest status
const latest = await historyRepo.getLatestHistoryEntry("monitor123");
```

## Classes

- [HistoryRepository](classes/HistoryRepository.md)

## Interfaces

- [HistoryRepositoryDependencies](interfaces/HistoryRepositoryDependencies.md)
