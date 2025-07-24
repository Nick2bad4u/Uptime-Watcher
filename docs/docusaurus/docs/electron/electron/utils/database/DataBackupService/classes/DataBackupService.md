# Class: DataBackupService

Defined in: [electron/utils/database/DataBackupService.ts:26](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/utils/database/DataBackupService.ts#L26)

Service for handling data backup operations.
Separates data operations from side effects for better testability.

## Constructors

### Constructor

> **new DataBackupService**(`config`): `DataBackupService`

Defined in: [electron/utils/database/DataBackupService.ts:30](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/utils/database/DataBackupService.ts#L30)

#### Parameters

##### config

[`DataBackupConfig`](../interfaces/DataBackupConfig.md)

#### Returns

`DataBackupService`

## Methods

### downloadDatabaseBackup()

> **downloadDatabaseBackup**(): `Promise`\<\` `buffer`: `Buffer`; `fileName`: `string`; \`\>

Defined in: [electron/utils/database/DataBackupService.ts:39](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/utils/database/DataBackupService.ts#L39)

Download SQLite database backup.
Pure data operation that returns backup buffer and filename.

#### Returns

`Promise`\<\` `buffer`: `Buffer`; `fileName`: `string`; \`\>
