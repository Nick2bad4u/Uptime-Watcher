# Function: downloadFile()

> **downloadFile**(`options`): `void`

Defined in: [src/stores/sites/utils/fileDownload.ts:43](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/stores/sites/utils/fileDownload.ts#L43)

Triggers a file download in the browser.

## Parameters

### options

[`FileDownloadOptions`](../interfaces/FileDownloadOptions.md)

The file download options including buffer, fileName, and optional mimeType.

## Returns

`void`

## Remarks

This function creates a Blob from the provided buffer and initiates a download using an anchor element.
If the primary method fails, a fallback strategy is attempted.

## Throws

Error If the download fails due to browser API issues or DOM manipulation errors.

## Example

```typescript
downloadFile({
  buffer: myArrayBuffer,
  fileName: "report.txt",
  mimeType: "text/plain"
});
```
