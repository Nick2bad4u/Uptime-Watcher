/**
 * Property-based tests for ThemeManager using fast-check fuzzing.
 *
 * @remarks
 * These tests use property-based testing to validate ThemeManager functionality
 * across a comprehensive range of inputs, including theme switching, CSS
 * variable generation, custom theme creation, and system preference handling.
 *
 * Test Coverage:
 *
 * - Theme application and switching
 * - CSS variable generation from theme objects
 * - Custom theme creation and merging
 * - System theme preference detection
 * - Theme validation and edge cases
 * - DOM integration and style application
 * - Performance characteristics under load
 */

/* Property-based tests require magic numbers and flexible object validation */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { test as fcTest } from "@fast-check/vitest";
import * as fc from "fast-check";

import { ThemeManager } from "./ThemeManager";
import type {
    Theme,
    ThemeName,
    ThemeColors,
    ThemeTypography,
    ThemeSpacing,
    ThemeShadows,
    ThemeBorderRadius,
} from "./types";
import { themes } from "./themes";

// Mock DOM environment for testing
const mockDocument = {
    documentElement: {
        style: {
            setProperty: vi.fn(),
            removeProperty: vi.fn(),
        },
        classList: {
            add: vi.fn(),
            remove: vi.fn(),
            contains: vi.fn().mockReturnValue(false),
        },
    },
    body: {
        classList: {
            add: vi.fn(),
            remove: vi.fn(),
            contains: vi.fn().mockReturnValue(false),
        },
    },
};

const mockWindow = {
    matchMedia: vi.fn(() => ({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
    })),
};

// Arbitraries for theme generation
const colorArbitrary = fc
    .tuple(
        fc.integer({ min: 0, max: 255 }),
        fc.integer({ min: 0, max: 255 }),
        fc.integer({ min: 0, max: 255 })
    )
    .map(
        ([
            r,
            g,
            b,
        ]) =>
            `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`
    );

const backgroundColorsArbitrary = fc.record({
    modal: colorArbitrary,
    primary: colorArbitrary,
    secondary: colorArbitrary,
    tertiary: colorArbitrary,
});

const borderColorsArbitrary = fc.record({
    focus: colorArbitrary,
    primary: colorArbitrary,
    secondary: colorArbitrary,
});

const hoverColorsArbitrary = fc.record({
    dark: colorArbitrary,
    light: colorArbitrary,
    medium: colorArbitrary,
});

const primaryColorsArbitrary = fc.record({
    50: colorArbitrary,
    100: colorArbitrary,
    200: colorArbitrary,
    300: colorArbitrary,
    400: colorArbitrary,
    500: colorArbitrary,
    600: colorArbitrary,
    700: colorArbitrary,
    800: colorArbitrary,
    900: colorArbitrary,
});

const statusColorsArbitrary = fc.record({
    degraded: colorArbitrary,
    down: colorArbitrary,
    mixed: colorArbitrary,
    paused: colorArbitrary,
    pending: colorArbitrary,
    unknown: colorArbitrary,
    up: colorArbitrary,
});

const surfaceColorsArbitrary = fc.record({
    base: colorArbitrary,
    elevated: colorArbitrary,
    overlay: colorArbitrary,
});

const shadowColorsArbitrary = fc.record({
    degraded: colorArbitrary,
    error: colorArbitrary,
    paused: colorArbitrary,
    success: colorArbitrary,
    warning: colorArbitrary,
});

const textColorsArbitrary = fc.record({
    inverse: colorArbitrary,
    primary: colorArbitrary,
    secondary: colorArbitrary,
    tertiary: colorArbitrary,
});

const themeColorsArbitrary: fc.Arbitrary<ThemeColors> = fc.record({
    background: backgroundColorsArbitrary,
    border: borderColorsArbitrary,
    error: colorArbitrary,
    errorAlert: colorArbitrary,
    hover: hoverColorsArbitrary,
    info: colorArbitrary,
    primary: primaryColorsArbitrary,
    shadows: shadowColorsArbitrary,
    status: statusColorsArbitrary,
    success: colorArbitrary,
    surface: surfaceColorsArbitrary,
    text: textColorsArbitrary,
    warning: colorArbitrary,
});

