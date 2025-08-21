/**
 * Chart configuration service for consistent, theme-aware data visualization.
 *
 * @remarks
 * Provides centralized Chart.js configuration management with automatic theme
 * integration for consistent styling across all charts in the application. This
 * service ensures that charts maintain visual consistency and respond to theme
 * changes appropriately.
 *
 * The service supports multiple chart types with optimized configurations:
 *
 * - Line charts for time-series data (response times, uptime trends)
 * - Area charts for filled visualizations
 * - Doughnut charts for status distributions
 * - Responsive design with mobile-friendly defaults
 *
 * @example
 *
 * ```typescript
 * const chartConfig = new ChartConfigService(currentTheme);
 * const lineConfig = chartConfig.getLineChartConfig();
 * const doughnutConfig = chartConfig.getDoughnutChartConfig();
 * ```
 *
 * @packageDocumentation
 */

import type { ChartData, ChartOptions } from "chart.js";

import type { Theme } from "../theme/types";

/**
 * Interface for chart configuration return type.
 */
export interface ChartConfigs {
    /** Configuration options for bar charts */
    barChartOptions: ChartOptions<"bar">;
    /** Configuration options for doughnut charts */
    doughnutOptions: ChartOptions<"doughnut">;
    /** Configuration options for line charts */
    lineChartOptions: ChartOptions<"line">;
}

/**
 * Response time line chart data structure
 */
export interface ResponseTimeChartData extends ChartData<"line"> {
    /** Dataset configuration for response time line chart */
    datasets: Array<{
        /** Fill color for area under the line */
        backgroundColor: string;
        /** Line color */
        borderColor: string;
        /** Response time data points (null for missing data) */
        data: Array<null | number>;
        /** Whether to fill area under the line */
        fill: boolean;
        /** Chart legend label */
        label: string;
        /** Line curve smoothness (0-1) */
        tension: number;
    }>;
}

/**
 * Type definitions for chart data to avoid manual type casting
 */

/**
 * Status distribution bar chart data structure
 */
export interface StatusBarChartData extends ChartData<"bar"> {
    /** Dataset configuration for status bar chart */
    datasets: Array<{
        /** Fill colors for each bar */
        backgroundColor: string[];
        /** Border colors for each bar */
        borderColor: string[];
        /** Border width for bars */
        borderWidth: number;
        /** Status count data for each category */
        data: number[];
        /** Chart legend label */
        label: string;
    }>;
    /** Status category labels for x-axis */
    labels: string[];
}

/**
 * Uptime status doughnut chart data structure
 */
export interface UptimeChartData extends ChartData<"doughnut"> {
    /** Dataset configuration for uptime doughnut chart */
    datasets: Array<{
        /** Segment colors for each status */
        backgroundColor: string[];
        /** Border colors for each segment */
        borderColor: string[];
        /** Border width for segments */
        borderWidth: number;
        /** Uptime percentage data for each status */
        data: number[];
    }>;
    /** Status labels for legend */
    labels: string[];
}

/**
 * Configuration object for chart axis titles
 */
export interface AxisTitleConfig {
    /** Text color for the axis title */
    color: string;
    /** Whether to display the axis title */
    display: boolean;
    /** Font configuration for the axis title */
    font: {
        /** Font family name */
        family: string;
        /** Font size in pixels */
        size: number;
    };
    /** The text content of the axis title */
    text: string;
}

/**
 * Configuration object for chart base scales
 */
export interface BaseScaleConfig {
    /** Grid line configuration */
    grid: {
        /** Color of the grid lines */
        color: string;
    };
    /** Tick mark configuration */
    ticks: {
        /** Color of the tick marks and labels */
        color: string;
        /** Font configuration for tick labels */
        font: {
            /** Font family name */
            family: string;
            /** Font size in pixels */
            size: number;
        };
    };
}

/**
 * Configuration object for chart fonts
 */
