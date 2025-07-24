# Variable: MonitoringService

> `const` **MonitoringService**: `object`

Defined in: [src/stores/sites/services/MonitoringService.ts:8](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/stores/sites/services/MonitoringService.ts#L8)

## Type declaration

### initialize()

> **initialize**(): `Promise`\<`void`\>

Initialize the service by ensuring electron API is available

#### Returns

`Promise`\<`void`\>

### startMonitoring()

> **startMonitoring**(`siteId`, `monitorId`): `Promise`\<`void`\>

Start monitoring for a site

#### Parameters

##### siteId

`string`

##### monitorId

`string`

#### Returns

`Promise`\<`void`\>

### startSiteMonitoring()

> **startSiteMonitoring**(`siteId`): `Promise`\<`void`\>

Start monitoring for all monitors of a site

#### Parameters

##### siteId

`string`

#### Returns

`Promise`\<`void`\>

### stopMonitoring()

> **stopMonitoring**(`siteId`, `monitorId`): `Promise`\<`void`\>

Stop monitoring for a site

#### Parameters

##### siteId

`string`

##### monitorId

`string`

#### Returns

`Promise`\<`void`\>

### stopSiteMonitoring()

> **stopSiteMonitoring**(`siteId`): `Promise`\<`void`\>

Stop monitoring for all monitors of a site

#### Parameters

##### siteId

`string`

#### Returns

`Promise`\<`void`\>
