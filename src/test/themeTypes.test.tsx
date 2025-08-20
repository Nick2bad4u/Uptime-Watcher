/**
 * Tests for theme/types.ts module. Tests theme-related type definitions,
 * interfaces, and type compatibility.
 */

import { describe, expect, it } from "vitest";

import type {
    ThemeColors,
    ThemeSpacing,
    ThemeTypography,
    ThemeShadows,
    ThemeBorderRadius,
    Theme,
    ThemeName,
    ThemeState,
} from "../theme/types";

describe("Theme Types Module", () => {
    describe("ThemeColors Interface", () => {
        it("should create valid ThemeColors object", () => {
            const colors: ThemeColors = {
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
                    paused: "#6b7280",
                    mixed: "#f59e0b",
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
                    primary: "#1f2937",
                    secondary: "#6b7280",
                    tertiary: "#9ca3af",
                    inverse: "#ffffff",
                },
                border: {
                    primary: "#e5e7eb",
                    secondary: "#d1d5db",
                    focus: "#3b82f6",
                },
                surface: {
                    base: "#ffffff",
                    elevated: "#f9fafb",
                    overlay: "#00000080",
                },
                hover: {
                    light: "#f9fafb",
                    medium: "#f3f4f6",
                    dark: "#e5e7eb",
                },
            };

            // Test primary color palette
            expect(colors.primary[50]).toBe("#f0f9ff");
            expect(colors.primary[500]).toBe("#0ea5e9");
            expect(colors.primary[900]).toBe("#0c4a6e");

            // Test status colors
            expect(colors.status.up).toBe("#10b981");
            expect(colors.status.down).toBe("#ef4444");
            expect(colors.status.pending).toBe("#f59e0b");
            expect(colors.status.unknown).toBe("#6b7280");

            // Test semantic colors
            expect(colors.success).toBe("#10b981");
            expect(colors.warning).toBe("#f59e0b");
            expect(colors.error).toBe("#ef4444");

            // Test background colors
            expect(colors.background.primary).toBe("#ffffff");
            expect(colors.background.modal).toBe("#ffffff");

            // Test text colors
            expect(colors.text.primary).toBe("#1f2937");
            expect(colors.text.inverse).toBe("#ffffff");
        });
    });

    describe("ThemeSpacing Interface", () => {
        it("should create valid ThemeSpacing object", () => {
            const spacing: ThemeSpacing = {
                xs: "0.25rem",
                sm: "0.5rem",
                md: "1rem",
                lg: "1.5rem",
                xl: "2rem",
                "2xl": "3rem",
                "3xl": "4rem",
            };

            expect(spacing.xs).toBe("0.25rem");
            expect(spacing.sm).toBe("0.5rem");
            expect(spacing.md).toBe("1rem");
            expect(spacing.lg).toBe("1.5rem");
            expect(spacing.xl).toBe("2rem");
            expect(spacing["2xl"]).toBe("3rem");
            expect(spacing["3xl"]).toBe("4rem");
        });
    });

    describe("ThemeTypography Interface", () => {
        it("should create valid ThemeTypography object", () => {
            const typography: ThemeTypography = {
                fontFamily: {
                    sans: [
                        "Inter",
                        "system-ui",
                        "sans-serif",
                    ],
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
            };

            // Test font families
            expect(Array.isArray(typography.fontFamily.sans)).toBe(true);
            expect(typography.fontFamily.sans[0]).toBe("Inter");
            expect(Array.isArray(typography.fontFamily.mono)).toBe(true);

            // Test font sizes
            expect(typography.fontSize.xs).toBe("0.75rem");
            expect(typography.fontSize.base).toBe("1rem");
            expect(typography.fontSize["4xl"]).toBe("2.25rem");

            // Test font weights
            expect(typography.fontWeight.normal).toBe("400");
            expect(typography.fontWeight.bold).toBe("700");

            // Test line heights
            expect(typography.lineHeight.tight).toBe("1.25");
            expect(typography.lineHeight.relaxed).toBe("1.75");
        });
    });

    describe("ThemeShadows Interface", () => {
        it("should create valid ThemeShadows object", () => {
            const shadows: ThemeShadows = {
                sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
                md: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                lg: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                xl: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
                inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
            };

            expect(shadows.sm).toContain("0 1px 2px");
            expect(shadows.md).toContain("0 4px 6px");
            expect(shadows.lg).toContain("0 10px 15px");
            expect(shadows.xl).toContain("0 20px 25px");
            expect(shadows.inner).toContain("inset");
        });
    });

    describe("ThemeBorderRadius Interface", () => {
        it("should create valid ThemeBorderRadius object", () => {
            const borderRadius: ThemeBorderRadius = {
                none: "0",
                sm: "0.125rem",
                md: "0.375rem",
                lg: "0.5rem",
                xl: "0.75rem",
                full: "9999px",
            };

            expect(borderRadius.none).toBe("0");
            expect(borderRadius.sm).toBe("0.125rem");
            expect(borderRadius.md).toBe("0.375rem");
            expect(borderRadius.full).toBe("9999px");
        });
    });

    describe("Theme Interface", () => {
        it("should create valid Theme object", () => {
            const mockColors: ThemeColors = {
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
                    paused: "",
                    mixed: "",
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
                    primary: "#1f2937",
                    secondary: "#6b7280",
                    tertiary: "#9ca3af",
                    inverse: "#ffffff",
                },
                border: {
                    primary: "#e5e7eb",
                    secondary: "#d1d5db",
                    focus: "#3b82f6",
                },
                surface: {
                    base: "#ffffff",
                    elevated: "#f9fafb",
                    overlay: "#00000080",
                },
                hover: { light: "#f9fafb", medium: "#f3f4f6", dark: "#e5e7eb" },
            };

            const theme: Theme = {
                name: "Test Theme",
                colors: mockColors,
                spacing: {
                    xs: "0.25rem",
                    sm: "0.5rem",
                    md: "1rem",
                    lg: "1.5rem",
                    xl: "2rem",
                    "2xl": "3rem",
                    "3xl": "4rem",
                },
                typography: {
                    fontFamily: {
                        sans: ["Inter", "system-ui"],
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
                shadows: {
                    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
                    md: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    xl: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
                    inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
                },
                borderRadius: {
                    none: "0",
                    sm: "0.125rem",
                    md: "0.375rem",
                    lg: "0.5rem",
                    xl: "0.75rem",
                    full: "9999px",
                },
                isDark: false,
            };

            expect(theme.name).toBe("Test Theme");
            expect(theme.colors).toBe(mockColors);
            expect(theme.isDark).toBe(false);
            expect(theme.spacing.md).toBe("1rem");
            expect(theme.typography.fontSize.base).toBe("1rem");
        });

        it("should support dark theme", () => {
            const darkTheme: Partial<Theme> = {
                name: "Dark Theme",
                isDark: true,
            };

            expect(darkTheme.name).toBe("Dark Theme");
            expect(darkTheme.isDark).toBe(true);
        });
    });

    describe("ThemeName Type", () => {
        it("should support all theme names", () => {
            const themeNames: ThemeName[] = [
                "light",
                "dark",
                "high-contrast",
                "system",
                "custom",
            ];

            for (const name of themeNames) {
                expect(typeof name).toBe("string");
            }

            // Test individual values
            expect(themeNames).toContain("light");
            expect(themeNames).toContain("dark");
            expect(themeNames).toContain("high-contrast");
            expect(themeNames).toContain("system");
            expect(themeNames).toContain("custom");
        });
    });

    describe("ThemeState Interface", () => {
        it("should create valid ThemeState object", () => {
            const mockTheme: Theme = {
                name: "Light",
                colors: {} as ThemeColors,
                spacing: {} as ThemeSpacing,
                typography: {} as ThemeTypography,
                shadows: {} as ThemeShadows,
                borderRadius: {} as ThemeBorderRadius,
                isDark: false,
            };

            const themeState: ThemeState = {
                currentTheme: "light",
                customThemes: {
                    "custom-theme": mockTheme,
                },
                activeTheme: mockTheme,
                systemThemePreference: "light",
            };

            expect(themeState.currentTheme).toBe("light");
            expect(themeState.customThemes["custom-theme"]).toBe(mockTheme);
            expect(themeState.activeTheme).toBe(mockTheme);
            expect(themeState.systemThemePreference).toBe("light");
        });

        it("should support system theme preferences", () => {
            const lightState: Partial<ThemeState> = {
                systemThemePreference: "light",
            };

            const darkState: Partial<ThemeState> = {
                systemThemePreference: "dark",
            };

            expect(lightState.systemThemePreference).toBe("light");
            expect(darkState.systemThemePreference).toBe("dark");
        });

        it("should support custom themes", () => {
            const customTheme1: Theme = {
                name: "Custom 1",
                colors: {} as ThemeColors,
                spacing: {} as ThemeSpacing,
                typography: {} as ThemeTypography,
                shadows: {} as ThemeShadows,
                borderRadius: {} as ThemeBorderRadius,
                isDark: false,
            };

            const customTheme2: Theme = {
                name: "Custom 2",
                colors: {} as ThemeColors,
                spacing: {} as ThemeSpacing,
                typography: {} as ThemeTypography,
                shadows: {} as ThemeShadows,
                borderRadius: {} as ThemeBorderRadius,
                isDark: true,
            };

            const state: Partial<ThemeState> = {
                customThemes: {
                    custom1: customTheme1,
                    custom2: customTheme2,
                },
            };

            expect(state.customThemes?.["custom1"]).toBe(customTheme1);
            expect(state.customThemes?.["custom2"]).toBe(customTheme2);
            expect(state.customThemes?.["custom1"]?.isDark).toBe(false);
            expect(state.customThemes?.["custom2"]?.isDark).toBe(true);
        });
    });

    describe("Type Compatibility", () => {
        it("should allow ThemeColors in Theme", () => {
            const colors: ThemeColors = {
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
                    paused: "",
                    mixed: "",
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
                    primary: "#1f2937",
                    secondary: "#6b7280",
                    tertiary: "#9ca3af",
                    inverse: "#ffffff",
                },
                border: {
                    primary: "#e5e7eb",
                    secondary: "#d1d5db",
                    focus: "#3b82f6",
                },
                surface: {
                    base: "#ffffff",
                    elevated: "#f9fafb",
                    overlay: "#00000080",
                },
                hover: { light: "#f9fafb", medium: "#f3f4f6", dark: "#e5e7eb" },
            };

            const theme: Partial<Theme> = {
                colors,
            };

            expect(theme.colors).toBe(colors);
        });

        it("should allow Theme in ThemeState", () => {
            const theme: Theme = {
                name: "Test",
                colors: {} as ThemeColors,
                spacing: {} as ThemeSpacing,
                typography: {} as ThemeTypography,
                shadows: {} as ThemeShadows,
                borderRadius: {} as ThemeBorderRadius,
                isDark: false,
            };

            const state: Partial<ThemeState> = {
                activeTheme: theme,
            };

            expect(state.activeTheme).toBe(theme);
        });

        it("should allow ThemeName in ThemeState", () => {
            const themeName: ThemeName = "dark";
            const state: Partial<ThemeState> = {
                currentTheme: themeName,
            };

            expect(state.currentTheme).toBe("dark");
        });
    });

    describe("Color Value Validation", () => {
        it("should handle hex color values", () => {
            const colors: Partial<ThemeColors> = {
                success: "#10b981",
                error: "#ef4444",
                warning: "#f59e0b",
            };

            expect(colors.success).toMatch(/^#[\da-f]{6}$/i);
            expect(colors.error).toMatch(/^#[\da-f]{6}$/i);
            expect(colors.warning).toMatch(/^#[\da-f]{6}$/i);
        });

        it("should handle rgba color values", () => {
            const colors: Partial<ThemeColors> = {
                surface: {
                    overlay: "rgba(0, 0, 0, 0.5)",
                    base: "#ffffff",
                    elevated: "#f9fafb",
                },
            };

            expect(colors.surface?.overlay).toContain("rgba");
        });
    });

    describe("Nested Structure Validation", () => {
        it("should handle nested color structures", () => {
            const primary = {
                50: "#f0f9ff",
                500: "#0ea5e9",
                900: "#0c4a6e",
            };

            expect(typeof primary[50]).toBe("string");
            expect(typeof primary[500]).toBe("string");
            expect(typeof primary[900]).toBe("string");
        });

        it("should handle nested font structures", () => {
            const typography: Partial<ThemeTypography> = {
                fontFamily: {
                    sans: ["Inter", "system-ui"],
                    mono: ["JetBrains Mono"],
                },
            };

            expect(Array.isArray(typography.fontFamily?.sans)).toBe(true);
            expect(Array.isArray(typography.fontFamily?.mono)).toBe(true);
        });
    });
});
