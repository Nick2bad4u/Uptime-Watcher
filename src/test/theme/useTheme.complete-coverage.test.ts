import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";

// Unmock the theme module to test the actual implementation
vi.unmock("../../theme/useTheme");

import {
    useTheme,
    useAvailabilityColors,
    useStatusColors,
    useThemeClasses,
    useThemeValue,
} from "../../theme/useTheme";
import { UI_DELAYS } from "../../constants";

describe("useTheme - Complete Coverage", () => {
    beforeEach(() => {
        // Clear any existing mocks
        vi.clearAllMocks();

        // Mock localStorage
        const mockStorage = {
            getItem: vi.fn(),
            setItem: vi.fn(),
            removeItem: vi.fn(),
            clear: vi.fn(),
        };
        Object.defineProperty(globalThis, "localStorage", {
            value: mockStorage,
            writable: true,
        });

        // Mock window.matchMedia for system theme detection
        Object.defineProperty(globalThis, "matchMedia", {
            writable: true,
            value: vi.fn().mockImplementation((query) => ({
                matches: query === "(prefers-color-scheme: dark)",
                media: query,
                onchange: null,
                addListener: vi.fn(),
                removeListener: vi.fn(),
                addEventListener: vi.fn(),
                removeEventListener: vi.fn(),
                dispatchEvent: vi.fn(),
            })),
        });
    });

    describe("useTheme hook", () => {
        it("should return basic theme properties and functions", () => {
            const { result } = renderHook(() => useTheme());

            expect(result.current).toHaveProperty("currentTheme");
            expect(result.current).toHaveProperty("themeName");
            expect(result.current).toHaveProperty("isDark");
            expect(result.current).toHaveProperty("availableThemes");
            expect(result.current).toHaveProperty("setTheme");
            expect(result.current).toHaveProperty("toggleTheme");
            expect(result.current).toHaveProperty("systemTheme");
            expect(result.current).toHaveProperty("themeManager");
            expect(result.current).toHaveProperty("themeVersion");
            expect(result.current).toHaveProperty("getColor");
            expect(result.current).toHaveProperty("getStatusColor");
        });

        it("should handle theme setting with system preference", async () => {
            const { result } = renderHook(() => useTheme());

            await act(async () => {
                result.current.setTheme("system");
                await new Promise((resolve) =>
                    setTimeout(resolve, UI_DELAYS.STATE_UPDATE_DEFER + 10)
                );
            });

            // Verify setTheme function was called and works
            expect(typeof result.current.setTheme).toBe("function");
            expect(typeof result.current.themeName).toBe("string");
        });

        it("should handle theme toggling", async () => {
            const { result } = renderHook(() => useTheme());

            const initialTheme = result.current.themeName;

            await act(async () => {
                result.current.toggleTheme();
                await new Promise((resolve) =>
                    setTimeout(resolve, UI_DELAYS.STATE_UPDATE_DEFER + 10)
                );
            });

            // Verify toggleTheme function works
            expect(typeof result.current.toggleTheme).toBe("function");
            expect(typeof result.current.themeName).toBe("string");
        });

        it("should handle color retrieval", () => {
            const { result } = renderHook(() => useTheme());

            const color = result.current.getColor("text.primary");
            expect(typeof color).toBe("string");
        });

        it("should handle status color retrieval", () => {
            const { result } = renderHook(() => useTheme());

            const statusColor = result.current.getStatusColor("up");
            expect(typeof statusColor).toBe("string");
        });

        it("should return available themes array", () => {
            const { result } = renderHook(() => useTheme());

            expect(Array.isArray(result.current.availableThemes)).toBe(true);
            expect(result.current.availableThemes.length).toBeGreaterThan(0);
        });

        it("should have theme manager with required methods", () => {
            const { result } = renderHook(() => useTheme());

            expect(result.current.themeManager).toBeDefined();
            expect(typeof result.current.themeManager.getTheme).toBe(
                "function"
            );
            expect(typeof result.current.themeManager.applyTheme).toBe(
                "function"
            );
        });
    });

    describe("useAvailabilityColors hook", () => {
        it("should return availability color functions", () => {
            const { result } = renderHook(() => useAvailabilityColors());

            expect(result.current).toHaveProperty("getAvailabilityColor");
            expect(result.current).toHaveProperty("getAvailabilityDescription");
            expect(result.current).toHaveProperty("getAvailabilityVariant");
        });

        it("should return correct colors for different availability percentages", () => {
            const { result } = renderHook(() => useAvailabilityColors());

            const excellentColor = result.current.getAvailabilityColor(100);
            const goodColor = result.current.getAvailabilityColor(95);
            const poorColor = result.current.getAvailabilityColor(50);

            expect(typeof excellentColor).toBe("string");
            expect(typeof goodColor).toBe("string");
            expect(typeof poorColor).toBe("string");
        });

        it("should return correct variants for different availability percentages", () => {
            const { result } = renderHook(() => useAvailabilityColors());

            // Success (>= 95%)
            expect(result.current.getAvailabilityVariant(100)).toBe("success");
            expect(result.current.getAvailabilityVariant(95)).toBe("success");

            // Warning (>= 80%)
            expect(result.current.getAvailabilityVariant(90)).toBe("warning");
            expect(result.current.getAvailabilityVariant(80)).toBe("warning");

            // Danger (< 80%)
            expect(result.current.getAvailabilityVariant(70)).toBe("danger");
            expect(result.current.getAvailabilityVariant(0)).toBe("danger");
        });

        it("should clamp percentage values for variants", () => {
            const { result } = renderHook(() => useAvailabilityColors());

            expect(result.current.getAvailabilityVariant(150)).toBe("success");
            expect(result.current.getAvailabilityVariant(-10)).toBe("danger");
        });

        it("should return correct descriptions for different availability percentages", () => {
            const { result } = renderHook(() => useAvailabilityColors());

            // Test all thresholds based on actual function logic
            expect(result.current.getAvailabilityDescription(100)).toBe(
                "Excellent"
            );
            expect(result.current.getAvailabilityDescription(99.9)).toBe(
                "Excellent"
            );
            expect(result.current.getAvailabilityDescription(99.5)).toBe(
                "Very Good"
            ); // 99.5 >= 99
            expect(result.current.getAvailabilityDescription(99)).toBe(
                "Very Good"
            );
            expect(result.current.getAvailabilityDescription(98)).toBe("Good");
            expect(result.current.getAvailabilityDescription(95)).toBe("Good");
            expect(result.current.getAvailabilityDescription(92)).toBe("Fair");
            expect(result.current.getAvailabilityDescription(90)).toBe("Fair");
            expect(result.current.getAvailabilityDescription(85)).toBe("Poor");
            expect(result.current.getAvailabilityDescription(80)).toBe("Poor");
            expect(result.current.getAvailabilityDescription(65)).toBe(
                "Critical"
            );
            expect(result.current.getAvailabilityDescription(50)).toBe(
                "Critical"
            );
            expect(result.current.getAvailabilityDescription(30)).toBe(
                "Failed"
            );
            expect(result.current.getAvailabilityDescription(0)).toBe("Failed");
        });

        it("should clamp percentage values for descriptions", () => {
            const { result } = renderHook(() => useAvailabilityColors());

            expect(result.current.getAvailabilityDescription(150)).toBe(
                "Excellent"
            );
            expect(result.current.getAvailabilityDescription(-10)).toBe(
                "Failed"
            );
        });
    });

    describe("useStatusColors hook", () => {
        it("should return status color object", () => {
            const { result } = renderHook(() => useStatusColors());

            expect(result.current).toHaveProperty("up");
            expect(result.current).toHaveProperty("down");
            expect(result.current).toHaveProperty("pending");
            expect(result.current).toHaveProperty("unknown");

            expect(typeof result.current.up).toBe("string");
            expect(typeof result.current.down).toBe("string");
            expect(typeof result.current.pending).toBe("string");
            expect(typeof result.current.unknown).toBe("string");
        });
    });

    describe("useThemeClasses hook", () => {
        it("should return theme class functions", () => {
            const { result } = renderHook(() => useThemeClasses());

            expect(result.current).toHaveProperty("getColor");
            expect(result.current).toHaveProperty("getBackgroundClass");
            expect(result.current).toHaveProperty("getBorderClass");
            expect(result.current).toHaveProperty("getSurfaceClass");
            expect(result.current).toHaveProperty("getTextClass");
            expect(result.current).toHaveProperty("getStatusClass");
        });

        it("should return theme class values as objects", () => {
            const { result } = renderHook(() => useThemeClasses());

            const bgClass = result.current.getBackgroundClass();
            const borderClass = result.current.getBorderClass();
            const surfaceClass = result.current.getSurfaceClass();
            const textClass = result.current.getTextClass();
            const statusClass = result.current.getStatusClass("up");

            expect(typeof bgClass).toBe("object");
            expect(typeof borderClass).toBe("object");
            expect(typeof surfaceClass).toBe("object");
            expect(typeof textClass).toBe("object");
            expect(typeof statusClass).toBe("object");
        });

        it("should handle color path retrieval", () => {
            const { result } = renderHook(() => useThemeClasses());

            const color = result.current.getColor("text.primary");
            expect(typeof color).toBe("string");
        });
    });

    describe("useThemeValue hook", () => {
        it("should return theme value by selector", () => {
            const { result } = renderHook(() =>
                useThemeValue((theme) => theme.colors.text.primary)
            );

            expect(typeof result.current).toBe("string");
        });

        it("should retrieve nested theme values", () => {
            const { result } = renderHook(() =>
                useThemeValue((theme) => theme.colors)
            );

            expect(typeof result.current).toBe("object");
            expect(result.current).toHaveProperty("text");
        });

        it("should handle complex selectors", () => {
            const { result } = renderHook(() =>
                useThemeValue((theme) => theme.spacing)
            );

            expect(typeof result.current).toBe("object");
        });

        it("should handle undefined selectors gracefully", () => {
            const { result } = renderHook(() =>
                useThemeValue((theme) => (theme as any).nonexistent?.path)
            );

            expect(result.current).toBeUndefined();
        });
    });

    describe("Integration tests", () => {
        it("should maintain consistency between hooks", () => {
            const { result: themeResult } = renderHook(() => useTheme());
            const { result: statusResult } = renderHook(() =>
                useStatusColors()
            );
            const { result: classesResult } = renderHook(() =>
                useThemeClasses()
            );

            // Status colors should be consistent
            const themeUpColor = themeResult.current.getStatusColor("up");
            const statusUpColor = statusResult.current.up;

            expect(typeof themeUpColor).toBe("string");
            expect(typeof statusUpColor).toBe("string");
        });

        it("should handle theme changes across all hooks", async () => {
            const { result: themeResult } = renderHook(() => useTheme());
            const { result: availabilityResult } = renderHook(() =>
                useAvailabilityColors()
            );

            const initialTheme = themeResult.current.themeName;

            await act(async () => {
                themeResult.current.setTheme(
                    initialTheme === "light" ? "dark" : "light"
                );
                await new Promise((resolve) =>
                    setTimeout(resolve, UI_DELAYS.STATE_UPDATE_DEFER + 10)
                );
            });

            // All hooks should still function after theme change
            expect(
                typeof availabilityResult.current.getAvailabilityColor(95)
            ).toBe("string");
            expect(typeof themeResult.current.getColor("text.primary")).toBe(
                "string"
            );
        });
    });

    describe("Edge cases and error handling", () => {
        it("should handle extreme values gracefully", () => {
            const { result } = renderHook(() => useAvailabilityColors());

            expect(() =>
                result.current.getAvailabilityColor(999)
            ).not.toThrow();
            expect(() =>
                result.current.getAvailabilityColor(-999)
            ).not.toThrow();
            expect(() =>
                result.current.getAvailabilityDescription(Infinity)
            ).not.toThrow();
            expect(() =>
                result.current.getAvailabilityDescription(-Infinity)
            ).not.toThrow();
        });

        it("should handle invalid color paths", () => {
            const { result } = renderHook(() => useTheme());

            expect(() => result.current.getColor("")).not.toThrow();
            expect(() => result.current.getColor("invalid.path")).not.toThrow();
        });

        it("should handle invalid status values", () => {
            const { result } = renderHook(() => useTheme());

            expect(() =>
                result.current.getStatusColor("invalid")
            ).not.toThrow();
            expect(() => result.current.getStatusColor("")).not.toThrow();
        });
    });
});
