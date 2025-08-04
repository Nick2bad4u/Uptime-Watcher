/**
 * Chart configuration type definitions for Uptime Watcher.
 *
 * @remarks
 * These interfaces provide type-safe configuration structures for Chart.js charts.
 * They ensure proper typing for chart options, scales, plugins, and data structures.
 *
 * @packageDocumentation
 */

/**
 * Chart configuration interface.
 *
 * @remarks
 * Main configuration interface for Chart.js charts used in Uptime Watcher.
 *
 * @public
 */
export interface ChartConfig {
    /** Animation configuration */
    animation?: {
        duration?: number;
        easing?: string;
    };
    /** Interaction configuration */
    interaction?: {
        intersect?: boolean;
        mode?: "dataset" | "index" | "nearest" | "point" | "x" | "y";
    };
    /** Whether to maintain aspect ratio */
    maintainAspectRatio?: boolean;
    /** Plugin configurations */
    plugins?: ChartPluginsConfig;
    /** Whether the chart is responsive */
    responsive?: boolean;
    /** Scale configurations */
    scales?: ChartScalesConfig;
}

/**
 * Chart data interface.
 *
 * @remarks
 * Main data structure for Chart.js charts.
 *
 * @public
 */
export interface ChartData {
    /** Datasets for the chart */
    datasets: ChartDatasetConfig[];
    /** Labels for the chart */
    labels?: Array<number | string>;
}

/**
 * Chart data point interface.
 *
 * @remarks
 * Defines the structure for individual data points in charts.
 *
 * @public
 */
export interface ChartDataPoint {
    /** Additional data for tooltips or processing */
    data?: Record<string, unknown>;
    /** X-axis value */
    x: number | string;
    /** Y-axis value */
    y: number;
}

/**
 * Chart dataset configuration interface.
 *
 * @remarks
 * Defines the structure for Chart.js dataset configuration.
 *
 * @public
 */
export interface ChartDatasetConfig {
    /** Background color */
    backgroundColor?: string | string[];
    /** Border color */
    borderColor?: string | string[];
    /** Border width */
    borderWidth?: number;
    /** Dataset data points */
    data: Array<ChartDataPoint | number>;
    /** Whether to fill the area under the line */
    fill?: boolean;
    /** Dataset label */
    label?: string;
    /** Point background color */
    pointBackgroundColor?: string | string[];
    /** Point border color */
    pointBorderColor?: string | string[];
    /** Point radius */
    pointRadius?: number | number[];
    /** Tension for line charts */
    tension?: number;
}

/**
 * Chart legend configuration interface.
 *
 * @remarks
 * Defines the structure for Chart.js legend configuration.
 *
 * @public
 */
export interface ChartLegendConfig {
    /** Whether to display the legend */
    display?: boolean;
    /** Labels configuration */
    labels?: {
        boxHeight?: number;
        boxWidth?: number;
        color?: string;
        font?: {
            family?: string;
            size?: number;
            style?: "italic" | "normal";
            weight?: "bold" | "normal";
        };
        padding?: number;
        usePointStyle?: boolean;
    };
    /** Legend position */
    position?: "bottom" | "chartArea" | "left" | "right" | "top";
}

/**
 * Chart plugins configuration interface.
 *
 * @remarks
 * Defines the structure for Chart.js plugins configuration.
 *
 * @public
 */
export interface ChartPluginsConfig {
    /** Legend configuration */
    legend?: ChartLegendConfig;
    /** Title configuration */
    title?: ChartTitleConfig;
    /** Tooltip configuration */
    tooltip?: ChartTooltipConfig;
}

/**
 * Chart scale configuration interface.
 *
 * @remarks
 * Defines the structure for Chart.js scale configuration objects.
 *
 * @public
 */
export interface ChartScaleConfig {
    /** Whether to display the scale */
    display?: boolean;
    /** Grid line configuration */
    grid?: {
        color?: string;
        display?: boolean;
        lineWidth?: number;
    };
    /** Maximum value for the scale */
    max?: number;
    /** Minimum value for the scale */
    min?: number;
    /** Position of the scale */
    position?: "bottom" | "left" | "right" | "top";
    /** Stacking configuration */
    stacked?: boolean;
    /** Ticks configuration */
    ticks?: {
        callback?: (value: number, index: number, values: number[]) => string;
        color?: string;
        font?: {
            family?: string;
            size?: number;
            style?: "italic" | "normal";
            weight?: "bold" | "normal";
        };
        max?: number;
        min?: number;
        precision?: number;
        stepSize?: number;
    };
    /** Scale title configuration */
    title?: {
        color?: string;
        display?: boolean;
        font?: {
            family?: string;
            size?: number;
            style?: "italic" | "normal";
            weight?: "bold" | "normal";
        };
        padding?: number;
        text?: string;
    };
    /** Scale type */
    type?: "category" | "linear" | "logarithmic" | "time";
}

/**
 * Chart scales configuration interface.
 *
 * @remarks
 * Defines the structure for Chart.js scales configuration.
 *
 * @public
 */
export interface ChartScalesConfig {
    /** Additional custom axes */
    [key: string]: ChartScaleConfig | undefined;
    /** X-axis configuration */
    x?: ChartScaleConfig;
    /** Y-axis configuration */
    y?: ChartScaleConfig;
}

/**
 * Chart theme configuration interface.
 *
 * @remarks
 * Defines color schemes and styling for charts based on theme.
 *
 * @public
 */
