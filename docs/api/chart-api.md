# 📊 Chart API Reference

> **Navigation:** [📖 Docs Home](../README) » [📚 API Reference](README/) » **Chart API**

The Chart API provides theme-aware chart configurations for consistent data visualization throughout the application using Chart.js.

## Classes

### ChartConfigService

Service class that provides theme-aware chart configurations for various chart types.

```typescript
export class ChartConfigService {
    constructor(theme: Theme)
}
```

#### Constructor

**Parameters:**

- **theme** (`Theme`): Theme object containing colors, typography, and styling information

#### Methods

##### getLineChartConfig(): ChartOptions&lt;'line'&gt;

Returns configuration for line charts, typically used for response time over time.

**Returns:** Complete Chart.js configuration object for line charts

**Features:**

- Time-based x-axis with configurable display formats
- Response time y-axis starting from zero
- Interactive tooltips and legends
- Zoom and pan functionality
- Theme-aware colors and fonts

**Example:**

```typescript
const chartService = new ChartConfigService(currentTheme);
const lineConfig = chartService.getLineChartConfig();

// Use with Chart.js
new Chart(ctx, {
    type: 'line',
    data: responseTimeData,
    options: lineConfig
});
```

##### getBarChartConfig(): ChartOptions&lt;'bar'&gt;

Returns configuration for bar charts, typically used for status distribution.

**Returns:** Complete Chart.js configuration object for bar charts

**Features:**

- No legend display (suitable for single data series)
- Count-based y-axis starting from zero
- Theme-aware styling
- Status distribution title

**Example:**

```typescript
const barConfig = chartService.getBarChartConfig();

new Chart(ctx, {
    type: 'bar',
    data: statusDistributionData,
    options: barConfig
});
```

##### getDoughnutChartConfig(totalChecks: number): ChartOptions&lt;'doughnut'&gt;

Returns configuration for doughnut charts, typically used for uptime distribution.

**Parameters:**

- **totalChecks** (`number`): Total number of checks for percentage calculations

**Returns:** Complete Chart.js configuration object for doughnut charts

**Features:**

- Bottom-positioned legend
- Custom tooltip with percentage calculations
- Uptime distribution title
- Theme-aware colors

**Example:**

```typescript
const doughnutConfig = chartService.getDoughnutChartConfig(1000);

new Chart(ctx, {
    type: 'doughnut',
    data: uptimeData,
    options: doughnutConfig
});
```

## React Hook

### useChartConfigs

React hook that provides theme-aware chart configurations with automatic theme updates.

```typescript
function useChartConfigs(theme: Theme, totalChecks?: number): ChartConfigs
```

**Parameters:**

- **theme** (`Theme`): Current theme object
- **totalChecks** (`number`, optional): Total checks for doughnut chart configuration (default: 0)

**Returns:** Object containing all chart configuration options

```typescript
interface ChartConfigs {
    lineChartOptions: ChartOptions<'line'>;
    barChartOptions: ChartOptions<'bar'>;
    doughnutOptions: ChartOptions<'doughnut'>;
}
```

**Example:**

```typescript
import { useChartConfigs } from './services/chartConfig';
import { useTheme } from './hooks/useTheme';

function MyChartComponent() {
    const theme = useTheme();
    const { lineChartOptions, barChartOptions, doughnutOptions } = useChartConfigs(theme, 500);

    return (
        <div>
            <Line data={responseTimeData} options={lineChartOptions} />
            <Bar data={statusData} options={barChartOptions} />
            <Doughnut data={uptimeData} options={doughnutOptions} />
        </div>
    );
}
```

## Configuration Details

### Base Configuration

All charts share common base configuration:

- **Responsive**: Automatically adjusts to container size
- **No aspect ratio maintenance**: Fills available space
- **Theme-aware tooltips**: Background, border, and text colors from theme
- **Consistent typography**: Uses theme font family and sizing

### Line Chart Specifics

- **Interaction mode**: Index-based with no intersection requirement
- **Time axis**: Configurable display formats (day: "MMM dd", hour/minute: "HH:mm")
- **Y-axis**: Response time in milliseconds with zero baseline
- **Zoom controls**: Mouse wheel and pinch zoom on x-axis
- **Pan controls**: Horizontal panning enabled

### Bar Chart Specifics

- **Legend**: Disabled for cleaner appearance
- **Y-axis**: Count values starting from zero
- **Title**: "Status Distribution"

### Doughnut Chart Specifics

- **Legend position**: Bottom
- **Custom tooltips**: Shows count and percentage
- **Title**: "Uptime Distribution"
- **Percentage calculation**: Based on provided totalChecks parameter

