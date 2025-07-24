# Function: createFilterMiddleware()

> **createFilterMiddleware**(`options`): [`EventMiddleware`](../../TypedEventBus/type-aliases/EventMiddleware.md)

Defined in: [electron/events/middleware.ts:228](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/events/middleware.ts#L228)

Filter middleware that can block certain events based on conditions.

## Parameters

### options

Configuration options for event filtering

#### allowList?

`string`[]

#### blockList?

`string`[]

#### condition?

(`event`, `data`) => `boolean`

## Returns

[`EventMiddleware`](../../TypedEventBus/type-aliases/EventMiddleware.md)

EventMiddleware function that filters events based on allow/block lists or custom conditions

## Remarks

Options include:
- `allowList`: Array of event names to allow (blocks all others)
- `blockList`: Array of event names to block
- `condition`: Custom function to determine if an event should be processed

## Example

```typescript
const filterMiddleware = createFilterMiddleware({
  allowList: ['user:login', 'user:logout'],
  condition: (event, data) => event.startsWith('user:')
});
eventBus.use(filterMiddleware);
```
