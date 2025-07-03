/**
 * @vitest-environment jsdom
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, expect, it } from "vitest";

import { ChartConfigService, useChartConfigs } from "../services/chartConfig";
import { Theme } from "../theme/types";

// Mock theme object for testing
const mockTheme: Theme = {
    name: "light",
    colors: {
        primary: {
            50: "#f0f9ff",
            100: "#e0f2fe",
            200: "#bae6fd",
            300: "#7dd3fc",
            400: "#38bdf8",
            500: "#0ea5e9",
            600: "#0284c7",
            700: "#0369a1",
            800: "#075985",
            900: "#0c4a6e",
        },
        status: {
            up: "#10b981",
            down: "#ef4444",
            pending: "#f59e0b",
            unknown: "#6b7280",
        },
        success: "#10b981",
        warning: "#f59e0b",
        error: "#ef4444",
        errorAlert: "#dc2626",
        info: "#3b82f6",
        background: {
            primary: "#ffffff",
            secondary: "#f8fafc",
            tertiary: "#f1f5f9",
            modal: "#ffffff",
        },
        text: {
            primary: "#1e293b",
            secondary: "#64748b",
            tertiary: "#94a3b8",
            inverse: "#ffffff",
        },
        border: {
            primary: "#e2e8f0",
            secondary: "#f1f5f9",
            focus: "#f8fafc",
        },
        surface: {
            base: "#f8fafc",
            elevated: "#ffffff",
            overlay: "#f1f5f9",
        },
        hover: {
            light: "#f8fafc",
            medium: "#f1f5f9",
            dark: "#e2e8f0",
        },
    },
    typography: {
        fontFamily: {
            sans: ["Inter", "system-ui", "sans-serif"],
            mono: ["JetBrains Mono", "monospace"],
        },
        fontSize: {
            xs: "0.75rem",
            sm: "0.875rem",
            base: "1rem",
            lg: "1.125rem",
            xl: "1.25rem",
            "2xl": "1.5rem",
            "3xl": "1.875rem",
            "4xl": "2.25rem",
        },
        fontWeight: {
            normal: "400",
            medium: "500",
            semibold: "600",
            bold: "700",
        },
        lineHeight: {
            tight: "1.25",
            normal: "1.5",
            relaxed: "1.75",
        },
    },
    spacing: {
        xs: "0.25rem",
        sm: "0.5rem",
        md: "1rem",
        lg: "1.5rem",
        xl: "2rem",
        "2xl": "3rem",
        "3xl": "4rem",
    },
    borderRadius: {
        none: "0",
        sm: "0.125rem",
        md: "0.375rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px",
    },
    shadows: {
        sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
        xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
        inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
    },
    isDark: false,
};

describe("ChartConfigService", () => {
    let chartService: ChartConfigService;

    beforeEach(() => {
        chartService = new ChartConfigService(mockTheme);
    });

    describe("Constructor", () => {
        it("should create an instance with theme", () => {
            expect(chartService).toBeInstanceOf(ChartConfigService);
        });

        it("should store the theme correctly", () => {
            // Test by calling a method that uses the theme
            const config = chartService.getLineChartConfig();
            expect(config.plugins?.legend?.labels?.color).toBe(mockTheme.colors.text.primary);
        });
    });

    describe("getLineChartConfig", () => {
        it("should return a line chart configuration", () => {
            const config = chartService.getLineChartConfig();

            expect(config).toBeDefined();
            expect(config.maintainAspectRatio).toBe(false);
            expect(config.responsive).toBe(true);
        });

        it("should have correct interaction settings", () => {
            const config = chartService.getLineChartConfig();

            expect(config.interaction?.mode).toBe("index");
            expect(config.interaction?.intersect).toBe(false);
        });

        it("should have zoom configuration", () => {
            const config = chartService.getLineChartConfig();

            expect(config.plugins?.zoom?.pan?.enabled).toBe(true);
            expect(config.plugins?.zoom?.pan?.mode).toBe("x");
            expect(config.plugins?.zoom?.zoom?.mode).toBe("x");
            expect(config.plugins?.zoom?.zoom?.pinch?.enabled).toBe(true);
            expect(config.plugins?.zoom?.zoom?.wheel?.enabled).toBe(true);
        });

        it("should have correct scale configuration", () => {
            const config = chartService.getLineChartConfig();

            expect(config.scales?.x?.type).toBe("time");
            // TypeScript has overly strict Chart.js types, so we use assertions for deep nested properties
            expect((config.scales?.x as any)?.time?.displayFormats?.day).toBe("MMM dd");
            expect((config.scales?.x as any)?.time?.displayFormats?.hour).toBe("HH:mm");
            expect((config.scales?.x as any)?.time?.displayFormats?.minute).toBe("HH:mm");
            expect((config.scales?.y as any)?.beginAtZero).toBe(true);
            expect(config.scales?.y?.title?.text).toBe("Response Time (ms)");
        });

        it("should have correct title", () => {
            const config = chartService.getLineChartConfig();

            expect(config.plugins?.title?.text).toBe("Response Time Over Time");
            expect(config.plugins?.title?.display).toBe(true);
        });

        it("should apply theme colors", () => {
            const config = chartService.getLineChartConfig();

            expect(config.plugins?.title?.color).toBe(mockTheme.colors.text.primary);
            expect(config.plugins?.legend?.labels?.color).toBe(mockTheme.colors.text.primary);
            expect(config.plugins?.tooltip?.backgroundColor).toBe(mockTheme.colors.surface.elevated);
            expect(config.plugins?.tooltip?.titleColor).toBe(mockTheme.colors.text.primary);
            expect(config.plugins?.tooltip?.bodyColor).toBe(mockTheme.colors.text.secondary);
            expect(config.plugins?.tooltip?.borderColor).toBe(mockTheme.colors.border.primary);
        });

        it("should apply theme typography", () => {
            const config = chartService.getLineChartConfig();

            // TypeScript has overly strict Chart.js types, so we use assertions for deep nested properties
            expect((config.plugins?.title?.font as any)?.family).toBe(mockTheme.typography.fontFamily.sans.join(", "));
            expect((config.plugins?.title?.font as any)?.size).toBe(16);
            expect((config.plugins?.title?.font as any)?.weight).toBe("bold");
            expect((config.plugins?.legend?.labels?.font as any)?.family).toBe(
                mockTheme.typography.fontFamily.sans.join(", ")
            );
            expect((config.plugins?.legend?.labels?.font as any)?.size).toBe(12);
        });
    });

    describe("getBarChartConfig", () => {
        it("should return a bar chart configuration", () => {
            const config = chartService.getBarChartConfig();

            expect(config).toBeDefined();
            expect(config.maintainAspectRatio).toBe(false);
            expect(config.responsive).toBe(true);
        });

        it("should hide legend for bar chart", () => {
            const config = chartService.getBarChartConfig();

            expect(config.plugins?.legend?.display).toBe(false);
        });

        it("should have correct title", () => {
            const config = chartService.getBarChartConfig();

            expect(config.plugins?.title?.text).toBe("Status Distribution");
            expect(config.plugins?.title?.display).toBe(true);
        });

        it("should have correct scale configuration", () => {
            const config = chartService.getBarChartConfig();

            expect((config.scales?.y as any)?.beginAtZero).toBe(true);
            expect(config.scales?.y?.title?.text).toBe("Count");
            expect(config.scales?.y?.title?.display).toBe(true);
        });

        it("should apply theme colors", () => {
            const config = chartService.getBarChartConfig();

            expect(config.plugins?.title?.color).toBe(mockTheme.colors.text.primary);
            expect(config.scales?.y?.title?.color).toBe(mockTheme.colors.text.secondary);
        });

        it("should apply theme typography", () => {
            const config = chartService.getBarChartConfig();

            expect((config.plugins?.title?.font as any)?.family).toBe(mockTheme.typography.fontFamily.sans.join(", "));
            expect((config.scales?.y?.title?.font as any)?.family).toBe(
                mockTheme.typography.fontFamily.sans.join(", ")
            );
        });
    });

    describe("getDoughnutChartConfig", () => {
        it("should return a doughnut chart configuration", () => {
            const config = chartService.getDoughnutChartConfig(100);

            expect(config).toBeDefined();
            expect(config.maintainAspectRatio).toBe(false);
            expect(config.responsive).toBe(true);
        });

        it("should have correct title", () => {
            const config = chartService.getDoughnutChartConfig(100);

            expect(config.plugins?.title?.text).toBe("Uptime Distribution");
            expect(config.plugins?.title?.display).toBe(true);
        });

        it("should position legend at bottom", () => {
            const config = chartService.getDoughnutChartConfig(100);

            expect(config.plugins?.legend?.position).toBe("bottom");
        });

        it("should have custom tooltip callbacks", () => {
            const config = chartService.getDoughnutChartConfig(100);

            expect(config.plugins?.tooltip?.callbacks?.label).toBeDefined();
            expect(typeof config.plugins?.tooltip?.callbacks?.label).toBe("function");
        });

        it("should calculate percentages correctly in tooltip", () => {
            const config = chartService.getDoughnutChartConfig(100);
            const labelCallback = config.plugins?.tooltip?.callbacks?.label;

            if (labelCallback) {
                const mockContext = {
                    parsed: 25,
                    label: "Up",
                };
                const result = labelCallback.call({} as any, mockContext as any);
                expect(result).toBe("Up: 25 (25.0%)");
            }
        });

        it("should handle zero total checks in tooltip", () => {
            const config = chartService.getDoughnutChartConfig(0);
            const labelCallback = config.plugins?.tooltip?.callbacks?.label;

            if (labelCallback) {
                const mockContext = {
                    parsed: 25,
                    label: "Up",
                };
                const result = labelCallback.call({} as any, mockContext as any);
                expect(result).toBe("Up: 25 (0%)");
            }
        });

        it("should apply theme colors", () => {
            const config = chartService.getDoughnutChartConfig(100);

            expect(config.plugins?.title?.color).toBe(mockTheme.colors.text.primary);
            expect(config.plugins?.legend?.labels?.color).toBe(mockTheme.colors.text.primary);
        });

        it("should apply theme typography", () => {
            const config = chartService.getDoughnutChartConfig(100);

            expect((config.plugins?.title?.font as any)?.family).toBe(mockTheme.typography.fontFamily.sans.join(", "));
            expect((config.plugins?.legend?.labels?.font as any)?.family).toBe(
                mockTheme.typography.fontFamily.sans.join(", ")
            );
        });
    });

    describe("Base configuration", () => {
        it("should apply consistent base settings across all chart types", () => {
            const lineConfig = chartService.getLineChartConfig();
            const barConfig = chartService.getBarChartConfig();
            const doughnutConfig = chartService.getDoughnutChartConfig(100);

            // All charts should have consistent base settings
            expect(lineConfig.maintainAspectRatio).toBe(false);
            expect(barConfig.maintainAspectRatio).toBe(false);
            expect(doughnutConfig.maintainAspectRatio).toBe(false);

            expect(lineConfig.responsive).toBe(true);
            expect(barConfig.responsive).toBe(true);
            expect(doughnutConfig.responsive).toBe(true);
        });

        it("should apply consistent tooltip styling", () => {
            const lineConfig = chartService.getLineChartConfig();
            const barConfig = chartService.getBarChartConfig();

            expect(lineConfig.plugins?.tooltip?.backgroundColor).toBe(mockTheme.colors.surface.elevated);
            expect(barConfig.plugins?.tooltip?.backgroundColor).toBe(mockTheme.colors.surface.elevated);

            expect(lineConfig.plugins?.tooltip?.borderWidth).toBe(1);
            expect(barConfig.plugins?.tooltip?.borderWidth).toBe(1);
        });

        it("should apply consistent grid and tick styling", () => {
            const lineConfig = chartService.getLineChartConfig();
            const barConfig = chartService.getBarChartConfig();

            // Check that grid colors are consistent
            expect(lineConfig.scales?.x?.grid?.color).toBe(mockTheme.colors.border.secondary);
            expect(barConfig.scales?.x?.grid?.color).toBe(mockTheme.colors.border.secondary);

            // Check that tick colors are consistent
            expect(lineConfig.scales?.x?.ticks?.color).toBe(mockTheme.colors.text.secondary);
            expect(barConfig.scales?.x?.ticks?.color).toBe(mockTheme.colors.text.secondary);
        });
    });
});

describe("useChartConfigs", () => {
    it("should return all chart configuration objects", () => {
        const configs = useChartConfigs(mockTheme, 100);

        expect(configs).toHaveProperty("lineChartOptions");
        expect(configs).toHaveProperty("barChartOptions");
        expect(configs).toHaveProperty("doughnutOptions");
    });

    it("should return valid chart configurations", () => {
        const configs = useChartConfigs(mockTheme, 100);

        expect(configs.lineChartOptions).toBeDefined();
        expect(configs.barChartOptions).toBeDefined();
        expect(configs.doughnutOptions).toBeDefined();

        expect(configs.lineChartOptions.responsive).toBe(true);
        expect(configs.barChartOptions.responsive).toBe(true);
        expect(configs.doughnutOptions.responsive).toBe(true);
    });

    it("should pass totalChecks to doughnut configuration", () => {
        const configs = useChartConfigs(mockTheme, 150);
        const labelCallback = configs.doughnutOptions.plugins?.tooltip?.callbacks?.label;

        if (labelCallback) {
            const mockContext = {
                parsed: 75,
                label: "Up",
            };
            const result = labelCallback.call({} as any, mockContext as any);
            expect(result).toBe("Up: 75 (50.0%)");
        }
    });

    it("should handle default totalChecks", () => {
        const configs = useChartConfigs(mockTheme);
        const labelCallback = configs.doughnutOptions.plugins?.tooltip?.callbacks?.label;

        if (labelCallback) {
            const mockContext = {
                parsed: 25,
                label: "Up",
            };
            const result = labelCallback.call({} as any, mockContext as any);
            expect(result).toBe("Up: 25 (0%)");
        }
    });

    it("should create new service instance for each call", () => {
        const configs1 = useChartConfigs(mockTheme, 100);
        const configs2 = useChartConfigs(mockTheme, 100);

        // Should be different object instances
        expect(configs1).not.toBe(configs2);
        expect(configs1.lineChartOptions).not.toBe(configs2.lineChartOptions);
    });

    it("should apply theme consistently across all configurations", () => {
        const configs = useChartConfigs(mockTheme, 100);

        expect(configs.lineChartOptions.plugins?.title?.color).toBe(mockTheme.colors.text.primary);
        expect(configs.barChartOptions.plugins?.title?.color).toBe(mockTheme.colors.text.primary);
        expect(configs.doughnutOptions.plugins?.title?.color).toBe(mockTheme.colors.text.primary);
    });

    it("should handle different theme objects", () => {
        const darkTheme: Theme = {
            ...mockTheme,
            name: "dark",
            colors: {
                ...mockTheme.colors,
                text: {
                    primary: "#ffffff",
                    secondary: "#cccccc",
                    tertiary: "#999999",
                    inverse: "#000000",
                },
            },
        };

        const configs = useChartConfigs(darkTheme, 100);

        expect(configs.lineChartOptions.plugins?.title?.color).toBe(darkTheme.colors.text.primary);
        expect(configs.barChartOptions.plugins?.title?.color).toBe(darkTheme.colors.text.primary);
        expect(configs.doughnutOptions.plugins?.title?.color).toBe(darkTheme.colors.text.primary);
    });
});