export interface ChartFontConfig {
    /** Font family name */
    family: string;
    /** Font size in pixels */
    size: number;
    /** Font weight (normal, bold, etc.) */
    weight: string;
}

/**
 * Configuration object for chart titles
 */
export interface ChartTitleConfig {
    /** Text color for the chart title */
    color: string;
    /** Whether to display the chart title */
    display: boolean;
    /** Font configuration for the chart title */
    font: {
        /** Font family name */
        family: string;
        /** Font size in pixels */
        size: number;
        /** Font weight (normal, bold, etc.) */
        weight: string;
    };
    /** The text content of the chart title */
    text: string;
}

/**
 * Chart Configuration Service for theme-aware chart styling.
 *
 * @remarks
 * Centralizes all chart configurations to ensure consistency and
 * maintainability across the application. The service automatically applies
 * theme colors, fonts, and spacing to all chart configurations.
 *
 * @public
 */
export class ChartConfigService {
    /** Current theme instance for styling configuration */
    private readonly theme: Theme;

    /**
     * Creates a new chart configuration service.
     *
     * @param theme - Theme instance containing colors, typography, and spacing
     *
     * @public
     */
    public constructor(theme: Theme) {
        this.theme = theme;
    }

    /**
     * Status distribution bar chart configuration
     *
     * @returns Chart configuration options for bar charts
     *
     * @public
     */
    public getBarChartConfig(): ChartOptions<"bar"> {
        return {
            ...this.getBaseConfig(),
            plugins: {
                ...this.getBaseConfig().plugins,
                legend: { display: false },
                title: this.getChartTitle("Status Distribution"),
            },
            scales: {
                x: this.getBaseScale(),
                y: {
                    beginAtZero: true,
                    title: this.getAxisTitle("Count"),
                    ...this.getBaseScale(),
                },
            },
        } as ChartOptions<"bar">;
    }

    /**
     * Uptime doughnut chart configuration
     *
     * @param totalChecks - Total number of checks for percentage calculation
     *
     * @returns Chart configuration options for doughnut charts
     *
     * @public
     */
    public getDoughnutChartConfig(
        totalChecks: number
    ): ChartOptions<"doughnut"> {
        // Store base config to avoid redundant calls
        const baseConfig = this.getBaseConfig();

        return {
            ...baseConfig,
            plugins: {
                ...baseConfig.plugins,
                legend: {
                    labels: {
                        color: this.theme.colors.text.primary,
                        font: this.getChartFont(12),
                    },
                    position: "bottom",
                },
                title: this.getChartTitle("Uptime Distribution"),
                tooltip: {
                    ...baseConfig.plugins?.tooltip,
                    callbacks: {
                        label: (context) => {
                            const percentage =
                                totalChecks > 0
                                    ? (
                                          (context.parsed / totalChecks) *
                                          100
                                      ).toFixed(1)
                                    : "0";
                            return `${context.label}: ${context.parsed} (${percentage}%)`;
                        },
                    },
                },
            },
        } as ChartOptions<"doughnut">;
    }

    /**
     * Response time line chart configuration
     *
     * @returns Chart configuration options for line charts with responsive
     *   scaling
     *
     * @public
     */
    public getLineChartConfig(): ChartOptions<"line"> {
        return {
            ...this.getBaseConfig(),
            interaction: {
                intersect: false,
                mode: "index",
            },
            plugins: {
                ...this.getBaseConfig().plugins,
                title: this.getChartTitle("Response Time Over Time"),
                zoom: {
                    pan: {
                        enabled: true,
                        mode: "x",
                    },
                    zoom: {
                        mode: "x",
                        pinch: { enabled: true },
                        wheel: { enabled: true },
                    },
                },
            },
            scales: {
                x: {
                    time: {
                        displayFormats: {
                            day: "MMM dd",
                            hour: "HH:mm",
                            minute: "HH:mm",
                        },
                    },
                    type: "time",
                    ...this.getBaseScale(),
                },
                y: {
                    beginAtZero: true,
                    title: this.getAxisTitle("Response Time (ms)"),
                    ...this.getBaseScale(),
                },
            },
        } as ChartOptions<"line">;
    }

