# Variable: CHECK\_INTERVALS

> `const` **CHECK\_INTERVALS**: [`IntervalOption`](../interfaces/IntervalOption.md)[]

Defined in: [src/constants.ts:160](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/constants.ts#L160)

Available check intervals for site monitoring.

## Remarks

Ranges from 5 seconds to 30 days with sensible progressions. Provides a
comprehensive set of monitoring intervals from high-frequency testing to
long-term health checks. Values are optimized for different monitoring
scenarios and performance requirements.

## Example

```typescript
const selectedInterval = CHECK_INTERVALS.find(
    (interval) => interval.value === 300000
);
console.log(selectedInterval?.label); // "5 minutes"
```
