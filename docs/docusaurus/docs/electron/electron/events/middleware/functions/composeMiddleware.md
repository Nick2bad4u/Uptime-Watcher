# Function: composeMiddleware()

> **composeMiddleware**(...`middlewares`): [`EventMiddleware`](../../TypedEventBus/type-aliases/EventMiddleware.md)

Defined in: [electron/events/middleware.ts:120](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/events/middleware.ts#L120)

Compose multiple middleware functions into a single middleware chain.

## Parameters

### middlewares

...[`EventMiddleware`](../../TypedEventBus/type-aliases/EventMiddleware.md)[]

Array of middleware functions to compose into a single chain

## Returns

[`EventMiddleware`](../../TypedEventBus/type-aliases/EventMiddleware.md)

Combined middleware function that executes all provided middlewares in sequence

## Remarks

Executes middlewares in the order they are provided. Each middleware must call `next()`
to continue the chain, or omit it to stop execution.

## Example

```typescript
const combinedMiddleware = composeMiddleware(
  createLoggingMiddleware({ level: 'info' }),
  createValidationMiddleware(validators),
  createMetricsMiddleware({ trackTiming: true })
);

eventBus.use(combinedMiddleware);
```
