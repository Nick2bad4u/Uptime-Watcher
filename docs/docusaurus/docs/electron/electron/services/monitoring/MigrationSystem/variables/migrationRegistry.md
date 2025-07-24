# Variable: migrationRegistry

> `const` **migrationRegistry**: `MigrationRegistry`

Defined in: [electron/services/monitoring/MigrationSystem.ts:270](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/services/monitoring/MigrationSystem.ts#L270)

Registry for monitor type migrations.

## Remarks

Singleton instance for registering and retrieving migration rules.
Provides migration path calculation and validation for monitor data upgrades.

## Example

```typescript
// Register a migration
migrationRegistry.registerMigration("http", {
  fromVersion: "1.0.0",
  toVersion: "1.1.0",
  description: "Add timeout field",
  isBreaking: false,
  transform: async (data) => ({ ...data, timeout: 30000 })
});
```
