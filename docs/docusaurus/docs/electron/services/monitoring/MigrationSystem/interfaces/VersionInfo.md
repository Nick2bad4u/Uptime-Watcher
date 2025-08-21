# Interface: VersionInfo

Defined in: [electron/services/monitoring/MigrationSystem.ts:101](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/MigrationSystem.ts#L101)

Tracks version information for a monitor type.

## Remarks

Used by VersionManager to record migration state and applied versions
for each monitor type.

## Properties

### applied

> **applied**: `boolean`

Defined in: [electron/services/monitoring/MigrationSystem.ts:108](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/MigrationSystem.ts#L108)

Indicates if the version has been applied.

#### Remarks

True if the migration to this version has been completed.

***

### timestamp

> **timestamp**: `number`

Defined in: [electron/services/monitoring/MigrationSystem.ts:115](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/MigrationSystem.ts#L115)

Timestamp when the version was set.

#### Remarks

Milliseconds since epoch.

***

### version

> **version**: `string`

Defined in: [electron/services/monitoring/MigrationSystem.ts:122](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/MigrationSystem.ts#L122)

The version string.

#### Remarks

Semantic version string (e.g., "1.1.0").
