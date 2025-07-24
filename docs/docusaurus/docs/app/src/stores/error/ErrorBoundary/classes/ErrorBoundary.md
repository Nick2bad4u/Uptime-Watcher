# Class: ErrorBoundary

Defined in: [src/stores/error/ErrorBoundary.tsx:26](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/stores/error/ErrorBoundary.tsx#L26)

Error boundary component for wrapping store-connected components

## Extends

- `Component`\<`ErrorBoundaryProperties`, `ErrorBoundaryState`\>

## Constructors

### Constructor

> **new ErrorBoundary**(`properties`): `ErrorBoundary`

Defined in: [src/stores/error/ErrorBoundary.tsx:27](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/stores/error/ErrorBoundary.tsx#L27)

#### Parameters

##### properties

`ErrorBoundaryProperties`

#### Returns

`ErrorBoundary`

#### Overrides

`React.Component`ErrorBoundaryProperties, ErrorBoundaryState`.constructor`

## Methods

### componentDidCatch()

> **componentDidCatch**(`error`, `errorInfo`): `void`

Defined in: [src/stores/error/ErrorBoundary.tsx:41](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/stores/error/ErrorBoundary.tsx#L41)

Catches exceptions generated in descendant components. Unhandled exceptions will cause
the entire component tree to unmount.

#### Parameters

##### error

`Error`

##### errorInfo

`ErrorInfo`

#### Returns

`void`

#### Overrides

`React.Component.componentDidCatch`

***

### handleRetry()

> **handleRetry**(): `void`

Defined in: [src/stores/error/ErrorBoundary.tsx:53](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/stores/error/ErrorBoundary.tsx#L53)

#### Returns

`void`

***

### render()

> **render**(): `undefined` \| `null` \| `string` \| `number` \| `bigint` \| `boolean` \| `Iterable`\<`ReactNode`, `any`, `any`\> \| `Promise`\<`AwaitedReactNode`\> \| `Element`

Defined in: [src/stores/error/ErrorBoundary.tsx:58](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/stores/error/ErrorBoundary.tsx#L58)

#### Returns

`undefined` \| `null` \| `string` \| `number` \| `bigint` \| `boolean` \| `Iterable`\<`ReactNode`, `any`, `any`\> \| `Promise`\<`AwaitedReactNode`\> \| `Element`

#### Overrides

`React.Component.render`

***

### getDerivedStateFromError()

> `static` **getDerivedStateFromError**(`error`): `ErrorBoundaryState`

Defined in: [src/stores/error/ErrorBoundary.tsx:34](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/stores/error/ErrorBoundary.tsx#L34)

#### Parameters

##### error

`Error`

#### Returns

`ErrorBoundaryState`
