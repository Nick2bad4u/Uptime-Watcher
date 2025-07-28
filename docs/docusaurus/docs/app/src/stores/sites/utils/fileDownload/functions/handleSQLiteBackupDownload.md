# Function: handleSQLiteBackupDownload()

> **handleSQLiteBackupDownload**(`downloadFunction`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/stores/sites/utils/fileDownload.ts:88](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/stores/sites/utils/fileDownload.ts#L88)

Handles downloading SQLite backup data as a file.

## Parameters

### downloadFunction

() => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`Uint8Array`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array)\<`ArrayBufferLike`\>\>

An async function that returns the backup data as a Uint8Array

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

## Remarks

This function retrieves backup data using the provided function, validates it, and triggers a browser download.
The download is performed using a Blob and anchor element with proper object URL lifecycle management.

## Throws

TypeError if the backup data is not a Uint8Array

## Throws

Error if the download fails due to browser API or DOM errors

## Example

```typescript
await handleSQLiteBackupDownload(() => fetchBackupData());
```
