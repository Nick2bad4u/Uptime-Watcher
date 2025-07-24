# Class: ErrorBoundary

Defined in: [src/stores/error/ErrorBoundary.tsx:36](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/stores/error/ErrorBoundary.tsx#L36)

Error boundary component for wrapping store-connected components

## Extends

- [`Component`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/1a60e1b9a9062ff9c48c681ca3d8b6f717b616b9/types/react/index.d.ts#L900)\<[`ErrorBoundaryProperties`](../interfaces/ErrorBoundaryProperties.md), [`ErrorBoundaryState`](../interfaces/ErrorBoundaryState.md)\>

## Constructors

### Constructor

> **new ErrorBoundary**(`properties`): `ErrorBoundary`

Defined in: [src/stores/error/ErrorBoundary.tsx:37](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/stores/error/ErrorBoundary.tsx#L37)

#### Parameters

##### properties

[`ErrorBoundaryProperties`](../interfaces/ErrorBoundaryProperties.md)

#### Returns

`ErrorBoundary`

#### Overrides

`React.Component`ErrorBoundaryProperties, ErrorBoundaryState`.constructor`

## Methods

### componentDidCatch()

> **componentDidCatch**(`error`, `errorInfo`): `void`

Defined in: [src/stores/error/ErrorBoundary.tsx:51](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/stores/error/ErrorBoundary.tsx#L51)

Catches exceptions generated in descendant components. Unhandled exceptions will cause
the entire component tree to unmount.

#### Parameters

##### error

[`Error`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

##### errorInfo

[`ErrorInfo`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/1a60e1b9a9062ff9c48c681ca3d8b6f717b616b9/types/react/index.d.ts#L4006)

#### Returns

`void`

#### Overrides

`React.Component.componentDidCatch`

***

### handleRetry()

> **handleRetry**(): `void`

Defined in: [src/stores/error/ErrorBoundary.tsx:63](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/stores/error/ErrorBoundary.tsx#L63)

#### Returns

`void`

***

### render()

> **render**(): `undefined` \| `null` \| `string` \| `number` \| `bigint` \| `boolean` \| [`Iterable`](https://www.typescriptlang.org/docs/handbook/iterators-and-generators.html#iterable-interface)\<[`ReactNode`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/1a60e1b9a9062ff9c48c681ca3d8b6f717b616b9/types/react/index.d.ts#L427), `any`, `any`\> \| [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`AwaitedReactNode`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/1a60e1b9a9062ff9c48c681ca3d8b6f717b616b9/types/react/index.d.ts#L42)\> \| [`Element`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/1a60e1b9a9062ff9c48c681ca3d8b6f717b616b9/types/react/jsx-runtime.d.ts#L6)

Defined in: [src/stores/error/ErrorBoundary.tsx:68](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/stores/error/ErrorBoundary.tsx#L68)

#### Returns

`undefined` \| `null` \| `string` \| `number` \| `bigint` \| `boolean` \| [`Iterable`](https://www.typescriptlang.org/docs/handbook/iterators-and-generators.html#iterable-interface)\<[`ReactNode`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/1a60e1b9a9062ff9c48c681ca3d8b6f717b616b9/types/react/index.d.ts#L427), `any`, `any`\> \| [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`AwaitedReactNode`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/1a60e1b9a9062ff9c48c681ca3d8b6f717b616b9/types/react/index.d.ts#L42)\> \| [`Element`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/1a60e1b9a9062ff9c48c681ca3d8b6f717b616b9/types/react/jsx-runtime.d.ts#L6)

#### Overrides

`React.Component.render`

***

### getDerivedStateFromError()

> `static` **getDerivedStateFromError**(`error`): [`ErrorBoundaryState`](../interfaces/ErrorBoundaryState.md)

Defined in: [src/stores/error/ErrorBoundary.tsx:44](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/stores/error/ErrorBoundary.tsx#L44)

#### Parameters

##### error

[`Error`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

#### Returns

[`ErrorBoundaryState`](../interfaces/ErrorBoundaryState.md)
