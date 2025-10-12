/**
 * Theme configuration type definitions for Uptime Watcher.
 *
 * @remarks
 * These interfaces provide type-safe configuration structures for application
 * theming. They ensure proper typing for colors, spacing, typography, and
 * component styling.
 *
 * @packageDocumentation
 */

import type { Merge, PartialDeep, SetOptional, UnknownRecord } from "type-fest";

/**
 * Animation configuration interface.
 *
 * @remarks
 * Defines animation and transition configurations.
 *
 * @public
 */
export interface AnimationConfig {
    /** Animation duration values */
    duration: {
        fast: string;
        normal: string;
        slow: string;
    };
    /** Animation easing functions */
    easing: {
        easeIn: string;
        easeInOut: string;
        easeOut: string;
        linear: string;
    };
}

/**
 * Background color configuration interface.
 *
 * @remarks
 * Defines background colors for different component states and areas.
 *
 * @public
 */
export interface BackgroundColors {
    /** Default background color */
    default: string;
    /** Elevated surface background color */
    elevated: string;
    /** Paper/card background color */
    paper: string;
    /** Primary background color */
    primary: string;
    /** Secondary background color */
    secondary: string;
}

/**
 * Border color configuration interface.
 *
 * @remarks
 * Defines border colors for different states and emphasis levels.
 *
 * @public
 */
export interface BorderColors {
    /** Default border color */
    default: string;
    /** Disabled state border color */
    disabled: string;
    /** Error state border color */
    error: string;
    /** Focus state border color */
    focus: string;
    /** Hover state border color */
    hover: string;
    /** Success state border color */
    success: string;
    /** Warning state border color */
    warning: string;
}

/**
 * Border radius configuration interface.
 *
 * @remarks
 * Defines border radius values for consistent component styling.
 *
 * @public
 */
export interface BorderRadiusConfig {
    /** Full/circular border radius */
    full: string;
    /** Large border radius */
    lg: string;
    /** Medium border radius */
    md: string;
    /** No border radius */
    none: string;
    /** Small border radius */
    sm: string;
    /** Extra large border radius */
    xl: string;
}

/**
 * Color palette interface for theme colors.
 *
 * @remarks
 * Defines a complete color palette with semantic color names.
 *
 * @public
 */
export interface ColorPalette {
    /** Error state color */
    error: string;
    /** Info state color */
    info: string;
    /** Primary brand color */
    primary: string;
    /** Secondary brand color */
    secondary: string;
    /** Success state color */
    success: string;
    /** Warning state color */
    warning: string;
}

/**
 * Component-specific styling configuration interface.
 *
 * @remarks
 * Defines styling overrides for specific components.
 *
 * @public
 */
export interface ComponentConfig {
    /** Button component styling */
    button: {
        borderRadius: string;
        fontSize: string;
        fontWeight: number;
        padding: string;
    };
    /** Card component styling */
    card: {
        borderRadius: string;
        padding: string;
        shadow: string;
    };
    /** Input component styling */
    input: {
        borderRadius: string;
        fontSize: string;
        padding: string;
    };
    /** Modal component styling */
    modal: {
        backdropColor: string;
        borderRadius: string;
        shadow: string;
    };
}

/**
 * Interface for default theme configuration values.
 *
 * @public
 */
export interface DefaultThemeConfig {
    /** Default animation configuration */
    readonly animation: {
        duration: {
            fast: string;
            normal: string;
            slow: string;
        };
        easing: {
            easeIn: string;
            easeInOut: string;
            easeOut: string;
            linear: string;
        };
    };
    /** Default border radius configuration */
    readonly borderRadius: {
        full: string;
        lg: string;
        md: string;
        none: string;
        sm: string;
        xl: string;
    };
    /** Default component configuration */
    readonly components: {
        button: {
            borderRadius: string;
            fontSize: string;
            fontWeight: number;
            padding: string;
        };
        card: {
            borderRadius: string;
            padding: string;
            shadow: string;
        };
        input: {
            borderRadius: string;
            fontSize: string;
            padding: string;
        };
        modal: {
            backdropColor: string;
            borderRadius: string;
            shadow: string;
        };
    };
    /** Default shadow configuration */
    readonly shadows: {
        lg: string;
        md: string;
        none: string;
        sm: string;
        xl: string;
    };
    /** Default spacing configuration */
    readonly spacing: {
        lg: string;
        md: string;
        sm: string;
        xl: string;
        xs: string;
        xxl: string;
        xxs: string;
    };
    /** Default typography configuration */
    readonly typography: {
        fontFamily: {
            body: string;
            heading: string;
            mono: string;
        };
        fontSize: {
            body: string;
            caption: string;
            h1: string;
            h2: string;
            h3: string;
            h4: string;
            h5: string;
            h6: string;
            large: string;
            small: string;
        };
        fontWeight: {
            bold: number;
            light: number;
            medium: number;
            normal: number;
            semibold: number;
        };
        lineHeight: {
            body: string;
            heading: string;
            tight: string;
        };
    };
}

