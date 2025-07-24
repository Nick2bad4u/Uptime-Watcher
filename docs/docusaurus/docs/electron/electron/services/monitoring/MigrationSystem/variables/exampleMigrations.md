# Variable: exampleMigrations

> `const` **exampleMigrations**: `object`

Defined in: [electron/services/monitoring/MigrationSystem.ts:308](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/monitoring/MigrationSystem.ts#L308)

Example migration definitions for reference and testing.

## Type declaration

### httpV1\_0\_to\_1\_1

> **httpV1\_0\_to\_1\_1**: [`MigrationRule`](../interfaces/MigrationRule.md)

Example HTTP monitor migration: Add timeout field with default value.

#### Remarks

Demonstrates non-breaking migration that adds a new field with sensible default.
Safe to apply to existing HTTP monitor configurations.

### portV1\_0\_to\_1\_1

> **portV1\_0\_to\_1\_1**: [`MigrationRule`](../interfaces/MigrationRule.md)

Example port monitor migration: Ensure port is numeric.

#### Remarks

Demonstrates data type normalization migration with validation.
Converts string port numbers to integers with proper error handling.

## Remarks

Provides working examples of migration rules for different monitor types.
Use these as templates when creating new migrations for your monitor types.

## Example

```typescript
// Register example migrations
migrationRegistry.registerMigration("http", exampleMigrations.httpV1_0_to_1_1);
migrationRegistry.registerMigration("port", exampleMigrations.portV1_0_to_1_1);
```
