# Function: handleSQLiteBackupDownload()

> **handleSQLiteBackupDownload**(`downloadFunction`): `Promise`\<`void`\>

Defined in: [src/stores/sites/utils/fileDownload.ts:45](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/src/stores/sites/utils/fileDownload.ts#L45)

Handles downloading SQLite backup data as a file

## Parameters

### downloadFunction

() => `Promise`\<`Uint8Array`\<`ArrayBufferLike`\>\>

## Returns

`Promise`\<`void`\>

## Throws

Error if download fails or browser APIs are not available
