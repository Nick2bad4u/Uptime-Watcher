# Variable: MIDDLEWARE\_STACKS

> `const` **MIDDLEWARE\_STACKS**: `object`

Defined in: [electron/events/middleware.ts:556](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/events/middleware.ts#L556)

Pre-configured middleware stacks for common use cases.

## Type declaration

### custom()

> **custom**: (`middlewares`) => [`EventMiddleware`](../../TypedEventBus/type-aliases/EventMiddleware.md)

Custom stack builder that composes multiple middleware functions.

#### Parameters

##### middlewares

[`EventMiddleware`](../../TypedEventBus/type-aliases/EventMiddleware.md)[]

Array of middleware functions to compose

#### Returns

[`EventMiddleware`](../../TypedEventBus/type-aliases/EventMiddleware.md)

Composed middleware function

#### Example

```typescript
const customStack = MIDDLEWARE_STACKS.custom([
  createLoggingMiddleware({ level: 'info' }),
  createMetricsMiddleware({ trackTiming: true }),
  createValidationMiddleware(myValidators)
]);
```

### development()

> **development**: () => [`EventMiddleware`](../../TypedEventBus/type-aliases/EventMiddleware.md)

Development stack with comprehensive debugging, verbose logging, and error handling.

#### Returns

[`EventMiddleware`](../../TypedEventBus/type-aliases/EventMiddleware.md)

Middleware stack optimized for development

#### Remarks

Includes:
- Error handling (continues on errors)
- Debug middleware (verbose logging)
- Detailed logging with event data

### production()

> **production**: () => [`EventMiddleware`](../../TypedEventBus/type-aliases/EventMiddleware.md)

Production stack with metrics, rate limiting, and error handling.

#### Returns

[`EventMiddleware`](../../TypedEventBus/type-aliases/EventMiddleware.md)

Middleware stack optimized for production

#### Remarks

Includes:
- Error handling (continues on errors)
- Rate limiting (5 burst, 50/sec)
- Metrics tracking (counts and timing)
- Info-level logging (no data included)

### testing()

> **testing**: () => [`EventMiddleware`](../../TypedEventBus/type-aliases/EventMiddleware.md)

Testing stack with minimal overhead and strict error handling.

#### Returns

[`EventMiddleware`](../../TypedEventBus/type-aliases/EventMiddleware.md)

Middleware stack optimized for testing

#### Remarks

Includes:
- Error handling (fails fast on errors)
- Warning-level logging (no data included)
- Minimal performance impact for fast test execution

## Remarks

These middleware stacks provide sensible defaults for different environments
and can be used directly with TypedEventBus or as starting points for custom configurations.

## Example

```typescript
// Use a pre-configured stack
const eventBus = new TypedEventBus('my-bus');
eventBus.use(MIDDLEWARE_STACKS.development());

// Create a custom stack
const customStack = MIDDLEWARE_STACKS.custom([
  createLoggingMiddleware({ level: 'info' }),
  createValidationMiddleware(validators)
]);
eventBus.use(customStack);
```
