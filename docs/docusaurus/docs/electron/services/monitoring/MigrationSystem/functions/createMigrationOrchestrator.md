# Function: createMigrationOrchestrator()

> **createMigrationOrchestrator**(): `MigrationOrchestrator`

Defined in: [electron/services/monitoring/MigrationSystem.ts:670](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/MigrationSystem.ts#L670)

Factory for creating migration orchestrator instances.

## Returns

`MigrationOrchestrator`

A new MigrationOrchestrator instance.

## Remarks

Use for isolated migration workflows or testing. Returns a new
MigrationOrchestrator instance using the shared registry and version
manager.

## Example

```typescript
const orchestrator = createMigrationOrchestrator();
```
