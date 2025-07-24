# Interface: DatabaseBackupResult

Defined in: [electron/services/database/utils/databaseBackup.ts:20](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/services/database/utils/databaseBackup.ts#L20)

Result interface for database backup operations.

## Remarks

Provides structured return type for backup operations with comprehensive
metadata for tracking and validation.

## Properties

### buffer

> **buffer**: `Buffer`

Defined in: [electron/services/database/utils/databaseBackup.ts:22](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/services/database/utils/databaseBackup.ts#L22)

Binary buffer containing the complete SQLite database

***

### fileName

> **fileName**: `string`

Defined in: [electron/services/database/utils/databaseBackup.ts:24](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/services/database/utils/databaseBackup.ts#L24)

Standardized filename for the backup file

***

### metadata

> **metadata**: `object`

Defined in: [electron/services/database/utils/databaseBackup.ts:26](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/services/database/utils/databaseBackup.ts#L26)

Metadata about the backup operation

#### createdAt

> **createdAt**: `number`

Backup creation timestamp

#### originalPath

> **originalPath**: `string`

Original database file path

#### sizeBytes

> **sizeBytes**: `number`

Database file size in bytes
