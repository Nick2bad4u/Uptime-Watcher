# Function: createLoggingMiddleware()

> **createLoggingMiddleware**(`options`): [`EventMiddleware`](../../TypedEventBus/type-aliases/EventMiddleware.md)

Defined in: [electron/events/middleware.ts:314](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/events/middleware.ts#L314)

Logging middleware that logs all events with configurable detail levels.

## Parameters

### options

Configuration options for event logging

#### filter?

(`eventName`) => `boolean`

#### includeData?

`boolean`

#### level?

`"error"` \| `"debug"` \| `"info"` \| `"warn"`

## Returns

[`EventMiddleware`](../../TypedEventBus/type-aliases/EventMiddleware.md)

EventMiddleware function that logs events at the specified level

## Remarks

Options include:
- `filter`: Function to determine which events to log
- `includeData`: Whether to include event data in logs (default: false)
- `level`: Log level to use ('debug', 'info', 'warn', 'error') (default: 'info')

## Example

```typescript
const loggingMiddleware = createLoggingMiddleware({
  level: 'debug',
  includeData: true,
  filter: (eventName) => eventName.startsWith('user:')
});
eventBus.use(loggingMiddleware);
```
