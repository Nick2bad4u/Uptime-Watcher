# Function: createValidationMiddleware()

> **createValidationMiddleware**\<`T`\>(`validators`): [`EventMiddleware`](../../TypedEventBus/type-aliases/EventMiddleware.md)

Defined in: [electron/events/middleware.ts:478](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/events/middleware.ts#L478)

Validation middleware that validates event data against schemas with type safety.

## Type Parameters

### T

`T` *extends* `Record`\<`string`, `unknown`\>

Record type defining event names and their expected data structures

## Parameters

### validators

`ValidatorMap`\<`T`\>

Map of event names to validator functions

## Returns

[`EventMiddleware`](../../TypedEventBus/type-aliases/EventMiddleware.md)

EventMiddleware function

## Remarks

This middleware validates event data before processing. It supports both simple boolean
validators and detailed validators that can provide specific error messages.

## Example

```typescript
const validators = {
  'user:login': (data: { userId: string }) => !!data.userId,
  'data:update': (data: { table: string }) =>
    data.table ? { isValid: true } : { isValid: false, error: 'Table name required' }
};

const validationMiddleware = createValidationMiddleware(validators);
```
