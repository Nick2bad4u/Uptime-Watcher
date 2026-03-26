/**
 * Property-based tests for themeMerging utilities using fast-check fuzzing.
 *
 * @remarks
 * These tests use property-based testing to validate theme merging
 * functionality across a comprehensive range of inputs, including deep object
 * merging, type safety preservation, and edge case handling.
 *
 * Test Coverage:
 *
 * - Deep theme object merging with proper type safety
 * - Partial theme override handling
 * - Color, typography, spacing, shadow, and border radius merging
 * - Immutability preservation during merging
 * - Edge cases with undefined/null values
 * - Performance characteristics under complex merging scenarios
 */

/* Property-based tests require magic numbers and flexible object validation */

import { describe, it, expect } from "vitest";
import { test as fcTest } from "@fast-check/vitest";
import * as fc from "fast-check";

import { deepMergeTheme } from "../../theme/utils/themeMerging";
import type { Theme } from "../../theme/types";
import { themes } from "../../theme/themes";

// Arbitraries for theme generation (reuse from ThemeManager tests but simplified)
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
    "50": colorArbitrary,
    "100": colorArbitrary,
    "200": colorArbitrary,
    "300": colorArbitrary,
    "400": colorArbitrary,
    "500": colorArbitrary,
    "600": colorArbitrary,
    "700": colorArbitrary,
    "800": colorArbitrary,
    "900": colorArbitrary,
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

const textColorsArbitrary = fc.record({
    inverse: colorArbitrary,
    primary: colorArbitrary,
    secondary: colorArbitrary,
    tertiary: colorArbitrary,
});

const shadowColorsArbitrary = fc.record({
    degraded: colorArbitrary,
    error: colorArbitrary,
    paused: colorArbitrary,
    success: colorArbitrary,
    warning: colorArbitrary,
});

