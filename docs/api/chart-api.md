# 📊 Chart API Reference

> **Navigation:** [📖 Docs Home](../README) » [📚 API Reference](README) » **Chart API**

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
- Title: "Response Time Over Time"

**Example:**

```typescript
const chartService = new ChartConfigService(currentTheme);
const lineConfig = chartService.getLineChartConfig();

// Use with react-chartjs-2
import { Line } from 'react-chartjs-2';

<Line 
    data={responseTimeData} 
    options={lineConfig}
/>
```

##### getBarChartConfig(): ChartOptions&lt;'bar'&gt;

Returns configuration for bar charts, typically used for status distribution.

**Returns:** Complete Chart.js configuration object for bar charts

**Features:**

- No legend display (suitable for single data series)
- Count-based y-axis starting from zero
- Theme-aware styling
- Title: "Status Distribution"

**Example:**

```typescript
const barConfig = chartService.getBarChartConfig();

// Use with react-chartjs-2
import { Bar } from 'react-chartjs-2';

<Bar 
    data={statusDistributionData} 
    options={barConfig}
/>
```

##### getDoughnutChartConfig(totalChecks: number): ChartOptions&lt;'doughnut'&gt;

Returns configuration for doughnut charts, typically used for uptime distribution.

**Parameters:**

- **totalChecks** (`number`): Total number of checks for percentage calculations

**Returns:** Complete Chart.js configuration object for doughnut charts

**Features:**

- Bottom-positioned legend
- Custom tooltip with percentage calculations
- Title: "Uptime Distribution"
- Theme-aware colors

**Example:**

```typescript
const doughnutConfig = chartService.getDoughnutChartConfig(1000);

// Use with react-chartjs-2
import { Doughnut } from 'react-chartjs-2';

<Doughnut 
    data={uptimeData} 
    options={doughnutConfig}
/>
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

**Note:** This hook is available in the service but not currently used in the main application. The primary usage pattern is direct instantiation of `ChartConfigService`.

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

### Actual Implementation Pattern (SiteDetails)

The primary usage pattern in the application follows this approach:

```typescript
import React, { useMemo } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { ChartConfigService } from '../services/chartConfig';
import { useTheme } from '../hooks/useTheme';

function SiteDetailsComponent({ analytics, currentTheme }) {
    // Create chart config service instance
    const chartConfig = useMemo(() => new ChartConfigService(currentTheme), [currentTheme]);

    // Chart configurations using the service
    const lineChartOptions = useMemo(() => chartConfig.getLineChartConfig(), [chartConfig]);
    const barChartOptions = useMemo(() => chartConfig.getBarChartConfig(), [chartConfig]);
    const doughnutOptions = useMemo(
        () => chartConfig.getDoughnutChartConfig(analytics.totalChecks),
        [chartConfig, analytics.totalChecks]
    );

    // Chart data preparation
    const lineChartData = useMemo(
        () => ({
            datasets: [
                {
                    backgroundColor: currentTheme.colors.primary[500] + "20",
                    borderColor: currentTheme.colors.primary[500],
                    data: analytics.filteredHistory.map((h) => h.responseTime),
                    fill: true,
                    label: "Response Time (ms)",
                    tension: 0.1,
                },
            ],
            labels: analytics.filteredHistory.map((h) => new Date(h.timestamp)),
        }),
        [analytics.filteredHistory, currentTheme]
    );

    return (
        <div>
            <Line data={lineChartData} options={lineChartOptions} />
            <Bar data={barChartData} options={barChartOptions} />
            <Doughnut data={doughnutChartData} options={doughnutOptions} />
        </div>
    );
}
```

### Alternative Pattern with useChartConfigs Hook

```typescript
function AlternativeChartComponent() {
    const theme = useTheme();
    const { lineChartOptions, barChartOptions, doughnutOptions } = useChartConfigs(theme, totalChecks);
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Line data={responseTimeData} options={lineChartOptions} />
            <Bar data={statusDistributionData} options={barChartOptions} />
            <Doughnut data={uptimeData} options={doughnutOptions} />
        </div>
    );
}
```

### Chart Data Preparation

The application follows specific patterns for preparing chart data:

```typescript
// Line chart data for response times
const lineChartData = useMemo(
    () => ({
        datasets: [
            {
                backgroundColor: currentTheme.colors.primary[500] + "20",
                borderColor: currentTheme.colors.primary[500],
                data: analytics.filteredHistory.map((h) => h.responseTime),
                fill: true,
                label: "Response Time (ms)",
                tension: 0.1,
            },
        ],
        labels: analytics.filteredHistory.map((h) => new Date(h.timestamp)),
    }),
    [analytics.filteredHistory, currentTheme]
);

// Bar chart data for status distribution  
const barChartData = useMemo(
    () => ({
        datasets: [
            {
                backgroundColor: [currentTheme.colors.success, currentTheme.colors.error],
                data: [analytics.upCount, analytics.downCount],
            },
        ],
        labels: ["Up", "Down"],
    }),
    [analytics.upCount, analytics.downCount, currentTheme]
);

// Doughnut chart data for uptime visualization
const doughnutChartData = useMemo(
    () => ({
        datasets: [
            {
                backgroundColor: [currentTheme.colors.success, currentTheme.colors.error],
                data: [analytics.upCount, analytics.downCount],
            },
        ],
        labels: ["Up", "Down"],
    }),
    [analytics.upCount, analytics.downCount, currentTheme]
);
```

## Integration with HistoryChart Component

**Note:** The `HistoryChart` component does not use `ChartConfigService`. Instead, it uses a custom `MiniChartBar` component for lightweight historical visualization:

```typescript
// HistoryChart.tsx - Uses custom mini bars, not Chart.js
import { MiniChartBar } from "../../theme/components";

export const HistoryChart = React.memo(function HistoryChart({ history, title, maxItems = 120 }) {
    const displayedHistory = history.slice(0, maxItems).reverse();

    return (
        <div className="mb-3 w-full">
            <ThemedText size="xs" variant="secondary">
                {title}
            </ThemedText>
            <div className="flex items-center justify-end gap-1">
                {displayedHistory.map((record) => (
                    <MiniChartBar
                        key={record.timestamp}
                        status={record.status}
                        responseTime={record.responseTime}
                        timestamp={record.timestamp}
                    />
                ))}
            </div>
        </div>
    );
});
```

The `ChartConfigService` is specifically used for full Chart.js implementations in the SiteDetails analytics tab.

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

- [🎨 Theme API](theme-api) - Theme system and color schemes
- [🧩 Hook APIs](hook-apis) - Chart configuration hooks
- [📋 Types API](types-api) - Chart data type definitions
- [💾 Database API](database-api) - Historical data sources
- [📊 Monitor API](monitor-api) - Real-time monitoring data
- [🛠️ Utilities API](utilities-api) - Data transformation utilities

---

> **Related:** [📚 API Reference](README) | [📖 Documentation Home](../README)
