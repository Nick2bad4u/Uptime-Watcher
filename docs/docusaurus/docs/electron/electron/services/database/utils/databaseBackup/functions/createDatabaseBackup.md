# Function: createDatabaseBackup()

> **createDatabaseBackup**(`dbPath`, `fileName`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`DatabaseBackupResult`](../interfaces/DatabaseBackupResult.md)\>

Defined in: [electron/services/database/utils/databaseBackup.ts:86](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/utils/databaseBackup.ts#L86)

Creates a backup of the SQLite database by reading the file into a buffer.

## Parameters

### dbPath

`string`

Absolute path to the SQLite database file to backup.

### fileName

`string` = `BACKUP_DB_FILE_NAME`

Optional custom filename for the backup (defaults to "uptime-watcher-backup.sqlite").

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`DatabaseBackupResult`](../interfaces/DatabaseBackupResult.md)\>

Promise resolving to a [DatabaseBackupResult](../interfaces/DatabaseBackupResult.md) containing the backup buffer, filename, and metadata.

## Remarks

Reads the entire SQLite database file into memory as a Buffer and returns a structured result with buffer data, filename, and comprehensive metadata. Uses dynamic import of `fs/promises` to minimize startup overhead. Enhanced error handling for import failures and file operations. Loads the entire database into memory (suitable for typical database sizes). For very large databases, consider streaming approaches.

## Throws

Re-throws file system errors after logging for upstream handling, including dynamic import failures and file read errors.

## Example

```typescript
const backup = await createDatabaseBackup("/path/to/database.sqlite");
// backup.buffer contains the database data
// backup.fileName contains "uptime-watcher-backup.sqlite"
// backup.metadata contains operation details
```
