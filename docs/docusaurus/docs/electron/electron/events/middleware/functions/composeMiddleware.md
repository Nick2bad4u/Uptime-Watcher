# Function: composeMiddleware()

> **composeMiddleware**(...`middlewares`): [`EventMiddleware`](../../TypedEventBus/type-aliases/EventMiddleware.md)

Defined in: [electron/events/middleware.ts:86](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/events/middleware.ts#L86)

Middleware composer to combine multiple middleware functions.

## Parameters

### middlewares

...[`EventMiddleware`](../../TypedEventBus/type-aliases/EventMiddleware.md)[]

Array of middleware functions to compose into a single middleware chain

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
