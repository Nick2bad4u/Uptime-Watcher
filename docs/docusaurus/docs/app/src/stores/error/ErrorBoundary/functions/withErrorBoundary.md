# Function: withErrorBoundary()

> **withErrorBoundary**\<`P`\>(`Component`, `fallback?`): \`(`properties`): [`Element`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/1a60e1b9a9062ff9c48c681ca3d8b6f717b616b9/types/react/jsx-runtime.d.ts#L6); `displayName`: `string`; \`

Defined in: [src/stores/error/ErrorBoundary.tsx:125](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/stores/error/ErrorBoundary.tsx#L125)

Higher-order component for wrapping components with error boundary protection.

## Type Parameters

### P

`P` *extends* `object`

The props type for the wrapped component.

## Parameters

### Component

[`ComponentType`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/1a60e1b9a9062ff9c48c681ca3d8b6f717b616b9/types/react/index.d.ts#L123)\<`P`\>

The component to wrap with error boundary protection.

### fallback?

[`ComponentType`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/1a60e1b9a9062ff9c48c681ca3d8b6f717b616b9/types/react/index.d.ts#L123)\<\` `error?`: [`Error`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error); `onRetry`: () => `void`; \`\>

Optional custom fallback component for error display.

## Returns

Wrapped component with error boundary functionality.

> (`properties`): [`Element`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/1a60e1b9a9062ff9c48c681ca3d8b6f717b616b9/types/react/jsx-runtime.d.ts#L6)

### Parameters

#### properties

`P`

### Returns

[`Element`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/1a60e1b9a9062ff9c48c681ca3d8b6f717b616b9/types/react/jsx-runtime.d.ts#L6)

### displayName

> **displayName**: `string`

## Remarks

Returns a new component that wraps the given component in an [ErrorBoundary](../classes/ErrorBoundary.md). Supports custom fallback components for error display. Sets a display name for easier debugging in React DevTools.

## Example

```tsx
const SafeComponent = withErrorBoundary(MyComponent, CustomErrorFallback);
```
