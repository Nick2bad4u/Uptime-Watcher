# Function: useChartConfigs()

> **useChartConfigs**(`theme`, `totalChecks`): `object`

Defined in: [src/services/chartConfig.ts:319](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/services/chartConfig.ts#L319)

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

## Example

```typescript
const { barChartOptions, doughnutOptions, lineChartOptions } = useChartConfigs(theme, 100);
// Use with Chart.js components
<Bar data={chartData} options={barChartOptions} />
<Doughnut data={statusData} options={doughnutOptions} />
<Line data={timeSeriesData} options={lineChartOptions} />
```
