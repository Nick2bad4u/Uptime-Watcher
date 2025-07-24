# Interface: ErrorBoundaryProperties

Defined in: [src/stores/error/ErrorBoundary.tsx:16](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/stores/error/ErrorBoundary.tsx#L16)

Props for the ErrorBoundary component

## Properties

### children

> **children**: [`ReactNode`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/1a60e1b9a9062ff9c48c681ca3d8b6f717b616b9/types/react/index.d.ts#L427)

Defined in: [src/stores/error/ErrorBoundary.tsx:17](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/stores/error/ErrorBoundary.tsx#L17)

***

### fallback?

> `optional` **fallback**: [`ComponentType`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/1a60e1b9a9062ff9c48c681ca3d8b6f717b616b9/types/react/index.d.ts#L123)\<\` `error?`: [`Error`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error); `retry`: () => `void`; \`\>

Defined in: [src/stores/error/ErrorBoundary.tsx:18](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/stores/error/ErrorBoundary.tsx#L18)

***

### onError()?

> `optional` **onError**: (`error`, `errorInfo`) => `void`

Defined in: [src/stores/error/ErrorBoundary.tsx:19](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/stores/error/ErrorBoundary.tsx#L19)

#### Parameters

##### error

[`Error`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

##### errorInfo

[`ErrorInfo`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/1a60e1b9a9062ff9c48c681ca3d8b6f717b616b9/types/react/index.d.ts#L4006)

#### Returns

`void`
