# Interface: SiteDetailsNavigationProperties

Defined in: [src/components/SiteDetails/SiteDetailsNavigation.tsx:19](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/SiteDetailsNavigation.tsx#L19)

Props for the SiteDetailsNavigation component.
Contains all necessary handlers and state for monitoring control.

## Properties

### activeSiteDetailsTab

> `readonly` **activeSiteDetailsTab**: `string`

Defined in: [src/components/SiteDetails/SiteDetailsNavigation.tsx:21](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/SiteDetailsNavigation.tsx#L21)

Currently active tab in the site details view

***

### currentSite

> `readonly` **currentSite**: [`Site`](../../../../../shared/types/interfaces/Site.md)

Defined in: [src/components/SiteDetails/SiteDetailsNavigation.tsx:23](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/SiteDetailsNavigation.tsx#L23)

The site object being displayed

***

### handleMonitorIdChange()

> `readonly` **handleMonitorIdChange**: (`event`) => `void`

Defined in: [src/components/SiteDetails/SiteDetailsNavigation.tsx:25](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/SiteDetailsNavigation.tsx#L25)

Handler for monitor selection changes

#### Parameters

##### event

[`ChangeEvent`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/1a60e1b9a9062ff9c48c681ca3d8b6f717b616b9/types/react/index.d.ts#L2018)\<[`HTMLSelectElement`](https://developer.mozilla.org/docs/Web/API/HTMLSelectElement)\>

#### Returns

`void`

***

### handleStartMonitoring()

> `readonly` **handleStartMonitoring**: () => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/components/SiteDetails/SiteDetailsNavigation.tsx:27](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/SiteDetailsNavigation.tsx#L27)

Handler for starting monitoring

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### handleStartSiteMonitoring()

> `readonly` **handleStartSiteMonitoring**: () => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/components/SiteDetails/SiteDetailsNavigation.tsx:29](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/SiteDetailsNavigation.tsx#L29)

Handler for starting site-level monitoring

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### handleStopMonitoring()

> `readonly` **handleStopMonitoring**: () => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/components/SiteDetails/SiteDetailsNavigation.tsx:31](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/SiteDetailsNavigation.tsx#L31)

Handler for stopping monitoring

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### handleStopSiteMonitoring()

> `readonly` **handleStopSiteMonitoring**: () => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/components/SiteDetails/SiteDetailsNavigation.tsx:33](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/SiteDetailsNavigation.tsx#L33)

Handler for stopping site-level monitoring

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### isLoading

> `readonly` **isLoading**: `boolean`

Defined in: [src/components/SiteDetails/SiteDetailsNavigation.tsx:35](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/SiteDetailsNavigation.tsx#L35)

Whether any async operation is in progress

***

### isMonitoring

> `readonly` **isMonitoring**: `boolean`

Defined in: [src/components/SiteDetails/SiteDetailsNavigation.tsx:37](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/SiteDetailsNavigation.tsx#L37)

Whether monitoring is currently active

***

### selectedMonitorId

> `readonly` **selectedMonitorId**: `string`

Defined in: [src/components/SiteDetails/SiteDetailsNavigation.tsx:39](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/SiteDetailsNavigation.tsx#L39)

Currently selected monitor ID

***

### setActiveSiteDetailsTab()

> `readonly` **setActiveSiteDetailsTab**: (`tab`) => `void`

Defined in: [src/components/SiteDetails/SiteDetailsNavigation.tsx:41](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/SiteDetailsNavigation.tsx#L41)

Function to set the active tab

#### Parameters

##### tab

`string`

#### Returns

`void`
