# Function: updateMonitorAndSave()

> **updateMonitorAndSave**(`siteId`, `monitorId`, `updates`, `deps`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/stores/sites/utils/operationHelpers.ts:48](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/sites/utils/operationHelpers.ts#L48)

Updates a monitor within a site and saves it. Common pattern for monitor
update operations.

## Parameters

### siteId

`string`

The site identifier

### monitorId

`string`

The monitor identifier

### updates

[`Partial`](https://www.typescriptlang.org/docs/handbook/utility-types.html#partialtype)\<[`Site`](../../../../../../shared/types/interfaces/Site.md)\[`"monitors"`\]\[`0`\]\>

Monitor updates to apply

### deps

[`SiteOperationsDependencies`](../../../types/interfaces/SiteOperationsDependencies.md)

Site operation dependencies

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>
