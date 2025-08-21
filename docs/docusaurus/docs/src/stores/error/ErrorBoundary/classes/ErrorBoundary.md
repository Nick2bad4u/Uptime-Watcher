# Class: ErrorBoundary

Defined in: [src/stores/error/ErrorBoundary.tsx:104](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/error/ErrorBoundary.tsx#L104)

Error boundary component for wrapping store-connected components.

## Remarks

Catches errors in child components, logs them, and displays a fallback UI.
Supports custom fallback components and error handling callbacks. Used to
wrap store-connected or critical UI components.

## Example

```tsx
<ErrorBoundary>
    <MyComponent />
</ErrorBoundary>;
```

## Extends

- [`Component`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/80449050d0e5e84f44ffa3fd3dc5651e4747e589/types/react/index.d.ts#L900)\<[`ErrorBoundaryProperties`](../interfaces/ErrorBoundaryProperties.md), [`ErrorBoundaryState`](../interfaces/ErrorBoundaryState.md)\>

## Constructors

### Constructor

> **new ErrorBoundary**(`properties`): `ErrorBoundary`

Defined in: [src/stores/error/ErrorBoundary.tsx:126](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/error/ErrorBoundary.tsx#L126)

#### Parameters

##### properties

[`ErrorBoundaryProperties`](../interfaces/ErrorBoundaryProperties.md)

#### Returns

`ErrorBoundary`

#### Overrides

`React.Component` ErrorBoundaryProperties, ErrorBoundaryState `.constructor`

## Methods

### handleRetry()

> **handleRetry**(): `void`

Defined in: [src/stores/error/ErrorBoundary.tsx:109](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/error/ErrorBoundary.tsx#L109)

#### Returns

`void`

***

### getDerivedStateFromError()

> `static` **getDerivedStateFromError**(`error`): [`ErrorBoundaryState`](../interfaces/ErrorBoundaryState.md)

Defined in: [src/stores/error/ErrorBoundary.tsx:118](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/error/ErrorBoundary.tsx#L118)

#### Parameters

##### error

[`Error`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

#### Returns

[`ErrorBoundaryState`](../interfaces/ErrorBoundaryState.md)

***

### componentDidCatch()

> **componentDidCatch**(`error`, `errorInfo`): `void`

Defined in: [src/stores/error/ErrorBoundary.tsx:137](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/error/ErrorBoundary.tsx#L137)

Catches exceptions generated in descendant components. Unhandled exceptions will cause
the entire component tree to unmount.

#### Parameters

##### error

[`Error`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error)

##### errorInfo

[`ErrorInfo`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/80449050d0e5e84f44ffa3fd3dc5651e4747e589/types/react/index.d.ts#L4006)

#### Returns

`void`

#### Overrides

`React.Component.componentDidCatch`

***

### render()

> **render**(): [`Element`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/80449050d0e5e84f44ffa3fd3dc5651e4747e589/types/react/jsx-runtime.d.ts#L6)

Defined in: [src/stores/error/ErrorBoundary.tsx:153](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/error/ErrorBoundary.tsx#L153)

#### Returns

[`Element`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/80449050d0e5e84f44ffa3fd3dc5651e4747e589/types/react/jsx-runtime.d.ts#L6)

#### Overrides

`React.Component.render`
