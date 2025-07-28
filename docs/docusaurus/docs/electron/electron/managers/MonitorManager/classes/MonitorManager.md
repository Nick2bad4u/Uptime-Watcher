# Class: MonitorManager

Defined in: [electron/managers/MonitorManager.ts:99](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/managers/MonitorManager.ts#L99)

Main class for orchestrating monitor scheduling, status checks, and event-driven updates.

## Remarks

All monitoring operations, including lifecycle management, scheduling, and event emission, are coordinated here. This class is the central entry point for all backend monitoring logic.

## Constructors

### Constructor

> **new MonitorManager**(`dependencies`): `MonitorManager`

Defined in: [electron/managers/MonitorManager.ts:151](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/managers/MonitorManager.ts#L151)

Constructs a new MonitorManager instance.

#### Parameters

##### dependencies

[`MonitorManagerDependencies`](../interfaces/MonitorManagerDependencies.md)

The required [MonitorManagerDependencies](../interfaces/MonitorManagerDependencies.md) for orchestration and data access.

#### Returns

`MonitorManager`

#### Remarks

All dependencies are injected to support testability and separation of concerns.

#### Example

```ts
const manager = new MonitorManager({ ... });
```

## Properties

### dependencies

> `readonly` **dependencies**: [`MonitorManagerDependencies`](../interfaces/MonitorManagerDependencies.md)

Defined in: [electron/managers/MonitorManager.ts:106](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/managers/MonitorManager.ts#L106)

Injected dependencies for orchestration and data access.

***

### eventEmitter

> `readonly` **eventEmitter**: [`TypedEventBus`](../../../events/TypedEventBus/classes/TypedEventBus.md)\<[`UptimeEvents`](../../../events/eventTypes/interfaces/UptimeEvents.md)\>

Defined in: [electron/managers/MonitorManager.ts:114](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/managers/MonitorManager.ts#L114)

Event bus for monitor events.

***

### isMonitoring

> **isMonitoring**: `boolean` = `false`

Defined in: [electron/managers/MonitorManager.ts:125](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/managers/MonitorManager.ts#L125)

Indicates if monitoring is currently active for any site or monitor.

#### Remarks

Used to track the global monitoring state.

#### Default Value

```ts
false
@public
```

***

### monitorScheduler

> `readonly` **monitorScheduler**: [`MonitorScheduler`](../../../services/monitoring/MonitorScheduler/classes/MonitorScheduler.md)

Defined in: [electron/managers/MonitorManager.ts:136](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/managers/MonitorManager.ts#L136)

Scheduler for monitor intervals and checks.

#### Remarks

Handles scheduling and execution of periodic monitor checks.

## Methods

### checkSiteManually()

> **checkSiteManually**(`identifier`, `monitorId?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`undefined` \| [`StatusUpdate`](../../../../shared/types/interfaces/StatusUpdate.md)\>

Defined in: [electron/managers/MonitorManager.ts:174](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/managers/MonitorManager.ts#L174)

Manually checks a site or monitor and returns the resulting status update.

#### Parameters

##### identifier

`string`

The site identifier to check.

##### monitorId?

`string`

Optional monitor ID for targeted check.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`undefined` \| [`StatusUpdate`](../../../../shared/types/interfaces/StatusUpdate.md)\>

The [StatusUpdate](../../../../shared/types/interfaces/StatusUpdate.md) for the site or monitor, or `undefined` if not found.

#### Remarks

Triggers a manual check for a site or monitor, emits a completion event, and returns the result. Uses the repository and event-driven patterns for all operations.

#### Throws

Any error encountered during the check is logged and re-thrown.

#### Example

```ts
const update = await manager.checkSiteManually("site-123", "monitor-456");
```

***

### getActiveMonitorCount()

> **getActiveMonitorCount**(): `number`

Defined in: [electron/managers/MonitorManager.ts:214](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/managers/MonitorManager.ts#L214)

Gets the count of active monitors currently being scheduled.

#### Returns

`number`

The number of active monitors in the scheduler.

#### Remarks

Returns the number of monitors that are currently scheduled for periodic checks.

#### Example

```ts
const count = manager.getActiveMonitorCount();
```

***

### isMonitorActiveInScheduler()

> **isMonitorActiveInScheduler**(`siteIdentifier`, `monitorId`): `boolean`

Defined in: [electron/managers/MonitorManager.ts:233](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/managers/MonitorManager.ts#L233)

Checks if a specific monitor is actively being scheduled for checks.

#### Parameters

##### siteIdentifier

`string`

The identifier of the site.

##### monitorId

`string`

The monitor ID to check.

#### Returns

`boolean`

`true` if the monitor is active in the scheduler, `false` otherwise.

#### Remarks

Returns whether the given monitor is currently scheduled for periodic checks by the scheduler.

#### Example

```ts
const isActive = manager.isMonitorActiveInScheduler("site-123", "monitor-456");
```

***

### isMonitoringActive()

> **isMonitoringActive**(): `boolean`

Defined in: [electron/managers/MonitorManager.ts:246](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/managers/MonitorManager.ts#L246)

Indicates whether monitoring is currently active for any site or monitor.

#### Returns

`boolean`

`true` if monitoring is active, `false` otherwise.

#### Remarks

Returns the global monitoring state.

***

### restartMonitorWithNewConfig()

> **restartMonitorWithNewConfig**(`siteIdentifier`, `monitor`): `boolean`

Defined in: [electron/managers/MonitorManager.ts:265](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/managers/MonitorManager.ts#L265)

Restarts monitoring for a specific monitor with updated configuration.

#### Parameters

##### siteIdentifier

`string`

The identifier of the site containing the monitor.

##### monitor

[`Monitor`](../../../../shared/types/interfaces/Monitor.md)

The monitor object with updated configuration.

#### Returns

`boolean`

`true` if the monitor was successfully restarted, `false` otherwise.

#### Remarks

Useful when monitor intervals or settings change and need immediate application. Delegates to the [MonitorScheduler](../../../services/monitoring/MonitorScheduler/classes/MonitorScheduler.md) for actual restart logic.

#### Example

```ts
const success = manager.restartMonitorWithNewConfig("site-123", monitorObj);
```

***

### setupNewMonitors()

> **setupNewMonitors**(`site`, `newMonitorIds`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [electron/managers/MonitorManager.ts:285](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/managers/MonitorManager.ts#L285)

Sets up new monitors that were added to an existing site.

#### Parameters

##### site

[`Site`](../../../../shared/types/interfaces/Site.md)

The [Site](../../../../shared/types/interfaces/Site.md) containing the new monitors.

##### newMonitorIds

`string`[]

Array of new monitor IDs to set up.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

A promise that resolves when setup is complete.

#### Remarks

Ensures new monitors receive the same initialization as those in new sites, including default interval assignment and auto-start logic.

#### Throws

Any error encountered during setup is logged and re-thrown.

#### Example

```ts
await manager.setupNewMonitors(siteObj, ["monitor-1", "monitor-2"]);
```

***

### setupSiteForMonitoring()

> **setupSiteForMonitoring**(`site`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [electron/managers/MonitorManager.ts:319](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/managers/MonitorManager.ts#L319)

Sets up a new site for monitoring, including initial checks, interval assignment, and auto-start logic.

#### Parameters

##### site

[`Site`](../../../../shared/types/interfaces/Site.md)

The [Site](../../../../shared/types/interfaces/Site.md) to set up for monitoring.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

A promise that resolves when setup is complete.

#### Remarks

Applies business rules for default intervals and auto-starting monitoring. Initial checks are handled by [MonitorScheduler](../../../services/monitoring/MonitorScheduler/classes/MonitorScheduler.md) when monitoring starts.

#### Throws

Any error encountered during setup is logged and re-thrown.

#### Example

```ts
await manager.setupSiteForMonitoring(siteObj);
```

***

### startMonitoring()

> **startMonitoring**(): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [electron/managers/MonitorManager.ts:349](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/managers/MonitorManager.ts#L349)

Starts monitoring for all sites.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

A promise that resolves when monitoring has started.

#### Remarks

Initiates monitoring for all sites and emits a monitoring started event. Uses the repository and event-driven patterns for all operations.

#### Throws

Any error encountered during start is logged and re-thrown.

#### Example

```ts
await manager.startMonitoring();
```

***

### startMonitoringForSite()

> **startMonitoringForSite**(`identifier`, `monitorId?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`boolean`\>

Defined in: [electron/managers/MonitorManager.ts:388](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/managers/MonitorManager.ts#L388)

Starts monitoring for a specific site or monitor.

#### Parameters

##### identifier

`string`

The site identifier to start monitoring for.

##### monitorId?

`string`

Optional monitor ID for targeted monitoring.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`boolean`\>

`true` if monitoring started successfully, `false` otherwise.

#### Remarks

Initiates monitoring for a site or monitor and emits a started event. Handles recursive calls to avoid infinite loops.

#### Throws

Any error encountered during start is logged and re-thrown.

#### Example

```ts
const started = await manager.startMonitoringForSite("site-123", "monitor-456");
```

***

### stopMonitoring()

> **stopMonitoring**(): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [electron/managers/MonitorManager.ts:440](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/managers/MonitorManager.ts#L440)

Stops monitoring for all sites.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

A promise that resolves when monitoring has stopped.

#### Remarks

Stops all monitoring and emits a monitoring stopped event. Uses the repository and event-driven patterns for all operations.

#### Throws

Any error encountered during stop is logged and re-thrown.

#### Example

```ts
await manager.stopMonitoring();
```

***

### stopMonitoringForSite()

> **stopMonitoringForSite**(`identifier`, `monitorId?`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`boolean`\>

Defined in: [electron/managers/MonitorManager.ts:474](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/managers/MonitorManager.ts#L474)

Stops monitoring for a specific site or monitor.

#### Parameters

##### identifier

`string`

The site identifier to stop monitoring for.

##### monitorId?

`string`

Optional monitor ID for targeted stop.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`boolean`\>

`true` if monitoring stopped successfully, `false` otherwise.

#### Remarks

Stops monitoring for a site or monitor and emits a stopped event. Handles recursive calls to avoid infinite loops.

#### Throws

Any error encountered during stop is logged and re-thrown.

#### Example

```ts
const stopped = await manager.stopMonitoringForSite("site-123", "monitor-456");
```
