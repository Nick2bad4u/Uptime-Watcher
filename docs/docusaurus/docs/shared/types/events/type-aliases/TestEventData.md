# Type Alias: TestEventData

> **TestEventData** = [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

Defined in: [shared/types/events.ts:371](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/events.ts#L371)

Payload for test events (used in development/testing).

## Remarks

Used for development or testing purposes to transmit arbitrary data.

## Example

```typescript
const event: TestEventData = {
    foo: "bar",
    count: 42,
};
```
