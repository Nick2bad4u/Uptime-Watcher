# electron/services/database/SiteRepository

Repository for site data persistence and management operations using the
repository pattern.

## Remarks

Provides comprehensive CRUD operations for site data with transaction
support, data validation, and consistent error handling. Follows the
repository pattern to abstract database operations from business logic.

Key features:

- Type-safe site CRUD operations with transaction support
- Data validation and normalization for site entities
- Consistent error handling with operational hooks
- Performance optimization through prepared statements
- Automatic data mapping between database rows and domain models
- Comprehensive logging for debugging and monitoring

## Examples

```typescript
const siteRepo = new SiteRepository({ databaseService });

// Create a new site
const newSite = await siteRepo.createSite({
    name: "Example Site",
    url: "https://example.com",
    checkInterval: 60000,
});

// Fetch all sites
const sites = await siteRepo.getAllSites();

// Update site
await siteRepo.updateSite(siteId, { name: "Updated Name" });
```

```typescript
await databaseService.executeTransaction(async (db) => {
    const site1 = await siteRepo.createSite(siteData1, db);
    const site2 = await siteRepo.createSite(siteData2, db);
    // Both operations committed together
});
```

## Classes

- [SiteRepository](classes/SiteRepository.md)

## Interfaces

- [SiteRepositoryDependencies](interfaces/SiteRepositoryDependencies.md)
