# Type Alias: EventMiddleware()\<T\>

> **EventMiddleware**\<`T`\> = (`event`, `data`, `next`) => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\> \| `void`

Defined in: [electron/events/TypedEventBus.ts:107](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/events/TypedEventBus.ts#L107)

Middleware function for event processing.

## Type Parameters

### T

`T` = `unknown`

## Parameters

### event

`string`

Name of the event being processed

### data

`T`

Event data payload (read-only for inspection)

### next

() => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\> \| `void`

Function to call to continue to the next middleware

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\> \| `void`

## Remarks

Middleware can inspect event data, add logging, collect metrics, perform validation,
or handle other cross-cutting concerns. Middleware should NOT modify the data object
as modifications will not be reflected in the final event delivered to listeners.

Call `next()` to continue processing or throw an error to stop the middleware chain.
Data transformations should be performed before calling `emitTyped()` rather than
within middleware functions.

## Example

```typescript
const loggingMiddleware: EventMiddleware = async (event, data, next) => {
  console.log(`Processing event: ${event}`);
  await next(); // Continue to next middleware
  console.log(`Completed event: ${event}`);
};

const validationMiddleware: EventMiddleware = async (event, data, next) => {
  if (!isValidData(data)) {
    throw new Error('Invalid event data'); // Stop processing
  }
  await next(); // Continue if valid
};
```
