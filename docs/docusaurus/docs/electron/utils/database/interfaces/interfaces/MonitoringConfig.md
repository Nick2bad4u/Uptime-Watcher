# Interface: MonitoringConfig

Defined in: [electron/utils/database/interfaces.ts:22](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/database/interfaces.ts#L22)

Configuration for monitoring operations.

## Properties

### setHistoryLimit()

> **setHistoryLimit**: (`limit`) => `void`

Defined in: [electron/utils/database/interfaces.ts:24](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/database/interfaces.ts#L24)

Function to set history limit

#### Parameters

##### limit

`number`

#### Returns

`void`

***

### setupNewMonitors()

> **setupNewMonitors**: (`site`, `newMonitorIds`) => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [electron/utils/database/interfaces.ts:26](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/database/interfaces.ts#L26)

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

Defined in: [electron/utils/database/interfaces.ts:28](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/database/interfaces.ts#L28)

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

Defined in: [electron/utils/database/interfaces.ts:33](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/database/interfaces.ts#L33)

Function to stop monitoring for a site/monitor

#### Parameters

##### identifier

`string`

##### monitorId

`string`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`boolean`\>
