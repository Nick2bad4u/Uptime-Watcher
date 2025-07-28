# Function: createDefaultMonitor()

> **createDefaultMonitor**(`overrides`): [`Monitor`](../../../../../../shared/types/interfaces/Monitor.md)

Defined in: [src/stores/sites/utils/monitorOperations.ts:38](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/stores/sites/utils/monitorOperations.ts#L38)

Creates a default monitor for a site

## Parameters

### overrides

[`Partial`](https://www.typescriptlang.org/docs/handbook/utility-types.html#partialtype)\<[`Monitor`](../../../../../../shared/types/interfaces/Monitor.md)\> = `{}`

Partial monitor object to override defaults

## Returns

[`Monitor`](../../../../../../shared/types/interfaces/Monitor.md)

Complete monitor object with defaults applied

## Example

```typescript
const monitor = createDefaultMonitor({ url: "https://example.com" });
```
