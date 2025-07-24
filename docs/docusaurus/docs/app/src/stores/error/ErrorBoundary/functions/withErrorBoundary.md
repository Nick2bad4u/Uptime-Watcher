# Function: withErrorBoundary()

> **withErrorBoundary**\<`P`\>(`Component`, `fallback?`): \`(`properties`): [`Element`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/1a60e1b9a9062ff9c48c681ca3d8b6f717b616b9/types/react/jsx-runtime.d.ts#L6); `displayName`: `string`; \`

Defined in: [src/stores/error/ErrorBoundary.tsx:86](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/stores/error/ErrorBoundary.tsx#L86)

Higher-order component for wrapping components with error boundary

## Type Parameters

### P

`P` *extends* `object`

## Parameters

### Component

[`ComponentType`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/1a60e1b9a9062ff9c48c681ca3d8b6f717b616b9/types/react/index.d.ts#L123)\<`P`\>

### fallback?

[`ComponentType`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/1a60e1b9a9062ff9c48c681ca3d8b6f717b616b9/types/react/index.d.ts#L123)\<\` `error?`: [`Error`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error); `retry`: () => `void`; \`\>

## Returns

> (`properties`): [`Element`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/1a60e1b9a9062ff9c48c681ca3d8b6f717b616b9/types/react/jsx-runtime.d.ts#L6)

### Parameters

#### properties

`P`

### Returns

[`Element`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/1a60e1b9a9062ff9c48c681ca3d8b6f717b616b9/types/react/jsx-runtime.d.ts#L6)

### displayName

> **displayName**: `string`
