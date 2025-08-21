# Function: ensureError()

> **ensureError**(`error`): [`Error`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

Defined in: [src/utils/errorHandling.ts:19](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/utils/errorHandling.ts#L19)

Ensures an error object is properly typed and formatted. Converts unknown
error types to proper Error instances.

## Parameters

### error

`unknown`

Unknown error value from catch blocks

## Returns

[`Error`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

Properly typed Error instance
