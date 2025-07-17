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

import { ChartData, ChartOptions } from "./chartSetup";

import { Theme } from "../theme";

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
     */
    constructor(theme: Theme) {
        this.theme = theme;
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
     * Response time line chart configuration
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
                title: {
                    color: this.theme.colors.text.primary,
                    display: true,
                    font: {
                        family: this.theme.typography.fontFamily.sans.join(", "),
                        size: 16,
                        weight: "bold",
                    },
                    text: "Response Time Over Time",
                },
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
                    title: {
                        color: this.theme.colors.text.secondary,
                        display: true,
                        font: {
                            family: this.theme.typography.fontFamily.sans.join(", "),
                            size: 12,
                        },
                        text: "Response Time (ms)",
                    },
                    ...this.getBaseScale(),
                },
            },
        } as ChartOptions<"line">;
    }

    /**
     * Status distribution bar chart configuration
     */
    getBarChartConfig(): ChartOptions<"bar"> {
        return {
            ...this.getBaseConfig(),
            plugins: {
                ...this.getBaseConfig().plugins,
                legend: { display: false },
                title: {
                    color: this.theme.colors.text.primary,
                    display: true,
                    font: {
                        family: this.theme.typography.fontFamily.sans.join(", "),
                        size: 16,
                        weight: "bold",
                    },
                    text: "Status Distribution",
                },
            },
            scales: {
                x: this.getBaseScale(),
                y: {
                    beginAtZero: true,
                    title: {
                        color: this.theme.colors.text.secondary,
                        display: true,
                        font: {
                            family: this.theme.typography.fontFamily.sans.join(", "),
                            size: 12,
                        },
                        text: "Count",
                    },
                    ...this.getBaseScale(),
                },
            },
        } as ChartOptions<"bar">;
    }

    /**
     * Uptime doughnut chart configuration
     */
    getDoughnutChartConfig(totalChecks: number): ChartOptions<"doughnut"> {
        return {
            ...this.getBaseConfig(),
            plugins: {
                ...this.getBaseConfig().plugins,
                legend: {
                    labels: {
                        color: this.theme.colors.text.primary,
                        font: {
                            family: this.theme.typography.fontFamily.sans.join(", "),
                            size: 12,
                        },
                    },
                    position: "bottom",
                },
                title: {
                    color: this.theme.colors.text.primary,
                    display: true,
                    font: {
                        family: this.theme.typography.fontFamily.sans.join(", "),
                        size: 16,
                        weight: "bold",
                    },
                    text: "Uptime Distribution",
                },
                tooltip: {
                    ...this.getBaseConfig().plugins?.tooltip,
                    callbacks: {
                        label: function (context) {
                            const percentage =
                                totalChecks > 0 ? ((context.parsed / totalChecks) * 100).toFixed(1) : "0";
                            return `${context.label}: ${context.parsed} (${percentage}%)`;
                        },
                    },
                },
            },
        } as ChartOptions<"doughnut">;
    }
}

/**
 * React hook for getting theme-aware chart configurations.
 *
 * @param theme - Current theme object for styling charts
 * @param totalChecks - Total number of checks for pie chart configuration
 * @returns Object containing various chart configuration options
 */
export function useChartConfigs(theme: Theme, totalChecks = 0) {
    const chartService = new ChartConfigService(theme);

    return {
        barChartOptions: chartService.getBarChartConfig(),
        doughnutOptions: chartService.getDoughnutChartConfig(totalChecks),
        lineChartOptions: chartService.getLineChartConfig(),
    };
}

/**
 * Type definitions for chart data to avoid manual type casting
 */

/**
 * Response time line chart data structure
 */
export interface ResponseTimeChartData extends ChartData<"line"> {
    datasets: {
        label: string;
        data: (number | null)[];
        borderColor: string;
        backgroundColor: string;
        fill: boolean;
        tension: number;
    }[];
}

/**
 * Uptime status doughnut chart data structure
 */
export interface UptimeChartData extends ChartData<"doughnut"> {
    labels: string[];
    datasets: {
        data: number[];
        backgroundColor: string[];
        borderColor: string[];
        borderWidth: number;
    }[];
}

/**
 * Status distribution bar chart data structure
 */
export interface StatusBarChartData extends ChartData<"bar"> {
    labels: string[];
    datasets: {
        label: string;
        data: number[];
        backgroundColor: string[];
        borderColor: string[];
        borderWidth: number;
    }[];
}
