# Interface: AnalyticsTabProperties

Defined in: [src/components/SiteDetails/tabs/AnalyticsTab.tsx:25](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/components/SiteDetails/tabs/AnalyticsTab.tsx#L25)

Props for the AnalyticsTab component.
Contains comprehensive metrics, chart data, and formatting functions.

## Properties

### avgResponseTime

> `readonly` **avgResponseTime**: `number`

Defined in: [src/components/SiteDetails/tabs/AnalyticsTab.tsx:27](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/components/SiteDetails/tabs/AnalyticsTab.tsx#L27)

Average response time across all checks

***

### barChartData

> `readonly` **barChartData**: [`StatusBarChartData`](../../../../../services/chartConfig/interfaces/StatusBarChartData.md)

Defined in: [src/components/SiteDetails/tabs/AnalyticsTab.tsx:29](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/components/SiteDetails/tabs/AnalyticsTab.tsx#L29)

Chart.js data configuration for bar chart

***

### barChartOptions

> `readonly` **barChartOptions**: `ChartOptions`\<`"bar"`\>

Defined in: [src/components/SiteDetails/tabs/AnalyticsTab.tsx:31](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/components/SiteDetails/tabs/AnalyticsTab.tsx#L31)

Chart.js options configuration for bar chart

***

### doughnutOptions

> `readonly` **doughnutOptions**: `ChartOptions`\<`"doughnut"`\>

Defined in: [src/components/SiteDetails/tabs/AnalyticsTab.tsx:33](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/components/SiteDetails/tabs/AnalyticsTab.tsx#L33)

Chart.js options configuration for doughnut chart

***

### downCount

> `readonly` **downCount**: `number`

Defined in: [src/components/SiteDetails/tabs/AnalyticsTab.tsx:35](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/components/SiteDetails/tabs/AnalyticsTab.tsx#L35)

Number of failed checks

***

### downtimePeriods

> `readonly` **downtimePeriods**: [`DowntimePeriod`](../../../../../hooks/site/useSiteAnalytics/interfaces/DowntimePeriod.md)[]

Defined in: [src/components/SiteDetails/tabs/AnalyticsTab.tsx:37](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/components/SiteDetails/tabs/AnalyticsTab.tsx#L37)

Array of downtime periods with durations

***

### formatDuration()

> `readonly` **formatDuration**: (`ms`) => `string`

Defined in: [src/components/SiteDetails/tabs/AnalyticsTab.tsx:39](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/components/SiteDetails/tabs/AnalyticsTab.tsx#L39)

Function to format duration values

#### Parameters

##### ms

`number`

#### Returns

`string`

***

### formatResponseTime()

> `readonly` **formatResponseTime**: (`time`) => `string`

Defined in: [src/components/SiteDetails/tabs/AnalyticsTab.tsx:41](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/components/SiteDetails/tabs/AnalyticsTab.tsx#L41)

Function to format response time values

#### Parameters

##### time

`number`

#### Returns

`string`

***

### getAvailabilityDescription()

> `readonly` **getAvailabilityDescription**: (`percentage`) => `string`

Defined in: [src/components/SiteDetails/tabs/AnalyticsTab.tsx:43](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/components/SiteDetails/tabs/AnalyticsTab.tsx#L43)

Function to get description based on availability percentage

#### Parameters

##### percentage

`number`

#### Returns

`string`

***

### lineChartData

> `readonly` **lineChartData**: [`ResponseTimeChartData`](../../../../../services/chartConfig/interfaces/ResponseTimeChartData.md)

Defined in: [src/components/SiteDetails/tabs/AnalyticsTab.tsx:45](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/components/SiteDetails/tabs/AnalyticsTab.tsx#L45)

Chart.js data configuration for line chart

***

### lineChartOptions

> `readonly` **lineChartOptions**: `ChartOptions`\<`"line"`\>

Defined in: [src/components/SiteDetails/tabs/AnalyticsTab.tsx:47](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/components/SiteDetails/tabs/AnalyticsTab.tsx#L47)

Chart.js options configuration for line chart

***

### monitorType

> `readonly` **monitorType**: `"http"` \| `"port"`

Defined in: [src/components/SiteDetails/tabs/AnalyticsTab.tsx:49](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/components/SiteDetails/tabs/AnalyticsTab.tsx#L49)

Type of monitor being analyzed

***

### mttr

> `readonly` **mttr**: `number`

Defined in: [src/components/SiteDetails/tabs/AnalyticsTab.tsx:51](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/components/SiteDetails/tabs/AnalyticsTab.tsx#L51)

Mean time to recovery in milliseconds

***

### p50

> `readonly` **p50**: `number`

Defined in: [src/components/SiteDetails/tabs/AnalyticsTab.tsx:53](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/components/SiteDetails/tabs/AnalyticsTab.tsx#L53)

50th percentile response time

***

### p95

> `readonly` **p95**: `number`

Defined in: [src/components/SiteDetails/tabs/AnalyticsTab.tsx:55](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/components/SiteDetails/tabs/AnalyticsTab.tsx#L55)

95th percentile response time

***

### p99

> `readonly` **p99**: `number`

Defined in: [src/components/SiteDetails/tabs/AnalyticsTab.tsx:57](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/components/SiteDetails/tabs/AnalyticsTab.tsx#L57)

99th percentile response time

***

### setShowAdvancedMetrics()

> `readonly` **setShowAdvancedMetrics**: (`show`) => `void`

Defined in: [src/components/SiteDetails/tabs/AnalyticsTab.tsx:59](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/components/SiteDetails/tabs/AnalyticsTab.tsx#L59)

Function to toggle advanced metrics visibility

#### Parameters

##### show

`boolean`

#### Returns

`void`

***

### setSiteDetailsChartTimeRange()

> `readonly` **setSiteDetailsChartTimeRange**: (`range`) => `void`

Defined in: [src/components/SiteDetails/tabs/AnalyticsTab.tsx:61](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/components/SiteDetails/tabs/AnalyticsTab.tsx#L61)

Function to set the chart time range

#### Parameters

##### range

`"1h"` | `"7d"` | `"24h"` | `"30d"`

#### Returns

`void`

***

### showAdvancedMetrics

> `readonly` **showAdvancedMetrics**: `boolean`

Defined in: [src/components/SiteDetails/tabs/AnalyticsTab.tsx:63](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/components/SiteDetails/tabs/AnalyticsTab.tsx#L63)

Whether advanced metrics are currently shown

***

### siteDetailsChartTimeRange

> `readonly` **siteDetailsChartTimeRange**: `"1h"` \| `"7d"` \| `"24h"` \| `"30d"`

Defined in: [src/components/SiteDetails/tabs/AnalyticsTab.tsx:65](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/components/SiteDetails/tabs/AnalyticsTab.tsx#L65)

Current chart time range selection

***

### totalChecks

> `readonly` **totalChecks**: `number`

Defined in: [src/components/SiteDetails/tabs/AnalyticsTab.tsx:67](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/components/SiteDetails/tabs/AnalyticsTab.tsx#L67)

Total number of checks performed

***

### totalDowntime

> `readonly` **totalDowntime**: `number`

Defined in: [src/components/SiteDetails/tabs/AnalyticsTab.tsx:69](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/components/SiteDetails/tabs/AnalyticsTab.tsx#L69)

Total downtime in milliseconds

***

### upCount

> `readonly` **upCount**: `number`

Defined in: [src/components/SiteDetails/tabs/AnalyticsTab.tsx:71](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/components/SiteDetails/tabs/AnalyticsTab.tsx#L71)

Number of successful checks

***

### uptime

> `readonly` **uptime**: `string`

Defined in: [src/components/SiteDetails/tabs/AnalyticsTab.tsx:73](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/components/SiteDetails/tabs/AnalyticsTab.tsx#L73)

Uptime percentage as string

***

### uptimeChartData

> `readonly` **uptimeChartData**: [`UptimeChartData`](../../../../../services/chartConfig/interfaces/UptimeChartData.md)

Defined in: [src/components/SiteDetails/tabs/AnalyticsTab.tsx:75](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/components/SiteDetails/tabs/AnalyticsTab.tsx#L75)

Chart.js data configuration for uptime chart
