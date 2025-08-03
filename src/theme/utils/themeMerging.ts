/**
 * Theme merging utilities for deep merging theme objects.
 * Provides centralized logic for merging themes with proper type safety.
 *
 * @packageDocumentation
 */

import type { Theme } from "../types";

// Helper functions for theme merging (reduces function length by composition)
const mergeColors = (baseColors: Theme["colors"], overrideColors?: Partial<Theme["colors"]>) => ({
    ...baseColors,
    ...overrideColors,
    background: {
        ...baseColors.background,
        ...overrideColors?.background,
    },
    border: {
        ...baseColors.border,
        ...overrideColors?.border,
    },
    hover: {
        ...baseColors.hover,
        ...overrideColors?.hover,
    },
    primary: {
        ...baseColors.primary,
        ...overrideColors?.primary,
    },
    status: {
        ...baseColors.status,
        ...overrideColors?.status,
    },
    surface: {
        ...baseColors.surface,
        ...overrideColors?.surface,
    },
    text: {
        ...baseColors.text,
        ...overrideColors?.text,
    },
});

const mergeTypography = (baseTypography: Theme["typography"], overrideTypography?: Partial<Theme["typography"]>) => ({
    ...baseTypography,
    ...overrideTypography,
    fontFamily: {
        ...baseTypography.fontFamily,
        ...overrideTypography?.fontFamily,
    },
    fontSize: {
        ...baseTypography.fontSize,
        ...overrideTypography?.fontSize,
    },
    fontWeight: {
        ...baseTypography.fontWeight,
        ...overrideTypography?.fontWeight,
    },
    lineHeight: {
        ...baseTypography.lineHeight,
        ...overrideTypography?.lineHeight,
    },
});

/**
 * Deep merge themes with proper type safety and nested object handling.
 * Performs deep merging of nested objects like colors, typography, and spacing
 * to ensure that only specified properties are overridden while preserving
 * all other base theme properties.
 *
 * @param baseTheme - The base theme to start with
 * @param overrides - Partial theme object with overrides to apply
 * @returns Merged theme with deep object merging applied
 *
 * @remarks
 * This utility handles all nested theme objects including:
 * - colors (with all sub-categories)
 * - typography (with font properties)
 * - spacing, shadows, borderRadius
 *
 * @example
 * ```typescript
 * const customTheme = deepMergeTheme(baseTheme, {
 *   colors: {
 *     primary: { main: '#custom-color' }
 *   }
 * });
 * ```
 */
export function deepMergeTheme(baseTheme: Theme, overrides: Partial<Theme>): Theme {
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
