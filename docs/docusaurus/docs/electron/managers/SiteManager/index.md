# electron/managers/SiteManager

Site management service responsible for site CRUD operations and monitoring
coordination.

## Remarks

The SiteManager serves as the primary interface for all site-related
operations, providing a unified API for site creation, updates, deletion, and
monitoring coordination. It maintains an in-memory cache for performance
while ensuring data consistency with the underlying database through
transactional operations.

Key responsibilities:

- Site CRUD Operations: Create, read, update, and delete site configurations
- Cache Management: Maintain synchronized in-memory cache for performance
- Monitor Integration: Coordinate with MonitorManager for monitoring operations
- Event Communication: Emit typed events for frontend and internal coordination
- Data Persistence: Ensure atomic database operations with transaction safety
- Error Handling: Provide comprehensive error handling and recovery mechanisms

The manager uses dependency injection for testability and follows the
repository pattern for data access. All operations are designed to be atomic
and maintain data consistency across cache and database layers.

## Example

```typescript
const siteManager = new SiteManager({
  siteRepository,
  monitorRepository,
  historyRepository,
  databaseService,
  eventEmitter,
  monitoringOperations
});

// Add a new site
const site = await siteManager.addSite({
  identifier: "site_123",
  name: "My Website",
  monitors: [...],
  monitoring: true
});
```

Site management coordinator for CRUD operations and cache synchronization.

## Classes

- [SiteManager](classes/SiteManager.md)

## Interfaces

- [IMonitoringOperations](interfaces/IMonitoringOperations.md)
- [SiteManagerDependencies](interfaces/SiteManagerDependencies.md)
