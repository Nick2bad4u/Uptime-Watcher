import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { useThemeStyles } from "../hooks/useThemeStyles";

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
    value: vi.fn().mockImplementation((query) => ({
        addEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
        matches: query === "(prefers-color-scheme: dark)",
        media: query,
        onchange: null,
        removeEventListener: vi.fn(),
    })),
    writable: true,
});

beforeEach(() => {
    vi.clearAllMocks();
});

describe("useThemeStyles", () => {
    it("should return theme styles object", () => {
        const { result } = renderHook(() => useThemeStyles());

        expect(result.current).toBeDefined();
        expect(typeof result.current).toBe("object");
    });

    it("should provide all required style properties", () => {
        const { result } = renderHook(() => useThemeStyles());

        expect(result.current.headerStyle).toBeDefined();
        expect(result.current.contentStyle).toBeDefined();
        expect(result.current.overlayStyle).toBeDefined();
        expect(result.current.collapseButtonStyle).toBeDefined();
        expect(result.current.titleStyle).toBeDefined();
        expect(result.current.urlStyle).toBeDefined();
        expect(result.current.metaStyle).toBeDefined();
    });

    it("should return CSS properties objects", () => {
        const { result } = renderHook(() => useThemeStyles());

        expect(typeof result.current.headerStyle).toBe("object");
        expect(typeof result.current.contentStyle).toBe("object");
        expect(typeof result.current.overlayStyle).toBe("object");
        expect(typeof result.current.collapseButtonStyle).toBe("object");
        expect(typeof result.current.titleStyle).toBe("object");
        expect(typeof result.current.urlStyle).toBe("object");
        expect(typeof result.current.metaStyle).toBe("object");
    });

    it("should handle collapsed state", () => {
        const { result: collapsedResult } = renderHook(() => useThemeStyles(true));
        const { result: expandedResult } = renderHook(() => useThemeStyles(false));

        expect(collapsedResult.current.contentStyle.padding).toBe("1rem 1.5rem");
        expect(expandedResult.current.contentStyle.padding).toBe("1.5rem");
    });

    it("should handle light mode", () => {
        vi.mocked(window.matchMedia).mockImplementation((query) => ({
            addEventListener: vi.fn(),
            addListener: vi.fn(),
            dispatchEvent: vi.fn(),
            matches: false, // Light mode
            media: query,
            onchange: null,
            removeEventListener: vi.fn(),
            removeListener: vi.fn(),
        }));

        const { result } = renderHook(() => useThemeStyles());

        expect(result.current.headerStyle.background).toContain("rgba(59, 130, 246, 0.1)");
        expect(result.current.headerStyle.color).toBe("#111827");
    });

    it("should handle dark mode", () => {
        vi.mocked(window.matchMedia).mockImplementation((query) => ({
            addEventListener: vi.fn(),
            addListener: vi.fn(),
            dispatchEvent: vi.fn(),
            matches: query === "(prefers-color-scheme: dark)",
            media: query,
            onchange: null,
            removeEventListener: vi.fn(),
            removeListener: vi.fn(),
        }));

        const { result } = renderHook(() => useThemeStyles());

        expect(result.current.headerStyle.background).toContain("rgba(37, 99, 235, 0.15)");
        expect(result.current.headerStyle.color).toBe("#f3f4f6");
    });

    it("should provide collapse button styles", () => {
        const { result } = renderHook(() => useThemeStyles());

        expect(result.current.collapseButtonStyle.backgroundColor).toBe("transparent");
        expect(result.current.collapseButtonStyle.border).toBe("none");
        expect(result.current.collapseButtonStyle.cursor).toBe("pointer");
        expect(result.current.collapseButtonStyle.padding).toBe("0.5rem");
    });

    it("should provide header styles with gradients", () => {
        const { result } = renderHook(() => useThemeStyles());

        expect(result.current.headerStyle.background).toContain("linear-gradient");
        expect(result.current.headerStyle.borderRadius).toBe("0.75rem");
        expect(result.current.headerStyle.boxShadow).toBeDefined();
    });

    it("should provide overlay styles", () => {
        const { result } = renderHook(() => useThemeStyles());

        expect(result.current.overlayStyle).toBeDefined();
        expect(typeof result.current.overlayStyle).toBe("object");
    });

    it("should provide title styles", () => {
        const { result } = renderHook(() => useThemeStyles());

        expect(result.current.titleStyle).toBeDefined();
        expect(typeof result.current.titleStyle).toBe("object");
    });

    it("should provide URL styles", () => {
        const { result } = renderHook(() => useThemeStyles());

        expect(result.current.urlStyle).toBeDefined();
        expect(typeof result.current.urlStyle).toBe("object");
    });

    it("should provide meta styles", () => {
        const { result } = renderHook(() => useThemeStyles());

        expect(result.current.metaStyle).toBeDefined();
        expect(typeof result.current.metaStyle).toBe("object");
    });

    it("should memoize styles correctly", () => {
        const { rerender, result } = renderHook(() => useThemeStyles(false));

        const firstRender = result.current;
        rerender();
        const secondRender = result.current;

        // Should be the same object reference when props don't change
        expect(firstRender).toBe(secondRender);
    });

    it("should update styles when collapsed state changes", () => {
        const { result } = renderHook(({ isCollapsed }) => useThemeStyles(isCollapsed), {
            initialProps: { isCollapsed: false },
        });

        const expandedStyles = result.current;

        expect(expandedStyles.contentStyle.padding).not.toBe("p-4");
    });

    it("should handle missing matchMedia gracefully", () => {
        const originalMatchMedia = window.matchMedia;
        // Remove matchMedia to test defensive programming

        delete (window as any).matchMedia;

        expect(() => {
            renderHook(() => useThemeStyles());
        }).not.toThrow();

        window.matchMedia = originalMatchMedia;
    });

    it("should provide transition effects", () => {
        const { result } = renderHook(() => useThemeStyles());

        expect(result.current.collapseButtonStyle.transition).toContain("0.3s cubic-bezier");
        expect(result.current.contentStyle.transition).toContain("padding");
    });

    it("should have consistent color schemes", () => {
        // Test light mode
        vi.mocked(window.matchMedia).mockImplementation(() => ({
            addEventListener: vi.fn(),
            addListener: vi.fn(),
            dispatchEvent: vi.fn(),
            matches: false,
            media: "",
            onchange: null,
            removeEventListener: vi.fn(),
            removeListener: vi.fn(),
        }));

        const { result: lightResult } = renderHook(() => useThemeStyles());

        // Test dark mode
        vi.mocked(window.matchMedia).mockImplementation((query) => ({
            addEventListener: vi.fn(),
            addListener: vi.fn(),
            dispatchEvent: vi.fn(),
            matches: query === "(prefers-color-scheme: dark)",
            media: query,
            onchange: null,
            removeEventListener: vi.fn(),
            removeListener: vi.fn(),
        }));

        const { result: darkResult } = renderHook(() => useThemeStyles());

        // Colors should be different between light and dark modes
        expect(lightResult.current.headerStyle.color).not.toBe(darkResult.current.headerStyle.color);
        expect(lightResult.current.headerStyle.background).not.toBe(darkResult.current.headerStyle.background);
    });

    it("should provide default collapsed state", () => {
        const { result } = renderHook(() => useThemeStyles());

        // Default should be false (not collapsed)
        expect(result.current.contentStyle.padding).toBe("1.5rem");
    });

    it("should handle boolean collapsed parameter correctly", () => {
        const { result: undefinedResult } = renderHook(() => useThemeStyles());
        const { result: falseResult } = renderHook(() => useThemeStyles(false));
        const { result: trueResult } = renderHook(() => useThemeStyles(true));

        expect(undefinedResult.current.contentStyle.padding).toBe("1.5rem");
        expect(falseResult.current.contentStyle.padding).toBe("1.5rem");
        expect(trueResult.current.contentStyle.padding).toBe("1rem 1.5rem");
    });
});
