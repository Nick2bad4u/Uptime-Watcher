# electron/events/TypedEventBus

Type-safe event bus with middleware support and debugging capabilities.

## Remarks

Enhances the standard Node.js EventEmitter with compile-time type safety,
middleware processing, correlation tracking, and comprehensive logging.
Ensures events are properly typed and provides rich debugging information.

## Example

```typescript
interface MyEvents {
  'user:login': { userId: string; timestamp: number };
  'data:updated': { table: string; records: number };
}

const bus = new TypedEventBus<MyEvents>('app-events');
bus.onTyped('user:login', (data) => {
  console.log(`User ${data.userId} logged in at ${data.timestamp}`);
});
await bus.emitTyped('user:login', { userId: '123', timestamp: Date.now() });
```

## Classes

- [TypedEventBus](classes/TypedEventBus.md)

## Interfaces

- [EventBusDiagnostics](interfaces/EventBusDiagnostics.md)
- [EventMetadata](interfaces/EventMetadata.md)

## Type Aliases

- [EventMiddleware](type-aliases/EventMiddleware.md)

## Functions

- [createTypedEventBus](functions/createTypedEventBus.md)
