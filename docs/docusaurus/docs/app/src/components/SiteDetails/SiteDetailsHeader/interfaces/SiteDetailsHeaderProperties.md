# Interface: SiteDetailsHeaderProperties

Defined in: [src/components/SiteDetails/SiteDetailsHeader.tsx:21](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/components/SiteDetails/SiteDetailsHeader.tsx#L21)

Props for the SiteDetailsHeader component

## Properties

### isCollapsed?

> `readonly` `optional` **isCollapsed**: `boolean`

Defined in: [src/components/SiteDetails/SiteDetailsHeader.tsx:23](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/components/SiteDetails/SiteDetailsHeader.tsx#L23)

Whether the header is collapsed

***

### onToggleCollapse()?

> `readonly` `optional` **onToggleCollapse**: () => `void`

Defined in: [src/components/SiteDetails/SiteDetailsHeader.tsx:25](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/components/SiteDetails/SiteDetailsHeader.tsx#L25)

Callback to toggle the header collapse state

#### Returns

`void`

***

### selectedMonitor?

> `readonly` `optional` **selectedMonitor**: [`Monitor`](../../../../../shared/types/interfaces/Monitor.md)

Defined in: [src/components/SiteDetails/SiteDetailsHeader.tsx:27](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/components/SiteDetails/SiteDetailsHeader.tsx#L27)

The currently selected monitor for the site

***

### site

> `readonly` **site**: [`Site`](../../../../../shared/types/interfaces/Site.md)

Defined in: [src/components/SiteDetails/SiteDetailsHeader.tsx:29](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/components/SiteDetails/SiteDetailsHeader.tsx#L29)

The site object to display information for
