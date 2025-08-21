# Interface: UseSiteResult

Defined in: [src/hooks/site/useSite.ts:24](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSite.ts#L24)

Combined result interface for the useSite hook. Merges data and functionality
from all site-related hooks.

## Extends

- [`SiteActionsResult`](../../useSiteActions/interfaces/SiteActionsResult.md).[`SiteMonitorResult`](../../useSiteMonitor/interfaces/SiteMonitorResult.md).[`SiteStats`](../../useSiteStats/interfaces/SiteStats.md)

## Properties

### isLoading

> **isLoading**: `boolean`

Defined in: [src/hooks/site/useSite.ts:29](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSite.ts#L29)

Loading state from error store for UI consistency

***

### handleCardClick()

> **handleCardClick**: () => `void`

Defined in: [src/hooks/site/useSiteActions.ts:31](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSiteActions.ts#L31)

Handler for clicking on site card to show details

#### Returns

`void`

#### Inherited from

[`SiteActionsResult`](../../useSiteActions/interfaces/SiteActionsResult.md).[`handleCardClick`](../../useSiteActions/interfaces/SiteActionsResult.md#handlecardclick)

***

### handleCheckNow()

> **handleCheckNow**: () => `void`

Defined in: [src/hooks/site/useSiteActions.ts:33](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSiteActions.ts#L33)

Handler for immediate status check of current monitor

#### Returns

`void`

#### Inherited from

[`SiteActionsResult`](../../useSiteActions/interfaces/SiteActionsResult.md).[`handleCheckNow`](../../useSiteActions/interfaces/SiteActionsResult.md#handlechecknow)

***

### handleStartMonitoring()

> **handleStartMonitoring**: () => `void`

Defined in: [src/hooks/site/useSiteActions.ts:35](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSiteActions.ts#L35)

Handler for starting monitoring on current monitor

#### Returns

`void`

#### Inherited from

[`SiteActionsResult`](../../useSiteActions/interfaces/SiteActionsResult.md).[`handleStartMonitoring`](../../useSiteActions/interfaces/SiteActionsResult.md#handlestartmonitoring)

***

### handleStartSiteMonitoring()

> **handleStartSiteMonitoring**: () => `void`

Defined in: [src/hooks/site/useSiteActions.ts:37](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSiteActions.ts#L37)

Handler for starting monitoring on all site monitors

#### Returns

`void`

#### Inherited from

[`SiteActionsResult`](../../useSiteActions/interfaces/SiteActionsResult.md).[`handleStartSiteMonitoring`](../../useSiteActions/interfaces/SiteActionsResult.md#handlestartsitemonitoring)

***

### handleStopMonitoring()

> **handleStopMonitoring**: () => `void`

Defined in: [src/hooks/site/useSiteActions.ts:39](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSiteActions.ts#L39)

Handler for stopping monitoring on current monitor

#### Returns

`void`

#### Inherited from

[`SiteActionsResult`](../../useSiteActions/interfaces/SiteActionsResult.md).[`handleStopMonitoring`](../../useSiteActions/interfaces/SiteActionsResult.md#handlestopmonitoring)

***

### handleStopSiteMonitoring()

> **handleStopSiteMonitoring**: () => `void`

Defined in: [src/hooks/site/useSiteActions.ts:41](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSiteActions.ts#L41)

Handler for stopping monitoring on all site monitors

#### Returns

`void`

#### Inherited from

[`SiteActionsResult`](../../useSiteActions/interfaces/SiteActionsResult.md).[`handleStopSiteMonitoring`](../../useSiteActions/interfaces/SiteActionsResult.md#handlestopsitemonitoring)

***

### filteredHistory

> **filteredHistory**: [`StatusHistory`](../../../../../shared/types/interfaces/StatusHistory.md)[]

Defined in: [src/hooks/site/useSiteMonitor.ts:27](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSiteMonitor.ts#L27)

Filtered history for the selected monitor

#### Inherited from

[`SiteMonitorResult`](../../useSiteMonitor/interfaces/SiteMonitorResult.md).[`filteredHistory`](../../useSiteMonitor/interfaces/SiteMonitorResult.md#filteredhistory)

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

#### Inherited from

[`SiteMonitorResult`](../../useSiteMonitor/interfaces/SiteMonitorResult.md).[`handleMonitorIdChange`](../../useSiteMonitor/interfaces/SiteMonitorResult.md#handlemonitoridchange)

***

### isMonitoring

> **isMonitoring**: `boolean`

Defined in: [src/hooks/site/useSiteMonitor.ts:32](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSiteMonitor.ts#L32)

Whether the selected monitor is actively being monitored

#### Inherited from

[`SiteMonitorResult`](../../useSiteMonitor/interfaces/SiteMonitorResult.md).[`isMonitoring`](../../useSiteMonitor/interfaces/SiteMonitorResult.md#ismonitoring)

***

### latestSite

> **latestSite**: [`Site`](../../../../../shared/types/interfaces/Site.md)

Defined in: [src/hooks/site/useSiteMonitor.ts:35](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSiteMonitor.ts#L35)

Most up-to-date site data from store

#### Inherited from

[`SiteMonitorResult`](../../useSiteMonitor/interfaces/SiteMonitorResult.md).[`latestSite`](../../useSiteMonitor/interfaces/SiteMonitorResult.md#latestsite)

***

### monitor

> **monitor**: `undefined` \| [`Monitor`](../../../../../shared/types/interfaces/Monitor.md)

Defined in: [src/hooks/site/useSiteMonitor.ts:37](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSiteMonitor.ts#L37)

Currently selected monitor object

#### Inherited from

[`SiteMonitorResult`](../../useSiteMonitor/interfaces/SiteMonitorResult.md).[`monitor`](../../useSiteMonitor/interfaces/SiteMonitorResult.md#monitor)

***

### monitorIds

> **monitorIds**: `string`[]

Defined in: [src/hooks/site/useSiteMonitor.ts:40](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSiteMonitor.ts#L40)

Array of all monitor IDs for this site

#### Inherited from

[`SiteMonitorResult`](../../useSiteMonitor/interfaces/SiteMonitorResult.md).[`monitorIds`](../../useSiteMonitor/interfaces/SiteMonitorResult.md#monitorids)

***

### responseTime

> **responseTime**: `undefined` \| `number`

Defined in: [src/hooks/site/useSiteMonitor.ts:43](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSiteMonitor.ts#L43)

Response time of the selected monitor

#### Inherited from

[`SiteMonitorResult`](../../useSiteMonitor/interfaces/SiteMonitorResult.md).[`responseTime`](../../useSiteMonitor/interfaces/SiteMonitorResult.md#responsetime)

***

### selectedMonitorId

> **selectedMonitorId**: `string`

Defined in: [src/hooks/site/useSiteMonitor.ts:45](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSiteMonitor.ts#L45)

ID of the currently selected monitor

#### Inherited from

[`SiteMonitorResult`](../../useSiteMonitor/interfaces/SiteMonitorResult.md).[`selectedMonitorId`](../../useSiteMonitor/interfaces/SiteMonitorResult.md#selectedmonitorid)

***

### status

> **status**: [`MonitorStatus`](../../../../../shared/types/type-aliases/MonitorStatus.md)

Defined in: [src/hooks/site/useSiteMonitor.ts:54](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSiteMonitor.ts#L54)

Current status of the selected monitor

#### Remarks

Falls back to DEFAULT_MONITOR_STATUS ("pending") when no monitor is
selected

#### Inherited from

[`SiteMonitorResult`](../../useSiteMonitor/interfaces/SiteMonitorResult.md).[`status`](../../useSiteMonitor/interfaces/SiteMonitorResult.md#status)

***

### averageResponseTime

> **averageResponseTime**: `number`

Defined in: [src/hooks/site/useSiteStats.ts:26](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSiteStats.ts#L26)

Average response time in milliseconds (only for successful "up" checks)

#### Inherited from

[`SiteStats`](../../useSiteStats/interfaces/SiteStats.md).[`averageResponseTime`](../../useSiteStats/interfaces/SiteStats.md#averageresponsetime)

***

### checkCount

> **checkCount**: `number`

Defined in: [src/hooks/site/useSiteStats.ts:28](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSiteStats.ts#L28)

Total number of checks performed

#### Inherited from

[`SiteStats`](../../useSiteStats/interfaces/SiteStats.md).[`checkCount`](../../useSiteStats/interfaces/SiteStats.md#checkcount)

***

### uptime

> **uptime**: `number`

Defined in: [src/hooks/site/useSiteStats.ts:30](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSiteStats.ts#L30)

Uptime percentage as integer (0-100)

#### Inherited from

[`SiteStats`](../../useSiteStats/interfaces/SiteStats.md).[`uptime`](../../useSiteStats/interfaces/SiteStats.md#uptime)
