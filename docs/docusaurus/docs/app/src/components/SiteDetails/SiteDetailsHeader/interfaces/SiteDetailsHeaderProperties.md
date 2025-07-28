# Interface: SiteDetailsHeaderProperties

Defined in: [src/components/SiteDetails/SiteDetailsHeader.tsx:22](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/SiteDetailsHeader.tsx#L22)

Props for the SiteDetailsHeader component

## Properties

### isCollapsed?

> `readonly` `optional` **isCollapsed**: `boolean`

Defined in: [src/components/SiteDetails/SiteDetailsHeader.tsx:24](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/SiteDetailsHeader.tsx#L24)

Whether the header is collapsed

***

### onToggleCollapse()?

> `readonly` `optional` **onToggleCollapse**: () => `void`

Defined in: [src/components/SiteDetails/SiteDetailsHeader.tsx:26](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/SiteDetailsHeader.tsx#L26)

Callback to toggle the header collapse state

#### Returns

`void`

***

### selectedMonitor?

> `readonly` `optional` **selectedMonitor**: [`Monitor`](../../../../../shared/types/interfaces/Monitor.md)

Defined in: [src/components/SiteDetails/SiteDetailsHeader.tsx:28](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/SiteDetailsHeader.tsx#L28)

The currently selected monitor for the site

***

### site

> `readonly` **site**: [`Site`](../../../../../shared/types/interfaces/Site.md)

Defined in: [src/components/SiteDetails/SiteDetailsHeader.tsx:30](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/SiteDetailsHeader.tsx#L30)

The site object to display information for
