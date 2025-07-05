/**
 * Chart configuration service for consistent chart styling and behavior.
 * Provides theme-aware chart configurations for Chart.js components
 * used throughout the application for data visualization.
 */

import { ChartOptions } from "chart.js";

import { Theme } from "../theme/types";

/**
 * Chart Configuration Service
 * Centralizes all chart configurations for consistency and maintainability
 */
export class ChartConfigService {
    private readonly theme: Theme;

    constructor(theme: Theme) {
        this.theme = theme;
    }

    /**
     * Get base configuration shared across all charts
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
export function useChartConfigs(theme: Theme, totalChecks: number = 0) {
    const chartService = new ChartConfigService(theme);

    return {
        barChartOptions: chartService.getBarChartConfig(),
        doughnutOptions: chartService.getDoughnutChartConfig(totalChecks),
        lineChartOptions: chartService.getLineChartConfig(),
    };
}
