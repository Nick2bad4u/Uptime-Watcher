# Function: createMigrationOrchestrator()

> **createMigrationOrchestrator**(): `MigrationOrchestrator`

Defined in: [electron/services/monitoring/MigrationSystem.ts:290](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/services/monitoring/MigrationSystem.ts#L290)

Factory function for creating migration orchestrator instances.

## Returns

`MigrationOrchestrator`

New migration orchestrator instance

## Remarks

Use this when you need an isolated orchestrator instance instead of
the shared singleton pattern. Useful for testing or specialized workflows.
