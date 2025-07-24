# Class: MonitorScheduler

Defined in: [electron/services/monitoring/MonitorScheduler.ts:14](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/services/monitoring/MonitorScheduler.ts#L14)

Service for managing monitor scheduling and intervals.
Handles per-monitor interval timers and scheduling logic.

## Remarks

Manages individual timer intervals for each monitor, allowing different
check frequencies per monitor. Provides lifecycle management for starting,
stopping, and restarting monitoring operations.

## Constructors

### Constructor

> **new MonitorScheduler**(): `MonitorScheduler`

#### Returns

`MonitorScheduler`

## Methods

### getActiveCount()

> **getActiveCount**(): `number`

Defined in: [electron/services/monitoring/MonitorScheduler.ts:43](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/services/monitoring/MonitorScheduler.ts#L43)

Get the number of active monitoring intervals.

#### Returns

`number`

***

### getActiveMonitors()

> **getActiveMonitors**(): `string`[]

Defined in: [electron/services/monitoring/MonitorScheduler.ts:50](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/services/monitoring/MonitorScheduler.ts#L50)

Get all active monitoring keys.

#### Returns

`string`[]

***

### isMonitoring()

> **isMonitoring**(`siteIdentifier`, `monitorId`): `boolean`

Defined in: [electron/services/monitoring/MonitorScheduler.ts:57](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/services/monitoring/MonitorScheduler.ts#L57)

Check if a monitor is currently being monitored.

#### Parameters

##### siteIdentifier

`string`

##### monitorId

`string`

#### Returns

`boolean`

***

### performImmediateCheck()

> **performImmediateCheck**(`siteIdentifier`, `monitorId`): `Promise`\<`void`\>

Defined in: [electron/services/monitoring/MonitorScheduler.ts:65](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/services/monitoring/MonitorScheduler.ts#L65)

Perform an immediate check for a monitor (used when starting monitoring).

#### Parameters

##### siteIdentifier

`string`

##### monitorId

`string`

#### Returns

`Promise`\<`void`\>

***

### restartMonitor()

> **restartMonitor**(`siteIdentifier`, `monitor`): `boolean`

Defined in: [electron/services/monitoring/MonitorScheduler.ts:91](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/services/monitoring/MonitorScheduler.ts#L91)

Restart monitoring for a specific monitor.

#### Parameters

##### siteIdentifier

`string`

Site identifier

##### monitor

[`Monitor`](../../../../../shared/types/interfaces/Monitor.md)

Monitor configuration

#### Returns

`boolean`

True if monitoring was successfully restarted, false if monitor has no ID

#### Remarks

Stops existing monitoring for the monitor and starts fresh with current configuration.
Useful when monitor settings (like check interval) have changed.

Return value semantics:
- true: Monitor was successfully stopped and restarted
- false: Monitor has no ID and cannot be monitored

***

### setCheckCallback()

> **setCheckCallback**(`callback`): `void`

Defined in: [electron/services/monitoring/MonitorScheduler.ts:103](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/services/monitoring/MonitorScheduler.ts#L103)

Set the callback function to execute when a monitor check is scheduled.

#### Parameters

##### callback

(`siteIdentifier`, `monitorId`) => `Promise`\<`void`\>

#### Returns

`void`

***

### startMonitor()

> **startMonitor**(`siteIdentifier`, `monitor`): `boolean`

Defined in: [electron/services/monitoring/MonitorScheduler.ts:110](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/services/monitoring/MonitorScheduler.ts#L110)

Start monitoring for a specific monitor with its own interval.

#### Parameters

##### siteIdentifier

`string`

##### monitor

[`Monitor`](../../../../../shared/types/interfaces/Monitor.md)

#### Returns

`boolean`

***

### startSite()

> **startSite**(`site`): `void`

Defined in: [electron/services/monitoring/MonitorScheduler.ts:163](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/services/monitoring/MonitorScheduler.ts#L163)

Start monitoring for all monitors in a site.

#### Parameters

##### site

[`Site`](../../../../../shared/types/interfaces/Site.md)

#### Returns

`void`

***

### stopAll()

> **stopAll**(): `void`

Defined in: [electron/services/monitoring/MonitorScheduler.ts:174](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/services/monitoring/MonitorScheduler.ts#L174)

Stop all monitoring intervals.

#### Returns

`void`

***

### stopMonitor()

> **stopMonitor**(`siteIdentifier`, `monitorId`): `boolean`

Defined in: [electron/services/monitoring/MonitorScheduler.ts:198](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/services/monitoring/MonitorScheduler.ts#L198)

Stop monitoring for a specific monitor.

#### Parameters

##### siteIdentifier

`string`

Site identifier

##### monitorId

`string`

Monitor ID to stop

#### Returns

`boolean`

True if monitoring was stopped, false if not currently monitoring

#### Remarks

Clears the interval timer and removes the monitor from active tracking.
Safe to call even if monitor is not currently being monitored.

Side effects:
- Clears associated interval timer
- Removes monitor from internal tracking
- Logs debug information about the stop operation

***

### stopSite()

> **stopSite**(`siteIdentifier`, `monitors?`): `void`

Defined in: [electron/services/monitoring/MonitorScheduler.ts:215](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/services/monitoring/MonitorScheduler.ts#L215)

Stop monitoring for all monitors in a site.

#### Parameters

##### siteIdentifier

`string`

##### monitors?

[`Monitor`](../../../../../shared/types/interfaces/Monitor.md)[]

#### Returns

`void`
