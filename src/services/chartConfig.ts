import { ChartOptions } from "chart.js";
import { Theme } from "../theme/types";

/**
 * Chart Configuration Service
 * Centralizes all chart configurations for consistency and maintainability
 */
export class ChartConfigService {
    private theme: Theme;

    constructor(theme: Theme) {
        this.theme = theme;
    }

    /**
     * Get base configuration shared across all charts
     */
    private getBaseConfig(): Partial<ChartOptions> {
        return {
            responsive: true,
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
                    titleColor: this.theme.colors.text.primary,
                    bodyColor: this.theme.colors.text.secondary,
                    borderColor: this.theme.colors.border.primary,
                    borderWidth: 1,
                },
            },
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
                    display: true,
                    text: "Response Time Over Time",
                    color: this.theme.colors.text.primary,
                    font: {
                        family: this.theme.typography.fontFamily.sans.join(", "),
                        size: 16,
                        weight: "bold",
                    },
                },
                zoom: {
                    zoom: {
                        wheel: { enabled: true },
                        pinch: { enabled: true },
                        mode: "x",
                    },
                    pan: {
                        enabled: true,
                        mode: "x",
                    },
                },
            },
            scales: {
                x: {
                    type: "time",
                    time: {
                        displayFormats: {
                            minute: "HH:mm",
                            hour: "HH:mm",
                            day: "MMM dd",
                        },
                    },
                    ...this.getBaseScale(),
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: "Response Time (ms)",
                        color: this.theme.colors.text.secondary,
                        font: {
                            family: this.theme.typography.fontFamily.sans.join(", "),
                            size: 12,
                        },
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
                    display: true,
                    text: "Status Distribution",
                    color: this.theme.colors.text.primary,
                    font: {
                        family: this.theme.typography.fontFamily.sans.join(", "),
                        size: 16,
                        weight: "bold",
                    },
                },
            },
            scales: {
                x: this.getBaseScale(),
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: "Count",
                        color: this.theme.colors.text.secondary,
                        font: {
                            family: this.theme.typography.fontFamily.sans.join(", "),
                            size: 12,
                        },
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
                    position: "bottom",
                    labels: {
                        color: this.theme.colors.text.primary,
                        font: {
                            family: this.theme.typography.fontFamily.sans.join(", "),
                            size: 12,
                        },
                    },
                },
                title: {
                    display: true,
                    text: "Uptime Distribution",
                    color: this.theme.colors.text.primary,
                    font: {
                        family: this.theme.typography.fontFamily.sans.join(", "),
                        size: 16,
                        weight: "bold",
                    },
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
 * Hook to get chart configurations with current theme
 */
export function useChartConfigs(theme: Theme, totalChecks: number = 0) {
    const chartService = new ChartConfigService(theme);

    return {
        lineChartOptions: chartService.getLineChartConfig(),
        barChartOptions: chartService.getBarChartConfig(),
        doughnutOptions: chartService.getDoughnutChartConfig(totalChecks),
    };
}
