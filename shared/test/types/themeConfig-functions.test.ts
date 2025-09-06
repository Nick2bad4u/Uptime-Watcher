/**
 * @file Tests for shared/types/themeConfig.ts functions
 */

import { describe, expect, it } from "vitest";

import {
    isColorPalette,
    isThemeConfig,
    type ColorPalette,
} from "../../types/themeConfig";

describe("shared/types/themeConfig function coverage", () => {
    describe(isColorPalette, () => {
        it("should return true for valid ColorPalette object", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: themeConfig-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const validPalette: ColorPalette = {
                primary: "#0066cc",
                secondary: "#666666",
                error: "#cc0000",
                warning: "#ffaa00",
                success: "#00aa00",
                info: "#00aaff",
            };

            expect(isColorPalette(validPalette)).toBeTruthy();
        });

        it("should return false for null", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: themeConfig-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isColorPalette(null)).toBeFalsy();
        });

        it("should return false for undefined", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: themeConfig-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isColorPalette(undefined)).toBeFalsy();
        });

        it("should return false for primitive types", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: themeConfig-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isColorPalette("string")).toBeFalsy();
            expect(isColorPalette(123)).toBeFalsy();
            expect(isColorPalette(true)).toBeFalsy();
        });

        it("should return false for array", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: themeConfig-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isColorPalette([])).toBeFalsy();
        });

        it("should return false for object missing required properties", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: themeConfig-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const incompletePalette = {
                background: "#ffffff",
                text: "#000000",
                // missing other required properties
            };

            expect(isColorPalette(incompletePalette)).toBeFalsy();
        });

        it("should return false for object with invalid property types", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: themeConfig-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const invalidPalette = {
                background: 123, // should be string
                border: "#cccccc",
                text: "#000000",
                primary: "#0066cc",
                secondary: "#666666",
                success: "#00aa00",
                warning: "#ffaa00",
                error: "#cc0000",
                muted: "#999999",
            };

            expect(isColorPalette(invalidPalette)).toBeFalsy();
        });

        it("should handle edge cases with color values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: themeConfig-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const edgeCasePalette: ColorPalette = {
                primary: "#ff0000", // valid color
                secondary: "#666666",
                error: "#cc0000",
                warning: "#ffaa00",
                success: "#00aa00",
                info: "#00aaff",
            };

            // Should pass type check with valid color values
            expect(isColorPalette(edgeCasePalette)).toBeTruthy();
        });
    });

    describe(isThemeConfig, () => {
        it("should return true for valid ThemeConfig object", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: themeConfig-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const validConfig = {
                animation: {
                    duration: {
                        fast: "150ms",
                        normal: "300ms",
                        slow: "500ms",
                    },
                    easing: {
                        linear: "linear",
                        easeIn: "ease-in",
                        easeOut: "ease-out",
                        easeInOut: "ease-in-out",
                    },
                },
                borderRadius: {
                    none: "0px",
                    sm: "4px",
                    md: "8px",
                    lg: "12px",
                    xl: "16px",
                    full: "9999px",
                },
                colors: {
                    background: {
                        default: "#ffffff",
                        elevated: "#f5f5f5",
                        paper: "#ffffff",
                    },
                    border: {
                        default: "#e0e0e0",
                        focus: "#0066cc",
                        hover: "#cccccc",
                    },
                    hover: {
                        primary: "#0052a3",
                        secondary: "#525252",
                    },
                    primary: {
                        error: "#cc0000",
                        info: "#00aaff",
                        primary: "#0066cc",
                        secondary: "#666666",
                        success: "#00aa00",
                        warning: "#ffaa00",
                    },
                    status: {
                        error: "#ff4444",
                        info: "#44aaff",
                        success: "#44aa44",
                        warning: "#ffaa44",
                    },
                    text: {
                        disabled: "#cccccc",
                        hint: "#999999",
                        primary: "#000000",
                        secondary: "#666666",
                    },
                },
                components: {
                    button: {
                        borderRadius: "8px",
                        fontSize: "14px",
                        fontWeight: 500,
                        padding: "8px 16px",
                    },
                    card: {
                        borderRadius: "12px",
                        padding: "16px",
                        shadow: "0 2px 4px rgba(0,0,0,0.1)",
                    },
                    input: {
                        borderRadius: "6px",
                        fontSize: "14px",
                        padding: "8px 12px",
                    },
                },
                shadows: {
                    none: "none",
                    sm: "0 1px 2px rgba(0,0,0,0.1)",
                    md: "0 2px 4px rgba(0,0,0,0.1)",
                    lg: "0 4px 8px rgba(0,0,0,0.1)",
                    xl: "0 8px 16px rgba(0,0,0,0.1)",
                },
                spacing: {
                    none: "0px",
                    xs: "4px",
                    sm: "8px",
                    md: "16px",
                    lg: "24px",
                    xl: "32px",
                    "2xl": "48px",
                },
                typography: {
                    fontFamily: {
                        primary: "Arial, sans-serif",
                        secondary: "Georgia, serif",
                        monospace: "Monaco, monospace",
                    },
                    fontSize: {
                        xs: "12px",
                        sm: "14px",
                        md: "16px",
                        lg: "18px",
                        xl: "20px",
                        "2xl": "24px",
                    },
                    fontWeight: {
                        light: 300,
                        normal: 400,
                        medium: 500,
                        semibold: 600,
                        bold: 700,
                    },
                    lineHeight: {
                        tight: 1.25,
                        normal: 1.5,
                        relaxed: 1.75,
                    },
                },
            };

            expect(isThemeConfig(validConfig as any)).toBeTruthy();
        });

        it("should return false for null", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: themeConfig-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isThemeConfig(null)).toBeFalsy();
        });

        it("should return false for undefined", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: themeConfig-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isThemeConfig(undefined)).toBeFalsy();
        });

        it("should return false for primitive types", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: themeConfig-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isThemeConfig("string")).toBeFalsy();
            expect(isThemeConfig(123)).toBeFalsy();
            expect(isThemeConfig(true)).toBeFalsy();
        });

        it("should return false for array", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: themeConfig-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isThemeConfig([])).toBeFalsy();
        });

        it("should return false for object missing required properties", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: themeConfig-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const incompleteConfig = {
                colors: {
                    light: {
                        background: "#ffffff",
                        border: "#cccccc",
                        text: "#000000",
                        primary: "#0066cc",
                        secondary: "#666666",
                        success: "#00aa00",
                        warning: "#ffaa00",
                        error: "#cc0000",
                        muted: "#999999",
                    },
                },
                // missing fonts, spacing, borderRadius
            };

            expect(isThemeConfig(incompleteConfig)).toBeFalsy();
        });

        it("should return false for object with invalid nested structure", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: themeConfig-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const invalidConfig = {
                colors: {
                    light: "invalid", // should be ColorPalette object
                    dark: {
                        background: "#1a1a1a",
                        border: "#444444",
                        text: "#ffffff",
                        primary: "#3399ff",
                        secondary: "#cccccc",
                        success: "#00cc00",
                        warning: "#ffcc00",
                        error: "#ff3333",
                        muted: "#666666",
                    },
                },
                fonts: {
                    primary: "Arial, sans-serif",
                    monospace: "Monaco, monospace",
                },
                spacing: {
                    xs: "4px",
                    sm: "8px",
                    md: "16px",
                    lg: "24px",
                    xl: "32px",
                },
                borderRadius: {
                    sm: "4px",
                    md: "8px",
                    lg: "12px",
                },
            };

            expect(isThemeConfig(invalidConfig)).toBeFalsy();
        });

        it("should return false for object missing color themes", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: themeConfig-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const configMissingThemes = {
                colors: {
                    light: {
                        background: "#ffffff",
                        border: "#cccccc",
                        text: "#000000",
                        primary: "#0066cc",
                        secondary: "#666666",
                        success: "#00aa00",
                        warning: "#ffaa00",
                        error: "#cc0000",
                        muted: "#999999",
                    },
                    // missing dark theme
                },
                fonts: {
                    primary: "Arial, sans-serif",
                    monospace: "Monaco, monospace",
                },
                spacing: {
                    xs: "4px",
                    sm: "8px",
                    md: "16px",
                    lg: "24px",
                    xl: "32px",
                },
                borderRadius: {
                    sm: "4px",
                    md: "8px",
                    lg: "12px",
                },
            };

            expect(isThemeConfig(configMissingThemes)).toBeFalsy();
        });
    });

    describe("integration tests", () => {
        it("should validate complete theme structure", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: themeConfig-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Validation", "type");

            const themeConfig = {
                animation: {
                    duration: { fast: "150ms", normal: "300ms", slow: "500ms" },
                    easing: {
                        linear: "linear",
                        easeIn: "ease-in",
                        easeOut: "ease-out",
                        easeInOut: "ease-in-out",
                    },
                },
                borderRadius: {
                    none: "0px",
                    sm: "4px",
                    md: "8px",
                    lg: "12px",
                    xl: "16px",
                    full: "9999px",
                },
                colors: {
                    background: {
                        default: "#ffffff",
                        elevated: "#f5f5f5",
                        paper: "#ffffff",
                    },
                    border: {
                        default: "#e0e0e0",
                        focus: "#0066cc",
                        hover: "#cccccc",
                    },
                    hover: { primary: "#0052a3", secondary: "#525252" },
                    primary: {
                        error: "#cc0000",
                        info: "#00aaff",
                        primary: "#0066cc",
                        secondary: "#666666",
                        success: "#00aa00",
                        warning: "#ffaa00",
                    },
                    status: {
                        error: "#ff4444",
                        info: "#44aaff",
                        success: "#44aa44",
                        warning: "#ffaa44",
                    },
                    text: {
                        disabled: "#cccccc",
                        hint: "#999999",
                        primary: "#000000",
                        secondary: "#666666",
                    },
                },
                components: {
                    button: {
                        borderRadius: "8px",
                        fontSize: "14px",
                        fontWeight: 500,
                        padding: "8px 16px",
                    },
                    card: {
                        borderRadius: "12px",
                        padding: "16px",
                        shadow: "0 2px 4px rgba(0,0,0,0.1)",
                    },
                    input: {
                        borderRadius: "6px",
                        fontSize: "14px",
                        padding: "8px 12px",
                    },
                },
                shadows: {
                    none: "none",
                    sm: "0 1px 2px rgba(0,0,0,0.1)",
                    md: "0 2px 4px rgba(0,0,0,0.1)",
                    lg: "0 4px 8px rgba(0,0,0,0.1)",
                    xl: "0 8px 16px rgba(0,0,0,0.1)",
                },
                spacing: {
                    none: "0px",
                    xs: "4px",
                    sm: "8px",
                    md: "16px",
                    lg: "24px",
                    xl: "32px",
                    "2xl": "48px",
                },
                typography: {
                    fontFamily: {
                        primary: "Arial, sans-serif",
                        secondary: "Georgia, serif",
                        monospace: "Monaco, monospace",
                    },
                    fontSize: {
                        xs: "12px",
                        sm: "14px",
                        md: "16px",
                        lg: "18px",
                        xl: "20px",
                        "2xl": "24px",
                    },
                    fontWeight: {
                        light: 300,
                        normal: 400,
                        medium: 500,
                        semibold: 600,
                        bold: 700,
                    },
                    lineHeight: { tight: 1.25, normal: 1.5, relaxed: 1.75 },
                },
            };

            expect(isThemeConfig(themeConfig as any)).toBeTruthy();
            expect(isColorPalette(themeConfig.colors.primary)).toBeTruthy(); // Test the actual ColorPalette
        });

        it("should handle edge cases with both validators", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: themeConfig-functions", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            // Test with minimum valid structure - valid ThemeConfig with minimal ColorPalette
            const minimalValidTheme = {
                animation: {
                    duration: { fast: "0ms", normal: "0ms", slow: "0ms" },
                    easing: {
                        linear: "",
                        easeIn: "",
                        easeOut: "",
                        easeInOut: "",
                    },
                },
                borderRadius: {
                    none: "",
                    sm: "",
                    md: "",
                    lg: "",
                    xl: "",
                    full: "",
                },
                colors: {
                    background: { default: "", elevated: "", paper: "" },
                    border: { default: "", focus: "", hover: "" },
                    hover: { primary: "", secondary: "" },
                    primary: {
                        error: "red",
                        info: "blue",
                        primary: "green",
                        secondary: "gray",
                        success: "green",
                        warning: "orange",
                    },
                    status: { error: "", info: "", success: "", warning: "" },
                    text: {
                        disabled: "",
                        hint: "",
                        primary: "",
                        secondary: "",
                    },
                },
                components: {
                    button: {
                        borderRadius: "",
                        fontSize: "",
                        fontWeight: 0,
                        padding: "",
                    },
                    card: { borderRadius: "", padding: "", shadow: "" },
                    input: { borderRadius: "", fontSize: "", padding: "" },
                },
                shadows: { none: "", sm: "", md: "", lg: "", xl: "" },
                spacing: {
                    none: "",
                    xs: "",
                    sm: "",
                    md: "",
                    lg: "",
                    xl: "",
                    "2xl": "",
                },
                typography: {
                    fontFamily: { primary: "", secondary: "", monospace: "" },
                    fontSize: {
                        xs: "",
                        sm: "",
                        md: "",
                        lg: "",
                        xl: "",
                        "2xl": "",
                    },
                    fontWeight: {
                        light: 0,
                        normal: 0,
                        medium: 0,
                        semibold: 0,
                        bold: 0,
                    },
                    lineHeight: { tight: 0, normal: 0, relaxed: 0 },
                },
            };

            expect(isThemeConfig(minimalValidTheme as any)).toBeTruthy();
        });
    });
});
