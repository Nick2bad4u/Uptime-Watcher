# Interface: SiteMonitorResult

Defined in: [src/hooks/site/useSiteMonitor.ts:19](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/hooks/site/useSiteMonitor.ts#L19)

Result interface for the useSiteMonitor hook.

## Properties

### filteredHistory

> **filteredHistory**: [`StatusHistory`](../../../../../shared/types/interfaces/StatusHistory.md)[]

Defined in: [src/hooks/site/useSiteMonitor.ts:21](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/hooks/site/useSiteMonitor.ts#L21)

Filtered history for the selected monitor

***

### handleMonitorIdChange()

> **handleMonitorIdChange**: (`e`) => `void`

Defined in: [src/hooks/site/useSiteMonitor.ts:24](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/hooks/site/useSiteMonitor.ts#L24)

Handler for monitor selection changes

#### Parameters

##### e

[`ChangeEvent`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/1a60e1b9a9062ff9c48c681ca3d8b6f717b616b9/types/react/index.d.ts#L2018)\<[`HTMLSelectElement`](https://developer.mozilla.org/docs/Web/API/HTMLSelectElement)\>

#### Returns

`void`

***

### isMonitoring

> **isMonitoring**: `boolean`

Defined in: [src/hooks/site/useSiteMonitor.ts:26](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/hooks/site/useSiteMonitor.ts#L26)

Whether the selected monitor is actively being monitored

***

### latestSite

> **latestSite**: [`Site`](../../../../../shared/types/interfaces/Site.md)

Defined in: [src/hooks/site/useSiteMonitor.ts:29](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/hooks/site/useSiteMonitor.ts#L29)

Most up-to-date site data from store

***

### monitor

> **monitor**: `undefined` \| [`Monitor`](../../../../../shared/types/interfaces/Monitor.md)

Defined in: [src/hooks/site/useSiteMonitor.ts:31](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/hooks/site/useSiteMonitor.ts#L31)

Currently selected monitor object

***

### monitorIds

> **monitorIds**: `string`[]

Defined in: [src/hooks/site/useSiteMonitor.ts:34](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/hooks/site/useSiteMonitor.ts#L34)

Array of all monitor IDs for this site

***

### responseTime

> **responseTime**: `undefined` \| `number`

Defined in: [src/hooks/site/useSiteMonitor.ts:37](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/hooks/site/useSiteMonitor.ts#L37)

Response time of the selected monitor

***

### selectedMonitorId

> **selectedMonitorId**: `string`

Defined in: [src/hooks/site/useSiteMonitor.ts:39](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/hooks/site/useSiteMonitor.ts#L39)

ID of the currently selected monitor

***

### status

> **status**: [`MonitorStatus`](../../../../../shared/types/type-aliases/MonitorStatus.md)

Defined in: [src/hooks/site/useSiteMonitor.ts:42](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/hooks/site/useSiteMonitor.ts#L42)

Current status of the selected monitor
