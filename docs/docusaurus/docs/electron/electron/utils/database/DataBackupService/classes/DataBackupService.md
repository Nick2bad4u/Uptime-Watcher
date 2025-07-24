# Class: DataBackupService

Defined in: [electron/utils/database/DataBackupService.ts:26](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/utils/database/DataBackupService.ts#L26)

Service for handling data backup operations.
Separates data operations from side effects for better testability.

## Constructors

### Constructor

> **new DataBackupService**(`config`): `DataBackupService`

Defined in: [electron/utils/database/DataBackupService.ts:30](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/utils/database/DataBackupService.ts#L30)

#### Parameters

##### config

[`DataBackupConfig`](../interfaces/DataBackupConfig.md)

#### Returns

`DataBackupService`

## Methods

### downloadDatabaseBackup()

> **downloadDatabaseBackup**(): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\` `buffer`: [`Buffer`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/node/buffer.buffer.d.ts#L356); `fileName`: `string`; \`\>

Defined in: [electron/utils/database/DataBackupService.ts:39](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/utils/database/DataBackupService.ts#L39)

Download SQLite database backup.
Pure data operation that returns backup buffer and filename.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\` `buffer`: [`Buffer`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/node/buffer.buffer.d.ts#L356); `fileName`: `string`; \`\>
