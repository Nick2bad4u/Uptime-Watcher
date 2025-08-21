# Interface: SitesState

Defined in: [src/stores/sites/types.ts:103](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/sites/types.ts#L103)

## Properties

### selectedMonitorIds

> **selectedMonitorIds**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `string`\>

Defined in: [src/stores/sites/types.ts:105](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/sites/types.ts#L105)

Selected monitor IDs per site (UI state, not persisted)

***

### selectedSiteId

> **selectedSiteId**: `undefined` \| `string`

Defined in: [src/stores/sites/types.ts:107](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/sites/types.ts#L107)

Currently selected site identifier

***

### sites

> **sites**: [`Site`](../../../../../shared/types/interfaces/Site.md)[]

Defined in: [src/stores/sites/types.ts:109](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/sites/types.ts#L109)

Array of monitored sites
