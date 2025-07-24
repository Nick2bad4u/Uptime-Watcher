# Interface: SitesState

Defined in: [src/stores/sites/types.ts:71](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/stores/sites/types.ts#L71)

## Properties

### selectedMonitorIds

> **selectedMonitorIds**: [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `string`\>

Defined in: [src/stores/sites/types.ts:73](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/stores/sites/types.ts#L73)

Selected monitor IDs per site (UI state, not persisted)

***

### selectedSiteId

> **selectedSiteId**: `undefined` \| `string`

Defined in: [src/stores/sites/types.ts:75](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/stores/sites/types.ts#L75)

Currently selected site identifier

***

### sites

> **sites**: [`Site`](../../../../../shared/types/interfaces/Site.md)[]

Defined in: [src/stores/sites/types.ts:77](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/stores/sites/types.ts#L77)

Array of monitored sites
