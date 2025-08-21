# Interface: SiteMonitorResult

Defined in: [src/hooks/site/useSiteMonitor.ts:25](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSiteMonitor.ts#L25)

Result interface for the useSiteMonitor hook.

## Extended by

- [`UseSiteResult`](../../useSite/interfaces/UseSiteResult.md)

## Properties

### filteredHistory

> **filteredHistory**: [`StatusHistory`](../../../../../shared/types/interfaces/StatusHistory.md)[]

Defined in: [src/hooks/site/useSiteMonitor.ts:27](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSiteMonitor.ts#L27)

Filtered history for the selected monitor

***

### handleMonitorIdChange()

> **handleMonitorIdChange**: (`e`) => `void`

Defined in: [src/hooks/site/useSiteMonitor.ts:30](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSiteMonitor.ts#L30)

Handler for monitor selection changes

#### Parameters

##### e

[`ChangeEvent`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/80449050d0e5e84f44ffa3fd3dc5651e4747e589/types/react/index.d.ts#L2018)\<[`HTMLSelectElement`](https://developer.mozilla.org/docs/Web/API/HTMLSelectElement)\>

#### Returns

`void`

***

### isMonitoring

> **isMonitoring**: `boolean`

Defined in: [src/hooks/site/useSiteMonitor.ts:32](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSiteMonitor.ts#L32)

Whether the selected monitor is actively being monitored

***

### latestSite

> **latestSite**: [`Site`](../../../../../shared/types/interfaces/Site.md)

Defined in: [src/hooks/site/useSiteMonitor.ts:35](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSiteMonitor.ts#L35)

Most up-to-date site data from store

***

### monitor

> **monitor**: `undefined` \| [`Monitor`](../../../../../shared/types/interfaces/Monitor.md)

Defined in: [src/hooks/site/useSiteMonitor.ts:37](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSiteMonitor.ts#L37)

Currently selected monitor object

***

### monitorIds

> **monitorIds**: `string`[]

Defined in: [src/hooks/site/useSiteMonitor.ts:40](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSiteMonitor.ts#L40)

Array of all monitor IDs for this site

***

### responseTime

> **responseTime**: `undefined` \| `number`

Defined in: [src/hooks/site/useSiteMonitor.ts:43](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSiteMonitor.ts#L43)

Response time of the selected monitor

***

### selectedMonitorId

> **selectedMonitorId**: `string`

Defined in: [src/hooks/site/useSiteMonitor.ts:45](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSiteMonitor.ts#L45)

ID of the currently selected monitor

***

### status

> **status**: [`MonitorStatus`](../../../../../shared/types/type-aliases/MonitorStatus.md)

Defined in: [src/hooks/site/useSiteMonitor.ts:54](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSiteMonitor.ts#L54)

Current status of the selected monitor

#### Remarks

Falls back to DEFAULT_MONITOR_STATUS ("pending") when no monitor is
selected
