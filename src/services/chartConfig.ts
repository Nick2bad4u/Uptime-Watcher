/**
 * Chart configuration service for consistent, theme-aware data visualization.
 *
 * @remarks
 * Provides centralized Chart.js configuration management with automatic theme
 * integration for consistent styling across all charts in the application.
 * This service ensures that charts maintain visual consistency and respond
 * to theme changes appropriately.
 *
 * The service supports multiple chart types with optimized configurations:
 * - Line charts for time-series data (response times, uptime trends)
 * - Area charts for filled visualizations
 * - Doughnut charts for status distributions
 * - Responsive design with mobile-friendly defaults
 *
 * @example
 * ```typescript
 * const chartConfig = new ChartConfigService(currentTheme);
 * const lineConfig = chartConfig.getLineChartConfig();
 * const doughnutConfig = chartConfig.getDoughnutChartConfig();
 * ```
 *
 * @packageDocumentation
 */

import { Theme } from "../theme/types";
import { ChartData, ChartOptions } from "./chartSetup";

/**
 * Response time line chart data structure
 */
export interface ResponseTimeChartData extends ChartData<"line"> {
    datasets: {
        backgroundColor: string;
        borderColor: string;
        data: (null | number)[];
        fill: boolean;
        label: string;
        tension: number;
    }[];
}

/**
 * Status distribution bar chart data structure
 */
export interface StatusBarChartData extends ChartData<"bar"> {
    datasets: {
        backgroundColor: string[];
        borderColor: string[];
        borderWidth: number;
        data: number[];
        label: string;
    }[];
    labels: string[];
}

/**
 * Type definitions for chart data to avoid manual type casting
 */

/**
 * Uptime status doughnut chart data structure
 */
export interface UptimeChartData extends ChartData<"doughnut"> {
    datasets: {
        backgroundColor: string[];
        borderColor: string[];
        borderWidth: number;
        data: number[];
    }[];
    labels: string[];
}

/**
 * Chart Configuration Service for theme-aware chart styling.
 *
 * @remarks
 * Centralizes all chart configurations to ensure consistency and maintainability
 * across the application. The service automatically applies theme colors, fonts,
 * and spacing to all chart configurations.
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
     * @public
     */
    constructor(theme: Theme) {
        this.theme = theme;
    }

    /**
     * Status distribution bar chart configuration
     *
     * @returns Chart configuration options for bar charts
     * @public
     */
    getBarChartConfig(): ChartOptions<"bar"> {
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
     * @returns Chart configuration options for doughnut charts
     * @public
     */
    getDoughnutChartConfig(totalChecks: number): ChartOptions<"doughnut"> {
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
                                totalChecks > 0 ? ((context.parsed / totalChecks) * 100).toFixed(1) : "0";
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
     * @returns Chart configuration options for line charts with responsive scaling
     * @public
     */
    getLineChartConfig(): ChartOptions<"line"> {
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
     */
    private getAxisTitle(text: string) {
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
     * @returns Partial chart options with common styling and behavior
     *
     * @remarks
     * Provides consistent foundation for all charts including responsive behavior,
     * theme-aware colors, typography, and tooltip styling. This configuration
     * is extended by specific chart type methods.
     *
     * This is an internal method used by other configuration methods.
     */
    private getBaseConfig(): Partial<ChartOptions> {
        return {
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: this.theme.colors.text.primary,
                        font: {
                            family: this.theme.typography.fontFamily.sans.join(", "),
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
     * Get base scale configuration
     */
    private getBaseScale() {
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
     */
    private getChartFont(size = 12, weight = "normal") {
        return {
            family: this.theme.typography.fontFamily.sans.join(", "),
            size,
            weight,
        };
    }

    /**
     * Get common title configuration for charts
     */
    private getChartTitle(text: string) {
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
 * @param theme - Current theme object for styling charts
 * @param totalChecks - Total number of checks for pie chart configuration
 * @returns Object containing various chart configuration options
 * @returns barChartOptions - Configuration for bar charts with theme-aware styling
 * @returns doughnutOptions - Configuration for doughnut/pie charts with tooltips and legends
 * @returns lineChartOptions - Configuration for line charts with responsive scaling and interactions
 *
 * @example
 * ```typescript
 * const { barChartOptions, doughnutOptions, lineChartOptions } = createChartConfigs(theme, 100);
 * // Use with Chart.js components
 * <Bar data={chartData} options={barChartOptions} />
 * <Doughnut data={statusData} options={doughnutOptions} />
 * <Line data={timeSeriesData} options={lineChartOptions} />
 * ```
 */
export function createChartConfigs(theme: Theme, totalChecks = 0) {
    const chartService = new ChartConfigService(theme);

    return {
        barChartOptions: chartService.getBarChartConfig(),
        doughnutOptions: chartService.getDoughnutChartConfig(totalChecks),
        lineChartOptions: chartService.getLineChartConfig(),
    };
}
