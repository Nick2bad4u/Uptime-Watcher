# Function: migrateMonitorType()

> **migrateMonitorType**(`monitorType`, `fromVersion`, `toVersion`, `data?`): `Promise`\<\` `appliedMigrations`: `string`[]; `data?`: `Record`\<`string`, `unknown`\>; `errors`: `string`[]; `success`: `boolean`; \`\>

Defined in: [electron/services/monitoring/MonitorTypeRegistry.ts:433](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/services/monitoring/MonitorTypeRegistry.ts#L433)

Migrate monitor data between versions with comprehensive error handling.

## Parameters

### monitorType

Type of monitor to migrate

`"http"` | `"port"`

### fromVersion

`string`

Source version of the data

### toVersion

`string`

Target version for migration

### data?

`Record`\<`string`, `unknown`\>

Optional monitor data to migrate

## Returns

`Promise`\<\` `appliedMigrations`: `string`[]; `data?`: `Record`\<`string`, `unknown`\>; `errors`: `string`[]; `success`: `boolean`; \`\>

Migration result with transformed data or errors

## Remarks

Provides version migration support for monitor configurations using
the migration system. Handles both data transformations and version updates.

Migration process:
1. Validates monitor type using internal validation
2. Checks if migration is needed (version comparison)
3. Uses migration orchestrator for data transformation
4. Returns structured result with applied migrations

Error handling:
- Invalid monitor types return validation errors
- Missing migration paths return migration errors
- Transform failures include original error details
- All errors are logged for debugging

## Example

```typescript
const result = await migrateMonitorType("http", "1.0.0", "1.1.0", monitorData);
if (result.success) {
  console.log("Applied migrations:", result.appliedMigrations);
  return result.data;
} else {
  console.error("Migration failed:", result.errors);
}
```
