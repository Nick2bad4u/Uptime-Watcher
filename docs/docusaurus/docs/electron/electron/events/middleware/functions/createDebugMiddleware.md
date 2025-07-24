# Function: createDebugMiddleware()

> **createDebugMiddleware**(`options`): [`EventMiddleware`](../../TypedEventBus/type-aliases/EventMiddleware.md)

Defined in: [electron/events/middleware.ts:126](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/events/middleware.ts#L126)

Debug middleware that provides detailed debugging information.

## Parameters

### options

Configuration options for debug middleware

#### enabled?

`boolean`

#### verbose?

`boolean`

## Returns

[`EventMiddleware`](../../TypedEventBus/type-aliases/EventMiddleware.md)

EventMiddleware function that logs event processing with timing information

## Remarks

Options include:
- `enabled`: Whether debug logging is enabled (defaults to development mode)
- `verbose`: Whether to include event data in debug logs

## Example

```typescript
const debugMiddleware = createDebugMiddleware({
  enabled: true,
  verbose: true
});
eventBus.use(debugMiddleware);
```
