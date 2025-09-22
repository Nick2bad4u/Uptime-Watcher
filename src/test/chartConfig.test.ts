/**
 * @vitest-environment jsdom
 */

import { describe, expect, it } from "vitest";

import {
    ChartConfigService,
    createChartConfigs,
} from "../services/chartConfig";
import { Theme } from "../theme/types";
import { getScaleProperty, getNestedScaleProperty } from "../utils/chartUtils";

// Mock theme object for testing
const mockTheme: Theme = {
    borderRadius: {
        full: "9999px",
        lg: "0.5rem",
        md: "0.375rem",
        none: "0",
        sm: "0.125rem",
        xl: "0.75rem",
    },
    colors: {
        background: {
            modal: "#ffffff",
            primary: "#ffffff",
            secondary: "#f8fafc",
            tertiary: "#f1f5f9",
        },
        border: {
            focus: "#f8fafc",
            primary: "#e2e8f0",
            secondary: "#f1f5f9",
        },
        error: "#ef4444",
        errorAlert: "#dc2626",
        hover: {
            dark: "#e2e8f0",
            light: "#f8fafc",
            medium: "#f1f5f9",
        },
        info: "#3b82f6",
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
        shadows: {
            degraded: "rgb(249 115 22 / 22%)",
            error: "rgb(239 68 68 / 22%)",
            paused: "rgb(156 163 175 / 22%)",
            success: "rgb(16 185 129 / 22%)",
            warning: "rgb(251 191 36 / 22%)",
        },
        status: {
            degraded: "#f97316",
            down: "#ef4444",
            mixed: "#8b5cf6",
            paused: "#9ca3af",
            pending: "#f59e0b",
            unknown: "#6b7280",
            up: "#10b981",
        },
        success: "#10b981",
        surface: {
            base: "#f8fafc",
            elevated: "#ffffff",
            overlay: "#f1f5f9",
        },
        text: {
            inverse: "#ffffff",
            primary: "#1e293b",
            secondary: "#64748b",
            tertiary: "#94a3b8",
        },
        warning: "#f59e0b",
    },
    isDark: false,
    name: "light",
    shadows: {
        inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
        lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
        md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
    },
    spacing: {
        "2xl": "3rem",
        "3xl": "4rem",
        lg: "1.5rem",
        md: "1rem",
        sm: "0.5rem",
        xl: "2rem",
        xs: "0.25rem",
    },
    typography: {
        fontFamily: {
            mono: ["JetBrains Mono", "monospace"],
            sans: [
                "Inter",
                "system-ui",
                "sans-serif",
            ],
        },
        fontSize: {
            "2xl": "1.5rem",
            "3xl": "1.875rem",
            "4xl": "2.25rem",
            base: "1rem",
            lg: "1.125rem",
            sm: "0.875rem",
            xl: "1.25rem",
            xs: "0.75rem",
        },
        fontWeight: {
            bold: "700",
            medium: "500",
            normal: "400",
            semibold: "600",
        },
        lineHeight: {
            normal: "1.5",
            relaxed: "1.75",
            tight: "1.25",
        },
    },
};

