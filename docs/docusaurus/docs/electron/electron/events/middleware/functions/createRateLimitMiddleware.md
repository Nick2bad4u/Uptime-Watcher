# Function: createRateLimitMiddleware()

> **createRateLimitMiddleware**(`options`): [`EventMiddleware`](../../TypedEventBus/type-aliases/EventMiddleware.md)

Defined in: [electron/events/middleware.ts:413](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/events/middleware.ts#L413)

Rate limiting middleware to prevent event spam.

## Parameters

### options

Configuration options for rate limiting

#### burstLimit?

`number`

#### maxEventsPerSecond?

`number`

#### onRateLimit?

(`event`, `data`) => `void`

## Returns

[`EventMiddleware`](../../TypedEventBus/type-aliases/EventMiddleware.md)

EventMiddleware function that enforces rate limits on events

## Remarks

Options include:
- `burstLimit`: Maximum events allowed in rapid succession (default: 10)
- `maxEventsPerSecond`: Maximum events allowed per second (default: 100)
- `onRateLimit`: Optional callback when rate limit is exceeded

## Example

```typescript
const rateLimitMiddleware = createRateLimitMiddleware({
  burstLimit: 5,
  maxEventsPerSecond: 50,
  onRateLimit: (event, data) => {
    console.warn(`Rate limit exceeded for ${event}`);
  }
});
eventBus.use(rateLimitMiddleware);
```
