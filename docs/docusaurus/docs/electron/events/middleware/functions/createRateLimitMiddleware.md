# Function: createRateLimitMiddleware()

> **createRateLimitMiddleware**(`options`): [`EventMiddleware`](../../TypedEventBus/type-aliases/EventMiddleware.md)

Defined in: [electron/events/middleware.ts:625](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/events/middleware.ts#L625)

Creates middleware that rate-limits event processing.

## Parameters

### options

Configuration options for rate limiting.

#### burstLimit?

`number`

#### maxEventsPerSecond?

`number`

#### onRateLimit?

(`event`, `data`) => `void`

## Returns

[`EventMiddleware`](../../TypedEventBus/type-aliases/EventMiddleware.md)

EventMiddleware function that enforces rate limits on events.

## Remarks

Options include:

- `burstLimit`: Maximum number of events allowed in a burst (default: 10).
- `maxEventsPerSecond`: Maximum number of events allowed per second (default:
  100). - `onRateLimit`: Optional callback invoked when an event is
  rate-limited.

## Example

```typescript
const rateLimitMiddleware = createRateLimitMiddleware({
    burstLimit: 5,
    maxEventsPerSecond: 50,
    onRateLimit: (event, data) => {
        console.warn(`Rate limit hit for event: ${event}`);
    },
});
eventBus.use(rateLimitMiddleware);
```
