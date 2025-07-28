# Class: MonitorScheduler

Defined in: [electron/services/monitoring/MonitorScheduler.ts:21](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/monitoring/MonitorScheduler.ts#L21)

Manages scheduling, execution, and lifecycle of monitor checks for sites and their monitors.

## Remarks

Maintains per-monitor interval timers, supports dynamic check intervals, and provides lifecycle management for starting, stopping, and restarting monitoring operations. All monitor checks are triggered via an async callback, and errors during checks are logged without affecting other monitors. Designed for robust, event-driven monitoring orchestration.

## Example

```typescript
const scheduler = new MonitorScheduler();
scheduler.setCheckCallback(async (siteId, monitorId) => { ... });
scheduler.startSite(siteObj);
```

## Constructors

### Constructor

> **new MonitorScheduler**(): `MonitorScheduler`

#### Returns

`MonitorScheduler`

## Methods

### getActiveCount()

> **getActiveCount**(): `number`

Defined in: [electron/services/monitoring/MonitorScheduler.ts:54](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/monitoring/MonitorScheduler.ts#L54)

Returns the number of currently active monitoring intervals.

#### Returns

`number`

The number of scheduled monitor intervals.

***

### getActiveMonitors()

> **getActiveMonitors**(): `string`[]

Defined in: [electron/services/monitoring/MonitorScheduler.ts:65](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/monitoring/MonitorScheduler.ts#L65)

Returns all active monitor interval keys.

#### Returns

`string`[]

An array of interval keys in the format `$`siteIdentifier`|$`monitorId``.

***

### isMonitoring()

> **isMonitoring**(`siteIdentifier`, `monitorId`): `boolean`

Defined in: [electron/services/monitoring/MonitorScheduler.ts:78](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/monitoring/MonitorScheduler.ts#L78)

Determines if a monitor is currently being scheduled and actively monitored.

#### Parameters

##### siteIdentifier

`string`

Unique identifier for the site.

##### monitorId

`string`

Unique identifier for the monitor.

#### Returns

`boolean`

`true` if the monitor is actively scheduled; otherwise, `false`.

***

### performImmediateCheck()

> **performImmediateCheck**(`siteIdentifier`, `monitorId`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [electron/services/monitoring/MonitorScheduler.ts:97](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/monitoring/MonitorScheduler.ts#L97)

Performs an immediate check for a specific monitor by invoking the registered check callback.

#### Parameters

##### siteIdentifier

`string`

Unique identifier for the site.

##### monitorId

`string`

Unique identifier for the monitor.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

A promise that resolves when the check completes.

#### Remarks

Invokes the registered check callback for the specified monitor. Errors are logged and do not interrupt execution. If no callback is set, this method does nothing.

#### Throws

Any error thrown by the callback is caught and logged; errors are not re-thrown.

***

### restartMonitor()

> **restartMonitor**(`siteIdentifier`, `monitor`): `boolean`

Defined in: [electron/services/monitoring/MonitorScheduler.ts:125](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/monitoring/MonitorScheduler.ts#L125)

Restarts monitoring for a specific monitor.

#### Parameters

##### siteIdentifier

`string`

Unique identifier for the site.

##### monitor

[`Monitor`](../../../../../shared/types/interfaces/Monitor.md)

Monitor configuration object.

#### Returns

`boolean`

`true` if monitoring was restarted; `false` if the monitor has no ID.

#### Remarks

Stops any existing interval for the monitor, then starts a new one. Useful when monitor settings (such as interval) change. If the monitor has no ID, no action is taken.

#### Example

```typescript
scheduler.restartMonitor("siteA", monitorObj);
```

***

### setCheckCallback()

> **setCheckCallback**(`callback`): `void`

Defined in: [electron/services/monitoring/MonitorScheduler.ts:149](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/monitoring/MonitorScheduler.ts#L149)

Registers the callback to execute when a monitor check is scheduled.

#### Parameters

##### callback

(`siteIdentifier`, `monitorId`) => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Function to execute for each scheduled monitor check. Receives the site identifier and monitor ID.

#### Returns

`void`

#### Remarks

Must be called before starting any monitoring. The callback should be async and handle errors internally. This callback is invoked for every scheduled or immediate monitor check.

#### Example

```typescript
scheduler.setCheckCallback(async (siteId, monitorId) => { ... });
```

***

### startMonitor()

> **startMonitor**(`siteIdentifier`, `monitor`): `boolean`

Defined in: [electron/services/monitoring/MonitorScheduler.ts:172](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/monitoring/MonitorScheduler.ts#L172)

Starts monitoring for a specific monitor with its own interval.

#### Parameters

##### siteIdentifier

`string`

Unique identifier for the site.

##### monitor

[`Monitor`](../../../../../shared/types/interfaces/Monitor.md)

Monitor configuration object.

#### Returns

`boolean`

`true` if monitoring started; `false` if the monitor has no ID.

#### Remarks

Stops any existing interval for the monitor before starting. Validates and applies the monitor's checkInterval. Triggers an immediate check after starting. Throws if the checkInterval is invalid. If the monitor has no ID, no action is taken.

#### Throws

Error if checkInterval is invalid.

#### Example

```typescript
scheduler.startMonitor("siteA", monitorObj);
```

***

### startSite()

> **startSite**(`site`): `void`

Defined in: [electron/services/monitoring/MonitorScheduler.ts:237](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/monitoring/MonitorScheduler.ts#L237)

Starts monitoring for all monitors in a site.

#### Parameters

##### site

[`Site`](../../../../../shared/types/interfaces/Site.md)

Site configuration object containing monitors.

#### Returns

`void`

#### Remarks

Only monitors with `monitoring: true` and a valid ID are started. This method is idempotent and safe to call multiple times.

#### Example

```typescript
scheduler.startSite(siteObj);
```

***

### stopAll()

> **stopAll**(): `void`

Defined in: [electron/services/monitoring/MonitorScheduler.ts:258](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/monitoring/MonitorScheduler.ts#L258)

Stops all monitoring intervals and clears all tracked monitors.

#### Returns

`void`

#### Remarks

Clears all interval timers and removes all monitors from tracking. Logs an info message when complete. Safe to call even if no monitors are active.

#### Example

```typescript
scheduler.stopAll();
```

***

### stopMonitor()

> **stopMonitor**(`siteIdentifier`, `monitorId`): `boolean`

Defined in: [electron/services/monitoring/MonitorScheduler.ts:283](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/monitoring/MonitorScheduler.ts#L283)

Stops monitoring for a specific monitor.

#### Parameters

##### siteIdentifier

`string`

Unique identifier for the site.

##### monitorId

`string`

Unique identifier for the monitor.

#### Returns

`boolean`

`true` if monitoring was stopped; `false` if not currently monitored.

#### Remarks

Clears the interval timer and removes the monitor from tracking. Safe to call even if the monitor is not currently monitored. Logs debug information about the stop operation.

#### Example

```typescript
scheduler.stopMonitor("siteA", "monitor123");
```

***

### stopSite()

> **stopSite**(`siteIdentifier`, `monitors?`): `void`

Defined in: [electron/services/monitoring/MonitorScheduler.ts:314](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/monitoring/MonitorScheduler.ts#L314)

Stops monitoring for all monitors in a site.

#### Parameters

##### siteIdentifier

`string`

Unique identifier for the site.

##### monitors?

[`Monitor`](../../../../../shared/types/interfaces/Monitor.md)[]

Optional array of monitor configurations to stop. If omitted, all monitors for the site are stopped.

#### Returns

`void`

#### Remarks

If `monitors` is provided, only those monitors are stopped. Otherwise, all monitors for the site are stopped. Safe to call even if no monitors are active for the site.

#### Example

```typescript
scheduler.stopSite("siteA");
scheduler.stopSite("siteA", [monitorObj1, monitorObj2]);
```
