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
 * - Theme app and switching
 * - CSS variable generation from theme objects
 * - Custom theme creation and merging
 * - System theme preference detection
 * - Theme validation and edge cases
 * - DOM integration and style app
 * - Performance characteristics under load
 */

/* Property-based tests require magic numbers and flexible object validation */

import { test as fcTest } from "@fast-check/vitest";
import * as fc from "fast-check";
import { arrayAt, arrayFirst, stringSplit } from "ts-extras";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type {
    Theme,
    ThemeBorderRadius,
    ThemeColors,
    ThemeName,
    ThemeShadows,
    ThemeSpacing,
    ThemeTypography,
} from "../../theme/types";

import { ThemeManager } from "../../theme/ThemeManager";
import { themes } from "../../theme/themes";

// Mock DOM environment for testing
const mockDocument = {
    body: {
        classList: {
            add: vi.fn(),
            contains: vi.fn().mockReturnValue(false),
            remove: vi.fn(),
        },
    },
    documentElement: {
        classList: {
            add: vi.fn(),
            contains: vi.fn().mockReturnValue(false),
            remove: vi.fn(),
        },
        style: {
            removeProperty: vi.fn(),
            setProperty: vi.fn(),
        },
    },
};

const mockWindow = {
    matchMedia: vi.fn(() => ({
        addEventListener: vi.fn(),
        matches: false,
        removeEventListener: vi.fn(),
    })),
};

// Arbitraries for theme generation
const colorArbitrary = fc
    .tuple(
        fc.integer({ max: 255, min: 0 }),
        fc.integer({ max: 255, min: 0 }),
        fc.integer({ max: 255, min: 0 })
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
    white: colorArbitrary,
});

const fontSizeArbitrary = fc.record({
    "2xl": fc.string({ maxLength: 8, minLength: 4 }).map((s) => `${s}rem`),
    "3xl": fc.string({ maxLength: 8, minLength: 4 }).map((s) => `${s}rem`),
    "4xl": fc.string({ maxLength: 8, minLength: 4 }).map((s) => `${s}rem`),
    base: fc.string({ maxLength: 6, minLength: 3 }).map((s) => `${s}rem`),
    lg: fc.string({ maxLength: 6, minLength: 3 }).map((s) => `${s}rem`),
    sm: fc.string({ maxLength: 6, minLength: 3 }).map((s) => `${s}rem`),
    xl: fc.string({ maxLength: 6, minLength: 3 }).map((s) => `${s}rem`),
    xs: fc.string({ maxLength: 6, minLength: 3 }).map((s) => `${s}rem`),
});

const fontWeightArbitrary = fc.record({
    bold: fc.constantFrom("700", "800", "900"),
    medium: fc.constantFrom("500", "600"),
    normal: fc.constantFrom("400", "300"),
    semibold: fc.constantFrom("600", "700"),
});

const lineHeightArbitrary = fc.record({
    normal: fc.float({ max: 2, min: 1 }).map((n) => n.toString()),
    relaxed: fc.float({ max: 2.5, min: 1.5 }).map((n) => n.toString()),
    tight: fc.float({ max: 1.5, min: 1 }).map((n) => n.toString()),
});

const fontFamilyArbitrary = fc.record({
    mono: fc.array(fc.string({ maxLength: 15, minLength: 5 }), {
        maxLength: 3,
        minLength: 1,
    }),
    sans: fc.array(fc.string({ maxLength: 15, minLength: 5 }), {
        maxLength: 3,
        minLength: 1,
    }),
});

const themeTypographyArbitrary: fc.Arbitrary<ThemeTypography> = fc.record({
    fontFamily: fontFamilyArbitrary,
    fontSize: fontSizeArbitrary,
    fontWeight: fontWeightArbitrary,
    lineHeight: lineHeightArbitrary,
});

const spacingValueArbitrary = fc
    .integer({ max: 100, min: 1 })
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

const shadowArbitrary = fc.string({ maxLength: 50, minLength: 10 });
const themeShadowsArbitrary: fc.Arbitrary<ThemeShadows> = fc.record({
    inner: shadowArbitrary,
    lg: shadowArbitrary,
    md: shadowArbitrary,
    sm: shadowArbitrary,
    xl: shadowArbitrary,
});

const borderRadiusArbitrary = fc
    .integer({ max: 50, min: 0 })
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
    borderRadius: themeBorderRadiusArbitrary,
    colors: themeColorsArbitrary,
    isDark: fc.boolean(),
    name: fc.string({ maxLength: 20, minLength: 3 }),
    shadows: themeShadowsArbitrary,
    spacing: themeSpacingArbitrary,
    typography: themeTypographyArbitrary,
});

const validThemeNameArbitrary: fc.Arbitrary<ThemeName> = fc.constantFrom(
    "light",
    "dark",
    "high-contrast",
    "system"
);

