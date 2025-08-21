# Function: createErrorHandlingMiddleware()

> **createErrorHandlingMiddleware**(`options`): [`EventMiddleware`](../../TypedEventBus/type-aliases/EventMiddleware.md)

Defined in: [electron/events/middleware.ts:359](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/events/middleware.ts#L359)

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

- `continueOnError`: Whether to continue processing after an error (default:
  true) - `onError`: Optional callback function to handle errors with custom
  logic

## Example

```typescript
const errorMiddleware = createErrorHandlingMiddleware({
    continueOnError: false,
    onError: (error, event, data) => {
        console.error(`Failed processing ${event}:`, error);
    },
});
eventBus.use(errorMiddleware);
```
