# Function: handleSQLiteBackupDownload()

> **handleSQLiteBackupDownload**(`downloadFunction`): `Promise`\<`void`\>

Defined in: [src/stores/sites/utils/fileDownload.ts:45](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/stores/sites/utils/fileDownload.ts#L45)

Handles downloading SQLite backup data as a file

## Parameters

### downloadFunction

() => `Promise`\<`Uint8Array`\<`ArrayBufferLike`\>\>

## Returns

`Promise`\<`void`\>

## Throws

Error if download fails or browser APIs are not available