export interface ChartThemeConfig {
    /** Background colors for datasets */
    backgroundColors: string[];
    /** Border colors for datasets */
    borderColors: string[];
    /** Grid line color */
    gridColor: string;
    /** Text color for labels and titles */
    textColor: string;
    /** Tooltip background color */
    tooltipBackgroundColor: string;
    /** Tooltip text color */
    tooltipTextColor: string;
}

/**
 * Chart title configuration interface.
 *
 * @remarks
 * Defines the structure for Chart.js title configuration.
 *
 * @public
 */
export interface ChartTitleConfig {
    /** Title text alignment */
    align?: "center" | "end" | "start";
    /** Title color */
    color?: string;
    /** Whether to display the title */
    display?: boolean;
    /** Title font configuration */
    font?: {
        family?: string;
        lineHeight?: number;
        size?: number;
        style?: "italic" | "normal";
        weight?: "bold" | "normal";
    };
    /** Title padding */
    padding?: number;
    /** Title position */
    position?: "bottom" | "left" | "right" | "top";
    /** Title text */
    text?: string | string[];
}

/**
 * Chart tooltip configuration interface.
 *
 * @remarks
 * Defines the structure for Chart.js tooltip configuration.
 *
 * @public
 */
export interface ChartTooltipConfig {
    /** Background color */
    backgroundColor?: string;
    /** Body color */
    bodyColor?: string;
    /** Body font configuration */
    bodyFont?: {
        family?: string;
        size?: number;
        style?: "italic" | "normal";
        weight?: "bold" | "normal";
    };
    /** Border color */
    borderColor?: string;
    /** Border width */
    borderWidth?: number;
    /** Corner radius */
    cornerRadius?: number;
    /** Whether to display the tooltip */
    display?: boolean;
    /** Whether to display colors in tooltip */
    displayColors?: boolean;
    /** Title color */
    titleColor?: string;
    /** Title font configuration */
    titleFont?: {
        family?: string;
        size?: number;
        style?: "italic" | "normal";
        weight?: "bold" | "normal";
    };
}

/**
 * Complete chart configuration with data.
 *
 * @remarks
 * Complete chart setup including both configuration and data.
 *
 * @public
 */
export interface CompleteChartConfig {
    /** Chart data */
    data: ChartData;
    /** Chart options */
    options?: ChartConfig;
    /** Chart type */
    type: "bar" | "doughnut" | "line" | "pie" | "scatter";
}

/**
 * Type guard to check if an object has plugins configuration.
 *
 * @param config - Object to check
 * @returns True if the object has plugins configuration
 *
 * @public
 */
export function hasPlugins(config: unknown): config is { plugins: ChartPluginsConfig } {
    return (
        typeof config === "object" &&
        config !== null &&
        "plugins" in config &&
        typeof (config as Record<string, unknown>)["plugins"] === "object"
    );
}

/**
 * Type guard to check if an object has scales configuration.
 *
 * @param config - Object to check
 * @returns True if the object has scales configuration
 *
 * @public
 */
export function hasScales(config: unknown): config is { scales: ChartScalesConfig } {
    return (
        typeof config === "object" &&
        config !== null &&
        "scales" in config &&
        typeof (config as Record<string, unknown>)["scales"] === "object"
    );
}

/**
 * Default chart theme configurations.
 *
 * @public
 */
export const DEFAULT_CHART_THEMES = {
    /** Dark theme configuration */
    dark: {
        backgroundColors: [
            "rgba(59, 130, 246, 0.8)", // Blue
            "rgba(16, 185, 129, 0.8)", // Green
            "rgba(245, 158, 11, 0.8)", // Yellow
            "rgba(239, 68, 68, 0.8)", // Red
            "rgba(139, 92, 246, 0.8)", // Purple
        ],
        borderColors: [
            "rgba(59, 130, 246, 1)",
            "rgba(16, 185, 129, 1)",
            "rgba(245, 158, 11, 1)",
            "rgba(239, 68, 68, 1)",
            "rgba(139, 92, 246, 1)",
        ],
        gridColor: "rgba(75, 85, 99, 0.3)",
        textColor: "rgba(229, 231, 235, 1)",
        tooltipBackgroundColor: "rgba(31, 41, 55, 0.95)",
        tooltipTextColor: "rgba(229, 231, 235, 1)",
    } satisfies ChartThemeConfig,

    /** Light theme configuration */
    light: {
        backgroundColors: [
            "rgba(59, 130, 246, 0.6)", // Blue
            "rgba(16, 185, 129, 0.6)", // Green
            "rgba(245, 158, 11, 0.6)", // Yellow
            "rgba(239, 68, 68, 0.6)", // Red
            "rgba(139, 92, 246, 0.6)", // Purple
        ],
        borderColors: [
            "rgba(59, 130, 246, 1)",
            "rgba(16, 185, 129, 1)",
            "rgba(245, 158, 11, 1)",
            "rgba(239, 68, 68, 1)",
            "rgba(139, 92, 246, 1)",
        ],
        gridColor: "rgba(107, 114, 128, 0.2)",
        textColor: "rgba(55, 65, 81, 1)",
        tooltipBackgroundColor: "rgba(255, 255, 255, 0.95)",
        tooltipTextColor: "rgba(55, 65, 81, 1)",
    } satisfies ChartThemeConfig,
} as const;
