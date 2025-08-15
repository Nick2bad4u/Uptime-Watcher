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
 * Theme validation result interface.
 *
 * @remarks
 * Used to return validation results for theme configurations. Import directly
 * from "./validation" for ThemeValidationResult if needed.
 *
 * @public
 */

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
 * @returns True if the object is a valid color palette
 *
 * @public
 */
export function isColorPalette(obj: unknown): obj is ColorPalette {
    if (typeof obj !== "object" || obj === null) {
        return false;
    }

    const palette = obj as Record<string, unknown>;
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
 * @returns True if the object is a valid theme configuration
 *
 * @public
 */
export function isThemeConfig(obj: unknown): obj is ThemeConfig {
    if (typeof obj !== "object" || obj === null) {
        return false;
    }

    const theme = obj as Record<string, unknown>;
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
