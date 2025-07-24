# Class: ChartConfigService

Defined in: [src/services/chartConfig.ts:84](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/src/services/chartConfig.ts#L84)

Chart Configuration Service for theme-aware chart styling.

## Remarks

Centralizes all chart configurations to ensure consistency and maintainability
across the application. The service automatically applies theme colors, fonts,
and spacing to all chart configurations.

## Constructors

### Constructor

> **new ChartConfigService**(`theme`): `ChartConfigService`

Defined in: [src/services/chartConfig.ts:93](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/src/services/chartConfig.ts#L93)

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

Defined in: [src/services/chartConfig.ts:100](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/src/services/chartConfig.ts#L100)

Status distribution bar chart configuration

#### Returns

`ChartOptions`\<`"bar"`\>

***

### getDoughnutChartConfig()

> **getDoughnutChartConfig**(`totalChecks`): `ChartOptions`\<`"doughnut"`\>

Defined in: [src/services/chartConfig.ts:122](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/src/services/chartConfig.ts#L122)

Uptime doughnut chart configuration

#### Parameters

##### totalChecks

`number`

#### Returns

`ChartOptions`\<`"doughnut"`\>

***

### getLineChartConfig()

> **getLineChartConfig**(): `ChartOptions`\<`"line"`\>

Defined in: [src/services/chartConfig.ts:152](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/src/services/chartConfig.ts#L152)

Response time line chart configuration

#### Returns

`ChartOptions`\<`"line"`\>
