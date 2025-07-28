# Function: createErrorHandlingMiddleware()

> **createErrorHandlingMiddleware**(`options`): [`EventMiddleware`](../../TypedEventBus/type-aliases/EventMiddleware.md)

Defined in: [electron/events/middleware.ts:210](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/events/middleware.ts#L210)

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
