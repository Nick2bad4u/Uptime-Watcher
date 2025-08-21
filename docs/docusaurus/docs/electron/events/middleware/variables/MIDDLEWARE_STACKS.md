# Variable: MIDDLEWARE\_STACKS

> `const` **MIDDLEWARE\_STACKS**: `MiddlewareStacks`

Defined in: [electron/events/middleware.ts:813](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/events/middleware.ts#L813)

Predefined middleware stacks for different environments.

## Remarks

Provides convenient factory functions for common middleware stacks: custom,
development, production, and testing. Each stack returns a composed
middleware chain suitable for the target environment.

## Example

```typescript
// Use a pre-configured stack
const eventBus = new TypedEventBus("my-bus");
eventBus.use(MIDDLEWARE_STACKS.development());

// Create a custom stack
const customStack = MIDDLEWARE_STACKS.custom([
    createLoggingMiddleware({ level: "info" }),
    createValidationMiddleware(validators),
]);
eventBus.use(customStack);
```
