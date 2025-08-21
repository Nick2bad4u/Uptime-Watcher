# Class: ChartConfigService

Defined in: [src/services/chartConfig.ts:96](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/services/chartConfig.ts#L96)

Chart Configuration Service for theme-aware chart styling.

## Remarks

Centralizes all chart configurations to ensure consistency and
maintainability across the application. The service automatically applies
theme colors, fonts, and spacing to all chart configurations.

## Constructors

### Constructor

> **new ChartConfigService**(`theme`): `ChartConfigService`

Defined in: [src/services/chartConfig.ts:107](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/services/chartConfig.ts#L107)

Creates a new chart configuration service.

#### Parameters

##### theme

[`Theme`](../../../theme/types/interfaces/Theme.md)

Theme instance containing colors, typography, and spacing

#### Returns

`ChartConfigService`

## Methods

### getBarChartConfig()

> **getBarChartConfig**(): `ChartOptions`\<`"bar"`\>

Defined in: [src/services/chartConfig.ts:118](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/services/chartConfig.ts#L118)

Status distribution bar chart configuration

#### Returns

`ChartOptions`\<`"bar"`\>

Chart configuration options for bar charts

***

### getDoughnutChartConfig()

> **getDoughnutChartConfig**(`totalChecks`): `ChartOptions`\<`"doughnut"`\>

Defined in: [src/services/chartConfig.ts:146](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/services/chartConfig.ts#L146)

Uptime doughnut chart configuration

#### Parameters

##### totalChecks

`number`

Total number of checks for percentage calculation

#### Returns

`ChartOptions`\<`"doughnut"`\>

Chart configuration options for doughnut charts

***

### getLineChartConfig()

> **getLineChartConfig**(): `ChartOptions`\<`"line"`\>

Defined in: [src/services/chartConfig.ts:191](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/services/chartConfig.ts#L191)

Response time line chart configuration

#### Returns

`ChartOptions`\<`"line"`\>

Chart configuration options for line charts with responsive
  scaling
