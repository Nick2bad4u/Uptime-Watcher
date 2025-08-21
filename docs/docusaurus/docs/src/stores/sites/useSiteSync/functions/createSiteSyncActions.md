# Function: createSiteSyncActions()

> **createSiteSyncActions**(`deps`): [`SiteSyncActions`](../interfaces/SiteSyncActions.md)

Defined in: [src/stores/sites/useSiteSync.ts:198](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/sites/useSiteSync.ts#L198)

Creates site synchronization actions with injected dependencies.

## Parameters

### deps

[`SiteSyncDependencies`](../interfaces/SiteSyncDependencies.md)

Dependencies required for synchronization operations

## Returns

[`SiteSyncActions`](../interfaces/SiteSyncActions.md)

Complete set of synchronization actions

## Remarks

Factory function that creates all site synchronization actions with proper
dependency injection. This pattern allows for easier testing and maintains
separation of concerns between the sync logic and store state management.

The created actions handle:

- Full backend synchronization
- Real-time status updates via WebSocket-like events
- Sync status monitoring and reporting
- Error handling and recovery