/**
 * Hover state color configuration interface.
 *
 * @remarks
 * Defines colors for hover states of interactive elements.
 *
 * @public
 */
export interface HoverColors {
    /** Background color on hover */
    background: string;
    /** Border color on hover */
    border: string;
    /** Primary color on hover */
    primary: string;
    /** Secondary color on hover */
    secondary: string;
    /** Text color on hover */
    text: string;
}

/**
 * Shadow configuration interface.
 *
 * @remarks
 * Defines box shadow values for elevation and depth.
 *
 * @public
 */
export interface ShadowConfig {
    /** Large shadow */
    lg: string;
    /** Medium shadow */
    md: string;
    /** No shadow */
    none: string;
    /** Small shadow */
    sm: string;
    /** Extra large shadow */
    xl: string;
}

/**
 * Spacing configuration interface.
 *
 * @remarks
 * Defines spacing values for consistent layout and component spacing.
 *
 * @public
 */
export interface SpacingConfig {
    /** Large spacing value */
    lg: string;
    /** Medium spacing value */
    md: string;
    /** Small spacing value */
    sm: string;
    /** Extra large spacing value */
    xl: string;
    /** Extra small spacing value */
    xs: string;
    /** Extra extra large spacing value */
    xxl: string;
    /** Extra extra small spacing value */
    xxs: string;
}

/**
 * Status indicator color configuration interface.
 *
 * @remarks
 * Defines colors for status indicators and monitor states.
 *
 * @public
 */
export interface StatusColors {
    /** Down/error status color */
    down: string;
    /** Paused status color */
    paused: string;
    /** Pending status color */
    pending: string;
    /** Unknown status color */
    unknown: string;
    /** Up/success status color */
    up: string;
}

/**
 * Text color configuration interface.
 *
 * @remarks
 * Defines text colors for different emphasis levels and states.
 *
 * @public
 */
export interface TextColors {
    /** Disabled text color */
    disabled: string;
    /** Error text color */
    error: string;
    /** Inverse text color (for dark backgrounds) */
    inverse: string;
    /** Muted/secondary text color */
    muted: string;
    /** Primary text color */
    primary: string;
    /** Success text color */
    success: string;
    /** Warning text color */
    warning: string;
}

/**
 * Complete theme color configuration interface.
 *
 * @remarks
 * Comprehensive color configuration for the entire application theme.
 *
 * @public
 */
export interface ThemeColors {
    /** Background color configuration */
    background: BackgroundColors;
    /** Border color configuration */
    border: BorderColors;
    /** Hover state color configuration */
    hover: HoverColors;
    /** Primary color palette */
    primary: ColorPalette;
    /** Status indicator colors */
    status: StatusColors;
    /** Text color configuration */
    text: TextColors;
}

/**
 * Complete theme configuration interface.
 *
 * @remarks
 * Main theme configuration interface that includes all theme aspects.
 *
 * @public
 */
export interface ThemeConfig {
    /** Animation and transition configuration */
    animation: AnimationConfig;
    /** Border radius configuration */
    borderRadius: BorderRadiusConfig;
    /** Color configuration */
    colors: ThemeColors;
    /** Component-specific styling */
    components: ComponentConfig;
    /** Shadow configuration */
    shadows: ShadowConfig;
    /** Spacing configuration */
    spacing: SpacingConfig;
    /** Typography configuration */
    typography: TypographyConfig;
}

