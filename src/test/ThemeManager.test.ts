import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { ThemeManager } from "../theme/ThemeManager";
import { lightTheme, darkTheme } from "../theme/themes";
import type { Theme } from "../theme/types";

// Mock DOM environment
Object.defineProperty(globalThis, "matchMedia", {
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

describe(ThemeManager, () => {
    let themeManager: ThemeManager;
    let mockDocumentElement: any;
    let mockBodyClassList: any;

    beforeEach(() => {
        themeManager = ThemeManager.getInstance();

        // Mock document.documentElement
        mockDocumentElement = {
            style: {
                setProperty: vi.fn(),
                removeProperty: vi.fn(),
            },
            classList: {
                add: vi.fn(),
                remove: vi.fn(),
                contains: vi.fn().mockReturnValue(false),
            },
        };

        // Mock document.body with proper classList
        mockBodyClassList = {
            classList: {
                add: vi.fn(),
                remove: vi.fn(),
                contains: vi.fn().mockReturnValue(false),
                toggle: vi.fn(),
            },
        };

        Object.defineProperty(globalThis, "document", {
            value: {
                documentElement: mockDocumentElement,
                body: mockBodyClassList,
            },
            writable: true,
        });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe("getInstance", () => {
        it("should return singleton instance", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ThemeManager", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const instance1 = ThemeManager.getInstance();
            const instance2 = ThemeManager.getInstance();

            expect(instance1).toBe(instance2);
        });
    });

    describe("applyTheme", () => {
        it("should apply light theme", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ThemeManager", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            themeManager.applyTheme(lightTheme);

            expect(mockDocumentElement.style.setProperty).toHaveBeenCalled();
            expect(mockBodyClassList.classList.add).toHaveBeenCalledWith(
                "theme-light"
            );
        });

        it("should apply dark theme", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ThemeManager", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            themeManager.applyTheme(darkTheme);

            expect(mockDocumentElement.style.setProperty).toHaveBeenCalled();
            expect(mockBodyClassList.classList.add).toHaveBeenCalledWith(
                "theme-dark"
            );
            expect(mockDocumentElement.classList.add).toHaveBeenCalledWith(
                "dark"
            );
        });

        it("should handle undefined document", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ThemeManager", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            Object.defineProperty(globalThis, "document", {
                value: undefined,
                writable: true,
            });

            expect(() => {
                themeManager.applyTheme(lightTheme);
            }).not.toThrow();
        });
    });

    describe("getTheme", () => {
        it("should get light theme", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ThemeManager", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Data Retrieval", "type");

            const theme = themeManager.getTheme("light");

            expect(theme).toBe(lightTheme);
        });

        it("should get dark theme", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ThemeManager", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Data Retrieval", "type");

            const theme = themeManager.getTheme("dark");

            expect(theme).toBe(darkTheme);
        });

        it("should get system theme preference", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ThemeManager", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Data Retrieval", "type");

            vi.mocked(globalThis.matchMedia).mockReturnValue({
                matches: true,
                media: "(prefers-color-scheme: dark)",
                onchange: null,
                addListener: vi.fn(),
                removeListener: vi.fn(),
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
                dispatchEvent: vi.fn(),
            } as any);

            const theme = themeManager.getTheme("system");

            expect(theme).toBe(darkTheme);
        });
    });

    describe("getSystemThemePreference", () => {
        it("should return dark when user prefers dark mode", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ThemeManager", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            vi.mocked(globalThis.matchMedia).mockReturnValue({
                matches: true,
            } as any);

            const preference = themeManager.getSystemThemePreference();

            expect(preference).toBe("dark");
        });

        it("should return light when user prefers light mode", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ThemeManager", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            vi.mocked(globalThis.matchMedia).mockReturnValue({
                matches: false,
            } as any);

            const preference = themeManager.getSystemThemePreference();

            expect(preference).toBe("light");
        });

        it("should return light when window is undefined", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ThemeManager", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const originalWindow = globalThis.window;
            // Intentionally deleting window for testing fallback behavior
            delete (globalThis as any).window;

            const preference = themeManager.getSystemThemePreference();

            expect(preference).toBe("light");

            globalThis.window = originalWindow;
        });
    });

    describe("getAvailableThemes", () => {
        it("should return all available theme names including system", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ThemeManager", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const themes = themeManager.getAvailableThemes();

            expect(themes).toContain("light");
            expect(themes).toContain("dark");
            expect(themes).toContain("system");
        });
    });

    describe("isValidThemeName", () => {
        it("should validate correct theme names", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ThemeManager", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Validation", "type");

            expect(themeManager.isValidThemeName("light")).toBeTruthy();
            expect(themeManager.isValidThemeName("dark")).toBeTruthy();
            expect(themeManager.isValidThemeName("system")).toBeTruthy();
        });

        it("should reject invalid theme names", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ThemeManager", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            expect(themeManager.isValidThemeName("invalid")).toBeFalsy();
            expect(themeManager.isValidThemeName("")).toBeFalsy();
        });
    });

    describe("onSystemThemeChange", () => {
        it("should register listener for system theme changes", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ThemeManager", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const callback = vi.fn();
            const mockMediaQuery = {
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
            };

            vi.mocked(globalThis.matchMedia).mockReturnValue(
                mockMediaQuery as any
            );

            const cleanup = themeManager.onSystemThemeChange(callback);

            expect(mockMediaQuery.addEventListener).toHaveBeenCalledWith(
                "change",
                expect.any(Function)
            );

            cleanup();
            expect(mockMediaQuery.removeEventListener).toHaveBeenCalledWith(
                "change",
                expect.any(Function)
            );
        });

        it("should return no-op function when window is undefined", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ThemeManager", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const originalWindow = globalThis.window;
            // Intentionally deleting window for testing fallback behavior
            delete (globalThis as any).window;

            const callback = vi.fn();
            const cleanup = themeManager.onSystemThemeChange(callback);

            expect(typeof cleanup).toBe("function");
            expect(() => cleanup()).not.toThrow();

            globalThis.window = originalWindow;
        });
    });

    describe("createCustomTheme", () => {
        it("should create custom theme based on light theme", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ThemeManager", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Constructor", "type");

            const customTheme = themeManager.createCustomTheme(lightTheme, {
                colors: {
                    ...lightTheme.colors,
                    primary: {
                        ...lightTheme.colors.primary,
                        500: "#custom-color",
                    },
                },
            });

            expect(customTheme.colors.primary["500"]).toBe("#custom-color");
            expect(customTheme.name).toBe(lightTheme.name);
        });
    });

    describe("generateCSSVariables", () => {
        it("should generate CSS variables for theme", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ThemeManager", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const cssVariables = themeManager.generateCSSVariables(lightTheme);

            expect(cssVariables).toContain(":root {");
            expect(cssVariables).toContain("--color-");
            expect(cssVariables).toContain("--font-size-");
            expect(cssVariables).toContain("--spacing-");
        });
    });

    describe("Edge Cases and Error Handling", () => {
        it("should handle null/undefined theme properties gracefully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ThemeManager", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const manager = ThemeManager.getInstance();

            // Create a theme with null/undefined properties to test all edge cases
            const themeWithNullProps = {
                name: "null-test",
                isDark: false,
                colors: null,
                spacing: undefined,
                borderRadius: null,
                shadows: undefined,
                typography: null,
            } as any as Theme;

            // This should not throw even with null/undefined properties
            expect(() => {
                manager.generateCSSVariables(themeWithNullProps);
            }).not.toThrow();

            // Apply theme should also handle this gracefully
            expect(() => {
                manager.applyTheme(lightTheme); // Use valid theme object
            }).not.toThrow();
        });

        it("should handle partial typography object", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ThemeManager", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const manager = ThemeManager.getInstance();

            const themeWithPartialTypography = {
                name: "partial-typography",
                isDark: false,
                colors: {},
                spacing: {},
                borderRadius: {},
                shadows: {},
                typography: {
                    fontSize: null, // Test null fontSize
                    fontFamily: undefined, // Test undefined fontFamily
                },
            } as any as Theme;

            expect(() => {
                manager.generateCSSVariables(themeWithPartialTypography);
            }).not.toThrow();
        });

        it("should handle empty objects for theme properties", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ThemeManager", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const manager = ThemeManager.getInstance();

            const themeWithEmptyObjects = {
                name: "empty-objects",
                isDark: false,
                colors: {},
                spacing: {},
                borderRadius: {},
                shadows: {},
                typography: {},
            } as any as Theme;

            const result = manager.generateCSSVariables(themeWithEmptyObjects);
            expect(result).toBe(":root {\n\n}"); // Should return empty CSS block for empty objects
        });

        it("should handle complex color structures with null values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ThemeManager", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const manager = ThemeManager.getInstance();

            const themeWithComplexColors = {
                name: "complex-colors",
                isDark: false,
                colors: {
                    primary: {
                        50: "#f0f9ff",
                        500: null, // Test null color value
                    },
                    secondary: null, // Test null color category
                },
                spacing: {},
                borderRadius: {},
                shadows: {},
                typography: {},
            } as any as Theme;

            expect(() => {
                manager.generateCSSVariables(themeWithComplexColors);
            }).not.toThrow();
        });

        it("should handle nested null checks in apply methods", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ThemeManager", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const manager = ThemeManager.getInstance();

            // Test with theme that has some properties as null to trigger the private method null checks
            const themeWithNullBorderRadius = {
                ...lightTheme,
                borderRadius: null,
            } as any as Theme;

            const themeWithNullSpacing = {
                ...lightTheme,
                spacing: null,
            } as any as Theme;

            const themeWithNullShadows = {
                ...lightTheme,
                shadows: null,
            } as any as Theme;

            const themeWithNullColors = {
                ...lightTheme,
                colors: null,
            } as any as Theme;

            const themeWithNullTypography = {
                ...lightTheme,
                typography: null,
            } as any as Theme;

            // Test with typography that has null fontSize specifically (line 330)
            const themeWithNullFontSize = {
                ...lightTheme,
                typography: {
                    ...lightTheme.typography,
                    fontSize: null,
                } as any,
            } as any as Theme;

            // These should all complete without throwing, exercising the null checks
            expect(() =>
                manager.generateCSSVariables(themeWithNullBorderRadius)
            ).not.toThrow();
            expect(() =>
                manager.generateCSSVariables(themeWithNullSpacing)
            ).not.toThrow();
            expect(() =>
                manager.generateCSSVariables(themeWithNullShadows)
            ).not.toThrow();
            expect(() =>
                manager.generateCSSVariables(themeWithNullColors)
            ).not.toThrow();
            expect(() =>
                manager.generateCSSVariables(themeWithNullTypography)
            ).not.toThrow();
            expect(() =>
                manager.generateCSSVariables(themeWithNullFontSize)
            ).not.toThrow();

            // Also test applyTheme method which calls the apply methods directly
            expect(() =>
                manager.applyTheme(themeWithNullBorderRadius)
            ).not.toThrow();
            expect(() =>
                manager.applyTheme(themeWithNullSpacing)
            ).not.toThrow();
            expect(() =>
                manager.applyTheme(themeWithNullShadows)
            ).not.toThrow();
            expect(() => manager.applyTheme(themeWithNullColors)).not.toThrow();
            expect(() =>
                manager.applyTheme(themeWithNullTypography)
            ).not.toThrow();
            expect(() =>
                manager.applyTheme(themeWithNullFontSize)
            ).not.toThrow();
        });

        it("should handle undefined document in applyThemeClasses", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: ThemeManager", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const manager = ThemeManager.getInstance();

            // Mock document to be undefined to trigger line 302
            const originalDocument = globalThis.document;
            delete (globalThis as any).document;

            // This should handle undefined document gracefully
            expect(() => manager.applyTheme(lightTheme)).not.toThrow();

            // Restore document
            globalThis.document = originalDocument;
        });
    });
});
