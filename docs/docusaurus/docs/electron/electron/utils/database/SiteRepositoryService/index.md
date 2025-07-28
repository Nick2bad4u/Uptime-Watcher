# electron/utils/database/SiteRepositoryService

**`Beta`**

Site repository service for data operations and dependency injection.

## Remarks

Provides a testable, dependency-injected service layer for site data operations,
separating business logic from infrastructure concerns. Designed with the repository
pattern and service layer architecture to enable comprehensive testing and
maintainable code organization.

 * Service for handling site repository operations.

## See

 - [SiteRepository](../../../services/database/SiteRepository/classes/SiteRepository.md) for data access patterns
 - [MonitorRepository](../../../services/database/MonitorRepository/classes/MonitorRepository.md) for monitor data operations
 - [HistoryRepository](../../../services/database/HistoryRepository/classes/HistoryRepository.md) for history data operations
 - [SettingsRepository](../../../services/database/SettingsRepository/classes/SettingsRepository.md) for settings data operations
This service is currently in beta and may undergo breaking changes.
 - [SiteLoadingOrchestrator](classes/SiteLoadingOrchestrator.md) for orchestration logic
 - [SiteRepository](../../../services/database/SiteRepository/classes/SiteRepository.md) for data access patterns

## Examples

```typescript
const service = new SiteRepositoryService({
  repositories: { site, monitor, history, settings },
  logger,
  eventEmitter
});

const sites = await service.getSitesFromDatabase();
await service.loadSitesIntoCache(siteCache);
```

The service provides both data operations (SiteRepositoryService) and orchestration
logic (SiteLoadingOrchestrator) to handle complex workflows while maintaining
clean separation between pure functions and side effects.

```typescript
const service = new SiteRepositoryService({
  repositories: { site, monitor, history, settings },
  logger,
  eventEmitter
});

const sites = await service.getSitesFromDatabase();
```

## Classes

- [SiteLoadingOrchestrator](classes/SiteLoadingOrchestrator.md)
- [SiteRepositoryService](classes/SiteRepositoryService.md)
