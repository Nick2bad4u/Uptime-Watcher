# Interface: SiteMonitoringActions

Defined in: [src/stores/sites/useSiteMonitoring.ts:13](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/stores/sites/useSiteMonitoring.ts#L13)

## Properties

### checkSiteNow()

> **checkSiteNow**: (`siteId`, `monitorId`) => `Promise`\<`void`\>

Defined in: [src/stores/sites/useSiteMonitoring.ts:15](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/stores/sites/useSiteMonitoring.ts#L15)

Check a site now

#### Parameters

##### siteId

`string`

##### monitorId

`string`

#### Returns

`Promise`\<`void`\>

***

### startSiteMonitoring()

> **startSiteMonitoring**: (`siteId`) => `Promise`\<`void`\>

Defined in: [src/stores/sites/useSiteMonitoring.ts:17](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/stores/sites/useSiteMonitoring.ts#L17)

Start monitoring for all monitors of a site

#### Parameters

##### siteId

`string`

#### Returns

`Promise`\<`void`\>

***

### startSiteMonitorMonitoring()

> **startSiteMonitorMonitoring**: (`siteId`, `monitorId`) => `Promise`\<`void`\>

Defined in: [src/stores/sites/useSiteMonitoring.ts:19](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/stores/sites/useSiteMonitoring.ts#L19)

Start monitoring for a site monitor

#### Parameters

##### siteId

`string`

##### monitorId

`string`

#### Returns

`Promise`\<`void`\>

***

### stopSiteMonitoring()

> **stopSiteMonitoring**: (`siteId`) => `Promise`\<`void`\>

Defined in: [src/stores/sites/useSiteMonitoring.ts:21](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/stores/sites/useSiteMonitoring.ts#L21)

Stop monitoring for all monitors of a site

#### Parameters

##### siteId

`string`

#### Returns

`Promise`\<`void`\>

***

### stopSiteMonitorMonitoring()

> **stopSiteMonitorMonitoring**: (`siteId`, `monitorId`) => `Promise`\<`void`\>

Defined in: [src/stores/sites/useSiteMonitoring.ts:23](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/stores/sites/useSiteMonitoring.ts#L23)

Stop monitoring for a site monitor

#### Parameters

##### siteId

`string`

##### monitorId

`string`

#### Returns

`Promise`\<`void`\>
