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
        it("should handle missing document in applyThemeClasses", () => {
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

        it("should handle missing window in onSystemThemeChange", () => {
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
        it("should properly handle media query events", () => {
            const mockCallback = vi.fn();
            const mockEventListener = vi.fn();
            const mockRemoveEventListener = vi.fn();

            const mockMediaQuery = {
                matches: false,
                media: "(prefers-color-scheme: dark)",
                addEventListener: mockEventListener,
                removeEventListener: mockRemoveEventListener,
            };

            // Mock window.matchMedia
            Object.defineProperty(globalThis, "matchMedia", {
                writable: true,
                value: vi.fn(() => mockMediaQuery),
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
        });

        it("should handle theme change from light to dark", () => {
            const mockCallback = vi.fn();
            const mockEventListener = vi.fn();

            const mockMediaQuery = {
                matches: false,
                media: "(prefers-color-scheme: dark)",
                addEventListener: mockEventListener,
                removeEventListener: vi.fn(),
            };

            Object.defineProperty(globalThis, "matchMedia", {
                writable: true,
                value: vi.fn(() => mockMediaQuery),
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
        });
    });

    describe("Edge Cases in applyTheme", () => {
        it("should handle applyTheme with all theme variants", () => {
            // Mock document methods
            const mockBodyClassList = {
                add: vi.fn(),
                remove: vi.fn(),
                contains: vi.fn(),
                toggle: vi.fn(),
            };

            const mockDocumentElementClassList = {
                add: vi.fn(),
                remove: vi.fn(),
                contains: vi.fn(),
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

            // Test with light theme
            const lightTheme = themeManager.getTheme("light");
            themeManager.applyTheme(lightTheme);

            // Verify dark class is removed for light theme
            expect(mockDocumentElementClassList.remove).toHaveBeenCalledWith(
                "dark"
            );
        });
    });

    describe("Complete Branch Coverage Scenarios", () => {
        it("should exercise all conditional branches in theme application", () => {
            // Test the conditional branches in applyThemeClasses that might be missed
            const mockRemove = vi.fn();
            const mockAdd = vi.fn();

            Object.defineProperty(document, "body", {
                value: { classList: { add: mockAdd, remove: mockRemove } },
                writable: true,
            });

            Object.defineProperty(document, "documentElement", {
                value: {
                    classList: { add: vi.fn(), remove: vi.fn() },
                    style: { setProperty: vi.fn() },
                },
                writable: true,
            });

            // Apply multiple themes to test the remove logic for all theme types
            const themes = ["light", "dark", "high-contrast"] as const;

            for (const themeName of themes) {
                const theme = themeManager.getTheme(themeName);
                themeManager.applyTheme(theme);
            }

            // Verify that theme classes are being properly removed and added
            expect(mockRemove).toHaveBeenCalledWith("theme-light");
            expect(mockRemove).toHaveBeenCalledWith("theme-dark");
            expect(mockRemove).toHaveBeenCalledWith("theme-high-contrast");
        });

        it("should test cleanup function returned by onSystemThemeChange", () => {
            const mockRemoveEventListener = vi.fn();
            const mockMediaQuery = {
                matches: false,
                media: "(prefers-color-scheme: dark)",
                addEventListener: vi.fn(),
                removeEventListener: mockRemoveEventListener,
            };

            Object.defineProperty(globalThis, "matchMedia", {
                writable: true,
                value: vi.fn(() => mockMediaQuery),
            });

            const cleanup = themeManager.onSystemThemeChange(() => {});

            // Test that cleanup function actually calls removeEventListener
            cleanup();
            expect(mockRemoveEventListener).toHaveBeenCalled();
        });
    });
});
