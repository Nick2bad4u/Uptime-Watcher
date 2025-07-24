# Interface: SiteAnalytics

Defined in: [src/hooks/site/useSiteAnalytics.ts:28](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/hooks/site/useSiteAnalytics.ts#L28)

Comprehensive analytics data for a site monitor

## Properties

### avgResponseTime

> **avgResponseTime**: `number`

Defined in: [src/hooks/site/useSiteAnalytics.ts:30](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/hooks/site/useSiteAnalytics.ts#L30)

Average response time in milliseconds

***

### downCount

> **downCount**: `number`

Defined in: [src/hooks/site/useSiteAnalytics.ts:32](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/hooks/site/useSiteAnalytics.ts#L32)

Number of failed checks

***

### downtimePeriods

> **downtimePeriods**: [`DowntimePeriod`](DowntimePeriod.md)[]

Defined in: [src/hooks/site/useSiteAnalytics.ts:34](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/hooks/site/useSiteAnalytics.ts#L34)

Array of downtime periods

***

### fastestResponse

> **fastestResponse**: `number`

Defined in: [src/hooks/site/useSiteAnalytics.ts:36](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/hooks/site/useSiteAnalytics.ts#L36)

Fastest response time recorded

***

### filteredHistory

> **filteredHistory**: [`StatusHistory`](../../../../../shared/types/interfaces/StatusHistory.md)[]

Defined in: [src/hooks/site/useSiteAnalytics.ts:38](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/hooks/site/useSiteAnalytics.ts#L38)

Status history filtered by time range

***

### incidentCount

> **incidentCount**: `number`

Defined in: [src/hooks/site/useSiteAnalytics.ts:40](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/hooks/site/useSiteAnalytics.ts#L40)

Number of separate downtime incidents

***

### mttr

> **mttr**: `number`

Defined in: [src/hooks/site/useSiteAnalytics.ts:42](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/hooks/site/useSiteAnalytics.ts#L42)

Mean Time To Recovery in milliseconds

***

### p50

> **p50**: `number`

Defined in: [src/hooks/site/useSiteAnalytics.ts:44](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/hooks/site/useSiteAnalytics.ts#L44)

50th percentile response time

***

### p95

> **p95**: `number`

Defined in: [src/hooks/site/useSiteAnalytics.ts:46](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/hooks/site/useSiteAnalytics.ts#L46)

95th percentile response time

***

### p99

> **p99**: `number`

Defined in: [src/hooks/site/useSiteAnalytics.ts:48](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/hooks/site/useSiteAnalytics.ts#L48)

99th percentile response time

***

### slowestResponse

> **slowestResponse**: `number`

Defined in: [src/hooks/site/useSiteAnalytics.ts:50](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/hooks/site/useSiteAnalytics.ts#L50)

Slowest response time recorded

***

### totalChecks

> **totalChecks**: `number`

Defined in: [src/hooks/site/useSiteAnalytics.ts:52](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/hooks/site/useSiteAnalytics.ts#L52)

Total number of checks performed

***

### totalDowntime

> **totalDowntime**: `number`

Defined in: [src/hooks/site/useSiteAnalytics.ts:54](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/hooks/site/useSiteAnalytics.ts#L54)

Total downtime in milliseconds

***

### upCount

> **upCount**: `number`

Defined in: [src/hooks/site/useSiteAnalytics.ts:56](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/hooks/site/useSiteAnalytics.ts#L56)

Number of successful checks

***

### uptime

> **uptime**: `string`

Defined in: [src/hooks/site/useSiteAnalytics.ts:58](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/hooks/site/useSiteAnalytics.ts#L58)

Uptime percentage as formatted string
