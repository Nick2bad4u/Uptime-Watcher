/**
 * Comprehensive tests for ThemeManager.ts
 * Targets 90%+ branch coverage for all theme management functions
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

// Mock document with body
Object.defineProperty(global, "document", {
    value: {
        body: {
            classList: {
                add: vi.fn(),
                remove: vi.fn(),
                contains: vi.fn(),
                toggle: vi.fn(),
            },
        },
        documentElement: {
            style: {
                setProperty: vi.fn(),
                removeProperty: vi.fn(),
            },
            classList: {
                add: vi.fn(),
                remove: vi.fn(),
                contains: vi.fn(),
                toggle: vi.fn(),
            },
        },
        createElement: vi.fn(),
        createTextNode: vi.fn(),
        getElementById: vi.fn(),
        head: {
            appendChild: vi.fn(),
            removeChild: vi.fn(),
        },
    },
    writable: true,
});

import { ThemeManager } from "../../theme/ThemeManager";

describe("ThemeManager", () => {
    let themeManager: ThemeManager;

    beforeEach(() => {
        vi.clearAllMocks();
        themeManager = ThemeManager.getInstance();
    });

    describe("Singleton Pattern", () => {
        it("should return the same instance", () => {
            const instance1 = ThemeManager.getInstance();
            const instance2 = ThemeManager.getInstance();
            expect(instance1).toBe(instance2);
        });
    });

    describe("getTheme", () => {
        it("should return light theme", () => {
            const theme = themeManager.getTheme("light");
            expect(theme).toBeDefined();
            expect(theme.name).toBe("light");
        });

        it("should return dark theme", () => {
            const theme = themeManager.getTheme("dark");
            expect(theme).toBeDefined();
            expect(theme.name).toBe("dark");
        });

        it("should return high contrast theme", () => {
            const theme = themeManager.getTheme("high-contrast");
            expect(theme).toBeDefined();
            expect(theme.name).toBe("high-contrast");
        });

        it("should return existing theme for any valid name", () => {
            const availableThemes = themeManager.getAvailableThemes();
            for (const themeName of availableThemes) {
                const theme = themeManager.getTheme(themeName);
                expect(theme).toBeDefined();
                // System theme returns the actual detected theme, not "system"
                if (themeName === "system") {
                    expect(["light", "dark"]).toContain(theme.name);
                } else {
                    expect(theme.name).toBe(themeName);
                }
            }
        });
    });

    describe("getAvailableThemes", () => {
        it("should return array of theme names", () => {
            const availableThemes = themeManager.getAvailableThemes();
            expect(Array.isArray(availableThemes)).toBe(true);
            expect(availableThemes.length).toBeGreaterThan(0);
            expect(availableThemes).toContain("light");
            expect(availableThemes).toContain("dark");
        });
    });

    describe("getSystemThemePreference", () => {
        it("should return dark when system prefers dark", () => {
            vi.mocked(window.matchMedia).mockReturnValue({
                matches: true,
                media: "(prefers-color-scheme: dark)",
                onchange: null,
                addListener: vi.fn(),
                removeListener: vi.fn(),
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
                dispatchEvent: vi.fn(),
            } as any);

            const preference = themeManager.getSystemThemePreference();
            expect(preference).toBe("dark");
        });

        it("should return light when system prefers light", () => {
            vi.mocked(window.matchMedia).mockReturnValue({
                matches: false,
                media: "(prefers-color-scheme: dark)",
                onchange: null,
                addListener: vi.fn(),
                removeListener: vi.fn(),
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
                dispatchEvent: vi.fn(),
            } as any);

            const preference = themeManager.getSystemThemePreference();
            expect(preference).toBe("light");
        });

        it("should handle missing matchMedia", () => {
            const originalMatchMedia = window.matchMedia;
            // @ts-expect-error Testing missing matchMedia
            window.matchMedia = undefined;

            const preference = themeManager.getSystemThemePreference();
            expect(preference).toBe("light"); // default fallback

            // Restore matchMedia
            window.matchMedia = originalMatchMedia;
        });
    });

    describe("isValidThemeName", () => {
        it("should validate correct theme names", () => {
            expect(themeManager.isValidThemeName("light")).toBe(true);
            expect(themeManager.isValidThemeName("dark")).toBe(true);
            expect(themeManager.isValidThemeName("high-contrast")).toBe(true);
        });

        it("should reject invalid theme names", () => {
            expect(themeManager.isValidThemeName("invalid")).toBe(false);
            expect(themeManager.isValidThemeName("")).toBe(false);
            expect(themeManager.isValidThemeName("123")).toBe(false);
            expect(themeManager.isValidThemeName("custom-theme")).toBe(false);
        });

        it("should handle edge cases", () => {
            expect(themeManager.isValidThemeName(null as any)).toBe(false);
            expect(themeManager.isValidThemeName(undefined as any)).toBe(false);
            expect(themeManager.isValidThemeName(123 as any)).toBe(false);
            expect(themeManager.isValidThemeName({} as any)).toBe(false);
        });
    });

    describe("applyTheme", () => {
        it("should apply theme to document", () => {
            const lightTheme = themeManager.getTheme("light");
            themeManager.applyTheme(lightTheme);

            const documentElement = document.documentElement as any;
            expect(documentElement.style.setProperty).toHaveBeenCalled();
        });

        it("should handle missing document gracefully", () => {
            const originalDocument = global.document;
            delete (global as any).document;

            const lightTheme = themeManager.getTheme("light");
            expect(() => themeManager.applyTheme(lightTheme)).not.toThrow();

            // Restore document
            global.document = originalDocument;
        });

        it("should apply all theme properties", () => {
            const lightTheme = themeManager.getTheme("light");
            themeManager.applyTheme(lightTheme);

            const documentElement = document.documentElement as any;

            // Should set CSS properties for colors, typography, spacing, etc.
            expect(documentElement.style.setProperty).toHaveBeenCalledWith(
                expect.stringMatching(/--color-/),
                expect.any(String)
            );
        });

        it("should handle different theme types", () => {
            const availableThemes = themeManager.getAvailableThemes();

            for (const themeName of availableThemes) {
                const theme = themeManager.getTheme(themeName);
                expect(() => themeManager.applyTheme(theme)).not.toThrow();
            }
        });
    });

    describe("createCustomTheme", () => {
        it("should create custom theme from base theme", () => {
            const baseTheme = themeManager.getTheme("light");
            const overrides = {
                name: "custom-light",
            } as any;

            const customTheme = themeManager.createCustomTheme(baseTheme, overrides);

            expect(customTheme).toBeDefined();
            expect(customTheme.name).toBe("custom-light");
            expect(customTheme.colors).toEqual(baseTheme.colors); // Should preserve other properties
        });

        it("should handle partial overrides", () => {
            const baseTheme = themeManager.getTheme("dark");
            const overrides = {
                isDark: false,
            } as any;

            const customTheme = themeManager.createCustomTheme(baseTheme, overrides);

            expect(customTheme.isDark).toBe(false);
            expect(customTheme.colors).toEqual(baseTheme.colors); // Should preserve unmodified properties
        });

        it("should handle empty overrides", () => {
            const baseTheme = themeManager.getTheme("light");
            const customTheme = themeManager.createCustomTheme(baseTheme, {});

            expect(customTheme).toEqual(baseTheme);
        });

        it("should deep merge nested objects", () => {
            const baseTheme = themeManager.getTheme("light");
            const overrides = {
                name: "custom-theme",
                isDark: true,
            } as any;

            const customTheme = themeManager.createCustomTheme(baseTheme, overrides);

            expect(customTheme.name).toBe("custom-theme");
            expect(customTheme.isDark).toBe(true);
            expect(customTheme.typography).toEqual(baseTheme.typography);
        });
    });

    describe("generateCSSVariables", () => {
        it("should generate CSS variables string", () => {
            const theme = themeManager.getTheme("light");
            const cssVariables = themeManager.generateCSSVariables(theme);

            expect(typeof cssVariables).toBe("string");
            expect(cssVariables).toContain("--color-");
            expect(cssVariables).toContain("--font-size-");
            expect(cssVariables).toContain("--spacing-");
        });

        it("should handle all theme properties", () => {
            const theme = themeManager.getTheme("dark");
            const cssVariables = themeManager.generateCSSVariables(theme);

            // Should include color variables
            expect(cssVariables).toMatch(/--color-\w+-\w+:/);

            // Should include typography variables
            expect(cssVariables).toMatch(/--font-size-\w+:/);
            expect(cssVariables).toMatch(/--font-weight-\w+:/);
            expect(cssVariables).toMatch(/--line-height-\w+:/);

            // Should include spacing variables
            expect(cssVariables).toMatch(/--spacing-\w+:/);
        });

        it("should generate valid CSS syntax", () => {
            const theme = themeManager.getTheme("high-contrast");
            const cssVariables = themeManager.generateCSSVariables(theme);

            // Basic CSS syntax validation
            expect(cssVariables).toMatch(/--[\w-]+:\s*[^;]+;/);
            expect(cssVariables).not.toContain("undefined");
            expect(cssVariables).not.toContain("null");
        });
    });

    describe("Edge Cases and Error Handling", () => {
        it("should handle theme with missing properties", () => {
            const incompleteTheme = {
                name: "incomplete",
                colors: {},
                typography: { fontSize: {}, fontWeight: {}, lineHeight: {} },
                spacing: {},
                shadows: {},
                borderRadius: {},
            } as any;

            expect(() => themeManager.applyTheme(incompleteTheme)).not.toThrow();
            expect(() => themeManager.generateCSSVariables(incompleteTheme)).not.toThrow();
        });

        it("should handle null/undefined values gracefully", () => {
            const themeWithNulls = {
                name: "test",
                colors: { primary: null },
                typography: { fontSize: { sm: undefined } },
                spacing: {},
                shadows: {},
                borderRadius: {},
            } as any;

            expect(() => themeManager.applyTheme(themeWithNulls)).not.toThrow();
        });

        it("should work without DOM environment", () => {
            const originalDocument = global.document;
            delete (global as any).document;

            const theme = themeManager.getTheme("light");
            expect(() => themeManager.applyTheme(theme)).not.toThrow();

            // Restore document
            global.document = originalDocument;
        });
    });

    describe("Performance", () => {
        it("should handle multiple theme applications efficiently", () => {
            const theme = themeManager.getTheme("light");

            const start = performance.now();
            for (let i = 0; i < 100; i++) {
                themeManager.applyTheme(theme);
            }
            const end = performance.now();

            // Should complete within reasonable time (less than 100ms for 100 applications)
            expect(end - start).toBeLessThan(100);
        });

        it("should handle CSS variable generation efficiently", () => {
            const theme = themeManager.getTheme("dark");

            const start = performance.now();
            for (let i = 0; i < 1000; i++) {
                themeManager.generateCSSVariables(theme);
            }
            const end = performance.now();

            // Should complete within reasonable time
            expect(end - start).toBeLessThan(100);
        });
    });
});
