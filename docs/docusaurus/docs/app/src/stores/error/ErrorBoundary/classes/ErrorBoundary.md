# Class: ErrorBoundary

Defined in: [src/stores/error/ErrorBoundary.tsx:58](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/stores/error/ErrorBoundary.tsx#L58)

Error boundary component for wrapping store-connected components.

## Remarks

Catches errors in child components, logs them, and displays a fallback UI. Supports custom fallback components and error handling callbacks. Used to wrap store-connected or critical UI components.

## Example

```tsx
<ErrorBoundary>
  <MyComponent />
</ErrorBoundary>
```

## Extends

- [`Component`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/1a60e1b9a9062ff9c48c681ca3d8b6f717b616b9/types/react/index.d.ts#L900)\<[`ErrorBoundaryProperties`](../interfaces/ErrorBoundaryProperties.md), [`ErrorBoundaryState`](../interfaces/ErrorBoundaryState.md)\>

## Constructors

### Constructor

> **new ErrorBoundary**(`properties`): `ErrorBoundary`

Defined in: [src/stores/error/ErrorBoundary.tsx:59](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/stores/error/ErrorBoundary.tsx#L59)

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

Defined in: [src/stores/error/ErrorBoundary.tsx:73](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/stores/error/ErrorBoundary.tsx#L73)

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

Defined in: [src/stores/error/ErrorBoundary.tsx:85](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/stores/error/ErrorBoundary.tsx#L85)

#### Returns

`void`

***

### render()

> **render**(): `undefined` \| `null` \| `string` \| `number` \| `bigint` \| `boolean` \| [`Iterable`](https://www.typescriptlang.org/docs/handbook/iterators-and-generators.html#iterable-interface)\<[`ReactNode`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/1a60e1b9a9062ff9c48c681ca3d8b6f717b616b9/types/react/index.d.ts#L427), `any`, `any`\> \| [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`AwaitedReactNode`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/1a60e1b9a9062ff9c48c681ca3d8b6f717b616b9/types/react/index.d.ts#L42)\> \| [`Element`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/1a60e1b9a9062ff9c48c681ca3d8b6f717b616b9/types/react/jsx-runtime.d.ts#L6)

Defined in: [src/stores/error/ErrorBoundary.tsx:94](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/stores/error/ErrorBoundary.tsx#L94)

#### Returns

`undefined` \| `null` \| `string` \| `number` \| `bigint` \| `boolean` \| [`Iterable`](https://www.typescriptlang.org/docs/handbook/iterators-and-generators.html#iterable-interface)\<[`ReactNode`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/1a60e1b9a9062ff9c48c681ca3d8b6f717b616b9/types/react/index.d.ts#L427), `any`, `any`\> \| [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<[`AwaitedReactNode`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/1a60e1b9a9062ff9c48c681ca3d8b6f717b616b9/types/react/index.d.ts#L42)\> \| [`Element`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/1a60e1b9a9062ff9c48c681ca3d8b6f717b616b9/types/react/jsx-runtime.d.ts#L6)

#### Overrides

`React.Component.render`

***

### getDerivedStateFromError()

> `static` **getDerivedStateFromError**(`error`): [`ErrorBoundaryState`](../interfaces/ErrorBoundaryState.md)

Defined in: [src/stores/error/ErrorBoundary.tsx:66](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/stores/error/ErrorBoundary.tsx#L66)

#### Parameters

##### error

[`Error`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

#### Returns

[`ErrorBoundaryState`](../interfaces/ErrorBoundaryState.md)
