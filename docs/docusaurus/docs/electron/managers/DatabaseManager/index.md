# electron/managers/DatabaseManager

Manages database operations including initialization, data management, and
backups across the Electron backend.

## Remarks

Handles database initialization, import/export, and backup operations. Uses
the new service-based architecture for all operations with comprehensive
transaction management, event emission, and error handling patterns.

Key responsibilities:

- Database initialization and schema management
- Data import/export operations with validation
- Backup creation and restoration workflows
- Transaction coordination across multiple repositories
- Event emission for database state changes
- Error handling and recovery for database operations
- Configuration management for database settings

## Examples

```typescript
const dbManager = new DatabaseManager(eventBus, configManager);
await dbManager.initializeDatabase();

// Export data
const exportResult = await dbManager.exportData();

// Create backup
const backupResult = await dbManager.createBackup();
```

```typescript
const importData = {
    sites: [{ url: "example.com", name: "Example" }],
    settings: { historyLimit: 1000 },
};

const result = await dbManager.importData(importData, {
    validateData: true,
    mergeStrategy: "replace",
});
```

## Classes

- [DatabaseManager](classes/DatabaseManager.md)

## Interfaces

- [DatabaseManagerDependencies](interfaces/DatabaseManagerDependencies.md)
