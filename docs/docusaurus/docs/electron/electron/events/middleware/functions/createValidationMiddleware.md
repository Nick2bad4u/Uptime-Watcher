# Function: createValidationMiddleware()

> **createValidationMiddleware**\<`T`\>(`validators`): [`EventMiddleware`](../../TypedEventBus/type-aliases/EventMiddleware.md)

Defined in: [electron/events/middleware.ts:478](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/events/middleware.ts#L478)

Validation middleware that validates event data against schemas with type safety.

## Type Parameters

### T

`T` *extends* [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

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
