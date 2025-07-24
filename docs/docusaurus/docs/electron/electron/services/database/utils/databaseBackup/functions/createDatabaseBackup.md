# Function: createDatabaseBackup()

> **createDatabaseBackup**(`dbPath`, `fileName`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`DatabaseBackupResult`](../interfaces/DatabaseBackupResult.md)\>

Defined in: [electron/services/database/utils/databaseBackup.ts:69](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/database/utils/databaseBackup.ts#L69)

Create a database backup by reading the SQLite file into a buffer.

## Parameters

### dbPath

`string`

Absolute path to the SQLite database file to backup

### fileName

`string` = `DATABASE_FILE_NAME`

Optional custom filename for the backup (defaults to "uptime-watcher-backup.sqlite")

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`DatabaseBackupResult`](../interfaces/DatabaseBackupResult.md)\>

Promise resolving to backup data with buffer, filename, and metadata

## Throws

Re-throws file system errors after logging for upstream handling

## Remarks

**Backup Process:**
- Reads the entire SQLite database file into memory as a Buffer
- Returns structured result with buffer data and comprehensive metadata
- Uses dynamic import of fs/promises to minimize startup overhead
- Enhanced error handling for import failures and file operations

**Performance Considerations:**
- Loads entire database into memory (suitable for typical database sizes)
- For very large databases, consider streaming approaches

**Error Handling:**
- Handles dynamic import failures gracefully
- Logs stack traces for enhanced debugging
- Provides detailed error context for troubleshooting

**Usage:**
```typescript
const backup = await createDatabaseBackup("/path/to/database.sqlite");
// backup.buffer contains the database data
// backup.fileName contains "uptime-watcher-backup.sqlite"
// backup.metadata contains operation details
```
