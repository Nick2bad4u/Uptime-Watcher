# Function: createValidationMiddleware()

> **createValidationMiddleware**\<`T`\>(`validators`): [`EventMiddleware`](../../TypedEventBus/type-aliases/EventMiddleware.md)

Defined in: [electron/events/middleware.ts:512](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/events/middleware.ts#L512)

Creates middleware that validates event data using a map of validator functions.

## Type Parameters

### T

`T` *extends* [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

Record type defining event names and their data types.

## Parameters

### validators

`ValidatorMap`\<`T`\>

Map of event names to their validator functions.

## Returns

[`EventMiddleware`](../../TypedEventBus/type-aliases/EventMiddleware.md)

EventMiddleware function that validates event data before processing.

## Remarks

If validation fails, the event is blocked and an error is logged. Throws on validation failure.

## Example

```typescript
const validators = {
  'user:login': (data: { userId: string }) => !!data.userId,
  'data:update': (data: { table: string }) =>
    data.table ? { isValid: true } : { isValid: false, error: 'Table name required' }
};

const validationMiddleware = createValidationMiddleware(validators);
eventBus.use(validationMiddleware);
```