    /**
     * Get common axis title configuration
     *
     * @param text - The text to display in the axis title
     * @returns Configured axis title object with theme-aware styling
     */
    private getAxisTitle(text: string): AxisTitleConfig {
        return {
            color: this.theme.colors.text.secondary,
            display: true,
            font: this.getChartFont(12),
            text,
        };
    }

    /**
     * Get base configuration shared across all chart types.
     *
     * @remarks
     * Provides consistent foundation for all charts including responsive
     * behavior, theme-aware colors, typography, and tooltip styling. This
     * configuration is extended by specific chart type methods.
     *
     * This is an internal method used by other configuration methods.
     *
     * @returns Partial chart options with common styling and behavior
     */
    private getBaseConfig(): Partial<ChartOptions> {
        return {
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: this.theme.colors.text.primary,
                        font: {
                            family: this.theme.typography.fontFamily.sans.join(
                                ", "
                            ),
                            size: 12,
                        },
                    },
                },
                tooltip: {
                    backgroundColor: this.theme.colors.surface.elevated,
                    bodyColor: this.theme.colors.text.secondary,
                    borderColor: this.theme.colors.border.primary,
                    borderWidth: 1,
                    titleColor: this.theme.colors.text.primary,
                },
            },
            responsive: true,
        };
    }

    /**
     * Get base scale configuration with theme-aware styling
     *
     * @returns Base scale configuration object for axes
     */
    private getBaseScale(): BaseScaleConfig {
        return {
            grid: {
                color: this.theme.colors.border.secondary,
            },
            ticks: {
                color: this.theme.colors.text.secondary,
                font: {
                    family: this.theme.typography.fontFamily.sans.join(", "),
                    size: 11,
                },
            },
        };
    }

    /**
     * Get common font configuration used across charts
     *
     * @param size - Font size in pixels (default: 12)
     * @param weight - Font weight (default: "normal")
     * @returns Font configuration object with theme-aware family
     */
    private getChartFont(
        size = 12,
        weight = "normal"
    ): ChartFontConfig {
        return {
            family: this.theme.typography.fontFamily.sans.join(", "),
            size,
            weight,
        };
    }

    /**
     * Get common title configuration for charts
     *
     * @param text - The text to display in the chart title
     * @returns Configured chart title object with theme-aware styling
     */
    private getChartTitle(text: string): ChartTitleConfig {
        return {
            color: this.theme.colors.text.primary,
            display: true,
            font: this.getChartFont(16, "bold"),
            text,
        };
    }
}

/**
 * React hook for getting theme-aware chart configurations.
 *
 * @example
 *
 * ```typescript
 * const { barChartOptions, doughnutOptions, lineChartOptions } = createChartConfigs(theme, 100);
 * // Use with Chart.js components
 * <Bar data={chartData} options={barChartOptions} />
 * <Doughnut data={statusData} options={doughnutOptions} />
 * <Line data={timeSeriesData} options={lineChartOptions} />
 * ```
 *
 * @param theme - Current theme object for styling charts
 * @param totalChecks - Total number of checks for pie chart configuration
 *
 * @returns Object containing various chart configuration options
 * @returns BarChartOptions - Configuration for bar charts with theme-aware
 *   styling
 * @returns DoughnutOptions - Configuration for doughnut/pie charts with
 *   tooltips and legends
 * @returns LineChartOptions - Configuration for line charts with responsive
 *   scaling and interactions
 */
export function createChartConfigs(
    theme: Theme,
    totalChecks = 0
): ChartConfigs {
    const chartService = new ChartConfigService(theme);

    return {
        barChartOptions: chartService.getBarChartConfig(),
        doughnutOptions: chartService.getDoughnutChartConfig(totalChecks),
        lineChartOptions: chartService.getLineChartConfig(),
    };
}
