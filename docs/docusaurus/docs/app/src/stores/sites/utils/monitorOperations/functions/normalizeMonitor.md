# Function: normalizeMonitor()

> **normalizeMonitor**(`monitor`): [`Monitor`](../../../../../../shared/types/interfaces/Monitor.md)

Defined in: [src/stores/sites/utils/monitorOperations.ts:71](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/stores/sites/utils/monitorOperations.ts#L71)

Normalizes monitor data ensuring all required fields are present

## Parameters

### monitor

[`Partial`](https://www.typescriptlang.org/docs/handbook/utility-types.html#partialtype)\<[`Monitor`](../../../../../../shared/types/interfaces/Monitor.md)\>

Partial monitor object to normalize

## Returns

[`Monitor`](../../../../../../shared/types/interfaces/Monitor.md)

Complete monitor object with validated and normalized fields

## Example

```typescript
const normalized = normalizeMonitor({ id: "123", url: "https://example.com" });
```
