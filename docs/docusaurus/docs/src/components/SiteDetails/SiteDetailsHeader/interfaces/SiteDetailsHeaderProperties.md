# Interface: SiteDetailsHeaderProperties

Defined in: [src/components/SiteDetails/SiteDetailsHeader.tsx:28](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/SiteDetailsHeader.tsx#L28)

Props for the SiteDetailsHeader component

## Properties

### isCollapsed?

> `readonly` `optional` **isCollapsed**: `boolean`

Defined in: [src/components/SiteDetails/SiteDetailsHeader.tsx:30](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/SiteDetailsHeader.tsx#L30)

Whether the header is collapsed

***

### onToggleCollapse()?

> `readonly` `optional` **onToggleCollapse**: () => `void`

Defined in: [src/components/SiteDetails/SiteDetailsHeader.tsx:32](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/SiteDetailsHeader.tsx#L32)

Callback to toggle the header collapse state

#### Returns

`void`

***

### selectedMonitor?

> `readonly` `optional` **selectedMonitor**: [`Monitor`](../../../../../shared/types/interfaces/Monitor.md)

Defined in: [src/components/SiteDetails/SiteDetailsHeader.tsx:34](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/SiteDetailsHeader.tsx#L34)

The currently selected monitor for the site

***

### site

> `readonly` **site**: [`Site`](../../../../../shared/types/interfaces/Site.md)

Defined in: [src/components/SiteDetails/SiteDetailsHeader.tsx:36](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/SiteDetailsHeader.tsx#L36)

The site object to display information for
