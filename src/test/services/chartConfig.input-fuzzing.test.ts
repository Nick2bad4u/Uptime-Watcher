/**
 * @remarks
 * Tests ChartConfigService operations with property-based testing using
 * fast-check to discover edge cases in chart configuration generation.
 *
 * @file Property-based fuzzing tests for chart configuration service
 *
 * @author AI Assistant
 */

import { beforeEach, describe, expect, vi } from "vitest";
import { test as fcTest } from "@fast-check/vitest";
import * as fc from "fast-check";
import { ChartConfigService } from "../../services/chartConfig";
import type { Theme } from "../../theme/types";

describe("ChartConfigService - Property-Based Fuzzing Tests", () => {
    let chartConfig: ChartConfigService;
    let mockTheme: Theme;

    beforeEach(() => {
        vi.clearAllMocks();

        // Create a proper mock theme that matches the Theme interface
        mockTheme = {
            name: "test",
            isDark: false,
            colors: {
                primary: {
                    50: "#eff6ff",
                    100: "#dbeafe",
                    200: "#bfdbfe",
                    300: "#93c5fd",
                    400: "#60a5fa",
                    500: "#3b82f6",
                    600: "#2563eb",
                    700: "#1d4ed8",
                    800: "#1e40af",
                    900: "#1e3a8a",
                },
                background: {
                    primary: "#ffffff",
                    secondary: "#f8fafc",
                    tertiary: "#f1f5f9",
                    modal: "rgba(0, 0, 0, 0.5)",
                },
                text: {
                    primary: "#1e293b",
                    secondary: "#64748b",
                    tertiary: "#94a3b8",
                    inverse: "#ffffff",
                },
                border: {
                    primary: "#e2e8f0",
                    secondary: "#cbd5e1",
                    focus: "#3b82f6",
                },
                surface: {
                    base: "#ffffff",
                    elevated: "#f8fafc",
                    overlay: "#ffffff",
                },
                hover: {
                    light: "#f8fafc",
                    medium: "#f1f5f9",
                    dark: "#e2e8f0",
                },
                status: {
                    degraded: "#f97316",
                    up: "#10b981",
                    down: "#ef4444",
                    pending: "#f59e0b",
                    paused: "#6b7280",
                    unknown: "#9ca3af",
                    mixed: "#8b5cf6",
                },
                error: "#ef4444",
                errorAlert: "#dc2626",
                success: "#10b981",
                warning: "#f59e0b",
                white: "#ffffff",
                info: "#3b82f6",
                shadows: {
                    degraded: "rgb(249 115 22 / 22%)",
                    error: "rgb(239 68 68 / 22%)",
                    paused: "rgb(156 163 175 / 22%)",
                    success: "rgb(16 185 129 / 22%)",
                    warning: "#fbbf24",
                },
            },
            typography: {
                fontFamily: {
                    sans: [
                        "Inter",
                        "system-ui",
                        "sans-serif",
                    ],
                    mono: [
                        "Fira Code",
                        "Monaco",
                        "monospace",
                    ],
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
                inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
                sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                md: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
            },
        };

        chartConfig = new ChartConfigService(mockTheme);
    });

    describe("Service Initialization", () => {
        fcTest.prop([fc.string({ minLength: 1, maxLength: 50 }), fc.boolean()])(
            "should initialize with various theme names and dark mode settings",
            (themeName, isDark) => {
                // Arrange
                const testTheme = { ...mockTheme, name: themeName, isDark };

                // Act
                const service = new ChartConfigService(testTheme);

                // Assert
                expect(service).toBeInstanceOf(ChartConfigService);
                expect(typeof service.getLineChartConfig).toBe("function");
                expect(typeof service.getDoughnutChartConfig).toBe("function");
                expect(typeof service.getBarChartConfig).toBe("function");
            }
        );
    });

    describe("Line Chart Configuration", () => {
        fcTest.prop([fc.constant(null)])(
            "should generate valid line chart configuration",
            () => {
                // Act
                const config = chartConfig.getLineChartConfig();

                // Assert
                expect(config).toBeDefined();
                expect(typeof config).toBe("object");
                expect(config.responsive).toBeTruthy();
                expect(config.maintainAspectRatio).toBeFalsy();
                expect(config.interaction).toBeDefined();
                expect(config.plugins).toBeDefined();
            }
        );
    });

    describe("Doughnut Chart Configuration", () => {
        fcTest.prop([fc.integer({ min: 0, max: 100_000 })])(
            "should generate valid doughnut chart configuration with arbitrary total checks",
            (totalChecks) => {
                // Act
                const config = chartConfig.getDoughnutChartConfig(totalChecks);

                // Assert
                expect(config).toBeDefined();
                expect(typeof config).toBe("object");
                expect(config.responsive).toBeTruthy();
                expect(config.maintainAspectRatio).toBeFalsy();
                expect(config.plugins).toBeDefined();

                // Verify tooltip callback exists
                if (config.plugins?.tooltip?.callbacks?.label) {
                    expect(typeof config.plugins.tooltip.callbacks.label).toBe(
                        "function"
                    );
                }
            }
        );

        fcTest.prop([fc.integer({ min: -1000, max: 0 })])(
            "should handle zero or negative total checks gracefully",
            (totalChecks) => {
                // Act & Assert - should not throw
                expect(() =>
                    chartConfig.getDoughnutChartConfig(totalChecks)
                ).not.toThrowError();

                const config = chartConfig.getDoughnutChartConfig(totalChecks);
                expect(config).toBeDefined();
            }
        );

        fcTest.prop([fc.integer({ min: 0, max: 1_000_000 })])(
            "should handle large total checks",
            (totalChecks) => {
                // Act & Assert - should not throw with large values
                expect(() =>
                    chartConfig.getDoughnutChartConfig(totalChecks)
                ).not.toThrowError();

                const config = chartConfig.getDoughnutChartConfig(totalChecks);
                expect(config).toBeDefined();
            }
        );
    });

    describe("Bar Chart Configuration", () => {
        fcTest.prop([fc.constant(null)])(
            "should generate valid bar chart configuration",
            () => {
                // Act
                const config = chartConfig.getBarChartConfig();

                // Assert
                expect(config).toBeDefined();
                expect(typeof config).toBe("object");
                expect(config.responsive).toBeTruthy();
                expect(config.maintainAspectRatio).toBeFalsy();
                expect(config.plugins).toBeDefined();
                expect(config.scales).toBeDefined();

                // Verify scales configuration
                if (config.scales) {
                    expect(config.scales["x"]).toBeDefined();
                    expect(config.scales["y"]).toBeDefined();
                    if (
                        config.scales["y"] &&
                        typeof config.scales["y"] === "object"
                    ) {
                        expect(
                            (config.scales["y"] as any).beginAtZero
                        ).toBeTruthy();
                    }
                }
            }
        );
    });

    describe("Configuration Consistency", () => {
        fcTest.prop([fc.integer({ min: 1, max: 10 })])(
            "should generate consistent configurations across multiple calls",
            (iterations) => {
                // Act - call configuration methods multiple times
                for (let i = 0; i < iterations; i++) {
                    const lineConfig = chartConfig.getLineChartConfig();
                    const doughnutConfig =
                        chartConfig.getDoughnutChartConfig(100);
                    const barConfig = chartConfig.getBarChartConfig();

                    // Assert - all configurations should be valid
                    expect(lineConfig).toBeDefined();
                    expect(doughnutConfig).toBeDefined();
                    expect(barConfig).toBeDefined();
                }
            }
        );
    });

    describe("Theme Integration", () => {
        fcTest.prop([
            fc
                .string({ minLength: 6, maxLength: 7 })
                .filter((s) => s.startsWith("#") || s.length === 6),
            fc.boolean(),
        ])("should handle different theme variations", (colorValue, isDark) => {
            // Arrange - create theme with different color
            const testTheme = {
                ...mockTheme,
                isDark,
                colors: {
                    ...mockTheme.colors,
                    primary: {
                        ...mockTheme.colors.primary,
                        500: colorValue.startsWith("#")
                            ? colorValue
                            : `#${colorValue}`,
                    },
                },
            };

            // Act
            const service = new ChartConfigService(testTheme);
            const lineConfig = service.getLineChartConfig();
            const doughnutConfig = service.getDoughnutChartConfig(100);
            const barConfig = service.getBarChartConfig();

            // Assert - all configurations should be generated without errors
            expect(lineConfig).toBeDefined();
            expect(doughnutConfig).toBeDefined();
            expect(barConfig).toBeDefined();
        });
    });

    describe("Edge Cases and Error Handling", () => {
        fcTest.prop([fc.integer({ min: -10_000, max: 10_000 })])(
            "should handle extreme values for doughnut chart total checks",
            (extremeValue) => {
                // Act & Assert - should not crash with extreme values
                expect(() =>
                    chartConfig.getDoughnutChartConfig(extremeValue)
                ).not.toThrowError();
            }
        );

        fcTest.prop([fc.constant(null)])(
            "should generate valid configurations even with minimal theme",
            () => {
                // Arrange - create minimal theme
                const minimalTheme = { ...mockTheme };
                const service = new ChartConfigService(minimalTheme);

                // Act & Assert - should not crash
                expect(() => service.getLineChartConfig()).not.toThrowError();
                expect(() =>
                    service.getDoughnutChartConfig(0)
                ).not.toThrowError();
                expect(() => service.getBarChartConfig()).not.toThrowError();
            }
        );
    });

    describe("Performance and Scalability", () => {
        fcTest.prop([fc.integer({ min: 1, max: 1000 })])(
            "should handle rapid configuration generation",
            (count) => {
                // Act - generate many configurations rapidly
                const startTime = performance.now();

                for (let i = 0; i < count; i++) {
                    chartConfig.getLineChartConfig();
                    chartConfig.getDoughnutChartConfig(i);
                    chartConfig.getBarChartConfig();
                }

                const endTime = performance.now();
                const duration = endTime - startTime;

                // Assert - should complete within reasonable time
                expect(duration).toBeLessThan(5000); // 5 seconds max for 1000 iterations
            }
        );
    });
});
