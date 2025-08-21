# Function: generateBackupFileName()

> **generateBackupFileName**(`prefix`, `extension`): `string`

Defined in: [src/stores/sites/utils/fileDownload.ts:227](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/sites/utils/fileDownload.ts#L227)

Generates a default backup filename with a timestamp.

## Parameters

### prefix

`string` = `"backup"`

The prefix for the filename (default: "backup").

### extension

`string` = `"sqlite"`

The file extension (default: "sqlite").

## Returns

`string`

The generated filename string.

## Remarks

The filename is formatted as `$`prefix`-$`YYYY-MM-DD`.$`extension``.

## Example

```typescript
const fileName = generateBackupFileName("db", "sqlite3");
// "db-2024-06-01.sqlite3"
```
