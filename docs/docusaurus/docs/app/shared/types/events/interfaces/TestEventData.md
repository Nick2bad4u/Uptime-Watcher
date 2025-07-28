# Interface: TestEventData

Defined in: [shared/types/events.ts:193](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/types/events.ts#L193)

Payload for test events (used in development/testing).

## Remarks

Used for development or testing purposes to transmit arbitrary data.

## Example

// Example: Sending a test event with custom data
```typescript
const event: TestEventData = {
  foo: 'bar',
  count: 42
};
```

## Indexable

\[`key`: `string`\]: `unknown`

Arbitrary test data payload.

### Remarks

Keys and value types are not restricted.
