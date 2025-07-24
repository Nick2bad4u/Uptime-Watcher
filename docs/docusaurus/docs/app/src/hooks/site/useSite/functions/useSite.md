# Function: useSite()

> **useSite**(`site`): `object`

Defined in: [src/hooks/site/useSite.ts:13](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/src/hooks/site/useSite.ts#L13)

A comprehensive hook that combines site monitoring, actions, statistics, and UI state

## Parameters

### site

[`Site`](../../../../../shared/types/interfaces/Site.md)

The site to work with

## Returns

Combined data and functionality from all site-related hooks

### averageResponseTime

> **averageResponseTime**: `number`

### checkCount

> **checkCount**: `number`

### filteredHistory

> **filteredHistory**: [`StatusHistory`](../../../../../shared/types/interfaces/StatusHistory.md)[]

Filtered history for the selected monitor

### handleCardClick()

> **handleCardClick**: () => `void`

#### Returns

`void`

### handleCheckNow()

> **handleCheckNow**: () => `void`

#### Returns

`void`

### handleMonitorIdChange()

> **handleMonitorIdChange**: (`e`) => `void`

Handler for monitor selection changes

#### Parameters

##### e

`ChangeEvent`\<`HTMLSelectElement`\>

#### Returns

`void`

### handleStartMonitoring()

> **handleStartMonitoring**: () => `void`

#### Returns

`void`

### handleStopMonitoring()

> **handleStopMonitoring**: () => `void`

#### Returns

`void`

### isLoading

> **isLoading**: `boolean`

### isMonitoring

> **isMonitoring**: `boolean`

Whether the selected monitor is actively being monitored

### latestSite

> **latestSite**: [`Site`](../../../../../shared/types/interfaces/Site.md)

Most up-to-date site data from store

### monitor

> **monitor**: `undefined` \| [`Monitor`](../../../../../shared/types/interfaces/Monitor.md)

Currently selected monitor object

### monitorIds

> **monitorIds**: `string`[]

Array of all monitor IDs for this site

### responseTime

> **responseTime**: `undefined` \| `number`

Response time of the selected monitor

### selectedMonitorId

> **selectedMonitorId**: `string`

ID of the currently selected monitor

### status

> **status**: [`MonitorStatus`](../../../../../shared/types/type-aliases/MonitorStatus.md)

Current status of the selected monitor

### uptime

> **uptime**: `number`
