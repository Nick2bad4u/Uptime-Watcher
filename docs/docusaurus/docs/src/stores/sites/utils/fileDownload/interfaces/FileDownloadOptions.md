# Interface: FileDownloadOptions

Defined in: [src/stores/sites/utils/fileDownload.ts:17](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/sites/utils/fileDownload.ts#L17)

Options for downloading a file in the browser.

## Remarks

Used to specify the file buffer, filename, and optional MIME type for
download operations.

## Properties

### buffer

> **buffer**: [`ArrayBuffer`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer)

Defined in: [src/stores/sites/utils/fileDownload.ts:19](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/sites/utils/fileDownload.ts#L19)

The file buffer to download

***

### fileName

> **fileName**: `string`

Defined in: [src/stores/sites/utils/fileDownload.ts:21](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/sites/utils/fileDownload.ts#L21)

The filename for the download

***

### mimeType?

> `optional` **mimeType**: `string`

Defined in: [src/stores/sites/utils/fileDownload.ts:23](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/sites/utils/fileDownload.ts#L23)

The MIME type of the file
