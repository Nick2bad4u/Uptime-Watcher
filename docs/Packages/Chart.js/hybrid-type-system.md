# Chart.js Hybrid Type System

This document explains the hybrid Chart.js type system implemented in Uptime Watcher, which combines Chart.js v4.5.0 official types with custom business logic types for optimal type safety and maintainability.

## Overview

Uptime Watcher uses a **hybrid approach** to Chart.js types that leverages the best of both worlds:

- **Chart.js Official Types**: For service layer integrations and Chart.js API compatibility
- **Custom Business Logic Types**: For enhanced type safety in utilities and business logic
- **Hybrid Types**: Combining both for complete type coverage

## Architecture

### File Structure

```
shared/types/
├── chartConfig.ts          # Custom business logic types (581 lines)
├── chartHybrid.ts          # Hybrid types combining official + custom
└── ...

src/
├── services/chartConfig.ts # Service layer using official types
├── utils/chartUtils.ts     # Utilities using hybrid types
└── ...
```

### Type Categories

#### 1. Chart.js Official Types (from chart.js package)

```typescript
import type { ChartOptions, ChartData, ChartDataset } from "chart.js";

// Service layer - direct Chart.js integration
const lineConfig: ChartOptions<'line'> = {
  responsive: true,
  plugins: {
    legend: { display: true }
  }
};

const chartData: ChartData<'line'> = {
  labels: ['Jan', 'Feb'],
  datasets: [{ data: [1, 2] }]
};
```

**Use cases:**
- Service layer integrations
- Direct Chart.js instantiation
- React Chart.js components
- Official Chart.js API compatibility

**Benefits:**
- Type-safe with Chart.js APIs
- Automatic TypeScript support
- Framework integration compatibility
- Future Chart.js version compatibility

#### 2. Custom Business Logic Types (chartConfig.ts)

```typescript
// Custom types for Uptime Watcher business logic
interface ChartScalesConfig {
  x?: ChartScaleConfig;
  y?: ChartScaleConfig;
  [key: string]: ChartScaleConfig | undefined;
}

interface ChartPluginsConfig {
  legend?: ChartLegendConfig;
  title?: ChartTitleConfig;
  tooltip?: ChartTooltipConfig;
}
```

**Use cases:**
- Business logic processing
- Theme integration
- Custom chart utilities
- Type-safe configuration building

**Benefits:**
- Comprehensive business logic coverage
- Theme-aware configurations
- Enhanced type safety
- Uptime Watcher specific features

#### 3. Hybrid Types (chartHybrid.ts)

```typescript
// Combining official types with custom business logic
interface UptimeChartOptions {
  responsive?: boolean;
  maintainAspectRatio?: boolean;
  scales?: ChartScalesConfig;        // Custom business logic
  plugins?: ChartPluginsConfig;      // Custom business logic
  animation?: {                      // Simplified official type
    duration?: number;
    easing?: string;
  };
}
```

**Use cases:**
- Chart utilities requiring both type systems
- Theme-aware chart factories
- Business logic with Chart.js compatibility
- Type-safe chart configuration building

**Benefits:**
- Best of both worlds
- Seamless integration
- Enhanced type safety
- Business logic + API compatibility

## When to Use Which Types

### Use Chart.js Official Types When:

✅ **Service Layer Integration**
```typescript
// ✅ Good: Service returning Chart.js compatible config
class ChartConfigService {
  getLineChartConfig(): ChartOptions<'line'> {
    return {
      responsive: true,
      plugins: { legend: { display: true } }
    };
  }
}
```

✅ **React Component Integration**
```typescript
// ✅ Good: Direct Chart.js component usage
import { Line } from 'react-chartjs-2';

<Line
  data={chartData as ChartData<'line'>}
  options={chartOptions as ChartOptions<'line'>}
/>
```

✅ **Direct Chart.js Instantiation**
```typescript
// ✅ Good: Creating Chart.js instances
new Chart(ctx, {
  type: 'line',
  data: chartData as ChartData<'line'>,
  options: chartOptions as ChartOptions<'line'>
});
```

### Use Custom Business Logic Types When:

✅ **Theme Integration**
```typescript
// ✅ Good: Theme-aware configuration building
function applyTheme(config: ChartScalesConfig, theme: Theme): ChartScalesConfig {
  return {
    ...config,
    x: { ...config.x, grid: { color: theme.gridColor } },
    y: { ...config.y, grid: { color: theme.gridColor } }
  };
}
```

✅ **Business Logic Processing**
```typescript
// ✅ Good: Uptime-specific chart configuration
function createUptimeChartConfig(
  data: UptimeData,
  theme: Theme
): { scales: ChartScalesConfig; plugins: ChartPluginsConfig } {
  return {
    scales: buildUptimeScales(data, theme),
    plugins: buildUptimePlugins(data, theme)
  };
}
```

✅ **Utility Functions**
```typescript
// ✅ Good: Type-safe utility functions
function getScaleConfig(
  config: unknown,
  axis: 'x' | 'y'
): ChartScalesConfig[keyof ChartScalesConfig] | undefined {
  // Type-safe scale configuration access
}
```

