# Interface: SitesState

Defined in: [src/stores/sites/types.ts:71](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/src/stores/sites/types.ts#L71)

## Properties

### selectedMonitorIds

> **selectedMonitorIds**: `Record`\<`string`, `string`\>

Defined in: [src/stores/sites/types.ts:73](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/src/stores/sites/types.ts#L73)

Selected monitor IDs per site (UI state, not persisted)

***

### selectedSiteId

> **selectedSiteId**: `undefined` \| `string`

Defined in: [src/stores/sites/types.ts:75](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/src/stores/sites/types.ts#L75)

Currently selected site identifier

***

### sites

> **sites**: [`Site`](../../../../../shared/types/interfaces/Site.md)[]

Defined in: [src/stores/sites/types.ts:77](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/src/stores/sites/types.ts#L77)

Array of monitored sites
