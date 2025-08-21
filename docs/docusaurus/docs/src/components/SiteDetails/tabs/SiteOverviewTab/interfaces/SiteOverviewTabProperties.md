# Interface: SiteOverviewTabProperties

Defined in: [src/components/SiteDetails/tabs/SiteOverviewTab.tsx:35](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/tabs/SiteOverviewTab.tsx#L35)

Props for the SiteOverviewTab component

## Properties

### avgResponseTime

> `readonly` **avgResponseTime**: `number`

Defined in: [src/components/SiteDetails/tabs/SiteOverviewTab.tsx:37](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/tabs/SiteOverviewTab.tsx#L37)

Average response time across all monitors

***

### handleRemoveSite()

> `readonly` **handleRemoveSite**: () => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/components/SiteDetails/tabs/SiteOverviewTab.tsx:39](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/tabs/SiteOverviewTab.tsx#L39)

Handler for removing the site

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### handleStartSiteMonitoring()

> `readonly` **handleStartSiteMonitoring**: () => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/components/SiteDetails/tabs/SiteOverviewTab.tsx:41](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/tabs/SiteOverviewTab.tsx#L41)

Handler for starting site-level monitoring

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### handleStopSiteMonitoring()

> `readonly` **handleStopSiteMonitoring**: () => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/components/SiteDetails/tabs/SiteOverviewTab.tsx:43](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/tabs/SiteOverviewTab.tsx#L43)

Handler for stopping site-level monitoring

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### isLoading

> `readonly` **isLoading**: `boolean`

Defined in: [src/components/SiteDetails/tabs/SiteOverviewTab.tsx:45](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/tabs/SiteOverviewTab.tsx#L45)

Whether any async operation is in progress

***

### site

> `readonly` **site**: [`Site`](../../../../../../shared/types/interfaces/Site.md)

Defined in: [src/components/SiteDetails/tabs/SiteOverviewTab.tsx:47](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/tabs/SiteOverviewTab.tsx#L47)

The site object to display overview for

***

### totalChecks

> `readonly` **totalChecks**: `number`

Defined in: [src/components/SiteDetails/tabs/SiteOverviewTab.tsx:49](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/tabs/SiteOverviewTab.tsx#L49)

Total number of checks across all monitors

***

### uptime

> `readonly` **uptime**: `number`

Defined in: [src/components/SiteDetails/tabs/SiteOverviewTab.tsx:51](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/tabs/SiteOverviewTab.tsx#L51)

Total uptime percentage across all monitors
