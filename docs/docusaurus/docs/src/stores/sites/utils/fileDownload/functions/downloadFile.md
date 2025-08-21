# Function: downloadFile()

> **downloadFile**(`options`): `void`

Defined in: [src/stores/sites/utils/fileDownload.ts:199](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/sites/utils/fileDownload.ts#L199)

Triggers a file download in the browser.

## Parameters

### options

[`FileDownloadOptions`](../interfaces/FileDownloadOptions.md)

The file download options including buffer, fileName, and
  optional mimeType.

## Returns

`void`

## Remarks

This function creates a Blob from the provided buffer and initiates a
download using an anchor element. If the primary method fails, a fallback
strategy is attempted.

## Example

```typescript
downloadFile({
    buffer: myArrayBuffer,
    fileName: "report.txt",
    mimeType: "text/plain",
});
```

## Throws

Error If the download fails due to browser API issues or DOM
  manipulation errors.