/**
 * Theme configuration with mode variants.
 *
 * @remarks
 * Contains both dark and light theme configurations.
 *
 * @public
 */
export interface ThemeConfigWithModes {
    /** Dark theme configuration */
    dark: ThemeConfig;
    /** Light theme configuration */
    light: ThemeConfig;
}

/**
 * Theme override configuration interface.
 *
 * @remarks
 * Allows partial overrides of theme configuration.
 *
 * @public
 */
export interface ThemeOverride {
    /** Animation overrides */
    animation?: Partial<AnimationConfig>;
    /** Border radius overrides */
    borderRadius?: Partial<BorderRadiusConfig>;
    /** Color overrides */
    colors?: Partial<ThemeColors>;
    /** Component overrides */
    components?: Partial<ComponentConfig>;
    /** Shadow overrides */
    shadows?: Partial<ShadowConfig>;
    /** Spacing overrides */
    spacing?: Partial<SpacingConfig>;
    /** Typography overrides */
    typography?: Partial<TypographyConfig>;
}

/**
 * Deep partial theme configuration using type-fest's PartialDeep utility.
 *
 * @remarks
 * Creates a type where all properties and nested properties are optional. This
 * is useful for complex theme customization where you want to override deeply
 * nested properties without having to specify entire sections.
 *
 * @example Deep theme customization:
 *
 * ```typescript
 * const deepCustomTheme: DeepThemeOverride = {
 *     colors: {
 *         text: {
 *             primary: "#333333", // Only override this specific nested property
 *         },
 *     },
 *     typography: {
 *         fontSize: {
 *             h1: "36px", // Only override this specific nested property
 *         },
 *     },
 * };
 * ```
 *
 * @public
 */
export type DeepThemeOverride = PartialDeep<ThemeConfig>;

/**
 * Typography configuration interface.
 *
 * @remarks
 * Defines font families, sizes, weights, and line heights.
 *
 * @public
 */
export interface TypographyConfig {
    /** Font family configuration */
    fontFamily: {
        body: string;
        heading: string;
        mono: string;
    };
    /** Font size configuration */
    fontSize: {
        body: string;
        caption: string;
        h1: string;
        h2: string;
        h3: string;
        h4: string;
        h5: string;
        h6: string;
        large: string;
        small: string;
    };
    /** Font weight configuration */
    fontWeight: {
        bold: number;
        light: number;
        medium: number;
        normal: number;
        semibold: number;
    };
    /** Line height configuration */
    lineHeight: {
        body: string;
        heading: string;
        tight: string;
    };
}

/**
 * Theme mode type.
 *
 * @public
 */
export type ThemeMode = "dark" | "light";

/**
 * Type guard to check if an object is a valid color palette.
 *
 * @param obj - Object to check
 *
 * @returns `true` when the object matches the `ColorPalette` contract;
 *   otherwise `false`.
 *
 * @public
 */
export function isColorPalette(obj: unknown): obj is ColorPalette {
    if (typeof obj !== "object" || obj === null) {
        return false;
    }

    // Safe assertion after type and null checks
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Type assertion is safe after runtime type validation of object structure
    const palette = obj as UnknownRecord;
    const requiredColors = [
        "error",
        "info",
        "primary",
        "secondary",
        "success",
        "warning",
    ];

    return requiredColors.every((color) => {
        const value = palette[color];
        return typeof value === "string" && value.length > 0;
    });
}

/**
 * Type guard to check if an object is a valid theme configuration.
 *
 * @param obj - Object to check
 *
 * @returns `true` when the object matches the `ThemeConfig` contract; otherwise
 *   `false`.
 *
 * @public
 */
export function isThemeConfig(obj: unknown): obj is ThemeConfig {
    if (typeof obj !== "object" || obj === null) {
        return false;
    }

    // Safe assertion after type and null checks
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Type assertion is safe after runtime type validation of theme structure
    const theme = obj as UnknownRecord;
    const requiredProps = [
        "animation",
        "borderRadius",
        "colors",
        "components",
        "shadows",
        "spacing",
        "typography",
    ];

    return requiredProps.every((prop) => {
        const value = theme[prop];
        return typeof value === "object" && value !== null;
    });
}

/**
 * Default theme configuration values.
 *
 * @public
 */