describe(ChartConfigService, () => {
    let chartService: ChartConfigService;

    beforeEach(() => {
        chartService = new ChartConfigService(mockTheme);
    });

    describe("Constructor", () => {
        it("should create an instance with theme", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartConfig", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Constructor", "type");

            expect(chartService).toBeInstanceOf(ChartConfigService);
        });

        it("should store the theme correctly", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartConfig", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            // Test by calling a method that uses the theme
            const config = chartService.getLineChartConfig();
            expect(config.plugins?.legend?.labels?.color).toBe(
                mockTheme.colors.text.primary
            );
        });
    });

    describe("getLineChartConfig", () => {
        it("should return a line chart configuration", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartConfig", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const config = chartService.getLineChartConfig();

            expect(config).toBeDefined();
            expect(config.maintainAspectRatio).toBeFalsy();
            expect(config.responsive).toBeTruthy();
        });

        it("should have correct interaction settings", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartConfig", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const config = chartService.getLineChartConfig();

            expect(config.interaction?.mode).toBe("index");
            expect(config.interaction?.intersect).toBeFalsy();
        });

        it("should have zoom configuration", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartConfig", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const config = chartService.getLineChartConfig();

            expect(config.plugins?.zoom?.pan?.enabled).toBeTruthy();
            expect(config.plugins?.zoom?.pan?.mode).toBe("x");
            expect(config.plugins?.zoom?.zoom?.mode).toBe("x");
            expect(config.plugins?.zoom?.zoom?.pinch?.enabled).toBeTruthy();
            expect(config.plugins?.zoom?.zoom?.wheel?.enabled).toBeTruthy();
        });

        it("should have correct scale configuration", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartConfig", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const config = chartService.getLineChartConfig();

            expect(getScaleProperty(config, "x", "type")).toBe("time");
            // TypeScript has overly strict Chart.js types, so we use assertions for deep nested properties
            expect(
                getNestedScaleProperty(config, "x", "time.displayFormats.day")
            ).toBe("MMM dd");
            expect(
                getNestedScaleProperty(config, "x", "time.displayFormats.hour")
            ).toBe("HH:mm");
            expect(
                getNestedScaleProperty(
                    config,
                    "x",
                    "time.displayFormats.minute"
                )
            ).toBe("HH:mm");
            expect(
                getNestedScaleProperty(config, "y", "beginAtZero")
            ).toBeTruthy();
            expect(getNestedScaleProperty(config, "y", "title.text")).toBe(
                "Response Time (ms)"
            );
        });

        it("should have correct title", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartConfig", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const config = chartService.getLineChartConfig();

            expect(config.plugins?.title?.text).toBe("Response Time Over Time");
            expect(config.plugins?.title?.display).toBeTruthy();
        });

        it("should apply theme colors", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartConfig", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const config = chartService.getLineChartConfig();

            expect(config.plugins?.title?.color).toBe(
                mockTheme.colors.text.primary
            );
            expect(config.plugins?.legend?.labels?.color).toBe(
                mockTheme.colors.text.primary
            );
            expect(config.plugins?.tooltip?.backgroundColor).toBe(
                mockTheme.colors.surface.elevated
            );
            expect(config.plugins?.tooltip?.titleColor).toBe(
                mockTheme.colors.text.primary
            );
            expect(config.plugins?.tooltip?.bodyColor).toBe(
                mockTheme.colors.text.secondary
            );
            expect(config.plugins?.tooltip?.borderColor).toBe(
                mockTheme.colors.border.primary
            );
        });

        it("should apply theme typography", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartConfig", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const config = chartService.getLineChartConfig();

            // TypeScript has overly strict Chart.js types, so we use assertions for deep nested properties
            expect((config.plugins?.title?.font as any)?.family).toBe(
                mockTheme.typography.fontFamily.sans.join(", ")
            );
            expect((config.plugins?.title?.font as any)?.size).toBe(16);
            expect((config.plugins?.title?.font as any)?.weight).toBe("bold");
            expect((config.plugins?.legend?.labels?.font as any)?.family).toBe(
                mockTheme.typography.fontFamily.sans.join(", ")
            );
            expect((config.plugins?.legend?.labels?.font as any)?.size).toBe(
                12
            );
        });
    });

    describe("getBarChartConfig", () => {
        it("should return a bar chart configuration", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartConfig", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const config = chartService.getBarChartConfig();

            expect(config).toBeDefined();
            expect(config.maintainAspectRatio).toBeFalsy();
            expect(config.responsive).toBeTruthy();
        });

        it("should hide legend for bar chart", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartConfig", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const config = chartService.getBarChartConfig();

            expect(config.plugins?.legend?.display).toBeFalsy();
        });

        it("should have correct title", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartConfig", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const config = chartService.getBarChartConfig();

            expect(config.plugins?.title?.text).toBe("Status Distribution");
            expect(config.plugins?.title?.display).toBeTruthy();
        });

        it("should have correct scale configuration", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartConfig", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const config = chartService.getBarChartConfig();

            expect(
                getNestedScaleProperty(config, "y", "beginAtZero")
            ).toBeTruthy();
            expect(getNestedScaleProperty(config, "y", "title.text")).toBe(
                "Count"
            );
            expect(
                getNestedScaleProperty(config, "y", "title.display")
            ).toBeTruthy();
        });

        it("should apply theme colors", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartConfig", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const config = chartService.getBarChartConfig();

            expect(config.plugins?.title?.color).toBe(
                mockTheme.colors.text.primary
            );
            expect(getNestedScaleProperty(config, "y", "title.color")).toBe(
                mockTheme.colors.text.secondary
            );
        });

        it("should apply theme typography", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartConfig", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const config = chartService.getBarChartConfig();

            expect((config.plugins?.title?.font as any)?.family).toBe(
                mockTheme.typography.fontFamily.sans.join(", ")
            );
            expect(
                getNestedScaleProperty(config, "y", "title.font.family")
            ).toBe(mockTheme.typography.fontFamily.sans.join(", "));
        });
    });

    describe("getDoughnutChartConfig", () => {
        it("should return a doughnut chart configuration", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartConfig", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const config = chartService.getDoughnutChartConfig(100);

            expect(config).toBeDefined();
            expect(config.maintainAspectRatio).toBeFalsy();
            expect(config.responsive).toBeTruthy();
        });

        it("should have correct title", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartConfig", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const config = chartService.getDoughnutChartConfig(100);

            expect(config.plugins?.title?.text).toBe("Uptime Distribution");
            expect(config.plugins?.title?.display).toBeTruthy();
        });

        it("should position legend at bottom", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartConfig", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const config = chartService.getDoughnutChartConfig(100);

            expect(config.plugins?.legend?.position).toBe("bottom");
        });

        it("should have custom tooltip callbacks", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartConfig", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const config = chartService.getDoughnutChartConfig(100);

            expect(config.plugins?.tooltip?.callbacks?.label).toBeDefined();
            expect(typeof config.plugins?.tooltip?.callbacks?.label).toBe(
                "function"
            );
        });

        it("should calculate percentages correctly in tooltip", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartConfig", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const config = chartService.getDoughnutChartConfig(100);
            const labelCallback = config.plugins?.tooltip?.callbacks?.label;

            if (labelCallback) {
                const mockContext = {
                    label: "Up",
                    parsed: 25,
                };
                const result = labelCallback.call(
                    {} as any,
                    mockContext as any
                );
                expect(result).toBe("Up: 25 (25.0%)");
            }
        });

        it("should handle zero total checks in tooltip", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartConfig", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const config = chartService.getDoughnutChartConfig(0);
            const labelCallback = config.plugins?.tooltip?.callbacks?.label;

            if (labelCallback) {
                const mockContext = {
                    label: "Up",
                    parsed: 25,
                };
                const result = labelCallback.call(
                    {} as any,
                    mockContext as any
                );
                expect(result).toBe("Up: 25 (0%)");
            }
        });

        it("should apply theme colors", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartConfig", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const config = chartService.getDoughnutChartConfig(100);

            expect(config.plugins?.title?.color).toBe(
                mockTheme.colors.text.primary
            );
            expect(config.plugins?.legend?.labels?.color).toBe(
                mockTheme.colors.text.primary
            );
        });

        it("should apply theme typography", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartConfig", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const config = chartService.getDoughnutChartConfig(100);

            expect((config.plugins?.title?.font as any)?.family).toBe(
                mockTheme.typography.fontFamily.sans.join(", ")
            );
            expect((config.plugins?.legend?.labels?.font as any)?.family).toBe(
                mockTheme.typography.fontFamily.sans.join(", ")
            );
        });
    });

    describe("Base configuration", () => {
        it("should apply consistent base settings across all chart types", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartConfig", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const lineConfig = chartService.getLineChartConfig();
            const barConfig = chartService.getBarChartConfig();
            const doughnutConfig = chartService.getDoughnutChartConfig(100);

            // All charts should have consistent base settings
            expect(lineConfig.maintainAspectRatio).toBeFalsy();
            expect(barConfig.maintainAspectRatio).toBeFalsy();
            expect(doughnutConfig.maintainAspectRatio).toBeFalsy();

            expect(lineConfig.responsive).toBeTruthy();
            expect(barConfig.responsive).toBeTruthy();
            expect(doughnutConfig.responsive).toBeTruthy();
        });

        it("should apply consistent tooltip styling", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartConfig", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const lineConfig = chartService.getLineChartConfig();
            const barConfig = chartService.getBarChartConfig();

            expect(lineConfig.plugins?.tooltip?.backgroundColor).toBe(
                mockTheme.colors.surface.elevated
            );
            expect(barConfig.plugins?.tooltip?.backgroundColor).toBe(
                mockTheme.colors.surface.elevated
            );

            expect(lineConfig.plugins?.tooltip?.borderWidth).toBe(1);
            expect(barConfig.plugins?.tooltip?.borderWidth).toBe(1);
        });

        it("should apply consistent grid and tick styling", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: chartConfig", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const lineConfig = chartService.getLineChartConfig();
            const barConfig = chartService.getBarChartConfig();

            // Check that grid colors are consistent
            expect(getNestedScaleProperty(lineConfig, "x", "grid.color")).toBe(
                mockTheme.colors.border.secondary
            );
            expect(getNestedScaleProperty(barConfig, "x", "grid.color")).toBe(
                mockTheme.colors.border.secondary
            );

            // Check that tick colors are consistent
            expect(getNestedScaleProperty(lineConfig, "x", "ticks.color")).toBe(
                mockTheme.colors.text.secondary
            );
            expect(getNestedScaleProperty(barConfig, "x", "ticks.color")).toBe(
                mockTheme.colors.text.secondary
            );
        });
    });
});

