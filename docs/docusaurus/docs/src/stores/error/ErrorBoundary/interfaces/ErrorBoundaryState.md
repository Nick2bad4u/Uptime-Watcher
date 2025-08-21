# Interface: ErrorBoundaryState

Defined in: [src/stores/error/ErrorBoundary.tsx:78](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/error/ErrorBoundary.tsx#L78)

State for the [ErrorBoundary](../classes/ErrorBoundary.md) component.

## Remarks

Tracks error state for rendering fallback UI. The retryCount is used to force
re-mounting of children on retry.

## Properties

### error?

> `optional` **error**: [`Error`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

Defined in: [src/stores/error/ErrorBoundary.tsx:79](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/error/ErrorBoundary.tsx#L79)

***

### hasError

> **hasError**: `boolean`

Defined in: [src/stores/error/ErrorBoundary.tsx:80](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/error/ErrorBoundary.tsx#L80)

***

### retryCount

> **retryCount**: `number`

Defined in: [src/stores/error/ErrorBoundary.tsx:81](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/error/ErrorBoundary.tsx#L81)
