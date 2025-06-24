"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChartConfigService = void 0;
exports.useChartConfigs = useChartConfigs;
/**
 * Chart Configuration Service
 * Centralizes all chart configurations for consistency and maintainability
 */
class ChartConfigService {
    constructor(theme) {
        Object.defineProperty(this, "theme", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.theme = theme;
    }
    /**
     * Get base configuration shared across all charts
     */
    getBaseConfig() {
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
    getBaseScale() {
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
    getLineChartConfig() {
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
        };
    }
    /**
     * Status distribution bar chart configuration
     */
    getBarChartConfig() {
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
        };
    }
    /**
     * Uptime doughnut chart configuration
     */
    getDoughnutChartConfig(totalChecks) {
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
                            const percentage = totalChecks > 0 ? ((context.parsed / totalChecks) * 100).toFixed(1) : "0";
                            return `${context.label}: ${context.parsed} (${percentage}%)`;
                        },
                    },
                },
            },
        };
    }
}
exports.ChartConfigService = ChartConfigService;
/**
 * Hook to get chart configurations with current theme
 */
function useChartConfigs(theme, totalChecks = 0) {
    const chartService = new ChartConfigService(theme);
    return {
        lineChartOptions: chartService.getLineChartConfig(),
        barChartOptions: chartService.getBarChartConfig(),
        doughnutOptions: chartService.getDoughnutChartConfig(totalChecks),
    };
}
