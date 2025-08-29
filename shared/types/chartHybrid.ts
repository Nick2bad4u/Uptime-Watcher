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
 * @packageDocumentation
 *
 * @see {@link docs/Packages/Chart.js/hybrid-type-system.md} for comprehensive documentation
 */

// Import official Chart.js types
import type { ChartOptions, ChartData } from "chart.js";

// Import our custom business logic types
import type {
    ChartScalesConfig,
    ChartPluginsConfig,
    ChartThemeConfig,
    ChartDataPoint,
    ChartDatasetConfig,
} from "./chartConfig.js";

/**
 * Enhanced Chart.js options that combine official types with custom business
 * logic.
 *
 * @remarks
 * This type extends Chart.js official `ChartOptions<TType>` with our custom
 * scale and plugin configurations for Uptime Watcher business logic while
 * maintaining compatibility with Chart.js APIs.
 *
 * @template TType - Chart type ('line' | 'bar' | 'doughnut' | etc.)
 *
 * @public
 */
export interface UptimeChartOptions {
    /** Animation configuration */
    animation?: {
        duration?: number;
        easing?: string;
    };
    /** Interaction configuration */
    interaction?: {
        intersect?: boolean;
        mode?: string;
    };
    /** Whether to maintain aspect ratio */
    maintainAspectRatio?: boolean;
    /** Whether the chart is responsive */
    responsive?: boolean;
    /** Enhanced scale configuration with business logic */
    scales?: ChartScalesConfig;
    /** Enhanced plugin configuration with theme integration */
    plugins?: ChartPluginsConfig;
    /** Element configurations */
    elements?: Record<string, unknown>;
    /** Dataset configurations */
    datasets?: Record<string, unknown>;
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
    line: "line";
    bar: "bar";
    doughnut: "doughnut";
    pie: "pie";
    scatter: "scatter";
    bubble: "bubble";
    polarArea: "polarArea";
    radar: "radar";
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
    /** Chart labels */
    labels?: string[];
    /** Enhanced datasets with custom configuration */
    datasets: Array<ChartDatasetConfig>;
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
    /** Chart type */
    type: ChartTypeRegistry[TType];
    /** Enhanced chart data */
    data: UptimeChartData;
    /** Enhanced chart options */
    options?: UptimeChartOptions;
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
     * Create a line chart configuration with theme integration.
     *
     * @param data - Chart data
     * @param themeConfig - Theme configuration
     *
     * @returns Complete chart configuration
     */
    createLineChart(
        data: UptimeChartData,
        themeConfig: ChartThemeConfig
    ): UptimeChartConfig<"line">;

    /**
     * Create a bar chart configuration with theme integration.
     *
     * @param data - Chart data
     * @param themeConfig - Theme configuration
     *
     * @returns Complete chart configuration
     */
    createBarChart(
        data: UptimeChartData,
        themeConfig: ChartThemeConfig
    ): UptimeChartConfig<"bar">;

    /**
     * Create a doughnut chart configuration with theme integration.
     *
     * @param data - Chart data
     * @param themeConfig - Theme configuration
     *
     * @returns Complete chart configuration
     */
    createDoughnutChart(
        data: UptimeChartData,
        themeConfig: ChartThemeConfig
    ): UptimeChartConfig<"doughnut">;
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
     * Safely get scale configuration from chart options.
     *
     * @param options - Chart options (hybrid or official)
     * @param scaleId - Scale identifier
     *
     * @returns Scale configuration or undefined
     */
    getScaleConfig(
        options: UptimeChartOptions | ChartOptions,
        scaleId: string
    ): ChartScalesConfig[keyof ChartScalesConfig] | undefined;

    /**
     * Safely get plugin configuration from chart options.
     *
     * @param options - Chart options (hybrid or official)
     * @param pluginId - Plugin identifier
     *
     * @returns Plugin configuration or undefined
     */
    getPluginConfig(
        options: UptimeChartOptions | ChartOptions,
        pluginId: string
    ): ChartPluginsConfig[keyof ChartPluginsConfig] | undefined;

    /**
     * Convert hybrid chart configuration to Chart.js official format.
     *
     * @param config - Hybrid chart configuration
     *
     * @returns Chart.js compatible configuration
     */
    toChartJsConfig<TType extends keyof ChartTypeRegistry>(
        config: UptimeChartConfig<TType>
    ): {
        type: ChartTypeRegistry[TType];
        data: ChartData<ChartTypeRegistry[TType]>;
        options: ChartOptions<ChartTypeRegistry[TType]>;
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
    /** Timestamp for the data point */
    timestamp?: Date | string | number;
    /** Status information for uptime monitoring */
    status?: "up" | "down" | "warning" | "unknown";
    /** Response time in milliseconds */
    responseTime?: number;
    /** Additional metadata for business logic */
    metadata?: {
        endpoint?: string;
        statusCode?: number;
        errorMessage?: string;
        [key: string]: unknown;
    };
}

/**
 * Re-export commonly used types for convenience.
 *
 * @public
 */
export type {
    // Custom business logic types
    ChartScalesConfig,
    ChartPluginsConfig,
    ChartThemeConfig,
    ChartDataPoint,
    ChartDatasetConfig,
} from "./chartConfig.js";

// Re-export Chart.js official types
export type { ChartOptions, ChartData } from "chart.js";

/**
 * Type guard to check if chart options use our hybrid format.
 *
 * @param options - Chart options to check
 *
 * @returns True if options use hybrid format
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
 * Type guard to check if chart data uses our hybrid format.
 *
 * @param data - Chart data to check
 *
 * @returns True if data uses hybrid format
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