export const DEFAULT_THEME_CONFIG: DefaultThemeConfig = {
    /** Default animation configuration */
    animation: {
        duration: {
            fast: "150ms",
            normal: "300ms",
            slow: "500ms",
        },
        easing: {
            easeIn: "cubic-bezier(0.4, 0.0, 1, 1)",
            easeInOut: "cubic-bezier(0.4, 0.0, 0.2, 1)",
            easeOut: "cubic-bezier(0.0, 0.0, 0.2, 1)",
            linear: "linear",
        },
    } satisfies AnimationConfig,

    /** Default border radius configuration */
    borderRadius: {
        full: "9999px",
        lg: "8px",
        md: "4px",
        none: "0px",
        sm: "2px",
        xl: "12px",
    } satisfies BorderRadiusConfig,

    /** Default component configuration */
    components: {
        button: {
            borderRadius: "4px",
            fontSize: "14px",
            fontWeight: 500,
            padding: "8px 16px",
        },
        card: {
            borderRadius: "8px",
            padding: "16px",
            shadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        },
        input: {
            borderRadius: "4px",
            fontSize: "14px",
            padding: "8px 12px",
        },
        modal: {
            backdropColor: "rgba(0, 0, 0, 0.5)",
            borderRadius: "8px",
            shadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
        },
    } satisfies ComponentConfig,

    /** Default shadow configuration */
    shadows: {
        lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        none: "none",
        sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    } satisfies ShadowConfig,

    /** Default spacing configuration */
    spacing: {
        lg: "16px",
        md: "12px",
        sm: "8px",
        xl: "24px",
        xs: "4px",
        xxl: "32px",
        xxs: "2px",
    } satisfies SpacingConfig,

    /** Default typography configuration */
    typography: {
        fontFamily: {
            body: "system-ui, -apple-system, sans-serif",
            heading: "system-ui, -apple-system, sans-serif",
            mono: "ui-monospace, Menlo, Monaco, monospace",
        },
        fontSize: {
            body: "14px",
            caption: "12px",
            h1: "32px",
            h2: "24px",
            h3: "20px",
            h4: "18px",
            h5: "16px",
            h6: "14px",
            large: "16px",
            small: "12px",
        },
        fontWeight: {
            bold: 700,
            light: 300,
            medium: 500,
            normal: 400,
            semibold: 600,
        },
        lineHeight: {
            body: "1.5",
            heading: "1.2",
            tight: "1.25",
        },
    } satisfies TypographyConfig,
} as const;

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Creates a theme configuration factory with optional theme sections.
 *
 * @remarks
 * Uses SetOptional to create type-safe theme configuration functions where
 * specific sections can be omitted when defaults are provided. This
 * demonstrates practical usage of type-fest SetOptional for API design.
 *
 * @example
 *
 * ```typescript
 * // Create minimal theme with just colors, other sections use defaults
 * const minimalTheme = createThemeConfig({
 *     colors: {
 *         primary: { 50: "#f0f9ff", 500: "#3b82f6", 900: "#1e3a8a" },
 *     },
 * });
 *
 * // Create full custom theme
 * const fullTheme = createThemeConfig({
 *     colors: customColors,
 *     typography: customTypography,
 *     spacing: customSpacing,
 * });
 * ```
 *
 * @param config - Partial theme configuration with at least colors required
 *
 * @returns Complete theme configuration with defaults applied
 *
 * @public
 */
export function createThemeConfig(
    config: SetOptional<
        ThemeConfig,
        | "animation"
        | "borderRadius"
        | "components"
        | "shadows"
        | "spacing"
        | "typography"
    >
): ThemeConfig {
    return {
        animation: config.animation ?? DEFAULT_THEME_CONFIG.animation,
        borderRadius: config.borderRadius ?? DEFAULT_THEME_CONFIG.borderRadius,
        colors: config.colors,
        components: config.components ?? DEFAULT_THEME_CONFIG.components,
        shadows: config.shadows ?? DEFAULT_THEME_CONFIG.shadows,
        spacing: config.spacing ?? DEFAULT_THEME_CONFIG.spacing,
        typography: config.typography ?? DEFAULT_THEME_CONFIG.typography,
    };
}

