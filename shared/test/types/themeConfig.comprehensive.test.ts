/**
 * Comprehensive tests for theme configuration types and interfaces. Tests all
 * theme-related type definitions and validation functions.
 */

import { describe, expect, it } from "vitest";

import {
    DEFAULT_THEME_CONFIG,
    isColorPalette,
    isThemeConfig,
    type AnimationConfig,
    type BackgroundColors,
    type BorderColors,
    type BorderRadiusConfig,
    type ColorPalette,
    type ComponentConfig,
    type HoverColors,
    type ShadowConfig,
    type SpacingConfig,
    type StatusColors,
    type TextColors,
    type ThemeColors,
    type ThemeConfig,
    type ThemeConfigWithModes,
    type ThemeOverride,
    type TypographyConfig,
} from "../../types/themeConfig";

describe("Theme Config Types - Comprehensive Coverage", () => {
    describe("AnimationConfig Interface", () => {
        it("should create valid AnimationConfig object", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: themeConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Constructor", "type");

            const animation: AnimationConfig = {
                duration: {
                    fast: "150ms",
                    normal: "300ms",
                    slow: "500ms",
                },
                easing: {
                    easeIn: "ease-in",
                    easeInOut: "ease-in-out",
                    easeOut: "ease-out",
                    linear: "linear",
                },
            };

            expect(animation.duration.fast).toBe("150ms");
            expect(animation.duration.normal).toBe("300ms");
            expect(animation.duration.slow).toBe("500ms");
            expect(animation.easing.easeIn).toBe("ease-in");
            expect(animation.easing.easeInOut).toBe("ease-in-out");
            expect(animation.easing.easeOut).toBe("ease-out");
            expect(animation.easing.linear).toBe("linear");
        });

        it("should validate all required animation properties", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: themeConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Validation", "type");

            const animation: AnimationConfig = {
                duration: {
                    fast: "100ms",
                    normal: "250ms",
                    slow: "600ms",
                },
                easing: {
                    easeIn: "cubic-bezier(0.4, 0, 1, 1)",
                    easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
                    easeOut: "cubic-bezier(0, 0, 0.2, 1)",
                    linear: "linear",
                },
            };

            expect(Object.keys(animation.duration)).toEqual([
                "fast",
                "normal",
                "slow",
            ]);
            expect(Object.keys(animation.easing)).toEqual([
                "easeIn",
                "easeInOut",
                "easeOut",
                "linear",
            ]);
        });
    });

    describe("BackgroundColors Interface", () => {
        it("should create valid BackgroundColors object", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: themeConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Constructor", "type");

            const background: BackgroundColors = {
                default: "#ffffff",
                elevated: "#f9fafb",
                paper: "#ffffff",
                primary: "#ffffff",
                secondary: "#f3f4f6",
            };

            expect(background.default).toBe("#ffffff");
            expect(background.elevated).toBe("#f9fafb");
            expect(background.paper).toBe("#ffffff");
            expect(background.primary).toBe("#ffffff");
            expect(background.secondary).toBe("#f3f4f6");
        });

        it("should support different color formats", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: themeConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const background: BackgroundColors = {
                default: "rgb(255, 255, 255)",
                elevated: "rgba(249, 250, 251, 0.9)",
                paper: "hsl(0, 0%, 100%)",
                primary: "#fff",
                secondary: "var(--color-secondary)",
            };

            expect(background.default).toContain("rgb");
            expect(background.elevated).toContain("rgba");
            expect(background.paper).toContain("hsl");
            expect(background.primary).toBe("#fff");
            expect(background.secondary).toContain("var(");
        });
    });

    describe("BorderColors Interface", () => {
        it("should create valid BorderColors object", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: themeConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Constructor", "type");

            const border: BorderColors = {
                default: "#e5e7eb",
                disabled: "#d1d5db",
                error: "#ef4444",
                focus: "#3b82f6",
                hover: "#9ca3af",
                success: "#10b981",
                warning: "#f59e0b",
            };

            expect(border.default).toBe("#e5e7eb");
            expect(border.disabled).toBe("#d1d5db");
            expect(border.error).toBe("#ef4444");
            expect(border.focus).toBe("#3b82f6");
            expect(border.hover).toBe("#9ca3af");
            expect(border.success).toBe("#10b981");
            expect(border.warning).toBe("#f59e0b");
        });
    });

    describe("BorderRadiusConfig Interface", () => {
        it("should create valid BorderRadiusConfig object", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: themeConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Constructor", "type");

            const borderRadius: BorderRadiusConfig = {
                full: "9999px",
                lg: "8px",
                md: "6px",
                none: "0",
                sm: "4px",
                xl: "12px",
            };

            expect(borderRadius.full).toBe("9999px");
            expect(borderRadius.lg).toBe("8px");
            expect(borderRadius.md).toBe("6px");
            expect(borderRadius.none).toBe("0");
            expect(borderRadius.sm).toBe("4px");
            expect(borderRadius.xl).toBe("12px");
        });
    });

    describe("ColorPalette Interface", () => {
        it("should create valid ColorPalette object", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: themeConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Constructor", "type");

            const palette: ColorPalette = {
                error: "#ef4444",
                info: "#3b82f6",
                primary: "#3b82f6",
                secondary: "#6b7280",
                success: "#10b981",
                warning: "#f59e0b",
            };

            expect(palette.error).toBe("#ef4444");
            expect(palette.info).toBe("#3b82f6");
            expect(palette.primary).toBe("#3b82f6");
            expect(palette.secondary).toBe("#6b7280");
            expect(palette.success).toBe("#10b981");
            expect(palette.warning).toBe("#f59e0b");
        });

        it("should validate isColorPalette type guard", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: themeConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Validation", "type");

            const validPalette: ColorPalette = {
                error: "#ef4444",
                info: "#3b82f6",
                primary: "#3b82f6",
                secondary: "#6b7280",
                success: "#10b981",
                warning: "#f59e0b",
            };

            const invalidPalette = {
                error: "#ef4444",
                info: "#3b82f6",
                // Missing required colors
            };

            expect(isColorPalette(validPalette)).toBeTruthy();
            expect(isColorPalette(invalidPalette)).toBeFalsy();
            expect(isColorPalette(null)).toBeFalsy();
            expect(isColorPalette(undefined)).toBeFalsy();
            expect(isColorPalette("string")).toBeFalsy();
        });
    });

    describe("ComponentConfig Interface", () => {
        it("should create valid ComponentConfig object", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: themeConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Constructor", "type");

            const components: ComponentConfig = {
                button: {
                    borderRadius: "6px",
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
            };

            expect(components.button.borderRadius).toBe("6px");
            expect(components.button.fontSize).toBe("14px");
            expect(components.button.fontWeight).toBe(500);
            expect(components.button.padding).toBe("8px 16px");
            expect(components.card.borderRadius).toBe("8px");
            expect(components.card.padding).toBe("16px");
            expect(components.card.shadow).toContain("rgba");
            expect(components.input.borderRadius).toBe("4px");
            expect(components.modal.backdropColor).toContain("rgba");
        });
    });

    describe("ShadowConfig Interface", () => {
        it("should create valid ShadowConfig object", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: themeConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Constructor", "type");

            const shadows: ShadowConfig = {
                lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                md: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                none: "none",
                sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
            };

            expect(shadows.lg).toContain("rgba");
            expect(shadows.md).toContain("rgba");
            expect(shadows.none).toBe("none");
            expect(shadows.sm).toContain("rgba");
            expect(shadows.xl).toContain("rgba");
        });
    });

    describe("SpacingConfig Interface", () => {
        it("should create valid SpacingConfig object", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: themeConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Constructor", "type");

            const spacing: SpacingConfig = {
                lg: "16px",
                md: "12px",
                sm: "8px",
                xl: "24px",
                xs: "4px",
                xxl: "32px",
                xxs: "2px",
            };

            expect(spacing.lg).toBe("16px");
            expect(spacing.md).toBe("12px");
            expect(spacing.sm).toBe("8px");
            expect(spacing.xl).toBe("24px");
            expect(spacing.xs).toBe("4px");
            expect(spacing.xxl).toBe("32px");
            expect(spacing.xxs).toBe("2px");
        });
    });

    describe("StatusColors Interface", () => {
        it("should create valid StatusColors object", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: themeConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Constructor", "type");

            const status: StatusColors = {
                down: "#ef4444",
                paused: "#f59e0b",
                pending: "#6b7280",
                unknown: "#9ca3af",
                up: "#10b981",
            };

            expect(status.down).toBe("#ef4444");
            expect(status.paused).toBe("#f59e0b");
            expect(status.pending).toBe("#6b7280");
            expect(status.unknown).toBe("#9ca3af");
            expect(status.up).toBe("#10b981");
        });
    });

    describe("TextColors Interface", () => {
        it("should create valid TextColors object", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: themeConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Constructor", "type");

            const text: TextColors = {
                disabled: "#9ca3af",
                error: "#ef4444",
                inverse: "#ffffff",
                muted: "#6b7280",
                primary: "#111827",
                success: "#10b981",
                warning: "#f59e0b",
            };

            expect(text.disabled).toBe("#9ca3af");
            expect(text.error).toBe("#ef4444");
            expect(text.inverse).toBe("#ffffff");
            expect(text.muted).toBe("#6b7280");
            expect(text.primary).toBe("#111827");
            expect(text.success).toBe("#10b981");
            expect(text.warning).toBe("#f59e0b");
        });
    });

    describe("ThemeColors Interface", () => {
        it("should create valid ThemeColors object", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: themeConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Constructor", "type");

            const colors: ThemeColors = {
                background: {
                    default: "#ffffff",
                    elevated: "#f9fafb",
                    paper: "#ffffff",
                    primary: "#ffffff",
                    secondary: "#f3f4f6",
                },
                border: {
                    default: "#e5e7eb",
                    disabled: "#d1d5db",
                    error: "#ef4444",
                    focus: "#3b82f6",
                    hover: "#9ca3af",
                    success: "#10b981",
                    warning: "#f59e0b",
                },
                hover: {
                    background: "#f9fafb",
                    border: "#e5e7eb",
                    primary: "#3b82f6",
                    secondary: "#6b7280",
                    text: "#374151",
                },
                primary: {
                    error: "#ef4444",
                    info: "#3b82f6",
                    primary: "#3b82f6",
                    secondary: "#6b7280",
                    success: "#10b981",
                    warning: "#f59e0b",
                },
                status: {
                    down: "#ef4444",
                    paused: "#f59e0b",
                    pending: "#6b7280",
                    unknown: "#9ca3af",
                    up: "#10b981",
                },
                text: {
                    disabled: "#9ca3af",
                    error: "#ef4444",
                    inverse: "#ffffff",
                    muted: "#6b7280",
                    primary: "#111827",
                    success: "#10b981",
                    warning: "#f59e0b",
                },
            };

            expect(colors.background.default).toBe("#ffffff");
            expect(colors.border.focus).toBe("#3b82f6");
            expect(colors.primary.primary).toBe("#3b82f6");
            expect(colors.status.up).toBe("#10b981");
            expect(colors.text.primary).toBe("#111827");
        });
    });

    describe("TypographyConfig Interface", () => {
        it("should create valid TypographyConfig object", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: themeConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Constructor", "type");

            const typography: TypographyConfig = {
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
            };

            expect(typography.fontFamily.body).toContain("system-ui");
            expect(typography.fontFamily.mono).toContain("Monaco");
            expect(typography.fontSize.h1).toBe("32px");
            expect(typography.fontSize.body).toBe("14px");
            expect(typography.fontWeight.bold).toBe(700);
            expect(typography.fontWeight.normal).toBe(400);
            expect(typography.lineHeight.body).toBe("1.5");
            expect(typography.lineHeight.heading).toBe("1.2");
        });
    });

    describe("ThemeConfig Interface", () => {
        it("should create valid complete ThemeConfig object", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: themeConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Constructor", "type");

            const config: ThemeConfig = {
                animation: {
                    duration: {
                        fast: "150ms",
                        normal: "300ms",
                        slow: "500ms",
                    },
                    easing: {
                        easeIn: "ease-in",
                        easeInOut: "ease-in-out",
                        easeOut: "ease-out",
                        linear: "linear",
                    },
                },
                borderRadius: {
                    full: "9999px",
                    lg: "8px",
                    md: "6px",
                    none: "0",
                    sm: "4px",
                    xl: "12px",
                },
                colors: {
                    background: {
                        default: "#ffffff",
                        elevated: "#f9fafb",
                        paper: "#ffffff",
                        primary: "#ffffff",
                        secondary: "#f3f4f6",
                    },
                    border: {
                        default: "#e5e7eb",
                        disabled: "#d1d5db",
                        error: "#ef4444",
                        focus: "#3b82f6",
                        hover: "#9ca3af",
                        success: "#10b981",
                        warning: "#f59e0b",
                    },
                    hover: {
                        background: "#f9fafb",
                        border: "#e5e7eb",
                        primary: "#3b82f6",
                        secondary: "#6b7280",
                        text: "#374151",
                    },
                    primary: {
                        error: "#ef4444",
                        info: "#3b82f6",
                        primary: "#3b82f6",
                        secondary: "#6b7280",
                        success: "#10b981",
                        warning: "#f59e0b",
                    },
                    status: {
                        down: "#ef4444",
                        paused: "#f59e0b",
                        pending: "#6b7280",
                        unknown: "#9ca3af",
                        up: "#10b981",
                    },
                    text: {
                        disabled: "#9ca3af",
                        error: "#ef4444",
                        inverse: "#ffffff",
                        muted: "#6b7280",
                        primary: "#111827",
                        success: "#10b981",
                        warning: "#f59e0b",
                    },
                },
                components: {
                    button: {
                        borderRadius: "6px",
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
                },
                shadows: {
                    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    none: "none",
                    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                },
                spacing: {
                    lg: "16px",
                    md: "12px",
                    sm: "8px",
                    xl: "24px",
                    xs: "4px",
                    xxl: "32px",
                    xxs: "2px",
                },
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
                },
            };

            expect(config.animation.duration.normal).toBe("300ms");
            expect(config.borderRadius.lg).toBe("8px");
            expect(config.colors.primary.primary).toBe("#3b82f6");
            expect(config.components.button.fontSize).toBe("14px");
            expect(config.shadows.md).toContain("rgba");
            expect(config.spacing.lg).toBe("16px");
            expect(config.typography.fontFamily.body).toContain("system-ui");
        });

        it("should validate isThemeConfig type guard with simplified config", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: themeConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Validation", "type");

            const validConfig = {
                animation: {
                    duration: { fast: "150ms", normal: "300ms", slow: "500ms" },
                    easing: {
                        easeIn: "ease-in",
                        easeInOut: "ease-in-out",
                        easeOut: "ease-out",
                        linear: "linear",
                    },
                },
                borderRadius: {
                    full: "9999px",
                    lg: "8px",
                    md: "6px",
                    none: "0",
                    sm: "4px",
                    xl: "12px",
                },
                colors: {
                    background: {
                        default: "#fff",
                        elevated: "#f9fafb",
                        paper: "#fff",
                        primary: "#fff",
                        secondary: "#f3f4f6",
                    },
                    border: {
                        default: "#e5e7eb",
                        disabled: "#d1d5db",
                        error: "#ef4444",
                        focus: "#3b82f6",
                        hover: "#9ca3af",
                        success: "#10b981",
                        warning: "#f59e0b",
                    },
                    hover: {
                        background: "#f9fafb",
                        border: "#e5e7eb",
                        primary: "#3b82f6",
                        secondary: "#6b7280",
                        text: "#374151",
                    },
                    primary: {
                        error: "#ef4444",
                        info: "#3b82f6",
                        primary: "#3b82f6",
                        secondary: "#6b7280",
                        success: "#10b981",
                        warning: "#f59e0b",
                    },
                    status: {
                        down: "#ef4444",
                        paused: "#f59e0b",
                        pending: "#6b7280",
                        unknown: "#9ca3af",
                        up: "#10b981",
                    },
                    text: {
                        disabled: "#9ca3af",
                        error: "#ef4444",
                        inverse: "#ffffff",
                        muted: "#6b7280",
                        primary: "#111827",
                        success: "#10b981",
                        warning: "#f59e0b",
                    },
                },
                components: {
                    button: {
                        borderRadius: "6px",
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
                },
                shadows: {
                    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    none: "none",
                    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                },
                spacing: {
                    lg: "16px",
                    md: "12px",
                    sm: "8px",
                    xl: "24px",
                    xs: "4px",
                    xxl: "32px",
                    xxs: "2px",
                },
                typography: {
                    fontFamily: {
                        body: "system-ui",
                        heading: "system-ui",
                        mono: "Monaco",
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
                    lineHeight: { body: "1.5", heading: "1.2", tight: "1.25" },
                },
            };

            const invalidConfig = {
                animation: { duration: { fast: "150ms" } },
                // Missing required properties
            };

            expect(isThemeConfig(validConfig)).toBeTruthy();
            expect(isThemeConfig(invalidConfig)).toBeFalsy();
            expect(isThemeConfig(null)).toBeFalsy();
            expect(isThemeConfig(undefined)).toBeFalsy();
            expect(isThemeConfig("string")).toBeFalsy();
        });
    });

    describe("ThemeConfigWithModes Interface", () => {
        it("should create valid ThemeConfigWithModes object", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: themeConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Constructor", "type");

            const lightConfig: ThemeConfig = {
                animation: {
                    duration: { fast: "150ms", normal: "300ms", slow: "500ms" },
                    easing: {
                        easeIn: "ease-in",
                        easeInOut: "ease-in-out",
                        easeOut: "ease-out",
                        linear: "linear",
                    },
                },
                borderRadius: {
                    full: "9999px",
                    lg: "8px",
                    md: "6px",
                    none: "0",
                    sm: "4px",
                    xl: "12px",
                },
                colors: {
                    background: {
                        default: "#ffffff",
                        elevated: "#f9fafb",
                        paper: "#ffffff",
                        primary: "#ffffff",
                        secondary: "#f3f4f6",
                    },
                    border: {
                        default: "#e5e7eb",
                        disabled: "#d1d5db",
                        error: "#ef4444",
                        focus: "#3b82f6",
                        hover: "#d1d5db",
                        success: "#10b981",
                        warning: "#f59e0b",
                    },
                    hover: {
                        background: "#f9fafb",
                        border: "#e5e7eb",
                        primary: "#3b82f6",
                        secondary: "#6b7280",
                        text: "#374151",
                    },
                    primary: {
                        error: "#ef4444",
                        info: "#3b82f6",
                        primary: "#3b82f6",
                        secondary: "#6b7280",
                        success: "#10b981",
                        warning: "#f59e0b",
                    },
                    status: {
                        down: "#ef4444",
                        paused: "#f59e0b",
                        pending: "#6b7280",
                        unknown: "#9ca3af",
                        up: "#10b981",
                    },
                    text: {
                        disabled: "#9ca3af",
                        error: "#ef4444",
                        inverse: "#ffffff",
                        muted: "#6b7280",
                        primary: "#111827",
                        success: "#10b981",
                        warning: "#f59e0b",
                    },
                },
                components: {
                    button: {
                        borderRadius: "6px",
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
                },
                shadows: {
                    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    none: "none",
                    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                },
                spacing: {
                    lg: "16px",
                    md: "12px",
                    sm: "8px",
                    xl: "24px",
                    xs: "4px",
                    xxl: "32px",
                    xxs: "2px",
                },
                typography: {
                    fontFamily: {
                        body: "system-ui",
                        heading: "system-ui",
                        mono: "Monaco",
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
                    lineHeight: { body: "1.5", heading: "1.2", tight: "1.25" },
                },
            };

            const darkConfig: ThemeConfig = {
                ...lightConfig,
                colors: {
                    ...lightConfig.colors,
                    background: {
                        default: "#1f2937",
                        elevated: "#374151",
                        paper: "#1f2937",
                        primary: "#1f2937",
                        secondary: "#111827",
                    },
                    text: {
                        ...lightConfig.colors.text,
                        primary: "#f9fafb",
                        inverse: "#111827",
                    },
                },
            };

            const themeWithModes: ThemeConfigWithModes = {
                dark: darkConfig,
                light: lightConfig,
            };

            expect(themeWithModes.light.colors.background.default).toBe(
                "#ffffff"
            );
            expect(themeWithModes.dark.colors.background.default).toBe(
                "#1f2937"
            );
            expect(themeWithModes.light.colors.text.primary).toBe("#111827");
            expect(themeWithModes.dark.colors.text.primary).toBe("#f9fafb");
        });
    });

    describe("ThemeOverride Interface", () => {
        it("should create valid ThemeOverride object", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: themeConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Constructor", "type");

            const override: ThemeOverride = {
                animation: {
                    duration: {
                        fast: "100ms",
                        normal: "300ms",
                        slow: "500ms",
                    },
                },
                colors: {
                    primary: {
                        error: "#ef4444",
                        info: "#3b82f6",
                        primary: "#3b82f6",
                        secondary: "#6b7280",
                        success: "#10b981",
                        warning: "#f59e0b",
                    },
                },
                typography: {
                    fontSize: {
                        body: "16px",
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
                },
            };

            expect(override.animation?.duration?.fast).toBe("100ms");
            expect(override.colors?.primary?.primary).toBe("#3b82f6");
            expect(override.typography?.fontSize?.body).toBe("16px");
        });

        it("should support partial overrides", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: themeConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const override: ThemeOverride = {
                spacing: {
                    lg: "20px",
                    xl: "28px",
                },
            };

            expect(override.spacing?.lg).toBe("20px");
            expect(override.spacing?.xl).toBe("28px");
            expect(override.animation).toBeUndefined();
            expect(override.colors).toBeUndefined();
        });
    });

    describe("DefaultThemeConfig Constant", () => {
        it("should provide valid default theme configuration", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: themeConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(DEFAULT_THEME_CONFIG).toBeDefined();
            expect(DEFAULT_THEME_CONFIG.animation).toBeDefined();
            expect(DEFAULT_THEME_CONFIG.borderRadius).toBeDefined();
            expect(DEFAULT_THEME_CONFIG.components).toBeDefined();
            expect(DEFAULT_THEME_CONFIG.shadows).toBeDefined();
            expect(DEFAULT_THEME_CONFIG.spacing).toBeDefined();
            expect(DEFAULT_THEME_CONFIG.typography).toBeDefined();
        });

        it("should have correct default animation values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: themeConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(DEFAULT_THEME_CONFIG.animation.duration.fast).toBe("150ms");
            expect(DEFAULT_THEME_CONFIG.animation.duration.normal).toBe(
                "300ms"
            );
            expect(DEFAULT_THEME_CONFIG.animation.duration.slow).toBe("500ms");
            expect(DEFAULT_THEME_CONFIG.animation.easing.linear).toBe("linear");
        });

        it("should have correct default spacing values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: themeConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(DEFAULT_THEME_CONFIG.spacing.xs).toBe("4px");
            expect(DEFAULT_THEME_CONFIG.spacing.sm).toBe("8px");
            expect(DEFAULT_THEME_CONFIG.spacing.md).toBe("12px");
            expect(DEFAULT_THEME_CONFIG.spacing.lg).toBe("16px");
            expect(DEFAULT_THEME_CONFIG.spacing.xl).toBe("24px");
        });

        it("should have correct default typography values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: themeConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(DEFAULT_THEME_CONFIG.typography.fontSize.body).toBe("14px");
            expect(DEFAULT_THEME_CONFIG.typography.fontWeight.normal).toBe(400);
            expect(DEFAULT_THEME_CONFIG.typography.lineHeight.body).toBe("1.5");
        });
    });

    describe("Type Validation Edge Cases", () => {
        it("should handle edge cases for isColorPalette", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: themeConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isColorPalette({})).toBeFalsy();
            expect(isColorPalette({ 50: "" })).toBeFalsy();
            expect(isColorPalette({ 50: "#fff", 100: null })).toBeFalsy();
            expect(isColorPalette([])).toBeFalsy();
            expect(isColorPalette(123)).toBeFalsy();
        });

        it("should handle edge cases for isThemeConfig", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: themeConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            expect(isThemeConfig({})).toBeFalsy();
            expect(isThemeConfig({ animation: {} })).toBeFalsy();
            expect(isThemeConfig({ animation: null })).toBeFalsy();
            expect(isThemeConfig([])).toBeFalsy();
            expect(isThemeConfig(123)).toBeFalsy();
        });
    });

    describe("HoverColors Interface", () => {
        it("should create valid HoverColors object", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: themeConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Constructor", "type");

            const hover: HoverColors = {
                background: "#f9fafb",
                border: "#e5e7eb",
                primary: "#3b82f6",
                secondary: "#6b7280",
                text: "#374151",
            };

            expect(hover.background).toBe("#f9fafb");
            expect(hover.border).toBe("#e5e7eb");
            expect(hover.primary).toBe("#3b82f6");
            expect(hover.secondary).toBe("#6b7280");
            expect(hover.text).toBe("#374151");
        });
    });

    describe("Complex Integration Tests", () => {
        it("should support nested theme configuration", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: themeConfig", "component");
            await annotate("Category: Shared", "category");
            await annotate("Type: Business Logic", "type");

            const complexConfig: ThemeConfig = {
                animation: DEFAULT_THEME_CONFIG.animation,
                borderRadius: DEFAULT_THEME_CONFIG.borderRadius,
                colors: {
                    background: {
                        default: "#ffffff",
                        elevated: "#f9fafb",
                        paper: "#ffffff",
                        primary: "#ffffff",
                        secondary: "#f3f4f6",
                    },
                    border: {
                        default: "#e5e7eb",
                        disabled: "#d1d5db",
                        error: "#ef4444",
                        focus: "#3b82f6",
                        hover: "#9ca3af",
                        success: "#10b981",
                        warning: "#f59e0b",
                    },
                    hover: {
                        background: "#f9fafb",
                        border: "#e5e7eb",
                        primary: "#3b82f6",
                        secondary: "#6b7280",
                        text: "#374151",
                    },
                    primary: {
                        error: "#ef4444",
                        info: "#3b82f6",
                        primary: "#3b82f6",
                        secondary: "#6b7280",
                        success: "#10b981",
                        warning: "#f59e0b",
                    },
                    status: {
                        down: "#ef4444",
                        paused: "#f59e0b",
                        pending: "#6b7280",
                        unknown: "#9ca3af",
                        up: "#10b981",
                    },
                    text: {
                        disabled: "#9ca3af",
                        error: "#ef4444",
                        inverse: "#ffffff",
                        muted: "#6b7280",
                        primary: "#111827",
                        success: "#10b981",
                        warning: "#f59e0b",
                    },
                },
                components: DEFAULT_THEME_CONFIG.components,
                shadows: DEFAULT_THEME_CONFIG.shadows,
                spacing: DEFAULT_THEME_CONFIG.spacing,
                typography: DEFAULT_THEME_CONFIG.typography,
            };

            expect(isThemeConfig(complexConfig)).toBeTruthy();
            expect(complexConfig.colors.primary.primary).toBe("#3b82f6");
            expect(complexConfig.animation.duration.normal).toBe("300ms");
        });
    });
});
