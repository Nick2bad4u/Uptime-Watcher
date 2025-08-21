# Variable: exampleMigrations

> `const` **exampleMigrations**: `object`

Defined in: [electron/services/monitoring/MigrationSystem.ts:696](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/MigrationSystem.ts#L696)

Example migration definitions for reference and testing.

## Type declaration

### httpV1\_0\_to\_1\_1

> **httpV1\_0\_to\_1\_1**: [`MigrationRule`](../interfaces/MigrationRule.md)

HTTP monitor migration: Adds a timeout field with default value.

#### Remarks

Non-breaking migration. Adds `timeout` field if missing.

#### Example

```typescript
const migrated = await exampleMigrations.httpV1_0_to_1_1.transform({
    url: "https://...",
});
```

#### Default Value

```ts
timeout = 30000
```

#### Param

The monitor configuration data.

#### Returns

Promise resolving to data with `timeout` field set.

### portV1\_0\_to\_1\_1

> **portV1\_0\_to\_1\_1**: [`MigrationRule`](../interfaces/MigrationRule.md)

Port monitor migration: Ensures port is numeric and valid.

#### Remarks

Converts string port numbers to integers. Validates port range.

#### Example

```typescript
const migrated = await exampleMigrations.portV1_0_to_1_1.transform({
    port: "8080",
});
```

#### Param

The monitor configuration data.

#### Returns

Promise resolving to data with numeric port.

#### Throws

Throws if port is invalid or not in range 1-65535.

## Remarks

Provides templates for common migration scenarios. These are not registered
by default; register as needed for tests or new monitor types.

## Example

```typescript
migrationRegistry.registerMigration(
    "http",
    exampleMigrations.httpV1_0_to_1_1
);
migrationRegistry.registerMigration(
    "port",
    exampleMigrations.portV1_0_to_1_1
);
```