## Theme Integration

### Supported Theme Properties

The chart configurations automatically adapt to theme changes using:

```typescript
// Colors
theme.colors.text.primary        // Legend and title text
theme.colors.text.secondary      // Axis labels and tooltips
theme.colors.surface.elevated    // Tooltip background
theme.colors.border.primary      // Tooltip borders
theme.colors.border.secondary    // Grid lines

// Typography
theme.typography.fontFamily.sans // Font family for all text
```

### Color Mapping

- **Grid lines**: Use secondary border color for subtle appearance
- **Text elements**: Primary text color for titles, secondary for labels
- **Tooltips**: Elevated surface background with primary border
- **Legends**: Primary text color with theme typography

## Usage Examples

### Complete Chart Implementation

```typescript
import React from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { useChartConfigs } from '../services/chartConfig';
import { useTheme } from '../hooks/useTheme';

interface ChartData {
    responseTimeData: any;
    statusDistributionData: any;
    uptimeData: any;
    totalChecks: number;
}

function MonitoringCharts({ responseTimeData, statusDistributionData, uptimeData, totalChecks }: ChartData) {
    const theme = useTheme();
    const { lineChartOptions, barChartOptions, doughnutOptions } = useChartConfigs(theme, totalChecks);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="chart-container">
                <Line 
                    data={responseTimeData} 
                    options={lineChartOptions}
                    height={300}
                />
            </div>
            
            <div className="chart-container">
                <Bar 
                    data={statusDistributionData} 
                    options={barChartOptions}
                    height={300}
                />
            </div>
            
            <div className="chart-container">
                <Doughnut 
                    data={uptimeData} 
                    options={doughnutOptions}
                    height={300}
                />
            </div>
        </div>
    );
}
```

### Dynamic Theme Updates

```typescript
function ThemeAwareChart() {
    const theme = useTheme();
    const [data, setData] = useState(chartData);
    
    // Chart configurations automatically update when theme changes
    const { lineChartOptions } = useChartConfigs(theme);
    
    useEffect(() => {
        // Chart will re-render with new theme colors
    }, [theme]);

    return <Line data={data} options={lineChartOptions} />;
}
```

### Custom Chart Service Usage

```typescript
// For non-React usage or custom implementations
function createCustomChart(canvas: HTMLCanvasElement, theme: Theme) {
    const chartService = new ChartConfigService(theme);
    
    return new Chart(canvas, {
        type: 'line',
        data: {
            datasets: [{
                label: 'Response Time',
                data: responseTimeData,
                borderColor: theme.colors.primary,
                backgroundColor: theme.colors.primary + '20', // Add transparency
            }]
        },
        options: chartService.getLineChartConfig()
    });
}
```

## Integration with HistoryChart Component

The chart configurations are designed to work seamlessly with the `HistoryChart` component:

```typescript
// In HistoryChart.tsx
const { lineChartOptions } = useChartConfigs(theme);

return (
    <Line 
        data={chartData}
        options={lineChartOptions}
        plugins={[/* custom plugins */]}
    />
);
```

## Performance Considerations

- **Responsive design**: Charts automatically resize without performance penalty
- **Theme caching**: Hook memoizes configurations to prevent unnecessary re-renders
- **Selective updates**: Only affected chart properties update when theme changes
- **Memory efficiency**: Service instances are lightweight and can be created as needed

## Accessibility Features

- **High contrast**: Theme-aware colors ensure sufficient contrast ratios
- **Font scaling**: Respects system font preferences through theme typography
- **Keyboard navigation**: Chart.js built-in keyboard support enabled
- **Screen reader**: Semantic markup and ARIA labels supported through Chart.js

## Chart.js Integration Notes

- **Version compatibility**: Designed for Chart.js v3+
- **Plugin support**: Configurations work with Chart.js plugins like zoom
- **Responsive behavior**: Leverages Chart.js responsive capabilities
- **Animation**: Uses Chart.js default animations with theme-appropriate timing

## See Also

- [🎨 Theme API](theme-api/) - Theme system and color schemes
- [🧩 Hook APIs](hook-apis/) - Chart configuration hooks
- [📋 Types API](types-api/) - Chart data type definitions
- [💾 Database API](database-api/) - Historical data sources
- [📊 Monitor API](monitor-api/) - Real-time monitoring data
- [🛠️ Utilities API](utilities-api/) - Data transformation utilities

---

> **Related:** [📚 API Reference](README/) | [📖 Documentation Home](../README)
