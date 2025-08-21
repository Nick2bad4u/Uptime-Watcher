# Interface: IDataBackupService

Defined in: [electron/services/factories/DatabaseServiceFactory.ts:61](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/factories/DatabaseServiceFactory.ts#L61)

Abstract interface for backup service operations.

## Remarks

Used for type safety and dependency injection for backup-related operations.

## Properties

### downloadDatabaseBackup()

> **downloadDatabaseBackup**: () => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\` `buffer`: [`Buffer`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/5216a9587cc018ac42f777f31b0e07038423e30a/types/node/buffer.buffer.d.ts#L356); `fileName`: `string`; \`\>

Defined in: [electron/services/factories/DatabaseServiceFactory.ts:62](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/factories/DatabaseServiceFactory.ts#L62)

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\` `buffer`: [`Buffer`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/5216a9587cc018ac42f777f31b0e07038423e30a/types/node/buffer.buffer.d.ts#L356); `fileName`: `string`; \`\>
