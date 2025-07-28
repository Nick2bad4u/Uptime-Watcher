# Interface: ErrorBoundaryProperties

Defined in: [src/stores/error/ErrorBoundary.tsx:23](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/stores/error/ErrorBoundary.tsx#L23)

Props for the [ErrorBoundary](../classes/ErrorBoundary.md) component.

## Remarks

Accepts children to render, an optional fallback component for error display, and an optional error handler callback.

## Properties

### children

> **children**: [`ReactNode`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/1a60e1b9a9062ff9c48c681ca3d8b6f717b616b9/types/react/index.d.ts#L427)

Defined in: [src/stores/error/ErrorBoundary.tsx:24](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/stores/error/ErrorBoundary.tsx#L24)

***

### fallback?

> `optional` **fallback**: [`ComponentType`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/1a60e1b9a9062ff9c48c681ca3d8b6f717b616b9/types/react/index.d.ts#L123)\<\` `error?`: [`Error`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error); `onRetry`: () => `void`; \`\>

Defined in: [src/stores/error/ErrorBoundary.tsx:25](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/stores/error/ErrorBoundary.tsx#L25)

***

### onError()?

> `optional` **onError**: (`error`, `errorInfo`) => `void`

Defined in: [src/stores/error/ErrorBoundary.tsx:26](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/stores/error/ErrorBoundary.tsx#L26)

#### Parameters

##### error

[`Error`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

##### errorInfo

[`ErrorInfo`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/1a60e1b9a9062ff9c48c681ca3d8b6f717b616b9/types/react/index.d.ts#L4006)

#### Returns

`void`
