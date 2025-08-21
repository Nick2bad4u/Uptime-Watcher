# Interface: SiteAnalytics

Defined in: [src/hooks/site/useSiteAnalytics.ts:51](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSiteAnalytics.ts#L51)

Comprehensive analytics data for a site monitor

## Properties

### avgResponseTime

> **avgResponseTime**: `number`

Defined in: [src/hooks/site/useSiteAnalytics.ts:53](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSiteAnalytics.ts#L53)

Average response time in milliseconds

***

### downCount

> **downCount**: `number`

Defined in: [src/hooks/site/useSiteAnalytics.ts:55](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSiteAnalytics.ts#L55)

Number of failed checks

***

### downtimePeriods

> **downtimePeriods**: [`DowntimePeriod`](DowntimePeriod.md)[]

Defined in: [src/hooks/site/useSiteAnalytics.ts:57](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSiteAnalytics.ts#L57)

Array of downtime periods

***

### fastestResponse

> **fastestResponse**: `number`

Defined in: [src/hooks/site/useSiteAnalytics.ts:59](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSiteAnalytics.ts#L59)

Fastest response time recorded

***

### filteredHistory

> **filteredHistory**: [`StatusHistory`](../../../../../shared/types/interfaces/StatusHistory.md)[]

Defined in: [src/hooks/site/useSiteAnalytics.ts:61](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSiteAnalytics.ts#L61)

Status history filtered by time range

***

### incidentCount

> **incidentCount**: `number`

Defined in: [src/hooks/site/useSiteAnalytics.ts:63](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSiteAnalytics.ts#L63)

Number of separate downtime incidents

***

### mttr

> **mttr**: `number`

Defined in: [src/hooks/site/useSiteAnalytics.ts:65](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSiteAnalytics.ts#L65)

Mean Time To Recovery in milliseconds

***

### p50

> **p50**: `number`

Defined in: [src/hooks/site/useSiteAnalytics.ts:67](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSiteAnalytics.ts#L67)

50th percentile response time

***

### p95

> **p95**: `number`

Defined in: [src/hooks/site/useSiteAnalytics.ts:69](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSiteAnalytics.ts#L69)

95th percentile response time

***

### p99

> **p99**: `number`

Defined in: [src/hooks/site/useSiteAnalytics.ts:71](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSiteAnalytics.ts#L71)

99th percentile response time

***

### slowestResponse

> **slowestResponse**: `number`

Defined in: [src/hooks/site/useSiteAnalytics.ts:73](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSiteAnalytics.ts#L73)

Slowest response time recorded

***

### totalChecks

> **totalChecks**: `number`

Defined in: [src/hooks/site/useSiteAnalytics.ts:75](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSiteAnalytics.ts#L75)

Total number of checks performed

***

### totalDowntime

> **totalDowntime**: `number`

Defined in: [src/hooks/site/useSiteAnalytics.ts:77](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSiteAnalytics.ts#L77)

Total downtime in milliseconds

***

### upCount

> **upCount**: `number`

Defined in: [src/hooks/site/useSiteAnalytics.ts:79](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSiteAnalytics.ts#L79)

Number of successful checks

***

### uptime

> **uptime**: `string`

Defined in: [src/hooks/site/useSiteAnalytics.ts:81](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSiteAnalytics.ts#L81)

Uptime percentage as formatted string

***

### uptimeRaw

> **uptimeRaw**: `number`

Defined in: [src/hooks/site/useSiteAnalytics.ts:83](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/hooks/site/useSiteAnalytics.ts#L83)

Raw uptime percentage as number for calculations
