# Function: useChartConfigs()

> **useChartConfigs**(`theme`, `totalChecks`): `object`

Defined in: [src/services/chartConfig.ts:293](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/src/services/chartConfig.ts#L293)

React hook for getting theme-aware chart configurations.

## Parameters

### theme

[`Theme`](../../../theme/types/interfaces/Theme.md)

Current theme object for styling charts

### totalChecks

`number` = `0`

Total number of checks for pie chart configuration

## Returns

`object`

Object containing various chart configuration options

### barChartOptions

> **barChartOptions**: `_DeepPartialObject`\<`CoreChartOptions`\<`"bar"`\> & `ElementChartOptions`\<`"bar"`\> & `PluginChartOptions`\<`"bar"`\> & `DatasetChartOptions`\<`"bar"`\> & `ScaleChartOptions`\<`"bar"`\> & `BarControllerChartOptions`\>

### doughnutOptions

> **doughnutOptions**: `_DeepPartialObject`\<`CoreChartOptions`\<`"doughnut"`\> & `ElementChartOptions`\<`"doughnut"`\> & `PluginChartOptions`\<`"doughnut"`\> & `DatasetChartOptions`\<`"doughnut"`\> & `ScaleChartOptions`\<`"doughnut"`\> & `DoughnutControllerChartOptions`\>

### lineChartOptions

> **lineChartOptions**: `_DeepPartialObject`\<`CoreChartOptions`\<`"line"`\> & `ElementChartOptions`\<`"line"`\> & `PluginChartOptions`\<`"line"`\> & `DatasetChartOptions`\<`"line"`\> & `ScaleChartOptions`\<`"line"`\> & `LineControllerChartOptions`\>
