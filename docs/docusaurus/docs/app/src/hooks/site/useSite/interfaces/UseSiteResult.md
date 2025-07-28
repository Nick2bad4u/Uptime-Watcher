# Interface: UseSiteResult

Defined in: [src/hooks/site/useSite.ts:13](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/hooks/site/useSite.ts#L13)

Combined result interface for the useSite hook.
Merges data and functionality from all site-related hooks.

## Extends

- [`SiteActionsResult`](../../useSiteActions/interfaces/SiteActionsResult.md).[`SiteMonitorResult`](../../useSiteMonitor/interfaces/SiteMonitorResult.md).[`SiteStats`](../../useSiteStats/interfaces/SiteStats.md)

## Properties

### averageResponseTime

> **averageResponseTime**: `number`

Defined in: [src/hooks/site/useSiteStats.ts:23](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/hooks/site/useSiteStats.ts#L23)

Average response time in milliseconds (only for successful "up" checks)

#### Inherited from

[`SiteStats`](../../useSiteStats/interfaces/SiteStats.md).[`averageResponseTime`](../../useSiteStats/interfaces/SiteStats.md#averageresponsetime)

***

### checkCount

> **checkCount**: `number`

Defined in: [src/hooks/site/useSiteStats.ts:25](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/hooks/site/useSiteStats.ts#L25)

Total number of checks performed

#### Inherited from

[`SiteStats`](../../useSiteStats/interfaces/SiteStats.md).[`checkCount`](../../useSiteStats/interfaces/SiteStats.md#checkcount)

***

### filteredHistory

> **filteredHistory**: [`StatusHistory`](../../../../../shared/types/interfaces/StatusHistory.md)[]

Defined in: [src/hooks/site/useSiteMonitor.ts:21](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/hooks/site/useSiteMonitor.ts#L21)

Filtered history for the selected monitor

#### Inherited from

[`SiteMonitorResult`](../../useSiteMonitor/interfaces/SiteMonitorResult.md).[`filteredHistory`](../../useSiteMonitor/interfaces/SiteMonitorResult.md#filteredhistory)

***

### handleCardClick()

> **handleCardClick**: () => `void`

Defined in: [src/hooks/site/useSiteActions.ts:15](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/hooks/site/useSiteActions.ts#L15)

#### Returns

`void`

#### Inherited from

[`SiteActionsResult`](../../useSiteActions/interfaces/SiteActionsResult.md).[`handleCardClick`](../../useSiteActions/interfaces/SiteActionsResult.md#handlecardclick)

***

### handleCheckNow()

> **handleCheckNow**: () => `void`

Defined in: [src/hooks/site/useSiteActions.ts:16](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/hooks/site/useSiteActions.ts#L16)

#### Returns

`void`

#### Inherited from

[`SiteActionsResult`](../../useSiteActions/interfaces/SiteActionsResult.md).[`handleCheckNow`](../../useSiteActions/interfaces/SiteActionsResult.md#handlechecknow)

***

### handleMonitorIdChange()

> **handleMonitorIdChange**: (`e`) => `void`

Defined in: [src/hooks/site/useSiteMonitor.ts:24](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/hooks/site/useSiteMonitor.ts#L24)

Handler for monitor selection changes

#### Parameters

##### e

[`ChangeEvent`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/1a60e1b9a9062ff9c48c681ca3d8b6f717b616b9/types/react/index.d.ts#L2018)\<[`HTMLSelectElement`](https://developer.mozilla.org/docs/Web/API/HTMLSelectElement)\>

#### Returns

`void`

#### Inherited from

[`SiteMonitorResult`](../../useSiteMonitor/interfaces/SiteMonitorResult.md).[`handleMonitorIdChange`](../../useSiteMonitor/interfaces/SiteMonitorResult.md#handlemonitoridchange)

***

### handleStartMonitoring()

> **handleStartMonitoring**: () => `void`

Defined in: [src/hooks/site/useSiteActions.ts:18](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/hooks/site/useSiteActions.ts#L18)

#### Returns

`void`

#### Inherited from

[`SiteActionsResult`](../../useSiteActions/interfaces/SiteActionsResult.md).[`handleStartMonitoring`](../../useSiteActions/interfaces/SiteActionsResult.md#handlestartmonitoring)

***

### handleStopMonitoring()

> **handleStopMonitoring**: () => `void`

Defined in: [src/hooks/site/useSiteActions.ts:19](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/hooks/site/useSiteActions.ts#L19)

#### Returns

`void`

#### Inherited from

[`SiteActionsResult`](../../useSiteActions/interfaces/SiteActionsResult.md).[`handleStopMonitoring`](../../useSiteActions/interfaces/SiteActionsResult.md#handlestopmonitoring)

***

### isLoading

> **isLoading**: `boolean`

Defined in: [src/hooks/site/useSite.ts:15](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/hooks/site/useSite.ts#L15)

Loading state from error store for UI consistency

***

### isMonitoring

> **isMonitoring**: `boolean`

Defined in: [src/hooks/site/useSiteMonitor.ts:26](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/hooks/site/useSiteMonitor.ts#L26)

Whether the selected monitor is actively being monitored

#### Inherited from

[`SiteMonitorResult`](../../useSiteMonitor/interfaces/SiteMonitorResult.md).[`isMonitoring`](../../useSiteMonitor/interfaces/SiteMonitorResult.md#ismonitoring)

***

### latestSite

> **latestSite**: [`Site`](../../../../../shared/types/interfaces/Site.md)

Defined in: [src/hooks/site/useSiteMonitor.ts:29](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/hooks/site/useSiteMonitor.ts#L29)

Most up-to-date site data from store

#### Inherited from

[`SiteMonitorResult`](../../useSiteMonitor/interfaces/SiteMonitorResult.md).[`latestSite`](../../useSiteMonitor/interfaces/SiteMonitorResult.md#latestsite)

***

### monitor

> **monitor**: `undefined` \| [`Monitor`](../../../../../shared/types/interfaces/Monitor.md)

Defined in: [src/hooks/site/useSiteMonitor.ts:31](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/hooks/site/useSiteMonitor.ts#L31)

Currently selected monitor object

#### Inherited from

[`SiteMonitorResult`](../../useSiteMonitor/interfaces/SiteMonitorResult.md).[`monitor`](../../useSiteMonitor/interfaces/SiteMonitorResult.md#monitor)

***

### monitorIds

> **monitorIds**: `string`[]

Defined in: [src/hooks/site/useSiteMonitor.ts:34](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/hooks/site/useSiteMonitor.ts#L34)

Array of all monitor IDs for this site

#### Inherited from

[`SiteMonitorResult`](../../useSiteMonitor/interfaces/SiteMonitorResult.md).[`monitorIds`](../../useSiteMonitor/interfaces/SiteMonitorResult.md#monitorids)

***

### responseTime

> **responseTime**: `undefined` \| `number`

Defined in: [src/hooks/site/useSiteMonitor.ts:37](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/hooks/site/useSiteMonitor.ts#L37)

Response time of the selected monitor

#### Inherited from

[`SiteMonitorResult`](../../useSiteMonitor/interfaces/SiteMonitorResult.md).[`responseTime`](../../useSiteMonitor/interfaces/SiteMonitorResult.md#responsetime)

***

### selectedMonitorId

> **selectedMonitorId**: `string`

Defined in: [src/hooks/site/useSiteMonitor.ts:39](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/hooks/site/useSiteMonitor.ts#L39)

ID of the currently selected monitor

#### Inherited from

[`SiteMonitorResult`](../../useSiteMonitor/interfaces/SiteMonitorResult.md).[`selectedMonitorId`](../../useSiteMonitor/interfaces/SiteMonitorResult.md#selectedmonitorid)

***

### status

> **status**: [`MonitorStatus`](../../../../../shared/types/type-aliases/MonitorStatus.md)

Defined in: [src/hooks/site/useSiteMonitor.ts:43](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/hooks/site/useSiteMonitor.ts#L43)

Current status of the selected monitor

#### Remarks

Falls back to DEFAULT_MONITOR_STATUS ("pending") when no monitor is selected

#### Inherited from

[`SiteMonitorResult`](../../useSiteMonitor/interfaces/SiteMonitorResult.md).[`status`](../../useSiteMonitor/interfaces/SiteMonitorResult.md#status)

***

### uptime

> **uptime**: `number`

Defined in: [src/hooks/site/useSiteStats.ts:27](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/hooks/site/useSiteStats.ts#L27)

Uptime percentage as integer (0-100)

#### Inherited from

[`SiteStats`](../../useSiteStats/interfaces/SiteStats.md).[`uptime`](../../useSiteStats/interfaces/SiteStats.md#uptime)
