# Class: MonitorManager

Defined in: [electron/managers/MonitorManager.ts:51](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/managers/MonitorManager.ts#L51)

Manages monitoring operations and scheduling.
Handles monitoring lifecycle and status checks.

## Constructors

### Constructor

> **new MonitorManager**(`dependencies`): `MonitorManager`

Defined in: [electron/managers/MonitorManager.ts:57](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/managers/MonitorManager.ts#L57)

#### Parameters

##### dependencies

[`MonitorManagerDependencies`](../interfaces/MonitorManagerDependencies.md)

#### Returns

`MonitorManager`

## Methods

### checkSiteManually()

> **checkSiteManually**(`identifier`, `monitorId?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`undefined` \| [`StatusUpdate`](../../../../shared/types/interfaces/StatusUpdate.md)\>

Defined in: [electron/managers/MonitorManager.ts:67](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/managers/MonitorManager.ts#L67)

Check a site manually and return status update.

#### Parameters

##### identifier

`string`

##### monitorId?

`string`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`undefined` \| [`StatusUpdate`](../../../../shared/types/interfaces/StatusUpdate.md)\>

***

### getActiveMonitorCount()

> **getActiveMonitorCount**(): `number`

Defined in: [electron/managers/MonitorManager.ts:99](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/managers/MonitorManager.ts#L99)

Get the count of active monitors currently being monitored.

#### Returns

`number`

The number of active monitors in the scheduler.

***

### isMonitorActiveInScheduler()

> **isMonitorActiveInScheduler**(`siteIdentifier`, `monitorId`): `boolean`

Defined in: [electron/managers/MonitorManager.ts:106](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/managers/MonitorManager.ts#L106)

Check if a specific monitor is actively being monitored by the scheduler.

#### Parameters

##### siteIdentifier

`string`

##### monitorId

`string`

#### Returns

`boolean`

***

### isMonitoringActive()

> **isMonitoringActive**(): `boolean`

Defined in: [electron/managers/MonitorManager.ts:113](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/managers/MonitorManager.ts#L113)

Check if monitoring is currently active.

#### Returns

`boolean`

***

### restartMonitorWithNewConfig()

> **restartMonitorWithNewConfig**(`siteIdentifier`, `monitor`): `boolean`

Defined in: [electron/managers/MonitorManager.ts:130](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/managers/MonitorManager.ts#L130)

Restart monitoring for a specific monitor with updated configuration.
This is useful when monitor intervals change and need to be applied immediately.

#### Parameters

##### siteIdentifier

`string`

The identifier of the site containing the monitor

##### monitor

[`Monitor`](../../../../shared/types/interfaces/Monitor.md)

The monitor with updated configuration to restart

#### Returns

`boolean`

True if the monitor was successfully restarted, false otherwise

#### Remarks

Delegates to the MonitorScheduler for actual restart logic. This method
provides a high-level interface for coordinated monitor restarts when
configuration changes require immediate application.

***

### setupNewMonitors()

> **setupNewMonitors**(`site`, `newMonitorIds`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [electron/managers/MonitorManager.ts:138](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/managers/MonitorManager.ts#L138)

Set up new monitors that were added to an existing site.
Ensures new monitors get the same treatment as monitors in new sites.

#### Parameters

##### site

[`Site`](../../../../shared/types/interfaces/Site.md)

##### newMonitorIds

`string`[]

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### setupSiteForMonitoring()

> **setupSiteForMonitoring**(`site`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [electron/managers/MonitorManager.ts:160](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/managers/MonitorManager.ts#L160)

Set up a new site for monitoring (initial checks, intervals, auto-start).

#### Parameters

##### site

[`Site`](../../../../shared/types/interfaces/Site.md)

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### startMonitoring()

> **startMonitoring**(): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [electron/managers/MonitorManager.ts:179](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/managers/MonitorManager.ts#L179)

Start monitoring for all sites.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### startMonitoringForSite()

> **startMonitoringForSite**(`identifier`, `monitorId?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`boolean`\>

Defined in: [electron/managers/MonitorManager.ts:205](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/managers/MonitorManager.ts#L205)

Start monitoring for a specific site or monitor.

#### Parameters

##### identifier

`string`

##### monitorId?

`string`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`boolean`\>

***

### stopMonitoring()

> **stopMonitoring**(): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [electron/managers/MonitorManager.ts:236](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/managers/MonitorManager.ts#L236)

Stop monitoring for all sites.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### stopMonitoringForSite()

> **stopMonitoringForSite**(`identifier`, `monitorId?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`boolean`\>

Defined in: [electron/managers/MonitorManager.ts:257](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/managers/MonitorManager.ts#L257)

Stop monitoring for a specific site or monitor.

#### Parameters

##### identifier

`string`

##### monitorId?

`string`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`boolean`\>
