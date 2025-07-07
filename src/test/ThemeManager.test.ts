/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";

import { ThemeManager } from "../theme/ThemeManager";

// Mock window.matchMedia
const mockMatchMedia = vi.fn();

Object.defineProperty(window, "matchMedia", {
    value: mockMatchMedia,
    writable: true,
});

describe("ThemeManager", () => {
    let themeManager: ThemeManager;

    beforeEach(() => {
        vi.clearAllMocks();
        themeManager = ThemeManager.getInstance();

        // Mock matchMedia to return a MediaQueryList-like object
        mockMatchMedia.mockReturnValue({
            addEventListener: vi.fn(),
            matches: false,
            removeEventListener: vi.fn(),
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should be a singleton", () => {
        const instance1 = ThemeManager.getInstance();
        const instance2 = ThemeManager.getInstance();

        expect(instance1).toBe(instance2);
    });

    it("should get light theme", () => {
        const lightTheme = themeManager.getTheme("light");

        expect(lightTheme).toBeDefined();
        expect(lightTheme.name).toBe("light");
        expect(lightTheme.isDark).toBe(false);
    });

    it("should get dark theme", () => {
        const darkTheme = themeManager.getTheme("dark");

        expect(darkTheme).toBeDefined();
        expect(darkTheme.name).toBe("dark");
        expect(darkTheme.isDark).toBe(true);
    });

    it("should get high-contrast theme", () => {
        const highContrastTheme = themeManager.getTheme("high-contrast");

        expect(highContrastTheme).toBeDefined();
        expect(highContrastTheme.name).toBe("high-contrast");
    });

    it("should handle system theme with light preference", () => {
        mockMatchMedia.mockReturnValue({
            addEventListener: vi.fn(),
            matches: false, // Light mode
            removeEventListener: vi.fn(),
        });

        const systemTheme = themeManager.getTheme("system");

        expect(systemTheme).toBeDefined();
        expect(systemTheme.isDark).toBe(false);
    });

    it("should handle system theme with dark preference", () => {
        mockMatchMedia.mockReturnValue({
            addEventListener: vi.fn(),
            matches: true, // Dark mode
            removeEventListener: vi.fn(),
        });

        const systemTheme = themeManager.getTheme("system");

        expect(systemTheme).toBeDefined();
        expect(systemTheme.isDark).toBe(true);
    });

    it("should get available themes", () => {
        const availableThemes = themeManager.getAvailableThemes();

        expect(availableThemes).toContain("light");
        expect(availableThemes).toContain("dark");
        expect(availableThemes).toContain("system");
    });

    it("should get system theme preference", () => {
        mockMatchMedia.mockReturnValue({
            addEventListener: vi.fn(),
            matches: false,
            removeEventListener: vi.fn(),
        });

        const preference = themeManager.getSystemThemePreference();
        expect(preference).toBe("light");

        mockMatchMedia.mockReturnValue({
            addEventListener: vi.fn(),
            matches: true,
            removeEventListener: vi.fn(),
        });

        const darkPreference = themeManager.getSystemThemePreference();
        expect(darkPreference).toBe("dark");
    });

    it("should handle applyTheme", () => {
        const lightTheme = themeManager.getTheme("light");

        // applyTheme should not throw
        expect(() => {
            themeManager.applyTheme(lightTheme);
        }).not.toThrow();
    });

    it("should handle system theme change listener", () => {
        const mockCallback = vi.fn();
        const mockAddEventListener = vi.fn();
        const mockRemoveEventListener = vi.fn();

        mockMatchMedia.mockReturnValue({
            addEventListener: mockAddEventListener,
            matches: false,
            removeEventListener: mockRemoveEventListener,
        });

        const cleanup = themeManager.onSystemThemeChange(mockCallback);

        expect(mockAddEventListener).toHaveBeenCalled();

        // Call cleanup
        cleanup();
        expect(mockRemoveEventListener).toHaveBeenCalled();
    });

    it("should fallback to light theme for invalid system preference", () => {
        // Mock matchMedia to return an invalid value that would cause issues
        const invalidMatchMedia = vi.fn().mockReturnValue({
            addEventListener: vi.fn(),
            matches: undefined, // Invalid value
            removeEventListener: vi.fn(),
        });

        // Replace window.matchMedia temporarily
        const originalMatchMedia = window.matchMedia;
        window.matchMedia = invalidMatchMedia;

        try {
            const theme = themeManager.getTheme("system");
            expect(theme.name).toBe("light");
        } finally {
            // Restore original matchMedia
            window.matchMedia = originalMatchMedia;
        }
    });

    it("should handle edge case when matchMedia is undefined", () => {
        // Store original matchMedia
        const originalMatchMedia = window.matchMedia;

        // Remove matchMedia temporarily

        delete (window as any).matchMedia;

        const preference = themeManager.getSystemThemePreference();
        expect(preference).toBe("light"); // Should fallback to light

        // Restore matchMedia
        window.matchMedia = originalMatchMedia;
    });

    describe("applyTheme", () => {
        beforeEach(() => {
            // Mock document and document.documentElement
            const mockRoot = {
                classList: {
                    add: vi.fn(),
                    remove: vi.fn(),
                },
                style: {
                    setProperty: vi.fn(),
                },
            };

            const mockBody = {
                classList: {
                    add: vi.fn(),
                },
                className: "theme-old-theme some-other-class",
            };

            Object.defineProperty(document, "documentElement", {
                value: mockRoot,
                writable: true,
            });

            Object.defineProperty(document, "body", {
                value: mockBody,
                writable: true,
            });
        });

        it("should apply light theme CSS variables", () => {
            const lightTheme = themeManager.getTheme("light");
            themeManager.applyTheme(lightTheme);

            const root = document.documentElement;
            expect(root.style.setProperty).toHaveBeenCalledWith(expect.stringMatching(/--color-/), expect.any(String));
            expect(root.style.setProperty).toHaveBeenCalledWith(
                expect.stringMatching(/--font-size-/),
                expect.any(String)
            );
            expect(root.style.setProperty).toHaveBeenCalledWith(
                expect.stringMatching(/--font-weight-/),
                expect.any(String)
            );
            expect(root.style.setProperty).toHaveBeenCalledWith(
                expect.stringMatching(/--line-height-/),
                expect.any(String)
            );
            expect(root.style.setProperty).toHaveBeenCalledWith(
                expect.stringMatching(/--spacing-/),
                expect.any(String)
            );
            expect(root.style.setProperty).toHaveBeenCalledWith(expect.stringMatching(/--shadow-/), expect.any(String));
            expect(root.style.setProperty).toHaveBeenCalledWith(expect.stringMatching(/--radius-/), expect.any(String));
        });

        it("should set theme class on body for light theme", () => {
            const lightTheme = themeManager.getTheme("light");
            themeManager.applyTheme(lightTheme);

            expect(document.body.classList.add).toHaveBeenCalledWith("theme-light");
        });

        it("should remove dark class for light theme", () => {
            const lightTheme = themeManager.getTheme("light");
            themeManager.applyTheme(lightTheme);

            expect(document.documentElement.classList.remove).toHaveBeenCalledWith("dark");
        });

        it("should add dark class for dark theme", () => {
            const darkTheme = themeManager.getTheme("dark");
            themeManager.applyTheme(darkTheme);

            expect(document.documentElement.classList.add).toHaveBeenCalledWith("dark");
        });

        it("should handle missing document gracefully", () => {
            const originalDocument = global.document;

            // Remove document temporarily

            delete (global as any).document;

            const lightTheme = themeManager.getTheme("light");

            // Should not throw
            expect(() => {
                themeManager.applyTheme(lightTheme);
            }).not.toThrow();

            // Restore document
            global.document = originalDocument;
        });

        it("should handle non-object color values", () => {
            const themeWithStringColors = {
                ...themeManager.getTheme("light"),
                colors: {
                    ...themeManager.getTheme("light").colors,
                    // Test with a simple string override
                    customColor: "#ff0000" as unknown,
                },
            };

            // Cast to Theme to bypass type checking for this test case

            themeManager.applyTheme(themeWithStringColors as any);

            expect(document.documentElement.style.setProperty).toHaveBeenCalledWith("--color-customColor", "#ff0000");
        });
    });

    describe("createCustomTheme", () => {
        it("should create custom theme with overrides", () => {
            const baseTheme = themeManager.getTheme("light");
            const overrides = {
                colors: {
                    ...baseTheme.colors,
                    primary: {
                        ...baseTheme.colors.primary,
                        50: "#custom-color",
                    },
                },
                name: "custom" as const,
                spacing: {
                    ...baseTheme.spacing,
                    xs: "2px",
                },
            };

            const customTheme = themeManager.createCustomTheme(baseTheme, overrides);

            expect(customTheme.name).toBe("custom");
            expect(customTheme.colors.primary["50"]).toBe("#custom-color");
            expect(customTheme.spacing.xs).toBe("2px");
        });

        it("should preserve base theme properties when no overrides provided", () => {
            const baseTheme = themeManager.getTheme("dark");
            const customTheme = themeManager.createCustomTheme(baseTheme, {});

            expect(customTheme.colors).toEqual(baseTheme.colors);
            expect(customTheme.typography).toEqual(baseTheme.typography);
            expect(customTheme.spacing).toEqual(baseTheme.spacing);
            expect(customTheme.shadows).toEqual(baseTheme.shadows);
            expect(customTheme.borderRadius).toEqual(baseTheme.borderRadius);
        });

        it("should merge nested properties correctly", () => {
            const baseTheme = themeManager.getTheme("light");
            const overrides = {
                borderRadius: {
                    ...baseTheme.borderRadius,
                    lg: "12px",
                },
                typography: {
                    ...baseTheme.typography,
                    fontSize: {
                        ...baseTheme.typography.fontSize,
                        xl: "24px",
                    },
                },
            };

            const customTheme = themeManager.createCustomTheme(baseTheme, overrides);

            expect(customTheme.typography.fontSize.xl).toBe("24px");
            expect(customTheme.borderRadius.lg).toBe("12px");
        });
    });

    describe("isValidThemeName", () => {
        it("should return true for valid theme names", () => {
            expect(themeManager.isValidThemeName("light")).toBe(true);
            expect(themeManager.isValidThemeName("dark")).toBe(true);
            expect(themeManager.isValidThemeName("high-contrast")).toBe(true);
            expect(themeManager.isValidThemeName("system")).toBe(true);
        });

        it("should return false for invalid theme names", () => {
            expect(themeManager.isValidThemeName("invalid")).toBe(false);
            expect(themeManager.isValidThemeName("")).toBe(false);
            expect(themeManager.isValidThemeName("custom")).toBe(false);
        });
    });

    describe("generateCSSVariables", () => {
        it("should generate CSS variables for light theme", () => {
            const lightTheme = themeManager.getTheme("light");
            const cssVariables = themeManager.generateCSSVariables(lightTheme);

            expect(cssVariables).toContain(":root {");
            expect(cssVariables).toContain("--color-");
            expect(cssVariables).toContain("--font-size-");
            expect(cssVariables).toContain("--font-weight-");
            expect(cssVariables).toContain("--line-height-");
            expect(cssVariables).toContain("--spacing-");
            expect(cssVariables).toContain("--shadow-");
            expect(cssVariables).toContain("--radius-");
            expect(cssVariables).toContain("}");
        });

        it("should generate CSS variables for dark theme", () => {
            const darkTheme = themeManager.getTheme("dark");
            const cssVariables = themeManager.generateCSSVariables(darkTheme);

            expect(cssVariables).toContain(":root {");
            expect(cssVariables).toContain("--color-");
            expect(cssVariables).toBeDefined();
            expect(cssVariables.length).toBeGreaterThan(0);
        });

        it("should handle string color values in CSS generation", () => {
            const themeWithStringColors = {
                ...themeManager.getTheme("light"),
                colors: {
                    ...themeManager.getTheme("light").colors,
                    // Test with a simple string override
                    customColor: "#ff0000" as unknown,
                },
            };

            const cssVariables = themeManager.generateCSSVariables(themeWithStringColors as any);
            expect(cssVariables).toContain("--color-customColor: #ff0000;");
        });

        it("should handle nested color objects in CSS generation", () => {
            const lightTheme = themeManager.getTheme("light");
            const cssVariables = themeManager.generateCSSVariables(lightTheme);

            // Should contain nested color properties
            expect(cssVariables).toMatch(/--color-\w+-\w+:/);
        });
    });

    describe("getTheme edge cases", () => {
        it("should fallback to light theme for invalid theme name", () => {
            const theme = themeManager.getTheme("invalid" as any);
            expect(theme.name).toBe("light");
        });

        it("should handle system theme when matchMedia returns unexpected value", () => {
            const mockMediaQuery = {
                addEventListener: vi.fn(),
                matches: null, // Unexpected value
                removeEventListener: vi.fn(),
            };

            mockMatchMedia.mockReturnValue(mockMediaQuery);

            const systemTheme = themeManager.getTheme("system");
            expect(systemTheme.name).toBe("light"); // Should fallback
        });

        it("should fallback to light theme when getSystemThemePreference returns neither light nor dark", () => {
            // Mock getSystemThemePreference to return an unexpected value
            const originalGetSystemThemePreference = themeManager.getSystemThemePreference;

            (themeManager as any).getSystemThemePreference = vi.fn().mockReturnValue("unexpected" as any);

            const systemTheme = themeManager.getTheme("system");
            expect(systemTheme.name).toBe("light"); // Should fallback to light theme

            // Restore original method

            (themeManager as any).getSystemThemePreference = originalGetSystemThemePreference;
        });
    });

    describe("onSystemThemeChange edge cases", () => {
        it("should return empty cleanup function when window is undefined", () => {
            const originalWindow = global.window;

            // Remove window temporarily

            delete (global as any).window;

            const mockCallback = vi.fn();
            const cleanup = themeManager.onSystemThemeChange(mockCallback);

            // Should not throw and return a function
            expect(typeof cleanup).toBe("function");
            expect(() => cleanup()).not.toThrow();

            // Restore window
            global.window = originalWindow;
        });

        it("should return empty cleanup function when matchMedia is undefined", () => {
            const originalMatchMedia = window.matchMedia;

            // Remove matchMedia temporarily

            delete (window as any).matchMedia;

            const mockCallback = vi.fn();
            const cleanup = themeManager.onSystemThemeChange(mockCallback);

            // Should not throw and return a function
            expect(typeof cleanup).toBe("function");
            expect(() => cleanup()).not.toThrow();

            // Restore matchMedia
            window.matchMedia = originalMatchMedia;
        });

        it("should call callback when system theme changes", () => {
            const mockCallback = vi.fn();
            const mockAddEventListener = vi.fn();
            const mockRemoveEventListener = vi.fn();

            mockMatchMedia.mockReturnValue({
                addEventListener: mockAddEventListener,
                matches: false,
                removeEventListener: mockRemoveEventListener,
            });

            themeManager.onSystemThemeChange(mockCallback);

            // Get the handler that was registered
            const handler = mockAddEventListener.mock.calls[0]?.[1];

            // Simulate a theme change event
            if (handler) {
                handler({ matches: true });
            }

            expect(mockCallback).toHaveBeenCalledWith(true);
        });
    });
});
