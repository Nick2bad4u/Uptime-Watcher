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

import type { ChartData, ChartOptions, FontSpec } from "chart.js";

import type { Theme } from "../theme/types";

/**
 * Bundle of chart options returned by {@link createChartConfigs}.
 *
 * @remarks
 * Provides preconfigured Chart.js options scoped to the application's
 * monitoring dashboard. Consumers typically spread these options when rendering
 * `<Bar />`, `<Doughnut />`, or `<Line />` components.
 *
 * @public
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
 * Response time line chart data structure.
 *
 * @remarks
 * Aligns with the dataset shape produced by the site analytics hook for
 * time-series response visualisations.
 *
 * @public
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
 * Status distribution bar chart data structure.
 *
 * @remarks
 * Mirrors the payload supplied to the uptime status bar chart rendered on the
 * overview dashboard. Keeps Chart.js generics strictly typed inside the UI
 * layer.
 *
 * @public
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
 * Uptime status doughnut chart data structure.
 *
 * @remarks
 * Represents the sliced status summary shown in the global monitoring widget
 * and is consumed alongside {@link ChartConfigService.getDoughnutChartConfig}.
 *
 * @public
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
 * Theme-aware configuration object for chart axis titles.
 *
 * @public
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
 * Base scale configuration shared across chart types.
 *
 * @public
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
 * Font configuration applied to chart titles, axis labels, and legends.
 *
 * @public
 */
export interface ChartFontConfig {
    /** Font family name */
    family: string;
    /** Font size in pixels */
    size: number;
    /** Font weight (normal, bold, numeric, etc.). */
    weight: FontSpec["weight"];
}

/**
 * Theme-aware configuration object for chart titles.
 *
 * @public
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
        weight: FontSpec["weight"];
    };
    /** The text content of the chart title */
    text: string;
}

interface BaseChartConfigCommon {
    maintainAspectRatio: boolean;
    plugins: {
        legend: {
            labels: {
                color: string;
                font: {
                    family: string;
                    size: number;
                };
            };
        };
        tooltip: {
            backgroundColor: string;
            bodyColor: string;
            borderColor: string;
            borderWidth: number;
            titleColor: string;
        };
    };
    responsive: boolean;
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
 *
 * @see {@link createChartConfigs} for the functional wrapper.
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
     * Status distribution bar chart configuration.
     *
     * @returns Chart configuration options for bar charts.
     *
     * @public
     */
    public getBarChartConfig(): ChartOptions<"bar"> {
        const baseConfig = this.getBaseConfigCommon();

        return {
            ...baseConfig,
            plugins: {
                ...baseConfig.plugins,
                legend: { display: false },
                title: this.getChartTitle("Status Distribution"),
            },
            scales: {
                x: this.getBaseScale(),
                y: {
                    ...this.getBaseScale(),
                    beginAtZero: true,
                    title: this.getAxisTitle("Count"),
                },
            },
        } satisfies ChartOptions<"bar">;
    }

    /**
     * Uptime doughnut chart configuration.
     *
     * @param totalChecks - Total number of checks for percentage calculation.
     *
     * @returns Chart configuration options for doughnut charts.
     *
     * @public
     */
    public getDoughnutChartConfig(
        totalChecks: number
    ): ChartOptions<"doughnut"> {
        // Store base config to avoid redundant calls
        const baseConfig = this.getBaseConfigCommon();

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
                    ...baseConfig.plugins.tooltip,
                    callbacks: {
                        label: (context): string => {
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
        } satisfies ChartOptions<"doughnut">;
    }

    /**
     * Response time line chart configuration.
     *
     * @returns Chart configuration options for line charts with responsive
     *   scaling.
     *
     * @public
     */
    public getLineChartConfig(): ChartOptions<"line"> {
        const baseConfig = this.getBaseConfigCommon();

        return {
            ...baseConfig,
            interaction: {
                intersect: false,
                mode: "index",
            },
            plugins: {
                ...baseConfig.plugins,
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
        } satisfies ChartOptions<"line">;
    }

    /**
     * Get common axis title configuration.
     *
     * @param text - The text to display in the axis title.
     *
     * @returns Configured axis title object with theme-aware styling.
     *
     * @internal
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
     * Provides a consistent foundation for all charts including responsive
     * behavior, theme-aware colors, typography, and tooltip styling. Extended
     * by chart-specific methods to avoid duplication.
     *
     * @returns Partial chart options with common styling and behavior.
     *
     * @internal
     */
    private getBaseConfigCommon(): BaseChartConfigCommon {
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
     * Get base scale configuration with theme-aware styling.
     *
     * @returns Base scale configuration object for axes.
     *
     * @internal
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
     * Get common font configuration used across charts.
     *
     * @param size - Font size in pixels (default: 12).
     * @param weight - Font weight (default: `"normal"`).
     *
     * @returns Font configuration object with theme-aware family.
     *
     * @internal
     */
    private getChartFont(
        size = 12,
        weight: FontSpec["weight"] = "normal"
    ): ChartFontConfig {
        return {
            family: this.theme.typography.fontFamily.sans.join(", "),
            size,
            weight,
        };
    }

    /**
     * Get common title configuration for charts.
     *
     * @param text - The text to display in the chart title.
     *
     * @returns Configured chart title object with theme-aware styling.
     *
     * @internal
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
 * Creates a set of theme-aware Chart.js configuration objects.
 *
 * @remarks
 * Thin wrapper around {@link ChartConfigService} for callers that prefer a
 * functional API. Returns memo-friendly plain objects ready to be passed to
 * Chart.js components.
 *
 * @example
 *
 * ```typescript
 * const { barChartOptions, doughnutOptions, lineChartOptions } =
 *     createChartConfigs(theme, 100);
 *
 * <Bar data={chartData} options={barChartOptions} />
 * <Doughnut data={statusData} options={doughnutOptions} />
 * <Line data={timeSeriesData} options={lineChartOptions} />
 * ```
 *
 * @param theme - Current theme object for styling charts.
 * @param totalChecks - Total number of checks for doughnut percentage
 *   formatting.
 *
 * @returns {@link ChartConfigs} Containing theme-aware chart options.
 *
 * @public
 *
 * @see {@link ChartConfigService} for the class-based implementation.
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
