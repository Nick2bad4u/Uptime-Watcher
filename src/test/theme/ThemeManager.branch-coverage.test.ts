/**
 * Additional branch coverage tests for ThemeManager.ts Focuses on achieving 98%
 * branch coverage by testing edge cases
 */

import { beforeEach, describe, expect, it, vi } from "vitest";

// Import ThemeManager - make sure it's the actual class
import { ThemeManager } from "../../theme/ThemeManager";

describe("ThemeManager - Branch Coverage Completion", () => {
    let themeManager: ThemeManager;

    beforeEach(() => {
        themeManager = ThemeManager.getInstance();
        vi.clearAllMocks();
    });

    describe("SSR Environment Handling", () => {
        it("should handle missing document in applyThemeClasses", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: ThemeManager.branch-coverage",
                "component"
            );
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            // Mock document as undefined to simulate SSR
            const originalDocument = globalThis.document;
            Object.defineProperty(globalThis, "document", {
                value: undefined,
                writable: true,
            });

            // This should not throw and should return early
            expect(() => {
                // Use reflection to access private method
                const applyThemeClassesMethod = (themeManager as any)
                    .applyThemeClasses;
                applyThemeClassesMethod.call(themeManager, {
                    name: "light",
                    isDark: false,
                    colors: {},
                    typography: {
                        fontFamily: "",
                        fontSize: "",
                        fontWeight: "",
                        lineHeight: "",
                    },
                    spacing: {},
                    shadows: { sm: "", md: "", lg: "" },
                    borderRadius: { sm: "", md: "", lg: "" },
                });
            }).not.toThrow();

            // Restore document
            Object.defineProperty(globalThis, "document", {
                value: originalDocument,
                writable: true,
            });
        });

        it("should handle missing window in onSystemThemeChange", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: ThemeManager.branch-coverage",
                "component"
            );
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            // Mock window as undefined to simulate SSR
            const originalWindow = globalThis.window;
            Object.defineProperty(globalThis, "window", {
                value: undefined,
                writable: true,
            });

            // Should return a no-op cleanup function
            const cleanup = themeManager.onSystemThemeChange(() => {});
            expect(typeof cleanup).toBe("function");

            // Cleanup function should not throw
            expect(() => cleanup()).not.toThrow();

            // Restore window
            Object.defineProperty(globalThis, "window", {
                value: originalWindow,
                writable: true,
            });
        });
    });

    describe("MediaQuery Event Handling", () => {
        it("should properly handle media query events", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: ThemeManager.branch-coverage",
                "component"
            );
            await annotate("Category: Core", "category");
            await annotate("Type: Event Processing", "type");

            const mockCallback = vi.fn();
            const mockEventListener = vi.fn();
            const mockRemoveEventListener = vi.fn();

            const mockMediaQuery = {
                matches: false,
                media: "(prefers-color-scheme: dark)",
                addEventListener: mockEventListener,
                removeEventListener: mockRemoveEventListener,
            };

            const originalWindowMatchMedia = window.matchMedia;
            const originalGlobalMatchMedia = globalThis.matchMedia;

            const matchMediaStub = vi.fn(() => mockMediaQuery);

            Object.defineProperty(window, "matchMedia", {
                configurable: true,
                writable: true,
                value: matchMediaStub,
            });
            Object.defineProperty(globalThis, "matchMedia", {
                configurable: true,
                writable: true,
                value: matchMediaStub,
            });

            // Setup the theme change listener
            const cleanup = themeManager.onSystemThemeChange(mockCallback);

            // Verify addEventListener was called
            expect(mockEventListener).toHaveBeenCalledWith(
                "change",
                expect.any(Function)
            );

            // Simulate a media query change event
            const handler = mockEventListener.mock.calls[0]?.[1];
            const mockEvent = { matches: true } as MediaQueryListEvent;
            handler?.(mockEvent);

            // Verify callback was called with correct value
            expect(mockCallback).toHaveBeenCalledWith(true);

            // Test cleanup
            cleanup();
            expect(mockRemoveEventListener).toHaveBeenCalledWith(
                "change",
                handler
            );

            Object.defineProperty(window, "matchMedia", {
                configurable: true,
                writable: true,
                value: originalWindowMatchMedia,
            });
            Object.defineProperty(globalThis, "matchMedia", {
                configurable: true,
                writable: true,
                value: originalGlobalMatchMedia,
            });
        });

        it("should handle theme change from light to dark", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: ThemeManager.branch-coverage",
                "component"
            );
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const mockCallback = vi.fn();
            const mockEventListener = vi.fn();

            const mockMediaQuery = {
                matches: false,
                media: "(prefers-color-scheme: dark)",
                addEventListener: mockEventListener,
                removeEventListener: vi.fn(),
            };

            const originalWindowMatchMedia = window.matchMedia;
            const originalGlobalMatchMedia = globalThis.matchMedia;
            const matchMediaStub = vi.fn(() => mockMediaQuery);

            Object.defineProperty(window, "matchMedia", {
                configurable: true,
                writable: true,
                value: matchMediaStub,
            });
            Object.defineProperty(globalThis, "matchMedia", {
                configurable: true,
                writable: true,
                value: matchMediaStub,
            });

            themeManager.onSystemThemeChange(mockCallback);

            // Get the handler function that was registered
            const handler = mockEventListener.mock.calls[0]?.[1];

            // Simulate theme change to dark
            handler?.({ matches: true } as MediaQueryListEvent);
            expect(mockCallback).toHaveBeenCalledWith(true);

            // Simulate theme change to light
            handler({ matches: false } as MediaQueryListEvent);
            expect(mockCallback).toHaveBeenCalledWith(false);

            Object.defineProperty(window, "matchMedia", {
                configurable: true,
                writable: true,
                value: originalWindowMatchMedia,
            });
            Object.defineProperty(globalThis, "matchMedia", {
                configurable: true,
                writable: true,
                value: originalGlobalMatchMedia,
            });
        });
    });

    describe("Edge Cases in applyTheme", () => {
        it("should handle applyTheme with all theme variants", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: ThemeManager.branch-coverage",
                "component"
            );
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            // Mock document methods
            const mockBodyClassList = {
                add: vi.fn(),
                remove: vi.fn(),
                contains: vi.fn().mockImplementation(
                    (className: string) =>
                        // Simulate that body contains 'theme-dark' initially
                        className === "theme-dark"
                ),
                toggle: vi.fn(),
            };

            // Track whether dark class is present
            let hasDarkClass = false;

            const mockDocumentElementClassList = {
                add: vi.fn().mockImplementation((className: string) => {
                    if (className === "dark") {
                        hasDarkClass = true;
                    }
                }),
                remove: vi.fn().mockImplementation((className: string) => {
                    if (className === "dark") {
                        hasDarkClass = false;
                    }
                }),
                contains: vi.fn().mockImplementation((className: string) => {
                    if (className === "dark") {
                        return hasDarkClass;
                    }
                    return false;
                }),
                toggle: vi.fn(),
            };

            Object.defineProperty(document, "body", {
                value: { classList: mockBodyClassList },
                writable: true,
            });

            Object.defineProperty(document, "documentElement", {
                value: {
                    classList: mockDocumentElementClassList,
                    style: { setProperty: vi.fn(), removeProperty: vi.fn() },
                },
                writable: true,
            });

            // Test with dark theme
            const darkTheme = themeManager.getTheme("dark");
            themeManager.applyTheme(darkTheme);

            // Verify dark class is added
            expect(mockDocumentElementClassList.add).toHaveBeenCalledWith(
                "dark"
            );

            // Test with light theme - this should trigger the removal of dark class
            const lightTheme = themeManager.getTheme("light");
            themeManager.applyTheme(lightTheme);

            // Verify dark class is removed for light theme
            expect(mockDocumentElementClassList.remove).toHaveBeenCalledWith(
                "dark"
            );
        });
    });

    describe("Complete Branch Coverage Scenarios", () => {
        it("should exercise all conditional branches in theme application", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: ThemeManager.branch-coverage",
                "component"
            );
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            // Test the conditional branches in applyThemeClasses that might be missed
            const mockRemove = vi.fn();
            const mockAdd = vi.fn();
            const mockContains = vi.fn().mockReturnValue(true); // Simulate existing classes

            Object.defineProperty(document, "body", {
                value: {
                    classList: {
                        add: mockAdd,
                        remove: mockRemove,
                        contains: mockContains,
                    },
                },
                writable: true,
            });

            Object.defineProperty(document, "documentElement", {
                value: {
                    classList: {
                        add: vi.fn(),
                        remove: vi.fn(),
                        contains: vi.fn().mockReturnValue(true),
                    },
                    style: { setProperty: vi.fn() },
                },
                writable: true,
            });

            // Apply multiple themes to test the remove logic for all theme types
            const themes = [
                "light",
                "dark",
                "high-contrast",
            ] as const;

            for (const themeName of themes) {
                const theme = themeManager.getTheme(themeName);
                themeManager.applyTheme(theme);
            }

            // Verify that theme classes are being properly added
            expect(mockAdd).toHaveBeenCalled();
            // Verify that old theme classes are being removed when switching themes
            expect(mockRemove).toHaveBeenCalled();
        });

        it("should test cleanup function returned by onSystemThemeChange", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: ThemeManager.branch-coverage",
                "component"
            );
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const mockRemoveEventListener = vi.fn();
            const mockMediaQuery = {
                matches: false,
                media: "(prefers-color-scheme: dark)",
                addEventListener: vi.fn(),
                removeEventListener: mockRemoveEventListener,
            };

            const originalWindowMatchMedia = window.matchMedia;
            const originalGlobalMatchMedia = globalThis.matchMedia;
            const matchMediaStub = vi.fn(() => mockMediaQuery);

            Object.defineProperty(window, "matchMedia", {
                configurable: true,
                writable: true,
                value: matchMediaStub,
            });
            Object.defineProperty(globalThis, "matchMedia", {
                configurable: true,
                writable: true,
                value: matchMediaStub,
            });

            const cleanup = themeManager.onSystemThemeChange(() => {});

            // Test that cleanup function actually calls removeEventListener
            cleanup();
            expect(mockRemoveEventListener).toHaveBeenCalled();

            Object.defineProperty(window, "matchMedia", {
                configurable: true,
                writable: true,
                value: originalWindowMatchMedia,
            });
            Object.defineProperty(globalThis, "matchMedia", {
                configurable: true,
                writable: true,
                value: originalGlobalMatchMedia,
            });
        });
    });
});
