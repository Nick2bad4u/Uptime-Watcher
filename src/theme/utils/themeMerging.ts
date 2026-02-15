/**
 * Theme merging utilities for deep merging theme objects. Provides centralized
 * logic for merging themes with proper type safety.
 *
 * @packageDocumentation
 */

import type { UnknownRecord } from "type-fest";

import { objectHasOwn } from "ts-extras";

import type { Theme } from "../types";

// Helper function to merge objects, allowing explicit undefined to override
const mergeWithExplicitUndefined = <T extends UnknownRecord>(
    base: T,
    override?: Partial<T>
): T => {
    if (!override) return { ...base };

    // Simple spread behavior: explicit undefined overrides
    return { ...base, ...override };
};

// Special merge function for fontSize that skips undefined but allows null
const mergeFontSize = (
    baseFontSize: Theme["typography"]["fontSize"],
    overrideFontSize?: Partial<Theme["typography"]["fontSize"]>
): Theme["typography"]["fontSize"] => {
    if (!overrideFontSize) return { ...baseFontSize };

    const result = { ...baseFontSize };

    // Handle each fontSize property individually to avoid type issues with Object.entries
    const fontSizeKeys = [
        "2xl",
        "3xl",
        "4xl",
        "base",
        "lg",
        "sm",
        "xl",
        "xs",
    ] as const;

    for (const key of fontSizeKeys) {
        const value = overrideFontSize[key];
        // Skip undefined values but allow null and other values
        if (value !== undefined) {
            result[key] = value;
        }
    }

    return result;
};

// Helper functions for theme merging (reduces function length by composition)
const mergeColors = (
    baseColors: Theme["colors"],
    overrideColors?: Partial<Theme["colors"]>
): Theme["colors"] => {
    if (!overrideColors) {
        return {
            ...baseColors,
            background: { ...baseColors.background },
            border: { ...baseColors.border },
            hover: { ...baseColors.hover },
            primary: { ...baseColors.primary },
            status: { ...baseColors.status },
            surface: { ...baseColors.surface },
            text: { ...baseColors.text },
        };
    }

    return {
        ...baseColors,
        ...(objectHasOwn(overrideColors, "error") && {
            error: overrideColors.error,
        }),
        ...(objectHasOwn(overrideColors, "errorAlert") && {
            errorAlert: overrideColors.errorAlert,
        }),
        ...(objectHasOwn(overrideColors, "info") && {
            info: overrideColors.info,
        }),
        ...(objectHasOwn(overrideColors, "success") && {
            success: overrideColors.success,
        }),
        ...(objectHasOwn(overrideColors, "warning") && {
            warning: overrideColors.warning,
        }),
        background: mergeWithExplicitUndefined(
            baseColors.background,
            overrideColors.background
        ),
        border: mergeWithExplicitUndefined(
            baseColors.border,
            overrideColors.border
        ),
        hover: mergeWithExplicitUndefined(
            baseColors.hover,
            overrideColors.hover
        ),
        primary: mergeWithExplicitUndefined(
            baseColors.primary,
            overrideColors.primary
        ),
        status: mergeWithExplicitUndefined(
            baseColors.status,
            overrideColors.status
        ),
        surface: mergeWithExplicitUndefined(
            baseColors.surface,
            overrideColors.surface
        ),
        text: mergeWithExplicitUndefined(baseColors.text, overrideColors.text),
    };
};

const mergeTypography = (
    baseTypography: Theme["typography"],
    overrideTypography?: Partial<Theme["typography"]>
): Theme["typography"] => {
    if (!overrideTypography) {
        return {
            ...baseTypography,
            fontFamily: { ...baseTypography.fontFamily },
            fontSize: { ...baseTypography.fontSize },
            fontWeight: { ...baseTypography.fontWeight },
            lineHeight: { ...baseTypography.lineHeight },
        };
    }

    return {
        fontFamily: mergeWithExplicitUndefined(
            baseTypography.fontFamily,
            overrideTypography.fontFamily
        ),
        fontSize: mergeFontSize(
            baseTypography.fontSize,
            overrideTypography.fontSize
        ),
        fontWeight: mergeWithExplicitUndefined(
            baseTypography.fontWeight,
            overrideTypography.fontWeight
        ),
        lineHeight: mergeWithExplicitUndefined(
            baseTypography.lineHeight,
            overrideTypography.lineHeight
        ),
    };
};

/**
 * Deep merge themes with proper type safety and nested object handling.
 * Performs deep merging of nested objects like colors, typography, and spacing
 * to ensure that only specified properties are overridden while preserving all
 * other base theme properties.
 *
 * @remarks
 * This utility handles all nested theme objects including:
 *
 * - Colors (with all sub-categories)
 * - Typography (with font properties)
 * - Spacing, shadows, borderRadius
 *
 * @example
 *
 * ```typescript
 * const customTheme = deepMergeTheme(baseTheme, {
 *     colors: {
 *         primary: { main: "#custom-color" },
 *     },
 * });
 * ```
 *
 * @param baseTheme - The base theme to start with
 * @param overrides - Partial theme object with overrides to apply
 *
 * @returns Merged theme with deep object merging applied
 */
export function deepMergeTheme(
    baseTheme: Theme,
    overrides: Partial<Theme>
): Theme {
    return {
        ...baseTheme,
        ...overrides,
        borderRadius: {
            ...baseTheme.borderRadius,
            ...overrides.borderRadius,
        },
        colors: mergeColors(baseTheme.colors, overrides.colors),
        shadows: {
            ...baseTheme.shadows,
            ...overrides.shadows,
        },
        spacing: {
            ...baseTheme.spacing,
            ...overrides.spacing,
        },
        typography: mergeTypography(baseTheme.typography, overrides.typography),
    };
}
