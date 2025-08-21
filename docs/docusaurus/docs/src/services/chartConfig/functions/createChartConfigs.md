# Function: createChartConfigs()

> **createChartConfigs**(`theme`, `totalChecks`): [`ChartConfigs`](../interfaces/ChartConfigs.md)

Defined in: [src/services/chartConfig.ts:371](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/services/chartConfig.ts#L371)

React hook for getting theme-aware chart configurations.

## Parameters

### theme

[`Theme`](../../../theme/types/interfaces/Theme.md)

Current theme object for styling charts

### totalChecks

`number` = `0`

Total number of checks for pie chart configuration

## Returns

[`ChartConfigs`](../interfaces/ChartConfigs.md)

Object containing various chart configuration options

## Example

```typescript
const { barChartOptions, doughnutOptions, lineChartOptions } = createChartConfigs(theme, 100);
// Use with Chart.js components
<Bar data={chartData} options={barChartOptions} />
<Doughnut data={statusData} options={doughnutOptions} />
<Line data={timeSeriesData} options={lineChartOptions} />
```
