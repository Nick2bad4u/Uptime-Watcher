# Function: createErrorHandlingMiddleware()

> **createErrorHandlingMiddleware**(`options`): [`EventMiddleware`](../../TypedEventBus/type-aliases/EventMiddleware.md)

Defined in: [electron/events/middleware.ts:176](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/events/middleware.ts#L176)

Error handling middleware that catches and logs middleware errors.

## Parameters

### options

Configuration options for error handling

#### continueOnError?

`boolean`

#### onError?

(`error`, `event`, `data`) => `void`

## Returns

[`EventMiddleware`](../../TypedEventBus/type-aliases/EventMiddleware.md)

EventMiddleware function that provides error handling and logging

## Remarks

Options include:
- `continueOnError`: Whether to continue processing after an error (default: true)
- `onError`: Optional callback function to handle errors with custom logic

## Example

```typescript
const errorMiddleware = createErrorHandlingMiddleware({
  continueOnError: false,
  onError: (error, event, data) => {
    console.error(`Failed processing ${event}:`, error);
  }
});
eventBus.use(errorMiddleware);
```