const fontSizeArbitrary = fc.record({
    "2xl": fc.string({ minLength: 4, maxLength: 8 }).map((s) => `${s}rem`),
    "3xl": fc.string({ minLength: 4, maxLength: 8 }).map((s) => `${s}rem`),
    "4xl": fc.string({ minLength: 4, maxLength: 8 }).map((s) => `${s}rem`),
    base: fc.string({ minLength: 3, maxLength: 6 }).map((s) => `${s}rem`),
    lg: fc.string({ minLength: 3, maxLength: 6 }).map((s) => `${s}rem`),
    sm: fc.string({ minLength: 3, maxLength: 6 }).map((s) => `${s}rem`),
    xl: fc.string({ minLength: 3, maxLength: 6 }).map((s) => `${s}rem`),
    xs: fc.string({ minLength: 3, maxLength: 6 }).map((s) => `${s}rem`),
});

const fontWeightArbitrary = fc.record({
    bold: fc.constantFrom("700", "800", "900"),
    medium: fc.constantFrom("500", "600"),
    normal: fc.constantFrom("400", "300"),
    semibold: fc.constantFrom("600", "700"),
});

const lineHeightArbitrary = fc.record({
    normal: fc.float({ min: 1, max: 2 }).map((n) => n.toString()),
    relaxed: fc.float({ min: 1.5, max: 2.5 }).map((n) => n.toString()),
    tight: fc.float({ min: 1, max: 1.5 }).map((n) => n.toString()),
});

const fontFamilyArbitrary = fc.record({
    mono: fc.array(fc.string({ minLength: 5, maxLength: 15 }), {
        minLength: 1,
        maxLength: 3,
    }),
    sans: fc.array(fc.string({ minLength: 5, maxLength: 15 }), {
        minLength: 1,
        maxLength: 3,
    }),
});

const themeTypographyArbitrary: fc.Arbitrary<ThemeTypography> = fc.record({
    fontFamily: fontFamilyArbitrary,
    fontSize: fontSizeArbitrary,
    fontWeight: fontWeightArbitrary,
    lineHeight: lineHeightArbitrary,
});

const spacingValueArbitrary = fc
    .integer({ min: 1, max: 100 })
    .map((n) => `${n}rem`);
const themeSpacingArbitrary: fc.Arbitrary<ThemeSpacing> = fc.record({
    "2xl": spacingValueArbitrary,
    "3xl": spacingValueArbitrary,
    lg: spacingValueArbitrary,
    md: spacingValueArbitrary,
    sm: spacingValueArbitrary,
    xl: spacingValueArbitrary,
    xs: spacingValueArbitrary,
});

const shadowArbitrary = fc.string({ minLength: 10, maxLength: 50 });
const themeShadowsArbitrary: fc.Arbitrary<ThemeShadows> = fc.record({
    inner: shadowArbitrary,
    lg: shadowArbitrary,
    md: shadowArbitrary,
    sm: shadowArbitrary,
    xl: shadowArbitrary,
});

const borderRadiusArbitrary = fc
    .integer({ min: 0, max: 50 })
    .map((n) => (n === 0 ? "0" : `${n}px`));
const themeBorderRadiusArbitrary: fc.Arbitrary<ThemeBorderRadius> = fc.record({
    full: fc.constant("9999px"),
    lg: borderRadiusArbitrary,
    md: borderRadiusArbitrary,
    none: fc.constant("0"),
    sm: borderRadiusArbitrary,
    xl: borderRadiusArbitrary,
});

const completeThemeArbitrary: fc.Arbitrary<Theme> = fc.record({
    name: fc.string({ minLength: 3, maxLength: 20 }),
    isDark: fc.boolean(),
    colors: themeColorsArbitrary,
    typography: themeTypographyArbitrary,
    spacing: themeSpacingArbitrary,
    shadows: themeShadowsArbitrary,
    borderRadius: themeBorderRadiusArbitrary,
});

const validThemeNameArbitrary: fc.Arbitrary<ThemeName> = fc.constantFrom(
    "light",
    "dark",
    "high-contrast",
    "system"
);

