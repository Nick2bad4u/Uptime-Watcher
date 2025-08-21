# src/services/chartConfig

Chart configuration service for consistent, theme-aware data visualization.

## Remarks

Provides centralized Chart.js configuration management with automatic theme
integration for consistent styling across all charts in the application. This
service ensures that charts maintain visual consistency and respond to theme
changes appropriately.

The service supports multiple chart types with optimized configurations:

- Line charts for time-series data (response times, uptime trends)
- Area charts for filled visualizations
- Doughnut charts for status distributions
- Responsive design with mobile-friendly defaults

## Example

```typescript
const chartConfig = new ChartConfigService(currentTheme);
const lineConfig = chartConfig.getLineChartConfig();
const doughnutConfig = chartConfig.getDoughnutChartConfig();
```

## Classes

- [ChartConfigService](classes/ChartConfigService.md)

## Interfaces

- [ChartConfigs](interfaces/ChartConfigs.md)
- [ResponseTimeChartData](interfaces/ResponseTimeChartData.md)
- [StatusBarChartData](interfaces/StatusBarChartData.md)
- [UptimeChartData](interfaces/UptimeChartData.md)

## Functions

- [createChartConfigs](functions/createChartConfigs.md)
