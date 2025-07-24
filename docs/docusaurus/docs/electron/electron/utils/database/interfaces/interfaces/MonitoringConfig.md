# Interface: MonitoringConfig

Defined in: [electron/utils/database/interfaces.ts:21](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/utils/database/interfaces.ts#L21)

Configuration for monitoring operations.

## Properties

### setHistoryLimit()

> **setHistoryLimit**: (`limit`) => `void`

Defined in: [electron/utils/database/interfaces.ts:23](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/utils/database/interfaces.ts#L23)

Function to set history limit

#### Parameters

##### limit

`number`

#### Returns

`void`

***

### setupNewMonitors()

> **setupNewMonitors**: (`site`, `newMonitorIds`) => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [electron/utils/database/interfaces.ts:25](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/utils/database/interfaces.ts#L25)

Function to setup new monitors for a site

#### Parameters

##### site

[`Site`](../../../../../shared/types/interfaces/Site.md)

##### newMonitorIds

`string`[]

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### startMonitoring()

> **startMonitoring**: (`identifier`, `monitorId`) => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`boolean`\>

Defined in: [electron/utils/database/interfaces.ts:27](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/utils/database/interfaces.ts#L27)

Function to start monitoring for a site/monitor

#### Parameters

##### identifier

`string`

##### monitorId

`string`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`boolean`\>

***

### stopMonitoring()

> **stopMonitoring**: (`identifier`, `monitorId`) => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`boolean`\>

Defined in: [electron/utils/database/interfaces.ts:29](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/utils/database/interfaces.ts#L29)

Function to stop monitoring for a site/monitor

#### Parameters

##### identifier

`string`

##### monitorId

`string`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`boolean`\>
