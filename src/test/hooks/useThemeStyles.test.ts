/**
 * @file Comprehensive tests for useThemeStyles hook Tests theme-aware CSS-in-JS
 *   styles with SSR support and theme change reactivity
 */

import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import { useThemeStyles } from "../../hooks/useThemeStyles";

// Mock window.matchMedia
const createMockMediaQuery = (matches: boolean): MediaQueryList =>
    ({
        addEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
        matches,
        media: "(prefers-color-scheme: dark)",
        onchange: null,
        removeEventListener: vi.fn(),
    }) as unknown as MediaQueryList;

// Setup window.matchMedia mock before any tests run
Object.defineProperty(globalThis, "matchMedia", {
    writable: true,
    value: vi
        .fn()
        .mockImplementation((_query: string) => createMockMediaQuery(false)),
});

describe("useThemeStyles Hook", () => {
    let mockMediaQuery: ReturnType<typeof createMockMediaQuery>;
    let originalMatchMedia: typeof globalThis.matchMedia;

    beforeEach(() => {
        // Save original matchMedia if it exists
        originalMatchMedia =
            (globalThis as any).window?.matchMedia || globalThis.matchMedia;

        mockMediaQuery = createMockMediaQuery(false);
        Object.defineProperty(globalThis, "matchMedia", {
            writable: true,
            value: vi.fn().mockReturnValue(mockMediaQuery),
        });
    });

    afterEach(() => {
        vi.clearAllMocks();
        // Restore original matchMedia
        if (originalMatchMedia) {
            Object.defineProperty(globalThis, "matchMedia", {
                writable: true,
                value: originalMatchMedia,
            });
        }
    });

    describe("Light Mode Styles", () => {
        beforeEach(() => {
            mockMediaQuery = createMockMediaQuery(false);
            (globalThis.matchMedia as any).mockReturnValue(mockMediaQuery);
        });

        it("should return light mode styles when collapsed=false", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useThemeStyles", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            const { result } = renderHook(() => useThemeStyles(false));

            expect(result.current.headerStyle.background).toContain(
                "rgba(59, 130, 246, 0.1)"
            );
            expect(result.current.headerStyle.color).toBe("#111827");
            expect(result.current.headerStyle.height).toBe("auto");
            expect(result.current.headerStyle.minHeight).toBe("140px");
            expect(result.current.titleStyle.color).toBe("#111827");
            expect(result.current.contentStyle.padding).toBe("1.5rem");
        });

        it("should return light mode styles when collapsed=true", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useThemeStyles", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            const { result } = renderHook(() => useThemeStyles(true));

            expect(result.current.headerStyle.height).toBe("80px");
            expect(result.current.headerStyle.minHeight).toBe("80px");
            expect(result.current.contentStyle.padding).toBe("1rem 1.5rem");
        });

        it("should have correct light mode colors for all style properties", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useThemeStyles", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            const { result } = renderHook(() => useThemeStyles());

            // Header styles
            expect(result.current.headerStyle.color).toBe("#111827");
            expect(result.current.headerStyle.background).toContain(
                "rgba(59, 130, 246, 0.1)"
            );

            // Title styles
            expect(result.current.titleStyle.color).toBe("#111827");

            // Meta and URL styles
            expect(result.current.metaStyle.color).toBe("#6b7280");
            expect(result.current.urlStyle.color).toBe("#6b7280");

            // Button styles
            expect(result.current.collapseButtonStyle.color).toBe("#6b7280");

            // Overlay styles
            expect(result.current.overlayStyle.background).toContain(
                "rgba(59, 130, 246, 0.05)"
            );
        });

        it("should have proper light mode shadows and effects", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useThemeStyles", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            const { result } = renderHook(() => useThemeStyles());

            expect(result.current.headerStyle.boxShadow).toContain(
                "rgba(0, 0, 0, 0.1)"
            );
            expect(result.current.titleStyle.textShadow).toContain(
                "rgba(59, 130, 246, 0.1)"
            );
        });
    });

    describe("Dark Mode Styles", () => {
        beforeEach(() => {
            mockMediaQuery = createMockMediaQuery(true);
            (globalThis.matchMedia as any).mockReturnValue(mockMediaQuery);
        });

        it("should return dark mode styles when collapsed=false", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useThemeStyles", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            const { result } = renderHook(() => useThemeStyles(false));

            expect(result.current.headerStyle.background).toContain(
                "rgba(37, 99, 235, 0.15)"
            );
            expect(result.current.headerStyle.color).toBe("#f3f4f6");
            expect(result.current.titleStyle.color).toBe("#f3f4f6");
            expect(result.current.contentStyle.padding).toBe("1.5rem");
        });

        it("should return dark mode styles when collapsed=true", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useThemeStyles", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            const { result } = renderHook(() => useThemeStyles(true));

            expect(result.current.headerStyle.height).toBe("80px");
            expect(result.current.headerStyle.minHeight).toBe("80px");
            expect(result.current.contentStyle.padding).toBe("1rem 1.5rem");
        });

        it("should have correct dark mode colors for all style properties", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useThemeStyles", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            const { result } = renderHook(() => useThemeStyles());

            // Header styles
            expect(result.current.headerStyle.color).toBe("#f3f4f6");
            expect(result.current.headerStyle.background).toContain(
                "rgba(37, 99, 235, 0.15)"
            );

            // Title styles
            expect(result.current.titleStyle.color).toBe("#f3f4f6");

            // Meta and URL styles
            expect(result.current.metaStyle.color).toBe("#9ca3af");
            expect(result.current.urlStyle.color).toBe("#9ca3af");

            // Button styles
            expect(result.current.collapseButtonStyle.color).toBe("#9ca3af");

            // Overlay styles
            expect(result.current.overlayStyle.background).toContain(
                "rgba(37, 99, 235, 0.05)"
            );
        });

        it("should have proper dark mode shadows and effects", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useThemeStyles", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            const { result } = renderHook(() => useThemeStyles());

            expect(result.current.headerStyle.boxShadow).toContain(
                "rgba(0, 0, 0, 0.4)"
            );
            expect(result.current.titleStyle.textShadow).toContain(
                "rgba(59, 130, 246, 0.3)"
            );
        });
    });

    describe("Theme Change Reactivity", () => {
        it("should react to theme changes via media query listener", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useThemeStyles", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            // Start with light mode
            mockMediaQuery = createMockMediaQuery(false);
            (globalThis.matchMedia as any).mockReturnValue(mockMediaQuery);

            const { result } = renderHook(() => useThemeStyles());

            // Initial light mode
            expect(result.current.headerStyle.color).toBe("#111827");

            // Simulate theme change to dark mode
            Reflect.set(
                mockMediaQuery as unknown as Record<string, unknown>,
                "matches",
                true
            );
            const listener = (
                mockMediaQuery.addEventListener as unknown as ReturnType<
                    typeof vi.fn
                >
            ).mock.calls[0]?.[1];

            act(() => {
                if (listener) {
                    listener({ matches: true });
                }
            });

            // Should now be dark mode
            expect(result.current.headerStyle.color).toBe("#f3f4f6");
        });

        it("should react to theme changes from dark to light", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useThemeStyles", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            // Start with dark mode
            mockMediaQuery = createMockMediaQuery(true);
            (globalThis.matchMedia as any).mockReturnValue(mockMediaQuery);

            const { result } = renderHook(() => useThemeStyles());

            // Initial dark mode
            expect(result.current.headerStyle.color).toBe("#f3f4f6");

            // Simulate theme change to light mode
            Reflect.set(
                mockMediaQuery as unknown as Record<string, unknown>,
                "matches",
                false
            );
            const listener = (
                mockMediaQuery.addEventListener as unknown as ReturnType<
                    typeof vi.fn
                >
            ).mock.calls[0]?.[1];

            act(() => {
                if (listener) {
                    listener({ matches: false });
                }
            });

            // Should now be light mode
            expect(result.current.headerStyle.color).toBe("#111827");
        });

        it("should properly register and cleanup media query listeners", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useThemeStyles", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            const { unmount } = renderHook(() => useThemeStyles());

            // Should register event listener
            expect(mockMediaQuery.addEventListener).toHaveBeenCalledWith(
                "change",
                expect.any(Function)
            );

            // Should cleanup on unmount
            unmount();
            expect(mockMediaQuery.removeEventListener).toHaveBeenCalledWith(
                "change",
                expect.any(Function)
            );
        });
    });

    describe("Collapsed State Behavior", () => {
        it("should handle collapsed state changes properly", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useThemeStyles", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            const { result, rerender } = renderHook(
                ({ collapsed }) => useThemeStyles(collapsed),
                {
                    initialProps: { collapsed: false },
                }
            );

            // Initially not collapsed
            expect(result.current.headerStyle.height).toBe("auto");
            expect(result.current.headerStyle.minHeight).toBe("140px");
            expect(result.current.contentStyle.padding).toBe("1.5rem");

            // Change to collapsed
            rerender({ collapsed: true });

            expect(result.current.headerStyle.height).toBe("80px");
            expect(result.current.headerStyle.minHeight).toBe("80px");
            expect(result.current.contentStyle.padding).toBe("1rem 1.5rem");

            // Change back to not collapsed
            rerender({ collapsed: false });

            expect(result.current.headerStyle.height).toBe("auto");
            expect(result.current.headerStyle.minHeight).toBe("140px");
            expect(result.current.contentStyle.padding).toBe("1.5rem");
        });

        it("should use default collapsed=false when no parameter provided", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useThemeStyles", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            const { result } = renderHook(() => useThemeStyles());

            expect(result.current.headerStyle.height).toBe("auto");
            expect(result.current.headerStyle.minHeight).toBe("140px");
            expect(result.current.contentStyle.padding).toBe("1.5rem");
        });
    });

    describe("SSR Compatibility", () => {
        it("should handle missing matchMedia function gracefully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useThemeStyles", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            // Mock environment without matchMedia
            Object.defineProperty(globalThis, "matchMedia", {
                writable: true,
                value: undefined,
            });

            const { result } = renderHook(() => useThemeStyles());

            // Should default to light mode styles
            expect(result.current.headerStyle.color).toBe("#111827");
            expect(result.current.titleStyle.color).toBe("#111827");
        });

        it("should handle matchMedia function that throws errors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useThemeStyles", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Error Handling", "type");

            // Mock matchMedia that throws
            Object.defineProperty(globalThis, "matchMedia", {
                writable: true,
                value: vi.fn().mockImplementation(() => {
                    throw new Error("matchMedia not supported");
                }),
            });

            const { result } = renderHook(() => useThemeStyles());

            // Should fallback to light mode styles
            expect(result.current.headerStyle.color).toBe("#111827");
            expect(result.current.titleStyle.color).toBe("#111827");
        });
    });

    describe("Style Properties Validation", () => {
        it("should return all required style properties", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useThemeStyles", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            const { result } = renderHook(() => useThemeStyles());

            expect(result.current).toHaveProperty("collapseButtonStyle");
            expect(result.current).toHaveProperty("contentStyle");
            expect(result.current).toHaveProperty("headerStyle");
            expect(result.current).toHaveProperty("metaStyle");
            expect(result.current).toHaveProperty("overlayStyle");
            expect(result.current).toHaveProperty("titleStyle");
            expect(result.current).toHaveProperty("urlStyle");
        });

        it("should have consistent transition properties", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useThemeStyles", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            const { result } = renderHook(() => useThemeStyles());

            // Check that transition properties are consistent
            // This test validates the theme animation timing

            expect(result.current.collapseButtonStyle.transition).toMatch(
                /all.*0\.3s cubic-bezier/
            );
            expect(result.current.contentStyle.transition).toMatch(
                /padding.*0\.3s cubic-bezier/
            );
            expect(result.current.headerStyle.transition).toMatch(
                /all.*0\.3s cubic-bezier/
            );
            expect(result.current.overlayStyle.transition).toMatch(
                /background.*0\.3s cubic-bezier/
            );
            expect(result.current.titleStyle.transition).toMatch(
                /all.*0\.3s cubic-bezier/
            );
            expect(result.current.urlStyle.transition).toMatch(
                /color.*0\.3s cubic-bezier/
            );
        });

        it("should have proper accessibility and usability properties", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useThemeStyles", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            const { result } = renderHook(() => useThemeStyles());

            // Button should be accessible
            expect(result.current.collapseButtonStyle.cursor).toBe("pointer");
            expect(result.current.collapseButtonStyle.border).toBe("none");
            expect(result.current.collapseButtonStyle.backgroundColor).toBe(
                "transparent"
            );

            // URL should handle long text
            expect(result.current.urlStyle.wordBreak).toBe("break-all");
            expect(result.current.urlStyle.maxWidth).toBe("100%");

            // Overlay should not interfere with interactions
            expect(result.current.overlayStyle.pointerEvents).toBe("none");

            // Content should have proper z-index stacking
            expect(result.current.contentStyle.zIndex).toBe(2);
            expect(result.current.overlayStyle.zIndex).toBe(1);
        });

        it("should have proper border radius consistency", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useThemeStyles", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            const { result } = renderHook(() => useThemeStyles());

            expect(result.current.collapseButtonStyle.borderRadius).toBe(
                "0.375rem"
            );
            expect(result.current.headerStyle.borderRadius).toBe("0.75rem");
            expect(result.current.overlayStyle.borderRadius).toBe("0.75rem");
        });
    });

    describe("Performance and Memoization", () => {
        it("should memoize styles properly to prevent unnecessary re-renders", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useThemeStyles", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Event Processing", "type");

            const { result, rerender } = renderHook(
                ({ collapsed }) => useThemeStyles(collapsed),
                {
                    initialProps: { collapsed: false },
                }
            );

            const initialStyles = result.current;

            // Re-render with same props should return same object reference
            rerender({ collapsed: false });
            expect(result.current).toBe(initialStyles);

            // Re-render with different props should return new object
            rerender({ collapsed: true });
            expect(result.current).not.toBe(initialStyles);
        });

        it("should handle rapid state changes efficiently", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useThemeStyles", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            const { result, rerender } = renderHook(
                ({ collapsed }) => useThemeStyles(collapsed),
                {
                    initialProps: { collapsed: false },
                }
            );

            // Rapid state changes
            for (let i = 0; i < 10; i++) {
                rerender({ collapsed: i % 2 === 0 });
            }

            // Should still work correctly
            expect(result.current.headerStyle.height).toBe("auto");
            expect(result.current.contentStyle.padding).toBe("1.5rem");
        });
    });

    describe("Integration Scenarios", () => {
        it("should work correctly in a real-world component scenario", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useThemeStyles", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            // Simulate a component that uses both collapsed and theme states
            const { result } = renderHook(() => {
                const lightStyles = useThemeStyles(false);
                const darkStyles = useThemeStyles(true);
                return { lightStyles, darkStyles };
            });

            // Both should be properly configured
            expect(result.current.lightStyles.headerStyle.height).toBe("auto");
            expect(result.current.darkStyles.headerStyle.height).toBe("80px");
        });

        it("should handle edge case values gracefully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: useThemeStyles", "component");
            await annotate("Category: Hook", "category");
            await annotate("Type: Business Logic", "type");

            const { result: undefinedResult } = renderHook(() =>
                useThemeStyles(undefined as any)
            );
            const { result: nullResult } = renderHook(() =>
                useThemeStyles(null as any)
            );

            // Should handle falsy values properly (default to false)
            expect(undefinedResult.current.headerStyle.height).toBe("auto");
            expect(nullResult.current.headerStyle.height).toBe("auto");
        });
    });
});
