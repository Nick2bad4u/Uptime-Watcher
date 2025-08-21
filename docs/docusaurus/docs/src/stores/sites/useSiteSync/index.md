# src/stores/sites/useSiteSync

Site synchronization operations module.

## Remarks

Provides comprehensive site synchronization functionality including:

- Full backend synchronization
- Real-time status updates via event subscriptions
- Sync status monitoring and reporting
- Centralized error handling through the error store

All operations are designed to work with the Zustand-based sites store and
maintain consistency between frontend state and backend data.

## Interfaces

- [SiteSyncActions](interfaces/SiteSyncActions.md)
- [SiteSyncDependencies](interfaces/SiteSyncDependencies.md)

## Functions

- [createSiteSyncActions](functions/createSiteSyncActions.md)
