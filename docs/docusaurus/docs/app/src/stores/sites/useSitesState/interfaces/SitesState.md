# Interface: SitesState

Defined in: [src/stores/sites/useSitesState.ts:10](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/stores/sites/useSitesState.ts#L10)

## Properties

### selectedMonitorIds

> **selectedMonitorIds**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `string`\>

Defined in: [src/stores/sites/useSitesState.ts:12](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/stores/sites/useSitesState.ts#L12)

Selected monitor IDs per site (UI state, not persisted)

***

### selectedSiteId

> **selectedSiteId**: `undefined` \| `string`

Defined in: [src/stores/sites/useSitesState.ts:14](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/stores/sites/useSitesState.ts#L14)

Currently selected site identifier

***

### sites

> **sites**: [`Site`](../../../../../shared/types/interfaces/Site.md)[]

Defined in: [src/stores/sites/useSitesState.ts:16](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/stores/sites/useSitesState.ts#L16)

Array of monitored sites
