# Function: createMigrationOrchestrator()

> **createMigrationOrchestrator**(): `MigrationOrchestrator`

Defined in: [electron/services/monitoring/MigrationSystem.ts:290](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/monitoring/MigrationSystem.ts#L290)

Factory function for creating migration orchestrator instances.

## Returns

`MigrationOrchestrator`

New migration orchestrator instance

## Remarks

Use this when you need an isolated orchestrator instance instead of
the shared singleton pattern. Useful for testing or specialized workflows.