/**
 * Merges theme overrides with base theme configuration using type-safe merging.
 *
 * @remarks
 * Uses type-fest's Merge utility to combine theme configurations with proper
 * type safety. This provides better type inference than manual object spreading
 * and ensures all properties are handled correctly.
 *
 * @example Basic theme merging:
 *
 * ```typescript
 * const baseTheme: ThemeConfig = getBaseTheme();
 * const overrides: ThemeOverride = {
 *     colors: { text: { primary: "#007bff" } },
 *     spacing: { lg: "20px" },
 * };
 *
 * const mergedTheme = mergeThemeConfig(baseTheme, overrides);
 * // Result is fully typed with merged properties
 * ```
 *
 * @param baseTheme - Base theme configuration
 * @param overrides - Theme overrides to apply
 *
 * @returns Merged theme configuration with type-safe property resolution
 *
 * @public
 */
export function mergeThemeConfig<
    T extends ThemeConfig,
    U extends ThemeOverride,
>(baseTheme: T, overrides: U): Merge<T, U> {
    return {
        ...baseTheme,
        ...overrides,
        // Deep merge for nested objects
        animation: { ...baseTheme.animation, ...overrides.animation },
        borderRadius: { ...baseTheme.borderRadius, ...overrides.borderRadius },
        colors: { ...baseTheme.colors, ...overrides.colors },
        components: { ...baseTheme.components, ...overrides.components },
        shadows: { ...baseTheme.shadows, ...overrides.shadows },
        spacing: { ...baseTheme.spacing, ...overrides.spacing },
        typography: { ...baseTheme.typography, ...overrides.typography },
    } as Merge<T, U>;
}

/**
 * Creates a deeply customized theme using PartialDeep pattern for maximum
 * flexibility.
 *
 * @remarks
 * Uses type-fest's PartialDeep to allow modification of any nested property
 * without requiring complete object structures. This is ideal for fine-grained
 * theme customization where only specific values need to be changed.
 *
 * @example Fine-grained theme customization:
 *
 * ```typescript
 * const customTheme = createDeepThemeOverride(baseTheme, {
 *     colors: {
 *         text: { primary: "#1a1a1a" }, // Only change text primary color
 *         background: { primary: "#ffffff" }, // Only change background primary
 *     },
 *     typography: {
 *         fontSize: { h1: "40px" }, // Only change h1 font size
 *     },
 * });
 * ```
 *
 * @param baseTheme - Base theme configuration
 * @param deepOverrides - Deep partial overrides using PartialDeep pattern
 *
 * @returns Theme configuration with deeply merged overrides
 *
 * @public
 */
export function createDeepThemeOverride(
    baseTheme: ThemeConfig,
    deepOverrides: DeepThemeOverride
): ThemeConfig {
    // Deep merge implementation - in production, consider using a library like lodash.merge
    // Use of 'any' is necessary for flexible object merging
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Deep merge utility requires 'any' type for flexible object property handling
    const deepMerge = (target: any, source: any): any => {
        if (source === null || source === undefined) return target;
        if (typeof source !== "object") return source;

        // Safe assignment with any for flexible merging
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- Deep merge utility requires 'any' type assignment for flexible object property handling
        const result = { ...target };
        for (const key in source) {
            if (
                // Safe member access for dynamic property checking
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- Dynamic property access requires bypassing type safety for flexible object traversal
                source[key] !== null &&
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- Dynamic property access requires bypassing type safety for flexible object traversal
                typeof source[key] === "object" &&
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- Dynamic property access requires bypassing type safety for flexible object traversal
                !Array.isArray(source[key])
            ) {
                // Recursive merge with safe assignment and member access
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access -- Recursive deep merge requires unsafe operations for dynamic object traversal and assignment
                result[key] = deepMerge(target[key] ?? {}, source[key]);
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access -- Dynamic property access requires bypassing type safety for flexible object traversal
            } else if (source[key] !== undefined) {
                // Safe assignment of source values
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access -- Direct value assignment requires unsafe operations for dynamic object property handling
                result[key] = source[key];
            }
        }
        return result;
    };

    // Safe return as ThemeConfig is expected type
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- Deep merge result is guaranteed to be ThemeConfig type by function contract
    return deepMerge(baseTheme, deepOverrides);
}
