# Variable: migrationRegistry

> `const` **migrationRegistry**: `MigrationRegistry`

Defined in: [electron/services/monitoring/MigrationSystem.ts:639](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/MigrationSystem.ts#L639)

Singleton registry for monitor type migrations.

## Remarks

Use to register and retrieve migration rules for all monitor types. Shared
across the application.

## Example

```typescript
migrationRegistry.registerMigration("http", {
    fromVersion: "1.0.0",
    toVersion: "1.1.0",
    description: "Add timeout field",
    isBreaking: false,
    transform: async (data) => ({ ...data, timeout: 30000 }),
});
```
