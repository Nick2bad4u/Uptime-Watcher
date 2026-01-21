/**
 * Hybrid Chart.js type definitions combining official Chart.js v4.5.0 types
 * with custom business logic.
 *
 * @remarks
 * This file creates a hybrid approach where we use Chart.js official types as
 * the foundation but extend them with our custom business logic types where the
 * official types lack specificity.
 *
 * **Strategy:**
 *
 * - Use official `ChartOptions<TType>`, `ChartData<TType>` for service layer
 *   integrations
 * - Use custom `ChartScalesConfig`, `ChartPluginsConfig` for business logic and
 *   utilities
 * - Provide hybrid types that combine both for complete type safety
 *
 * **When to use which:**
 *
 * - `ChartOptions<'line' | 'bar' | 'doughnut'>`: Service layer, Chart.js
 *   instantiation
 * - `ChartScalesConfig`: Utils, business logic, theme integration
 * - `ChartPluginsConfig`: Plugin configuration, custom styling
 * - `UptimeChartOptions<TType>`: Hybrid type for complete Uptime Watcher chart
 *   config
 *
 * @packageDocumentation For
 *
 * comprehensive documentation see the hybrid type system guide in the
 * architecture documentation set.
 */

// Import official Chart.js types
import type { ChartData, ChartOptions } from "chart.js";
import type { UnknownRecord } from "type-fest";

// Import our custom business logic types
import type {
    ChartDataPoint,
    ChartDatasetConfig,
    ChartPluginsConfig,
    ChartScalesConfig,
    ChartThemeConfig,
} from "./chartConfig.js";

/**
 * Enhanced Chart.js options that combine official types with custom business
 * logic.
 *
 * @remarks
 * Extends the core Chart.js option surface with our scale and plugin
 * conveniences while remaining compatible with upstream APIs.
 *
 * @public
 */
export interface UptimeChartOptions {
    /** Animation configuration */
    animation?: {
        duration?: number;
        easing?: string;
    };
    /** Dataset configurations */
    datasets?: UnknownRecord;
    /** Element configurations */
    elements?: UnknownRecord;
    /** Interaction configuration */
    interaction?: {
        intersect?: boolean;
        mode?: string;
    };
    /** Whether to maintain aspect ratio */
    maintainAspectRatio?: boolean;
    /** Enhanced plugin configuration with theme integration */
    plugins?: ChartPluginsConfig;
    /** Whether the chart is responsive */
    responsive?: boolean;
    /** Enhanced scale configuration with business logic */
    scales?: ChartScalesConfig;
}

/**
 * Chart type registry mapping for TypeScript inference.
 *
 * @remarks
 * Maps our custom chart types to Chart.js official chart types for proper type
 * inference.
 *
 * @public
 */
export interface ChartTypeRegistry {
    bar: "bar";
    bubble: "bubble";
    doughnut: "doughnut";
    line: "line";
    pie: "pie";
    polarArea: "polarArea";
    radar: "radar";
    scatter: "scatter";
}

/**
 * Enhanced Chart.js data structure combining official types with custom dataset
 * configuration.
 *
 * @remarks
 * Provides enhanced chart data structure with our custom dataset configuration
 * for enhanced type safety in business logic.
 *
 * @public
 */
export interface UptimeChartData {
    /** Enhanced datasets with custom configuration */
    datasets: ChartDatasetConfig[];
    /** Chart labels */
    labels?: string[];
}

/**
 * Complete chart configuration combining data and options with hybrid types.
 *
 * @remarks
 * Provides a complete chart setup that uses our hybrid approach, suitable for
 * both Chart.js instantiation and business logic processing.
 *
 * @template TType - Chart type from registry
 *
 * @public
 */
export interface UptimeChartConfig<
    TType extends keyof ChartTypeRegistry = "line",
> {
    /** Enhanced chart data */
    data: UptimeChartData;
    /** Enhanced chart options */
    options?: UptimeChartOptions;
    /** Chart type */
    type: ChartTypeRegistry[TType];
}

/**
 * Theme-aware chart configuration factory interface.
 *
 * @remarks
 * Interface for creating chart configurations that automatically apply
 * theme-specific styling using both official Chart.js types and custom theme
 * logic.
 *
 * @public
 */
export interface ThemeAwareChartFactory {
    /**
     * Create a bar chart configuration with theme integration.
     *
     * @param data - Chart data
     * @param themeConfig - Theme configuration
     *
     * @returns Hybrid chart configuration with theme-driven styling.
     */
    createBarChart: (
        data: UptimeChartData,
        themeConfig: ChartThemeConfig
    ) => UptimeChartConfig<"bar">;

