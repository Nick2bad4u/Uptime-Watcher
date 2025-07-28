# Interface: VersionInfo

Defined in: [electron/services/monitoring/MigrationSystem.ts:82](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/monitoring/MigrationSystem.ts#L82)

Tracks version information for a monitor type.

## Remarks

Used by VersionManager to record migration state and applied versions for each monitor type.

## Properties

### applied

> **applied**: `boolean`

Defined in: [electron/services/monitoring/MigrationSystem.ts:89](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/monitoring/MigrationSystem.ts#L89)

Indicates if the version has been applied.

#### Remarks

True if the migration to this version has been completed.

***

### timestamp

> **timestamp**: `number`

Defined in: [electron/services/monitoring/MigrationSystem.ts:96](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/monitoring/MigrationSystem.ts#L96)

Timestamp when the version was set.

#### Remarks

Milliseconds since epoch.

***

### version

> **version**: `string`

Defined in: [electron/services/monitoring/MigrationSystem.ts:103](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/monitoring/MigrationSystem.ts#L103)

The version string.

#### Remarks

Semantic version string (e.g., "1.1.0").
