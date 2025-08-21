# Interface: SiteMonitoringActions

Defined in: [src/stores/sites/useSiteMonitoring.ts:14](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/sites/useSiteMonitoring.ts#L14)

## Properties

### checkSiteNow()

> **checkSiteNow**: (`siteId`, `monitorId`) => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/stores/sites/useSiteMonitoring.ts:16](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/sites/useSiteMonitoring.ts#L16)

Check a site now

#### Parameters

##### siteId

`string`

##### monitorId

`string`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### startSiteMonitoring()

> **startSiteMonitoring**: (`siteId`) => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/stores/sites/useSiteMonitoring.ts:18](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/sites/useSiteMonitoring.ts#L18)

Start monitoring for all monitors of a site

#### Parameters

##### siteId

`string`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### startSiteMonitorMonitoring()

> **startSiteMonitorMonitoring**: (`siteId`, `monitorId`) => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/stores/sites/useSiteMonitoring.ts:20](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/sites/useSiteMonitoring.ts#L20)

Start monitoring for a site monitor

#### Parameters

##### siteId

`string`

##### monitorId

`string`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### stopSiteMonitoring()

> **stopSiteMonitoring**: (`siteId`) => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/stores/sites/useSiteMonitoring.ts:25](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/sites/useSiteMonitoring.ts#L25)

Stop monitoring for all monitors of a site

#### Parameters

##### siteId

`string`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### stopSiteMonitorMonitoring()

> **stopSiteMonitorMonitoring**: (`siteId`, `monitorId`) => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/stores/sites/useSiteMonitoring.ts:27](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/sites/useSiteMonitoring.ts#L27)

Stop monitoring for a site monitor

#### Parameters

##### siteId

`string`

##### monitorId

`string`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>
