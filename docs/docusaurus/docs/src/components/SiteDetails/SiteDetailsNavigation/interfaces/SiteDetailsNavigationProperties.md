# Interface: SiteDetailsNavigationProperties

Defined in: [src/components/SiteDetails/SiteDetailsNavigation.tsx:25](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/SiteDetailsNavigation.tsx#L25)

Props for the SiteDetailsNavigation component. Contains all necessary
handlers and state for monitoring control.

## Properties

### activeSiteDetailsTab

> `readonly` **activeSiteDetailsTab**: `string`

Defined in: [src/components/SiteDetails/SiteDetailsNavigation.tsx:27](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/SiteDetailsNavigation.tsx#L27)

Currently active tab in the site details view

***

### currentSite

> `readonly` **currentSite**: [`Site`](../../../../../shared/types/interfaces/Site.md)

Defined in: [src/components/SiteDetails/SiteDetailsNavigation.tsx:29](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/SiteDetailsNavigation.tsx#L29)

The site object being displayed

***

### handleMonitorIdChange()

> `readonly` **handleMonitorIdChange**: (`event`) => `void`

Defined in: [src/components/SiteDetails/SiteDetailsNavigation.tsx:31](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/SiteDetailsNavigation.tsx#L31)

Handler for monitor selection changes

#### Parameters

##### event

[`ChangeEvent`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/80449050d0e5e84f44ffa3fd3dc5651e4747e589/types/react/index.d.ts#L2018)\<[`HTMLSelectElement`](https://developer.mozilla.org/docs/Web/API/HTMLSelectElement)\>

#### Returns

`void`

***

### handleStartMonitoring()

> `readonly` **handleStartMonitoring**: () => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/components/SiteDetails/SiteDetailsNavigation.tsx:35](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/SiteDetailsNavigation.tsx#L35)

Handler for starting monitoring

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### handleStartSiteMonitoring()

> `readonly` **handleStartSiteMonitoring**: () => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/components/SiteDetails/SiteDetailsNavigation.tsx:37](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/SiteDetailsNavigation.tsx#L37)

Handler for starting site-level monitoring

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### handleStopMonitoring()

> `readonly` **handleStopMonitoring**: () => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/components/SiteDetails/SiteDetailsNavigation.tsx:39](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/SiteDetailsNavigation.tsx#L39)

Handler for stopping monitoring

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### handleStopSiteMonitoring()

> `readonly` **handleStopSiteMonitoring**: () => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/components/SiteDetails/SiteDetailsNavigation.tsx:41](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/SiteDetailsNavigation.tsx#L41)

Handler for stopping site-level monitoring

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### isLoading

> `readonly` **isLoading**: `boolean`

Defined in: [src/components/SiteDetails/SiteDetailsNavigation.tsx:43](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/SiteDetailsNavigation.tsx#L43)

Whether any async operation is in progress

***

### isMonitoring

> `readonly` **isMonitoring**: `boolean`

Defined in: [src/components/SiteDetails/SiteDetailsNavigation.tsx:45](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/SiteDetailsNavigation.tsx#L45)

Whether monitoring is currently active

***

### selectedMonitorId

> `readonly` **selectedMonitorId**: `string`

Defined in: [src/components/SiteDetails/SiteDetailsNavigation.tsx:47](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/SiteDetailsNavigation.tsx#L47)

Currently selected monitor ID

***

### setActiveSiteDetailsTab()

> `readonly` **setActiveSiteDetailsTab**: (`tab`) => `void`

Defined in: [src/components/SiteDetails/SiteDetailsNavigation.tsx:49](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/SiteDetails/SiteDetailsNavigation.tsx#L49)

Function to set the active tab

#### Parameters

##### tab

`string`

#### Returns

`void`