describe("ThemeManager Property-Based Tests", () => {
    let themeManager: ThemeManager;
    let originalDocument: typeof document;
    let originalWindow: typeof window;

    beforeEach(() => {
        // Reset singleton instance
        (ThemeManager as any).instance = undefined;
        themeManager = ThemeManager.getInstance();

        // Mock DOM environment
        originalDocument = global.document;
        originalWindow = global.window;
        global.document = mockDocument as any;
        global.window = mockWindow as any;

        // Clear all mocks
        vi.clearAllMocks();
    });

    afterEach(() => {
        // Restore original environment
        global.document = originalDocument;
        global.window = originalWindow;
        vi.clearAllMocks();
    });

    fcTest.prop([completeThemeArbitrary])(
        "should successfully apply any valid theme to DOM",
        (theme) => {
            // Apply theme should not throw and should call style setProperty
            expect(() => themeManager.applyTheme(theme)).not.toThrow();

            // Verify CSS properties were set
            expect(
                mockDocument.documentElement.style.setProperty
            ).toHaveBeenCalled();

            // Verify color properties were applied
            const setPropertyCalls = (
                mockDocument.documentElement.style.setProperty as any
            ).mock.calls;
            const colorCalls = setPropertyCalls.filter((call: any[]) =>
                call[0].startsWith("--color-")
            );
            expect(colorCalls.length).toBeGreaterThan(0);
        }
    );

    fcTest.prop([completeThemeArbitrary])(
        "should generate valid CSS variables for any theme",
        (theme) => {
            const cssVariables = themeManager.generateCSSVariables(theme);

            // Should return a string
            expect(typeof cssVariables).toBe("string");

            // Should start with :root
            expect(cssVariables).toMatch(/^:root\s*{/);

            // Should end with closing brace
            expect(cssVariables).toMatch(/}\s*$/);

            // Should contain CSS custom properties
            expect(cssVariables).toMatch(/--[\w-]+:/);

            // Should contain color variables
            expect(cssVariables).toMatch(/--color-/);

            // Should contain typography variables
            expect(cssVariables).toMatch(/--font-/);

            // Should contain spacing variables
            expect(cssVariables).toMatch(/--spacing-/);
        }
    );

    fcTest.prop([
        completeThemeArbitrary,
        fc.record(
            {
                name: fc.string({ minLength: 1, maxLength: 50 }),
                isDark: fc.boolean(),
                colors: fc.record(
                    {
                        primary: fc.record({ 500: colorArbitrary }),
                    },
                    { requiredKeys: [] }
                ),
            },
            { requiredKeys: [] }
        ),
    ])(
        "should create custom themes with proper deep merging",
        (baseTheme, overrides) => {
            const customTheme = themeManager.createCustomTheme(
                baseTheme,
                // @ts-expect-error - Fuzzing test with intentionally partial theme data for edge case testing
                overrides
            );

            // Result should be a complete theme
            expect(customTheme).toHaveProperty("name");
            expect(customTheme).toHaveProperty("isDark");
            expect(customTheme).toHaveProperty("colors");
            expect(customTheme).toHaveProperty("typography");
            expect(customTheme).toHaveProperty("spacing");
            expect(customTheme).toHaveProperty("shadows");
            expect(customTheme).toHaveProperty("borderRadius");

            // Override properties should be applied
            if (overrides.name) {
                expect(customTheme.name).toBe(overrides.name);
            }
            if (typeof overrides.isDark === "boolean") {
                expect(customTheme.isDark).toBe(overrides.isDark);
            }

            // Non-overridden properties should be preserved
            if (!(overrides as any).typography) {
                expect(customTheme.typography).toEqual(baseTheme.typography);
            }
        }
    );

    fcTest.prop([validThemeNameArbitrary])(
        "should retrieve valid themes for all theme names",
        (themeName) => {
            const theme = themeManager.getTheme(themeName);

            expect(theme).toBeDefined();
            expect(typeof theme).toBe("object");
            expect(theme).toHaveProperty("name");
            expect(theme).toHaveProperty("isDark");
            expect(theme).toHaveProperty("colors");
            expect(theme).toHaveProperty("typography");
            expect(theme).toHaveProperty("spacing");
            expect(theme).toHaveProperty("shadows");
            expect(theme).toHaveProperty("borderRadius");

            // System theme should resolve to light or dark
            if (themeName === "system") {
                expect(["light", "dark"]).toContain(theme.name);
            } else {
                expect(theme.name).toBe(themeName);
            }
        }
    );

    fcTest.prop([fc.string()])(
        "should properly validate theme names",
        (potentialThemeName) => {
            const isValid = themeManager.isValidThemeName(potentialThemeName);
            const availableThemes = themeManager.getAvailableThemes();

            if (isValid) {
                expect(availableThemes).toContain(
                    potentialThemeName as ThemeName
                );
            } else {
                expect(availableThemes).not.toContain(
                    potentialThemeName as ThemeName
                );
            }
        }
    );

    fcTest.prop([fc.boolean()])(
        "should handle system theme preference detection",
        (isDarkMode) => {
            // Mock matchMedia response
            (mockWindow.matchMedia as any).mockReturnValue({
                matches: isDarkMode,
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
            });

            const preference = themeManager.getSystemThemePreference();
            expect(preference).toBe(isDarkMode ? "dark" : "light");
        }
    );

    fcTest.prop([completeThemeArbitrary, completeThemeArbitrary])(
        "should optimize theme application by avoiding redundant applications",
        (theme1, theme2) => {
            // Apply first theme
            themeManager.applyTheme(theme1);
            const firstCallCount = (
                mockDocument.documentElement.style.setProperty as any
            ).mock.calls.length;

            // Apply same theme again (should be optimized away)
            themeManager.applyTheme(theme1);
            const secondCallCount = (
                mockDocument.documentElement.style.setProperty as any
            ).mock.calls.length;

            // Should not have made additional calls for same theme
            expect(secondCallCount).toBe(firstCallCount);

            // Apply different theme (should make new calls)
            themeManager.applyTheme(theme2);
            const thirdCallCount = (
                mockDocument.documentElement.style.setProperty as any
            ).mock.calls.length;

            // Should have made additional calls for different theme
            if (
                JSON.stringify(theme1.colors) !==
                    JSON.stringify(theme2.colors) ||
                theme1.name !== theme2.name ||
                theme1.isDark !== theme2.isDark
            ) {
                expect(thirdCallCount).toBeGreaterThan(secondCallCount);
            }
        }
    );

    fcTest.prop([
        fc.array(completeThemeArbitrary, { minLength: 5, maxLength: 20 }),
    ])(
        "should handle multiple rapid theme switches without errors",
        (themes) => {
            expect(() => {
                for (const theme of themes) {
                    themeManager.applyTheme(theme);
                }
            }).not.toThrow();

            // Should have called setProperty for each unique theme
            expect(
                mockDocument.documentElement.style.setProperty
            ).toHaveBeenCalled();
        }
    );

    fcTest.prop([fc.constant(null)])(
        "should handle system theme change listeners",
        () => {
            const callback = vi.fn();

            // Register listener
            const cleanup = themeManager.onSystemThemeChange(callback);

            expect(typeof cleanup).toBe("function");
            expect(mockWindow.matchMedia).toHaveBeenCalledWith(
                "(prefers-color-scheme: dark)"
            );

            // Cleanup should not throw
            expect(() => cleanup()).not.toThrow();
        }
    );

    fcTest.prop([completeThemeArbitrary])(
        "should generate CSS variables with proper format and values",
        (theme) => {
            const cssVariables = themeManager.generateCSSVariables(theme);

            // Split into lines and check format
            const lines = cssVariables
                .split("\n")
                .filter((line) => line.trim().length > 0);

            // First line should be :root {
            expect(lines[0]!.trim()).toBe(":root {");

            // Last line should be }
            expect(lines.at(-1)!.trim()).toBe("}");

            // Middle lines should be CSS variables
            const variableLines = lines.slice(1, -1);
            for (const line of variableLines) {
                expect(line).toMatch(/^\s+--[\w-]+:\s*.+;$/);
            }

            // Should contain expected variable types
            expect(cssVariables).toMatch(/--color-background-primary/);
            expect(cssVariables).toMatch(/--font-size-base/);
            expect(cssVariables).toMatch(/--spacing-md/);
            expect(cssVariables).toMatch(/--shadow-md/);
            expect(cssVariables).toMatch(/--radius-md/);
        }
    );

    fcTest.prop([fc.constant(null)])(
        "should maintain singleton pattern",
        () => {
            const instance1 = ThemeManager.getInstance();
            const instance2 = ThemeManager.getInstance();

            expect(instance1).toBe(instance2);
            expect(instance1).toBe(themeManager);
        }
    );

    it("should handle missing document gracefully", () => {
        global.document = undefined as any;

        const theme = themes.light;
        expect(() => themeManager.applyTheme(theme)).not.toThrow();
    });

    it("should handle missing window gracefully", () => {
        global.window = undefined as any;

        const preference = themeManager.getSystemThemePreference();
        expect(preference).toBe("light");

        const cleanup = themeManager.onSystemThemeChange(vi.fn());
        expect(typeof cleanup).toBe("function");
    });
});
