# Function: removeMonitorFromSite()

> **removeMonitorFromSite**(`site`, `monitorId`): [`Site`](../../../../../../shared/types/interfaces/Site.md)

Defined in: [src/stores/sites/utils/monitorOperations.ts:102](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/stores/sites/utils/monitorOperations.ts#L102)

Removes a monitor from a site

## Parameters

### site

[`Site`](../../../../../../shared/types/interfaces/Site.md)

The site to remove the monitor from

### monitorId

`string`

The ID of the monitor to remove

## Returns

[`Site`](../../../../../../shared/types/interfaces/Site.md)

Updated site without the specified monitor

## Example

```typescript
const updatedSite = removeMonitorFromSite(site, "monitor-123");
```
