# Interface: SiteOverviewTabProperties

Defined in: [src/components/SiteDetails/tabs/SiteOverviewTab.tsx:29](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/components/SiteDetails/tabs/SiteOverviewTab.tsx#L29)

Props for the SiteOverviewTab component

## Properties

### avgResponseTime

> `readonly` **avgResponseTime**: `number`

Defined in: [src/components/SiteDetails/tabs/SiteOverviewTab.tsx:31](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/components/SiteDetails/tabs/SiteOverviewTab.tsx#L31)

Average response time across all monitors

***

### handleRemoveSite()

> `readonly` **handleRemoveSite**: () => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/components/SiteDetails/tabs/SiteOverviewTab.tsx:33](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/components/SiteDetails/tabs/SiteOverviewTab.tsx#L33)

Handler for removing the site

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### handleStartSiteMonitoring()

> `readonly` **handleStartSiteMonitoring**: () => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/components/SiteDetails/tabs/SiteOverviewTab.tsx:35](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/components/SiteDetails/tabs/SiteOverviewTab.tsx#L35)

Handler for starting site-level monitoring

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### handleStopSiteMonitoring()

> `readonly` **handleStopSiteMonitoring**: () => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/components/SiteDetails/tabs/SiteOverviewTab.tsx:37](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/components/SiteDetails/tabs/SiteOverviewTab.tsx#L37)

Handler for stopping site-level monitoring

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### isLoading

> `readonly` **isLoading**: `boolean`

Defined in: [src/components/SiteDetails/tabs/SiteOverviewTab.tsx:39](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/components/SiteDetails/tabs/SiteOverviewTab.tsx#L39)

Whether any async operation is in progress

***

### site

> `readonly` **site**: [`Site`](../../../../../../shared/types/interfaces/Site.md)

Defined in: [src/components/SiteDetails/tabs/SiteOverviewTab.tsx:41](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/components/SiteDetails/tabs/SiteOverviewTab.tsx#L41)

The site object to display overview for

***

### totalChecks

> `readonly` **totalChecks**: `number`

Defined in: [src/components/SiteDetails/tabs/SiteOverviewTab.tsx:43](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/components/SiteDetails/tabs/SiteOverviewTab.tsx#L43)

Total number of checks across all monitors

***

### uptime

> `readonly` **uptime**: `number`

Defined in: [src/components/SiteDetails/tabs/SiteOverviewTab.tsx:45](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/components/SiteDetails/tabs/SiteOverviewTab.tsx#L45)

Total uptime percentage across all monitors
