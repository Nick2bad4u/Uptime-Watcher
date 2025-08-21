# Function: withErrorBoundary()

> **withErrorBoundary**\<`P`\>(`Component`, `fallback?`): `WrappedErrorBoundaryComponent`\<`P`\>

Defined in: [src/stores/error/withErrorBoundary.tsx:55](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/error/withErrorBoundary.tsx#L55)

Higher-order component for wrapping components with error boundary
protection.

## Type Parameters

### P

`P` *extends* `object`

The props type for the wrapped component.

## Parameters

### Component

[`ComponentType`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/80449050d0e5e84f44ffa3fd3dc5651e4747e589/types/react/index.d.ts#L123)\<`P`\>

The component to wrap with error boundary protection.

### fallback?

[`ComponentType`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/80449050d0e5e84f44ffa3fd3dc5651e4747e589/types/react/index.d.ts#L123)\<\` `error?`: [`Error`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Error); `onRetry`: () => `void`; \`\>

Optional custom fallback component for error display.

## Returns

`WrappedErrorBoundaryComponent`\<`P`\>

Wrapped component with error boundary functionality.

## Remarks

Returns a new component that wraps the given component in an
[ErrorBoundary](../../ErrorBoundary/classes/ErrorBoundary.md). Supports custom fallback components for error display.
Sets a display name for easier debugging in React DevTools.

## Example

```tsx
const SafeComponent = withErrorBoundary(
    MyComponent,
    CustomErrorFallback
);
```
