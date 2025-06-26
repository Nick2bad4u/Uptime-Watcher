"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
exports.useChartConfigs = exports.ChartConfigService = void 0;
/**
 * Chart Configuration Service
 * Centralizes all chart configurations for consistency and maintainability
 */
var ChartConfigService = /** @class */ (function () {
    function ChartConfigService(theme) {
        this.theme = theme;
    }
    /**
     * Get base configuration shared across all charts
     */
    ChartConfigService.prototype.getBaseConfig = function () {
        return {
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: this.theme.colors.text.primary,
                        font: {
                            family: this.theme.typography.fontFamily.sans.join(", "),
                            size: 12
                        }
                    }
                },
                tooltip: {
                    backgroundColor: this.theme.colors.surface.elevated,
                    bodyColor: this.theme.colors.text.secondary,
                    borderColor: this.theme.colors.border.primary,
                    borderWidth: 1,
                    titleColor: this.theme.colors.text.primary
                }
            },
            responsive: true
        };
    };
    /**
     * Get base scale configuration
     */
    ChartConfigService.prototype.getBaseScale = function () {
        return {
            grid: {
                color: this.theme.colors.border.secondary
            },
            ticks: {
                color: this.theme.colors.text.secondary,
                font: {
                    family: this.theme.typography.fontFamily.sans.join(", "),
                    size: 11
                }
            }
        };
    };
    /**
     * Response time line chart configuration
     */
    ChartConfigService.prototype.getLineChartConfig = function () {
        return __assign(__assign({}, this.getBaseConfig()), { interaction: {
                intersect: false,
                mode: "index"
            }, plugins: __assign(__assign({}, this.getBaseConfig().plugins), { title: {
                    color: this.theme.colors.text.primary,
                    display: true,
                    font: {
                        family: this.theme.typography.fontFamily.sans.join(", "),
                        size: 16,
                        weight: "bold"
                    },
                    text: "Response Time Over Time"
                }, zoom: {
                    pan: {
                        enabled: true,
                        mode: "x"
                    },
                    zoom: {
                        mode: "x",
                        pinch: { enabled: true },
                        wheel: { enabled: true }
                    }
                } }), scales: {
                x: __assign({ time: {
                        displayFormats: {
                            day: "MMM dd",
                            hour: "HH:mm",
                            minute: "HH:mm"
                        }
                    }, type: "time" }, this.getBaseScale()),
                y: __assign({ beginAtZero: true, title: {
                        color: this.theme.colors.text.secondary,
                        display: true,
                        font: {
                            family: this.theme.typography.fontFamily.sans.join(", "),
                            size: 12
                        },
                        text: "Response Time (ms)"
                    } }, this.getBaseScale())
            } });
    };
    /**
     * Status distribution bar chart configuration
     */
    ChartConfigService.prototype.getBarChartConfig = function () {
        return __assign(__assign({}, this.getBaseConfig()), { plugins: __assign(__assign({}, this.getBaseConfig().plugins), { legend: { display: false }, title: {
                    color: this.theme.colors.text.primary,
                    display: true,
                    font: {
                        family: this.theme.typography.fontFamily.sans.join(", "),
                        size: 16,
                        weight: "bold"
                    },
                    text: "Status Distribution"
                } }), scales: {
                x: this.getBaseScale(),
                y: __assign({ beginAtZero: true, title: {
                        color: this.theme.colors.text.secondary,
                        display: true,
                        font: {
                            family: this.theme.typography.fontFamily.sans.join(", "),
                            size: 12
                        },
                        text: "Count"
                    } }, this.getBaseScale())
            } });
    };
    /**
     * Uptime doughnut chart configuration
     */
    ChartConfigService.prototype.getDoughnutChartConfig = function (totalChecks) {
        var _a;
        return __assign(__assign({}, this.getBaseConfig()), { plugins: __assign(__assign({}, this.getBaseConfig().plugins), { legend: {
                    labels: {
                        color: this.theme.colors.text.primary,
                        font: {
                            family: this.theme.typography.fontFamily.sans.join(", "),
                            size: 12
                        }
                    },
                    position: "bottom"
                }, title: {
                    color: this.theme.colors.text.primary,
                    display: true,
                    font: {
                        family: this.theme.typography.fontFamily.sans.join(", "),
                        size: 16,
                        weight: "bold"
                    },
                    text: "Uptime Distribution"
                }, tooltip: __assign(__assign({}, (_a = this.getBaseConfig().plugins) === null || _a === void 0 ? void 0 : _a.tooltip), { callbacks: {
                        label: function (context) {
                            var percentage = totalChecks > 0 ? ((context.parsed / totalChecks) * 100).toFixed(1) : "0";
                            return context.label + ": " + context.parsed + " (" + percentage + "%)";
                        }
                    } }) }) });
    };
    return ChartConfigService;
}());
exports.ChartConfigService = ChartConfigService;
/**
 * Hook to get chart configurations with current theme
 */
function useChartConfigs(theme, totalChecks) {
    if (totalChecks === void 0) { totalChecks = 0; }
    var chartService = new ChartConfigService(theme);
    return {
        barChartOptions: chartService.getBarChartConfig(),
        doughnutOptions: chartService.getDoughnutChartConfig(totalChecks),
        lineChartOptions: chartService.getLineChartConfig()
    };
}
exports.useChartConfigs = useChartConfigs;
