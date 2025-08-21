# Function: createLoggingMiddleware()

> **createLoggingMiddleware**(`options`): [`EventMiddleware`](../../TypedEventBus/type-aliases/EventMiddleware.md)

Defined in: [electron/events/middleware.ts:487](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/events/middleware.ts#L487)

Logging middleware that logs all events with configurable detail levels.

## Parameters

### options

Configuration options for event logging

#### filter?

(`eventName`) => `boolean`

#### includeData?

`boolean`

#### level?

`"error"` \| `"warn"` \| `"info"` \| `"debug"`

## Returns

[`EventMiddleware`](../../TypedEventBus/type-aliases/EventMiddleware.md)

EventMiddleware function that logs events at the specified level

## Remarks

Options include:

- `filter`: Function to determine which events to log
- `includeData`: Whether to include event data in logs (default: false)
- `level`: Log level to use ('debug', 'info', 'warn', 'error') (default:
  'info')

## Example

```typescript
const loggingMiddleware = createLoggingMiddleware({
    level: "debug",
    includeData: true,
    filter: (eventName) => eventName.startsWith("user:"),
});
eventBus.use(loggingMiddleware);
```