### Use Hybrid Types When:

✅ **Chart Utilities with API Compatibility**
```typescript
// ✅ Good: Utilities that need both type systems
class ThemeAwareChartFactory {
  createLineChart(
    data: UptimeChartData,
    theme: ChartThemeConfig
  ): UptimeChartConfig<'line'> {
    // Uses custom business logic + Chart.js compatibility
  }

  toChartJsConfig(config: UptimeChartConfig): {
    type: string;
    data: ChartData;
    options: ChartOptions;
  } {
    // Converts to Chart.js official format
  }
}
```

✅ **Bridge Between Systems**
```typescript
// ✅ Good: Converting between type systems
function convertToChartJs(
  uptimeConfig: UptimeChartOptions
): ChartOptions<'line'> {
  return {
    responsive: uptimeConfig.responsive,
    scales: convertScales(uptimeConfig.scales),
    plugins: convertPlugins(uptimeConfig.plugins)
  };
}
```

## Migration Examples

### Before: Over-simplified with UnknownRecord
```typescript
// ❌ Bad: Lost type safety
function getScaleConfig(config: unknown, axis: string): UnknownRecord | undefined {
  // No type safety, prone to runtime errors
}
```

### After: Hybrid Approach
```typescript
// ✅ Good: Type-safe with business logic
function getScaleConfig(
  config: unknown,
  axis: 'x' | 'y'
): ChartScalesConfig[keyof ChartScalesConfig] | undefined {
  // Type-safe access to scale configuration
}
```

### Before: Chart.js Official Only
```typescript
// ❌ Limited: No business logic types
const config: ChartOptions<'line'> = {
  scales: {
    x: { /* limited type information */ },
    y: { /* limited type information */ }
  }
};
```

### After: Hybrid with Business Logic
```typescript
// ✅ Enhanced: Full business logic + Chart.js compatibility
const config: UptimeChartOptions = {
  scales: {
    x: {
      display: true,
      grid: { color: theme.gridColor },
      title: { display: true, text: 'Time' }
      // Full ChartScaleConfig type safety
    }
  }
};

// Convert to Chart.js when needed
const chartJsConfig = toChartJsConfig(config);
```

## Best Practices

### 1. Type Imports

```typescript
// ✅ Good: Import from appropriate sources
import type { ChartOptions, ChartData } from "chart.js";
import type { ChartScalesConfig, ChartPluginsConfig } from "@shared/types/chartConfig";
import type { UptimeChartOptions, UptimeChartData } from "@shared/types/chartHybrid";
```

### 2. Function Signatures

```typescript
// ✅ Good: Clear type boundaries
class ChartService {
  // Service layer: Official types
  createChart(): ChartOptions<'line'> { }

  // Business logic: Custom types
  applyTheme(scales: ChartScalesConfig): ChartScalesConfig { }

  // Bridge functions: Hybrid types
  buildConfiguration(): UptimeChartOptions { }
}
```

### 3. Type Guards

```typescript
// ✅ Good: Runtime type checking
function isUptimeChartOptions(options: unknown): options is UptimeChartOptions {
  return (
    typeof options === 'object' &&
    options !== null &&
    ('scales' in options || 'plugins' in options)
  );
}
```

### 4. Documentation

```typescript
/**
 * Theme-aware chart configuration factory.
 *
 * @remarks
 * Uses hybrid types combining Chart.js official types with Uptime Watcher
 * business logic for comprehensive type safety.
 *
 * @param data - Chart data using hybrid format
 * @param theme - Theme configuration for styling
 * @returns Complete chart configuration compatible with Chart.js
 */
function createChart(data: UptimeChartData, theme: Theme): UptimeChartConfig {
  // Implementation using hybrid approach
}
```

## Benefits of Hybrid Approach

### Type Safety
- **Full Coverage**: Both Chart.js APIs and business logic are type-safe
- **Compile-time Errors**: Catch configuration errors during development
- **IntelliSense**: Enhanced IDE support for all chart configurations

### Maintainability
- **Clear Boundaries**: Each type system has specific use cases
- **Gradual Migration**: Can migrate from custom to official types incrementally
- **Documentation**: Self-documenting code through TypeScript interfaces

### Compatibility
- **Chart.js Integration**: Seamless integration with Chart.js ecosystem
- **Future-proof**: Easy to update when Chart.js releases new versions
- **Framework Agnostic**: Works with React, Angular, Vue, etc.

### Developer Experience
- **Predictable**: Clear guidelines on which types to use when
- **Flexible**: Can use the most appropriate type system for each scenario
- **Safe**: Type system prevents common configuration mistakes

## Conclusion

The hybrid Chart.js type system provides the best balance of:

1. **Type Safety**: Comprehensive coverage of all chart configurations
2. **Business Logic**: Rich types for Uptime Watcher specific features
3. **Chart.js Compatibility**: Seamless integration with Chart.js ecosystem
4. **Maintainability**: Clear separation of concerns and upgrade paths

By following this hybrid approach, Uptime Watcher achieves both robust type safety and excellent Chart.js integration while maintaining clean, maintainable code.
