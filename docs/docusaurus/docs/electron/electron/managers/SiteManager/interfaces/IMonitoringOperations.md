# Interface: IMonitoringOperations

Defined in: [electron/managers/SiteManager.ts:69](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/managers/SiteManager.ts#L69)

Interface for monitoring operations integration.

## Remarks

Defines the contract for monitoring operations that can be performed
in coordination with site management. This allows loose coupling between
the SiteManager and MonitorManager while enabling coordinated operations.

## Properties

### setHistoryLimit()

> **setHistoryLimit**: (`limit`) => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [electron/managers/SiteManager.ts:71](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/managers/SiteManager.ts#L71)

Update the global history limit setting

#### Parameters

##### limit

`number`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### setupNewMonitors()

> **setupNewMonitors**: (`site`, `newMonitorIds`) => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [electron/managers/SiteManager.ts:73](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/managers/SiteManager.ts#L73)

Set up monitoring for newly created monitors

#### Parameters

##### site

[`Site`](../../../../shared/types/interfaces/Site.md)

##### newMonitorIds

`string`[]

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### startMonitoringForSite()

> **startMonitoringForSite**: (`identifier`, `monitorId`) => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`boolean`\>

Defined in: [electron/managers/SiteManager.ts:75](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/managers/SiteManager.ts#L75)

Start monitoring for a specific site and monitor

#### Parameters

##### identifier

`string`

##### monitorId

`string`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`boolean`\>

***

### stopMonitoringForSite()

> **stopMonitoringForSite**: (`identifier`, `monitorId`) => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`boolean`\>

Defined in: [electron/managers/SiteManager.ts:77](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/managers/SiteManager.ts#L77)

Stop monitoring for a specific site and monitor

#### Parameters

##### identifier

`string`

##### monitorId

`string`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`boolean`\>
