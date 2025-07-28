# Function: updateMonitorInSite()

> **updateMonitorInSite**(`site`, `monitorId`, `updates`): [`Site`](../../../../../../shared/types/interfaces/Site.md)

Defined in: [src/stores/sites/utils/monitorOperations.ts:121](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/stores/sites/utils/monitorOperations.ts#L121)

Updates a monitor in a site

## Parameters

### site

[`Site`](../../../../../../shared/types/interfaces/Site.md)

The site containing the monitor

### monitorId

`string`

The ID of the monitor to update

### updates

[`Partial`](https://www.typescriptlang.org/docs/handbook/utility-types.html#partialtype)\<[`Monitor`](../../../../../../shared/types/interfaces/Monitor.md)\>

Partial monitor updates to apply

## Returns

[`Site`](../../../../../../shared/types/interfaces/Site.md)

Updated site with modified monitor

## Throws

Error if monitor is not found

## Example

```typescript
const updatedSite = updateMonitorInSite(site, "monitor-123", { timeout: 10000 });
```