    /**
     * Create a doughnut chart configuration with theme integration.
     *
     * @param data - Chart data
     * @param themeConfig - Theme configuration
     *
     * @returns Hybrid chart configuration with theme-driven styling.
     */
    createDoughnutChart: (
        data: UptimeChartData,
        themeConfig: ChartThemeConfig
    ) => UptimeChartConfig<"doughnut">;

    /**
     * Create a line chart configuration with theme integration.
     *
     * @param data - Chart data
     * @param themeConfig - Theme configuration
     *
     * @returns Hybrid chart configuration with theme-driven styling.
     */
    createLineChart: (
        data: UptimeChartData,
        themeConfig: ChartThemeConfig
    ) => UptimeChartConfig;
}

/**
 * Type-safe chart utility functions interface.
 *
 * @remarks
 * Interface for utility functions that work with both official Chart.js types
 * and our custom business logic types.
 *
 * @public
 */
export interface ChartUtilities {
    /**
     * Safely get plugin configuration from chart options.
     *
     * @param options - Chart options (hybrid or official)
     * @param pluginId - Plugin identifier
     *
     * @returns The plugin configuration when available; otherwise `undefined`.
     */
    getPluginConfig: (
        options: ChartOptions | UptimeChartOptions,
        pluginId: string
    ) => ChartPluginsConfig[keyof ChartPluginsConfig];

    /**
     * Safely get scale configuration from chart options.
     *
     * @param options - Chart options (hybrid or official)
     * @param scaleId - Scale identifier
     *
     * @returns The scale configuration when available; otherwise `undefined`.
     */
    getScaleConfig: (
        options: ChartOptions | UptimeChartOptions,
        scaleId: string
    ) => ChartScalesConfig[keyof ChartScalesConfig];

    /**
     * Convert hybrid chart configuration to Chart.js official format.
     *
     * @param config - Hybrid chart configuration
     *
     * @returns A Chart.js-compatible configuration bundle.
     */
    toChartJsConfig: <TType extends keyof ChartTypeRegistry>(
        config: UptimeChartConfig<TType>
    ) => {
        data: ChartData<ChartTypeRegistry[TType]>;
        options: ChartOptions<ChartTypeRegistry[TType]>;
        type: ChartTypeRegistry[TType];
    };
}

/**
 * Enhanced chart data point for Uptime Watcher business logic.
 *
 * @remarks
 * Combines Chart.js data point requirements with our custom business data.
 *
 * @public
 */
export interface UptimeChartDataPoint extends ChartDataPoint {
    /** Additional metadata for business logic */
    metadata?: {
        [key: string]: unknown;
        endpoint?: string;
        errorMessage?: string;
        statusCode?: number;
    };
    /** Response time in milliseconds */
    responseTime?: number;
    /** Status information for uptime monitoring */
    status?: "down" | "unknown" | "up" | "warning";
    /** Timestamp for the data point */
    timestamp?: Date | number | string;
}

/**
 * This file provides hybrid chart types that combine Chart.js official types
 * with custom business logic types. Consumers should import types directly from
 * their respective modules:
 *
 * - Chart.js types: import from "chart.js"
 * - Custom types: import from "./chartConfig.js"
 *
 * @public
 */

// Note: Re-exports have been removed to comply with no-barrel-files rule.
// Import ChartDataPoint, ChartDatasetConfig, ChartPluginsConfig, ChartScalesConfig,
// ChartThemeConfig directly from "./chartConfig.js"
// Import ChartData, ChartOptions directly from "chart.js"

/**
 * Determines whether chart options use the hybrid Uptime Watcher format.
 *
 * @param options - Chart options to inspect.
 *
 * @returns `true` when the options include plugin or scale metadata specific to
 *   our hybrid format.
 *
 * @public
 */
export function isUptimeChartOptions(
    options: unknown
): options is UptimeChartOptions {
    return (
        typeof options === "object" &&
        options !== null &&
        ("scales" in options || "plugins" in options)
    );
}

/**
 * Determines whether chart data uses the hybrid Uptime Watcher format.
 *
 * @param data - Chart data to inspect.
 *
 * @returns `true` when the data exposes a `datasets` array; otherwise `false`.
 *
 * @public
 */
export function isUptimeChartData(data: unknown): data is UptimeChartData {
    return (
        typeof data === "object" &&
        data !== null &&
        "datasets" in data &&
        Array.isArray((data as { datasets: unknown }).datasets)
    );
}
