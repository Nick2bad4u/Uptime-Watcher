/**
 * Theme merging utilities for deep merging theme objects.
 * Provides centralized logic for merging themes with proper type safety.
 *
 * @packageDocumentation
 */

import type { Theme } from "../types";

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
        colors: {
            ...baseTheme.colors,
            ...overrides.colors,
            background: {
                ...baseTheme.colors.background,
                ...overrides.colors?.background,
            },
            border: {
                ...baseTheme.colors.border,
                ...overrides.colors?.border,
            },
            hover: {
                ...baseTheme.colors.hover,
                ...overrides.colors?.hover,
            },
            primary: {
                ...baseTheme.colors.primary,
                ...overrides.colors?.primary,
            },
            status: {
                ...baseTheme.colors.status,
                ...overrides.colors?.status,
            },
            surface: {
                ...baseTheme.colors.surface,
                ...overrides.colors?.surface,
            },
            text: {
                ...baseTheme.colors.text,
                ...overrides.colors?.text,
            },
        },
        shadows: {
            ...baseTheme.shadows,
            ...overrides.shadows,
        },
        spacing: {
            ...baseTheme.spacing,
            ...overrides.spacing,
        },
        typography: {
            ...baseTheme.typography,
            ...overrides.typography,
            fontFamily: {
                ...baseTheme.typography.fontFamily,
                ...overrides.typography?.fontFamily,
            },
            fontSize: {
                ...baseTheme.typography.fontSize,
                ...overrides.typography?.fontSize,
            },
            fontWeight: {
                ...baseTheme.typography.fontWeight,
                ...overrides.typography?.fontWeight,
            },
            lineHeight: {
                ...baseTheme.typography.lineHeight,
                ...overrides.typography?.lineHeight,
            },
        },
    };
}
