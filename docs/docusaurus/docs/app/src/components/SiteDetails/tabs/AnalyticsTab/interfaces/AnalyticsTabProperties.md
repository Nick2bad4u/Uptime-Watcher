# Interface: AnalyticsTabProperties

Defined in: [src/components/SiteDetails/tabs/AnalyticsTab.tsx:42](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/tabs/AnalyticsTab.tsx#L42)

Props for the AnalyticsTab component.
Contains comprehensive metrics, chart data, and formatting functions.

## Properties

### avgResponseTime

> `readonly` **avgResponseTime**: `number`

Defined in: [src/components/SiteDetails/tabs/AnalyticsTab.tsx:44](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/tabs/AnalyticsTab.tsx#L44)

Average response time across all checks

***

### barChartData

> `readonly` **barChartData**: [`StatusBarChartData`](../../../../../services/chartConfig/interfaces/StatusBarChartData.md)

Defined in: [src/components/SiteDetails/tabs/AnalyticsTab.tsx:46](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/tabs/AnalyticsTab.tsx#L46)

Chart.js data configuration for bar chart

***

### barChartOptions

> `readonly` **barChartOptions**: `ChartOptions`\<`"bar"`\>

Defined in: [src/components/SiteDetails/tabs/AnalyticsTab.tsx:48](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/tabs/AnalyticsTab.tsx#L48)

Chart.js options configuration for bar chart

***

### doughnutOptions

> `readonly` **doughnutOptions**: `ChartOptions`\<`"doughnut"`\>

Defined in: [src/components/SiteDetails/tabs/AnalyticsTab.tsx:50](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/tabs/AnalyticsTab.tsx#L50)

Chart.js options configuration for doughnut chart

***

### downCount

> `readonly` **downCount**: `number`

Defined in: [src/components/SiteDetails/tabs/AnalyticsTab.tsx:52](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/tabs/AnalyticsTab.tsx#L52)

Number of failed checks

***

### downtimePeriods

> `readonly` **downtimePeriods**: [`DowntimePeriod`](../../../../../hooks/site/useSiteAnalytics/interfaces/DowntimePeriod.md)[]

Defined in: [src/components/SiteDetails/tabs/AnalyticsTab.tsx:54](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/tabs/AnalyticsTab.tsx#L54)

Array of downtime periods with durations

***

### formatDuration()

> `readonly` **formatDuration**: (`ms`) => `string`

Defined in: [src/components/SiteDetails/tabs/AnalyticsTab.tsx:56](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/tabs/AnalyticsTab.tsx#L56)

Function to format duration values

#### Parameters

##### ms

`number`

#### Returns

`string`

***

### formatResponseTime()

> `readonly` **formatResponseTime**: (`time`) => `string`

Defined in: [src/components/SiteDetails/tabs/AnalyticsTab.tsx:58](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/tabs/AnalyticsTab.tsx#L58)

Function to format response time values

#### Parameters

##### time

`number`

#### Returns

`string`

***

### getAvailabilityDescription()

> `readonly` **getAvailabilityDescription**: (`percentage`) => `string`

Defined in: [src/components/SiteDetails/tabs/AnalyticsTab.tsx:60](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/tabs/AnalyticsTab.tsx#L60)

Function to get description based on availability percentage

#### Parameters

##### percentage

`number`

#### Returns

`string`

***

### lineChartData

> `readonly` **lineChartData**: [`ResponseTimeChartData`](../../../../../services/chartConfig/interfaces/ResponseTimeChartData.md)

Defined in: [src/components/SiteDetails/tabs/AnalyticsTab.tsx:62](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/tabs/AnalyticsTab.tsx#L62)

Chart.js data configuration for line chart

***

### lineChartOptions

> `readonly` **lineChartOptions**: `ChartOptions`\<`"line"`\>

Defined in: [src/components/SiteDetails/tabs/AnalyticsTab.tsx:64](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/tabs/AnalyticsTab.tsx#L64)

Chart.js options configuration for line chart

***

### monitorType

> `readonly` **monitorType**: `"http"` \| `"port"`

Defined in: [src/components/SiteDetails/tabs/AnalyticsTab.tsx:66](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/tabs/AnalyticsTab.tsx#L66)

Type of monitor being analyzed

***

### mttr

> `readonly` **mttr**: `number`

Defined in: [src/components/SiteDetails/tabs/AnalyticsTab.tsx:68](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/tabs/AnalyticsTab.tsx#L68)

Mean time to recovery in milliseconds

***

### p50

> `readonly` **p50**: `number`

Defined in: [src/components/SiteDetails/tabs/AnalyticsTab.tsx:70](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/tabs/AnalyticsTab.tsx#L70)

50th percentile response time

***

### p95

> `readonly` **p95**: `number`

Defined in: [src/components/SiteDetails/tabs/AnalyticsTab.tsx:72](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/tabs/AnalyticsTab.tsx#L72)

95th percentile response time

***

### p99

> `readonly` **p99**: `number`

Defined in: [src/components/SiteDetails/tabs/AnalyticsTab.tsx:74](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/tabs/AnalyticsTab.tsx#L74)

99th percentile response time

***

### setShowAdvancedMetrics()

> `readonly` **setShowAdvancedMetrics**: (`show`) => `void`

Defined in: [src/components/SiteDetails/tabs/AnalyticsTab.tsx:76](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/tabs/AnalyticsTab.tsx#L76)

Function to toggle advanced metrics visibility

#### Parameters

##### show

`boolean`

#### Returns

`void`

***

### setSiteDetailsChartTimeRange()

> `readonly` **setSiteDetailsChartTimeRange**: (`range`) => `void`

Defined in: [src/components/SiteDetails/tabs/AnalyticsTab.tsx:78](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/tabs/AnalyticsTab.tsx#L78)

Function to set the chart time range

#### Parameters

##### range

`"1h"` | `"24h"` | `"7d"` | `"30d"`

#### Returns

`void`

***

### showAdvancedMetrics

> `readonly` **showAdvancedMetrics**: `boolean`

Defined in: [src/components/SiteDetails/tabs/AnalyticsTab.tsx:80](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/tabs/AnalyticsTab.tsx#L80)

Whether advanced metrics are currently shown

***

### siteDetailsChartTimeRange

> `readonly` **siteDetailsChartTimeRange**: `"1h"` \| `"24h"` \| `"7d"` \| `"30d"`

Defined in: [src/components/SiteDetails/tabs/AnalyticsTab.tsx:82](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/tabs/AnalyticsTab.tsx#L82)

Current chart time range selection

***

### totalChecks

> `readonly` **totalChecks**: `number`

Defined in: [src/components/SiteDetails/tabs/AnalyticsTab.tsx:84](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/tabs/AnalyticsTab.tsx#L84)

Total number of checks performed

***

### totalDowntime

> `readonly` **totalDowntime**: `number`

Defined in: [src/components/SiteDetails/tabs/AnalyticsTab.tsx:86](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/tabs/AnalyticsTab.tsx#L86)

Total downtime in milliseconds

***

### upCount

> `readonly` **upCount**: `number`

Defined in: [src/components/SiteDetails/tabs/AnalyticsTab.tsx:88](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/tabs/AnalyticsTab.tsx#L88)

Number of successful checks

***

### uptime

> `readonly` **uptime**: `string`

Defined in: [src/components/SiteDetails/tabs/AnalyticsTab.tsx:90](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/tabs/AnalyticsTab.tsx#L90)

Uptime percentage as string

***

### uptimeChartData

> `readonly` **uptimeChartData**: [`UptimeChartData`](../../../../../services/chartConfig/interfaces/UptimeChartData.md)

Defined in: [src/components/SiteDetails/tabs/AnalyticsTab.tsx:92](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/components/SiteDetails/tabs/AnalyticsTab.tsx#L92)

Chart.js data configuration for uptime chart