describe("themeManager Property-Based Tests", () => {
    let themeManager: ThemeManager;
    let originalDocument: typeof document;
    let originalMatchMedia: typeof globalThis.matchMedia;
    let originalWindow: typeof window;

    beforeEach(() => {
        // Mock DOM environment
        originalDocument = document;
        originalMatchMedia = globalThis.matchMedia;
        originalWindow = globalThis.window;
        globalThis.document = mockDocument as any;
        globalThis.window = mockWindow as any;
        globalThis.matchMedia = mockWindow.matchMedia as any;

        // Reset singleton instance after the mocked browser APIs are installed.
        (ThemeManager as any).instance = undefined;
        themeManager = ThemeManager.getInstance();

        // Clear all mocks
        vi.clearAllMocks();
    });

    afterEach(() => {
        // Restore original environment
        globalThis.document = originalDocument;
        globalThis.matchMedia = originalMatchMedia;
        globalThis.window = originalWindow;
        vi.clearAllMocks();
    });

    fcTest.prop([completeThemeArbitrary])(
        "should successfully apply any valid theme to DOM",
        (theme) => {
            // Apply theme should not throw and should call style setProperty
            expect(() => {
                themeManager.applyTheme(theme);
            }).not.toThrow();

            // Verify CSS properties were set
            expect(
                mockDocument.documentElement.style.setProperty
            ).toHaveBeenCalled();

            // Verify color properties were applied
            const setPropertyCalls = (
                mockDocument.documentElement.style.setProperty as any
            ).mock.calls;
            const colorCalls = setPropertyCalls.filter((call: any[]) =>
                arrayFirst(call).startsWith("--color-")
            );

            expect(colorCalls.length).toBeGreaterThan(0);
        }
    );

    fcTest.prop([completeThemeArbitrary])(
        "should generate valid CSS variables for any theme",
        (theme) => {
            const cssVariables = themeManager.generateCSSVariables(theme);

            // Should return a string
            expect(cssVariables).toBeTypeOf("string");

            // Should start with :root
            expect(cssVariables).toMatch(/^:root\s*\{/v);

            // Should end with closing brace
            expect(cssVariables).toMatch(/\}\s*$/v);

            // Should contain CSS custom properties
            expect(cssVariables).toMatch(/--[\w-]+:/u);

            // Should contain color variables
            expect(cssVariables).toMatch(/--color-/v);

            // Should contain typography variables
            expect(cssVariables).toMatch(/--font-/v);

            // Should contain spacing variables
            expect(cssVariables).toMatch(/--spacing-/v);
        }
    );

    fcTest.prop([
        completeThemeArbitrary,
        fc.record(
            {
                colors: fc.record(
                    {
                        primary: fc.record({ 500: colorArbitrary }),
                    },
                    { requiredKeys: [] }
                ),
                isDark: fc.boolean(),
                name: fc.string({ maxLength: 50, minLength: 1 }),
            },
            { requiredKeys: [] }
        ),
    ])(
        "should create custom themes with proper deep merging",
        (baseTheme, overrides) => {
            const runtimeOverrides = overrides as unknown as Partial<Theme>;
            const customTheme = themeManager.createCustomTheme(
                baseTheme,
                runtimeOverrides
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
            expect(theme).toBeTypeOf("object");
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
                expect(availableThemes).toContain(potentialThemeName);
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
                addEventListener: vi.fn(),
                matches: isDarkMode,
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
        fc.array(completeThemeArbitrary, { maxLength: 20, minLength: 5 }),
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

            expect(cleanup).toBeTypeOf("function");
            expect(mockWindow.matchMedia).toHaveBeenCalledWith(
                "(prefers-color-scheme: dark)"
            );

            // Cleanup should not throw
            expect(() => {
                cleanup();
            }).not.toThrow();
        }
    );

    fcTest.prop([completeThemeArbitrary])(
        "should generate CSS variables with proper format and values",
        (theme) => {
            const cssVariables = themeManager.generateCSSVariables(theme);

            // Split into lines and check format
            const lines = stringSplit(cssVariables, "\n").filter(
                (line) => line.trim().length > 0
            );

            // First line should be :root {
            expect(arrayFirst(lines)!.trim()).toBe(":root {");

            // Last line should be }
            expect(arrayAt(lines, -1)!.trim()).toBe("}");

            // Middle lines should be CSS variables
            const variableLines = lines.slice(1, -1);
            for (const line of variableLines) {
                expect(line).toMatch(
                    /^\s+--[\w-]+:\s*(?:\S.*|[\t\v\f \xA0\u{1680}\u{2000}-\u{200A}\u{202F}\u{205F}\u{3000}\u{FEFF}]);$/u
                );
            }

            // Should contain expected variable types
            expect(cssVariables).toMatch(/--color-background-primary/v);
            expect(cssVariables).toMatch(/--font-size-base/v);
            expect(cssVariables).toMatch(/--spacing-md/v);
            expect(cssVariables).toMatch(/--shadow-md/v);
            expect(cssVariables).toMatch(/--radius-md/v);
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
        globalThis.document = undefined as any;

        const theme = themes.light;

        expect(() => {
            themeManager.applyTheme(theme);
        }).not.toThrow();
    });

    it("should handle missing window gracefully", () => {
        globalThis.window = undefined as any;

        const preference = themeManager.getSystemThemePreference();

        expect(preference).toBe("light");

        const cleanup = themeManager.onSystemThemeChange(vi.fn());

        expect(cleanup).toBeTypeOf("function");
    });
});