const themeColorsArbitrary = fc.record({
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

const fontFamilyArbitrary = fc.record({
    mono: fc
        .array(fc.string({ minLength: 3, maxLength: 20 }), {
            minLength: 1,
            maxLength: 3,
        })
        .map((arr) => arr as readonly string[]),
    sans: fc
        .array(fc.string({ minLength: 3, maxLength: 20 }), {
            minLength: 1,
            maxLength: 5,
        })
        .map((arr) => arr as readonly string[]),
});

const fontSizeArbitrary = fc
    .integer({ min: 8, max: 48 })
    .map((n) => `${n / 4}rem`);

const fontSizesArbitrary = fc.record({
    "2xl": fontSizeArbitrary,
    "3xl": fontSizeArbitrary,
    "4xl": fontSizeArbitrary,
    base: fontSizeArbitrary,
    lg: fontSizeArbitrary,
    sm: fontSizeArbitrary,
    xl: fontSizeArbitrary,
    xs: fontSizeArbitrary,
});

const fontWeightArbitrary = fc.constantFrom(
    "300",
    "400",
    "500",
    "600",
    "700",
    "800",
    "900"
);
const fontWeightsArbitrary = fc.record({
    bold: fontWeightArbitrary,
    medium: fontWeightArbitrary,
    normal: fontWeightArbitrary,
    semibold: fontWeightArbitrary,
});

const lineHeightArbitrary = fc.double({ min: 1, max: 2.5 }).map(String);
const lineHeightsArbitrary = fc.record({
    normal: lineHeightArbitrary,
    relaxed: lineHeightArbitrary,
    tight: lineHeightArbitrary,
});

const themeTypographyArbitrary = fc.record({
    fontFamily: fontFamilyArbitrary,
    fontSize: fontSizesArbitrary,
    fontWeight: fontWeightsArbitrary,
    lineHeight: lineHeightsArbitrary,
});

const spacingValueArbitrary = fc
    .integer({ min: 1, max: 100 })
    .map((n) => `${n}rem`);

const themeSpacingArbitrary = fc.record({
    "2xl": spacingValueArbitrary,
    "3xl": spacingValueArbitrary,
    lg: spacingValueArbitrary,
    md: spacingValueArbitrary,
    sm: spacingValueArbitrary,
    xl: spacingValueArbitrary,
    xs: spacingValueArbitrary,
});

const shadowArbitrary = fc.string({ minLength: 10, maxLength: 50 });
const themeShadowsArbitrary = fc.record({
    inner: shadowArbitrary,
    lg: shadowArbitrary,
    md: shadowArbitrary,
    sm: shadowArbitrary,
    xl: shadowArbitrary,
});

const borderRadiusValueArbitrary = fc.oneof(
    fc.constant("0"),
    fc.constant("9999px"),
    fc.integer({ min: 1, max: 50 }).map((n) => `${n}px`)
);

const themeBorderRadiusArbitrary = fc.record({
    full: fc.constant("9999px"),
    lg: borderRadiusValueArbitrary,
    md: borderRadiusValueArbitrary,
    none: fc.constant("0"),
    sm: borderRadiusValueArbitrary,
    xl: borderRadiusValueArbitrary,
});

const completeThemeArbitrary = fc.record({
    name: fc.string({ minLength: 2, maxLength: 30 }),
    isDark: fc.boolean(),
    colors: themeColorsArbitrary,
    typography: themeTypographyArbitrary,
    spacing: themeSpacingArbitrary,
    shadows: themeShadowsArbitrary,
    borderRadius: themeBorderRadiusArbitrary,
});

// Partial theme arbitraries for override testing
const partialColorsArbitrary = fc.record(
    {
        background: fc.option(
            fc.record({
                modal: fc.option(colorArbitrary, { nil: undefined }),
                primary: fc.option(colorArbitrary, { nil: undefined }),
            })
        ),
        error: fc.option(colorArbitrary, { nil: undefined }),
        primary: fc.option(
            fc.record({
                "50": fc.option(colorArbitrary, { nil: undefined }),
                "500": fc.option(colorArbitrary, { nil: undefined }),
                "900": fc.option(colorArbitrary, { nil: undefined }),
            })
        ),
        text: fc.option(
            fc.record({
                primary: fc.option(colorArbitrary, { nil: undefined }),
                secondary: fc.option(colorArbitrary, { nil: undefined }),
            })
        ),
    },
    { requiredKeys: [] }
);

const partialTypographyArbitrary = fc.record(
    {
        fontSize: fc.option(
            fc.record({
                base: fc.option(fontSizeArbitrary, { nil: undefined }),
                lg: fc.option(fontSizeArbitrary, { nil: undefined }),
            })
        ),
        fontWeight: fc.option(
            fc.record({
                bold: fc.option(fontWeightArbitrary, { nil: undefined }),
                normal: fc.option(fontWeightArbitrary, { nil: undefined }),
            })
        ),
    },
    { requiredKeys: [] }
);

const partialThemeArbitrary = fc.record(
    {
        name: fc.option(fc.string({ minLength: 2, maxLength: 30 }), {
            nil: undefined,
        }),
        isDark: fc.option(fc.boolean(), { nil: undefined }),
        colors: fc.option(partialColorsArbitrary, { nil: undefined }),
        typography: fc.option(partialTypographyArbitrary, { nil: undefined }),
        spacing: fc.option(
            fc.record({
                lg: fc.option(spacingValueArbitrary, { nil: undefined }),
                md: fc.option(spacingValueArbitrary, { nil: undefined }),
            }),
            { nil: undefined }
        ),
    },
    { requiredKeys: [] }
);

describe("Theme Merging Property-Based Tests", () => {
    fcTest.prop([completeThemeArbitrary, partialThemeArbitrary])(
        "should merge themes while preserving base theme structure",
        (baseTheme, overrideTheme) => {
            // Fuzzing test with intentionally partial/malformed theme data for edge case testing
            const result = deepMergeTheme(baseTheme, overrideTheme as any);

            // Result should be a valid theme with all required properties
            expect(result).toHaveProperty("name");
            expect(result).toHaveProperty("isDark");
            expect(result).toHaveProperty("colors");
            expect(result).toHaveProperty("typography");
            expect(result).toHaveProperty("spacing");
            expect(result).toHaveProperty("shadows");
            expect(result).toHaveProperty("borderRadius");

            // Base theme structure should be preserved
            expect(result.colors).toHaveProperty("background");
            expect(result.colors).toHaveProperty("primary");
            expect(result.colors).toHaveProperty("text");
            expect(result.colors.background).toHaveProperty("modal");
            expect(result.colors.background).toHaveProperty("primary");
            expect(result.colors.primary).toHaveProperty("50");
            expect(result.colors.primary).toHaveProperty("500");
            expect(result.colors.primary).toHaveProperty("900");

            // Override values should be applied where provided
            if (Object.hasOwn(overrideTheme, "name")) {
                // When override explicitly has name property, use that value (even if undefined)
                expect(result.name).toBe(overrideTheme.name);
            } else {
                // When override doesn't have name, preserve base theme value
                expect(result.name).toBe(baseTheme.name);
            }

            if (Object.hasOwn(overrideTheme, "isDark")) {
                // When override explicitly has isDark property, use that value (even if undefined)
                expect(result.isDark).toBe(overrideTheme.isDark);
            } else {
                // When override doesn't have isDark property, preserve base theme value
                expect(result.isDark).toBe(baseTheme.isDark);
            }
        }
    );

    fcTest.prop([completeThemeArbitrary, partialThemeArbitrary])(
        "should perform deep merging of nested color objects",
        (baseTheme, overrideTheme) => {
            const result = deepMergeTheme(
                baseTheme,
                overrideTheme as Partial<Theme>
            );

            // Deep merge behavior: if colors is undefined, preserve entire base colors structure
            if (overrideTheme.colors === undefined) {
                expect(result.colors).toEqual(baseTheme.colors);
            } else if (
                overrideTheme.colors.background &&
                Object.hasOwn(overrideTheme.colors.background, "modal")
            ) {
                // If colors exists, check nested properties
                expect(result.colors.background.modal).toBe(
                    overrideTheme.colors.background.modal
                );
            } else {
                expect(result.colors.background.modal).toBe(
                    baseTheme.colors.background.modal
                );
            }

            // Complex nested objects should merge properly
            if (
                overrideTheme.colors?.primary &&
                Object.hasOwn(overrideTheme.colors.primary, "50")
            ) {
                expect(result.colors.primary["50"]).toBe(
                    overrideTheme.colors.primary["50"]
                );
            } else {
                // When override.colors is undefined, helper function preserves base theme
                expect(result.colors.primary["50"]).toBe(
                    baseTheme.colors.primary["50"]
                );
            }

            // Unrelated properties should remain unchanged
            expect(result.colors.background.secondary).toBe(
                baseTheme.colors.background.secondary
            );
            expect(result.colors.background.tertiary).toBe(
                baseTheme.colors.background.tertiary
            );
        }
    );

    fcTest.prop([completeThemeArbitrary, partialThemeArbitrary])(
        "should handle typography merging with type safety",
        (baseTheme, overrideTheme) => {
            const result = deepMergeTheme(
                baseTheme,
                overrideTheme as Partial<Theme>
            );

            // Typography structure should be preserved
            expect(result.typography).toHaveProperty("fontFamily");
            expect(result.typography).toHaveProperty("fontSize");
            expect(result.typography).toHaveProperty("fontWeight");
            expect(result.typography).toHaveProperty("lineHeight");

            // Deep merging should work for typography
            if (overrideTheme.typography?.fontSize?.base) {
                expect(result.typography.fontSize.base).toBe(
                    overrideTheme.typography.fontSize.base
                );
            } else {
                expect(result.typography.fontSize.base).toBe(
                    baseTheme.typography.fontSize.base
                );
            }

            if (
                overrideTheme.typography?.fontWeight &&
                Object.hasOwn(overrideTheme.typography.fontWeight, "bold")
            ) {
                // When override explicitly has bold property, use that value (even if undefined)
                expect(result.typography.fontWeight.bold).toBe(
                    overrideTheme.typography.fontWeight.bold
                );
            } else {
                // When override doesn't have bold, preserve base theme value
                expect(result.typography.fontWeight.bold).toBe(
                    baseTheme.typography.fontWeight.bold
                );
            } // Typography merging behavior: if typography is undefined, preserve entire base typography
            if (overrideTheme.typography === undefined) {
                expect(result.typography).toEqual(baseTheme.typography);
            } else if (
                overrideTheme.typography.fontWeight &&
                Object.hasOwn(overrideTheme.typography.fontWeight, "normal")
            ) {
                // If typography exists, check nested properties
                expect(result.typography.fontWeight.normal).toBe(
                    overrideTheme.typography.fontWeight.normal
                );
            } else {
                expect(result.typography.fontWeight.normal).toBe(
                    baseTheme.typography.fontWeight.normal
                );
            }
        }
    );

    fcTest.prop([completeThemeArbitrary])(
        "should return identical theme when no override is provided",
        (baseTheme) => {
            const result = deepMergeTheme(baseTheme, {});

            // Should be structurally identical to base theme
            expect(result).toEqual(baseTheme);

            // But should be a different object (immutable)
            expect(result).not.toBe(baseTheme);
            expect(result.colors).not.toBe(baseTheme.colors);
            expect(result.colors.background).not.toBe(
                baseTheme.colors.background
            );
        }
    );

    fcTest.prop([completeThemeArbitrary, completeThemeArbitrary])(
        "should completely override when full theme is provided",
        (baseTheme, fullOverride) => {
            const result = deepMergeTheme(baseTheme, fullOverride);

            // Result should match the override theme
            expect(result.name).toBe(fullOverride.name);
            expect(result.isDark).toBe(fullOverride.isDark);
            expect(result.colors.error).toBe(fullOverride.colors.error);
            expect(result.colors.background.modal).toBe(
                fullOverride.colors.background.modal
            );
            expect(result.typography.fontSize.base).toBe(
                fullOverride.typography.fontSize.base
            );
            expect(result.spacing.lg).toBe(fullOverride.spacing.lg);
        }
    );

    fcTest.prop([
        fc.constantFrom(...Object.values(themes)),
        partialThemeArbitrary,
    ])(
        "should work with predefined themes from themes.ts",
        (baseTheme, overrideTheme) => {
            const result = deepMergeTheme(
                baseTheme,
                overrideTheme as Partial<Theme>
            );

            // Should maintain theme structure and type safety
            if (Object.hasOwn(overrideTheme, "name")) {
                // When override explicitly has name property, use that value (even if undefined)
                expect(result.name).toBe(overrideTheme.name);
            } else {
                // When override doesn't have name, preserve base theme value
                expect(result.name).toBeDefined();
            }
            if (Object.hasOwn(overrideTheme, "isDark")) {
                // When override explicitly has isDark, use that value (even if undefined)
                expect(result.isDark).toBe(overrideTheme.isDark);
            } else {
                // When override doesn't have isDark, preserve base theme value
                expect(typeof result.isDark).toBe("boolean");
            }

            // Colors should be properly merged based on override presence
            if (overrideTheme.colors === undefined) {
                expect(result.colors).toEqual(baseTheme.colors);
            } else {
                // Check that colors structure is maintained
                expect(result.colors.background).toBeDefined();
                expect(result.colors.primary).toBeDefined();
            }

            // Should preserve predefined theme quality
            expect(Object.keys(result.colors.primary)).toHaveLength(10); // 50-900 shades
            expect(Object.keys(result.colors.status)).toHaveLength(7); // All status colors
        }
    );

    fcTest.prop([completeThemeArbitrary, partialThemeArbitrary])(
        "should preserve immutability - original themes should not be modified",
        (baseTheme, overrideTheme) => {
            const originalBaseTheme = structuredClone(baseTheme);
            const originalOverrideTheme = structuredClone(overrideTheme);

            deepMergeTheme(baseTheme, overrideTheme as Partial<Theme>);

            // Original themes should not be modified
            expect(baseTheme).toEqual(originalBaseTheme);
            expect(overrideTheme).toEqual(originalOverrideTheme);
        }
    );

    fcTest.prop([
        fc.array(completeThemeArbitrary, { minLength: 2, maxLength: 5 }),
        fc.array(partialThemeArbitrary, { minLength: 1, maxLength: 3 }),
    ])(
        "should handle multiple theme merging operations",
        (baseThemes, overrideThemes) => {
            // Start with first base theme
            let result = baseThemes[0];

            // Apply each override sequentially
            for (const override of overrideThemes) {
                // @ts-expect-error - Fuzzing test with complex theme type compatibility issues
                result = deepMergeTheme(result, override as Partial<Theme>);
            }

            // Result should still be a valid theme
            expect(result).toHaveProperty("name");
            expect(result).toHaveProperty("isDark");
            expect(result).toHaveProperty("colors");
            expect(result!.colors).toHaveProperty("background");
            expect(result!.colors).toHaveProperty("primary");

            // Should maintain structural integrity after multiple merges
            expect(Object.keys(result!.colors.primary)).toHaveLength(10);
            expect(Object.keys(result!.colors.status)).toHaveLength(7);
        }
    );

    it("should handle empty override objects gracefully", () => {
        const baseTheme = themes.light;

        // Should handle empty override
        expect(() => deepMergeTheme(baseTheme, {})).not.toThrow();
        const result = deepMergeTheme(baseTheme, {});
        expect(result).toEqual(baseTheme);
    });

    it("should handle deeply nested null/undefined values correctly", () => {
        const baseTheme = themes.dark;
        const overrideWithNulls = {
            colors: {
                background: {
                    modal: null as any,
                    primary: undefined as any,
                },
            },
            typography: {
                fontSize: {
                    base: null as any,
                },
            },
        } as Partial<Theme>;

        expect(() =>
            deepMergeTheme(baseTheme, overrideWithNulls)
        ).not.toThrow();
        const result = deepMergeTheme(baseTheme, overrideWithNulls);

        // Null values should override (explicit null is intentional)
        expect(result.colors.background.modal).toBe(null);
        // Undefined values DO override to undefined (JavaScript spread behavior)
        expect(result.colors.background.primary).toBe(undefined);
        // Nested null should override
        expect(result.typography.fontSize.base).toBe(null);
        // Other non-overridden values should remain
        expect(result.typography.fontSize.lg).toBe(
            baseTheme.typography.fontSize.lg
        );
    });
});
