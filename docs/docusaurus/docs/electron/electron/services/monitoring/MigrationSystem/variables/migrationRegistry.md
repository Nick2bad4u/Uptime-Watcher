# Variable: migrationRegistry

> `const` **migrationRegistry**: `MigrationRegistry`

Defined in: [electron/services/monitoring/MigrationSystem.ts:509](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/monitoring/MigrationSystem.ts#L509)

Singleton registry for monitor type migrations.

## Remarks

Use to register and retrieve migration rules for all monitor types. Shared across the application.

## Example

```typescript
migrationRegistry.registerMigration("http", {
  fromVersion: "1.0.0",
  toVersion: "1.1.0",
  description: "Add timeout field",
  isBreaking: false,
  transform: async (data) => ({ ...data, timeout: 30000 })
});
```
