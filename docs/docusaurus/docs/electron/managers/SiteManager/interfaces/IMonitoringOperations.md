# Interface: IMonitoringOperations

Defined in: [electron/managers/SiteManager.ts:84](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/managers/SiteManager.ts#L84)

## Remarks

Defines the contract for monitoring operations that can be performed in
coordination with site management. This allows loose coupling between the
SiteManager and MonitorManager while enabling coordinated operations.

Interface for monitoring operations integration.

## Properties

### setHistoryLimit()

> **setHistoryLimit**: (`limit`) => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [electron/managers/SiteManager.ts:92](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/managers/SiteManager.ts#L92)

Update the global history limit setting.

#### Parameters

##### limit

`number`

The new history limit value.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

A promise that resolves when the limit is updated.

***

### setupNewMonitors()

> **setupNewMonitors**: (`site`, `newMonitorIds`) => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [electron/managers/SiteManager.ts:101](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/managers/SiteManager.ts#L101)

Set up monitoring for newly created monitors.

#### Parameters

##### site

[`Site`](../../../../shared/types/interfaces/Site.md)

The site containing new monitors.

##### newMonitorIds

`string`[]

Array of new monitor IDs to set up.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

A promise that resolves when setup is complete.

***

### startMonitoringForSite()

> **startMonitoringForSite**: (`identifier`, `monitorId`) => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`boolean`\>

Defined in: [electron/managers/SiteManager.ts:111](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/managers/SiteManager.ts#L111)

Start monitoring for a specific site and monitor.

#### Parameters

##### identifier

`string`

The site identifier.

##### monitorId

`string`

The monitor ID to start monitoring for.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`boolean`\>

A promise that resolves to true if monitoring started, false
  otherwise.

***

### stopMonitoringForSite()

> **stopMonitoringForSite**: (`identifier`, `monitorId`) => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`boolean`\>

Defined in: [electron/managers/SiteManager.ts:124](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/managers/SiteManager.ts#L124)

Stop monitoring for a specific site and monitor.

#### Parameters

##### identifier

`string`

The site identifier.

##### monitorId

`string`

The monitor ID to stop monitoring for.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`boolean`\>

A promise that resolves to true if monitoring stopped, false
  otherwise.
