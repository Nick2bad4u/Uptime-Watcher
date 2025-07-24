# Function: withErrorBoundary()

> **withErrorBoundary**\<`P`\>(`Component`, `fallback?`): \`(`properties`): `Element`; `displayName`: `string`; \`

Defined in: [src/stores/error/ErrorBoundary.tsx:76](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/src/stores/error/ErrorBoundary.tsx#L76)

Higher-order component for wrapping components with error boundary

## Type Parameters

### P

`P` *extends* `object`

## Parameters

### Component

`ComponentType`\<`P`\>

### fallback?

`ComponentType`\<\` `error?`: `Error`; `retry`: () => `void`; \`\>

## Returns

> (`properties`): `Element`

### Parameters

#### properties

`P`

### Returns

`Element`

### displayName

> **displayName**: `string`
