# Class: DataBackupService

Defined in: [electron/utils/database/DataBackupService.ts:34](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/database/DataBackupService.ts#L34)

Service for handling data backup operations.

Separates data operations from side effects for better testability.

## Constructors

### Constructor

> **new DataBackupService**(`config`): `DataBackupService`

Defined in: [electron/utils/database/DataBackupService.ts:76](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/database/DataBackupService.ts#L76)

#### Parameters

##### config

[`DataBackupConfig`](../interfaces/DataBackupConfig.md)

#### Returns

`DataBackupService`

## Methods

### downloadDatabaseBackup()

> **downloadDatabaseBackup**(): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\` `buffer`: [`Buffer`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/5216a9587cc018ac42f777f31b0e07038423e30a/types/node/buffer.buffer.d.ts#L356); `fileName`: `string`; \`\>

Defined in: [electron/utils/database/DataBackupService.ts:48](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/database/DataBackupService.ts#L48)

Download SQLite database backup.

Pure data operation that returns backup buffer and filename.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\` `buffer`: [`Buffer`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/5216a9587cc018ac42f777f31b0e07038423e30a/types/node/buffer.buffer.d.ts#L356); `fileName`: `string`; \`\>

Promise resolving to backup buffer and filename

#### Throws

SiteLoadingError when backup creation fails
