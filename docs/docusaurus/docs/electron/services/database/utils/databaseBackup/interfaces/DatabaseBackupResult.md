# Interface: DatabaseBackupResult

Defined in: [electron/services/database/utils/databaseBackup.ts:28](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/utils/databaseBackup.ts#L28)

Result interface for database backup operations.

## Remarks

Provides a structured return type for backup operations with comprehensive
metadata for tracking and validation. Used as the return value for
[createDatabaseBackup](../functions/createDatabaseBackup.md).

## Properties

### buffer

> **buffer**: [`Buffer`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/5216a9587cc018ac42f777f31b0e07038423e30a/types/node/buffer.buffer.d.ts#L356)

Defined in: [electron/services/database/utils/databaseBackup.ts:35](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/utils/databaseBackup.ts#L35)

Binary buffer containing the complete SQLite database.

#### Remarks

The raw contents of the SQLite database file as a Node.js Buffer.

***

### fileName

> **fileName**: `string`

Defined in: [electron/services/database/utils/databaseBackup.ts:43](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/utils/databaseBackup.ts#L43)

Standardized filename for the backup file.

#### Remarks

The filename used for the backup file, typically
"uptime-watcher-backup.sqlite".

***

### metadata

> **metadata**: `object`

Defined in: [electron/services/database/utils/databaseBackup.ts:51](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/utils/databaseBackup.ts#L51)

Metadata about the backup operation.

#### createdAt

> **createdAt**: `number`

Backup creation timestamp.

##### Remarks

The Unix timestamp (in milliseconds) when the backup was created.

#### originalPath

> **originalPath**: `string`

Original database file path.

##### Remarks

The absolute path to the original SQLite database file that was
backed up.

#### sizeBytes

> **sizeBytes**: `number`

Database file size in bytes.

##### Remarks

The size of the database file in bytes at the time of backup.

#### Remarks

Contains details about the backup creation, including timestamp, original
path, and file size.
