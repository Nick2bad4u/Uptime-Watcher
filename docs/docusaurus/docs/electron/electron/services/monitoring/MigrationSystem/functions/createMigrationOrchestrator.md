# Function: createMigrationOrchestrator()

> **createMigrationOrchestrator**(): `MigrationOrchestrator`

Defined in: [electron/services/monitoring/MigrationSystem.ts:536](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/monitoring/MigrationSystem.ts#L536)

Factory for creating migration orchestrator instances.

## Returns

`MigrationOrchestrator`

A new MigrationOrchestrator instance.

## Remarks

Use for isolated migration workflows or testing. Returns a new MigrationOrchestrator instance using the shared registry and version manager.

## Example

```typescript
const orchestrator = createMigrationOrchestrator();
```