describe(createChartConfigs, () => {
    it("should return all chart configuration objects", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: chartConfig", "component");
        await annotate("Category: Core", "category");
        await annotate("Type: Business Logic", "type");

        const configs = createChartConfigs(mockTheme, 100);

        expect(configs).toHaveProperty("lineChartOptions");
        expect(configs).toHaveProperty("barChartOptions");
        expect(configs).toHaveProperty("doughnutOptions");
    });

    it("should return valid chart configurations", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: chartConfig", "component");
        await annotate("Category: Core", "category");
        await annotate("Type: Business Logic", "type");

        const configs = createChartConfigs(mockTheme, 100);

        expect(configs.lineChartOptions).toBeDefined();
        expect(configs.barChartOptions).toBeDefined();
        expect(configs.doughnutOptions).toBeDefined();

        expect(configs.lineChartOptions.responsive).toBeTruthy();
        expect(configs.barChartOptions.responsive).toBeTruthy();
        expect(configs.doughnutOptions.responsive).toBeTruthy();
    });

    it("should pass totalChecks to doughnut configuration", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: chartConfig", "component");
        await annotate("Category: Core", "category");
        await annotate("Type: Business Logic", "type");

        const configs = createChartConfigs(mockTheme, 150);
        const labelCallback =
            configs.doughnutOptions.plugins?.tooltip?.callbacks?.label;

        if (labelCallback) {
            const mockContext = {
                label: "Up",
                parsed: 75,
            };
            const result = labelCallback.call({} as any, mockContext as any);
            expect(result).toBe("Up: 75 (50.0%)");
        }
    });

    it("should handle default totalChecks", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: chartConfig", "component");
        await annotate("Category: Core", "category");
        await annotate("Type: Business Logic", "type");

        const configs = createChartConfigs(mockTheme);
        const labelCallback =
            configs.doughnutOptions.plugins?.tooltip?.callbacks?.label;

        if (labelCallback) {
            const mockContext = {
                label: "Up",
                parsed: 25,
            };
            const result = labelCallback.call({} as any, mockContext as any);
            expect(result).toBe("Up: 25 (0%)");
        }
    });

    it("should create new service instance for each call", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: chartConfig", "component");
        await annotate("Category: Core", "category");
        await annotate("Type: Constructor", "type");

        const configs1 = createChartConfigs(mockTheme, 100);
        const configs2 = createChartConfigs(mockTheme, 100);

        // Should be different object instances
        expect(configs1).not.toBe(configs2);
        expect(configs1.lineChartOptions).not.toBe(configs2.lineChartOptions);
    });

    it("should apply theme consistently across all configurations", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: chartConfig", "component");
        await annotate("Category: Core", "category");
        await annotate("Type: Business Logic", "type");

        const configs = createChartConfigs(mockTheme, 100);

        expect(configs.lineChartOptions.plugins?.title?.color).toBe(
            mockTheme.colors.text.primary
        );
        expect(configs.barChartOptions.plugins?.title?.color).toBe(
            mockTheme.colors.text.primary
        );
        expect(configs.doughnutOptions.plugins?.title?.color).toBe(
            mockTheme.colors.text.primary
        );
    });

    it("should handle different theme objects", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: chartConfig", "component");
        await annotate("Category: Core", "category");
        await annotate("Type: Business Logic", "type");

        const darkTheme: Theme = {
            ...mockTheme,
            colors: {
                ...mockTheme.colors,
                text: {
                    inverse: "#000000",
                    primary: "#ffffff",
                    secondary: "#cccccc",
                    tertiary: "#999999",
                },
            },
            name: "dark",
        };

        const configs = createChartConfigs(darkTheme, 100);

        expect(configs.lineChartOptions.plugins?.title?.color).toBe(
            darkTheme.colors.text.primary
        );
        expect(configs.barChartOptions.plugins?.title?.color).toBe(
            darkTheme.colors.text.primary
        );
        expect(configs.doughnutOptions.plugins?.title?.color).toBe(
            darkTheme.colors.text.primary
        );
    });
});
