# Interface: ErrorBoundaryProperties

Defined in: [src/stores/error/ErrorBoundary.tsx:60](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/error/ErrorBoundary.tsx#L60)

Props for the [ErrorBoundary](../classes/ErrorBoundary.md) component.

## Remarks

Accepts children to render, an optional fallback component for error display,
and an optional error handler callback.

## Properties

### children

> `readonly` **children**: [`ReactNode`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/80449050d0e5e84f44ffa3fd3dc5651e4747e589/types/react/index.d.ts#L427)

Defined in: [src/stores/error/ErrorBoundary.tsx:61](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/error/ErrorBoundary.tsx#L61)

***

### fallback?

> `readonly` `optional` **fallback**: [`ComponentType`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/80449050d0e5e84f44ffa3fd3dc5651e4747e589/types/react/index.d.ts#L123)\<\` `error?`: [`Error`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error); `onRetry`: () => `void`; \`\>

Defined in: [src/stores/error/ErrorBoundary.tsx:62](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/error/ErrorBoundary.tsx#L62)

***

### onError()?

> `readonly` `optional` **onError**: (`error`, `errorInfo`) => `void`

Defined in: [src/stores/error/ErrorBoundary.tsx:66](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/error/ErrorBoundary.tsx#L66)

#### Parameters

##### error

[`Error`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

##### errorInfo

[`ErrorInfo`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/80449050d0e5e84f44ffa3fd3dc5651e4747e589/types/react/index.d.ts#L4006)

#### Returns

`void`
