# Interface: BaseSiteMonitoring

Defined in: [src/stores/sites/baseTypes.ts:52](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/sites/baseTypes.ts#L52)

Common site monitoring operations interface. Shared between different
monitoring-related modules.

## Properties

### checkSiteNow()

> **checkSiteNow**: (`siteId`, `monitorId`) => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/stores/sites/baseTypes.ts:54](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/sites/baseTypes.ts#L54)

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

Defined in: [src/stores/sites/baseTypes.ts:56](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/sites/baseTypes.ts#L56)

Start monitoring for a site

#### Parameters

##### siteId

`string`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### startSiteMonitorMonitoring()

> **startSiteMonitorMonitoring**: (`siteId`, `monitorId`) => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/stores/sites/baseTypes.ts:58](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/sites/baseTypes.ts#L58)

Start monitoring for a specific site monitor

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

Defined in: [src/stores/sites/baseTypes.ts:63](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/sites/baseTypes.ts#L63)

Stop monitoring for a site

#### Parameters

##### siteId

`string`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### stopSiteMonitorMonitoring()

> **stopSiteMonitorMonitoring**: (`siteId`, `monitorId`) => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/stores/sites/baseTypes.ts:65](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/sites/baseTypes.ts#L65)

Stop monitoring for a specific site monitor

#### Parameters

##### siteId

`string`

##### monitorId

`string`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>
