/**
 * @vitest-environment jsdom
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTheme, useThemeValue, useStatusColors, useThemeClasses, useAvailabilityColors } from "../theme/useTheme";
import { themeManager } from "../theme/ThemeManager";
import { useSettingsStore } from "../stores";

// Mock the settings store
vi.mock("../stores", () => ({
    useSettingsStore: vi.fn(),
}));

// Mock the theme manager
vi.mock("../theme/ThemeManager", () => ({
    themeManager: {
        getTheme: vi.fn(),
        applyTheme: vi.fn(),
        onSystemThemeChange: vi.fn(),
        getSystemThemePreference: vi.fn(),
        getAvailableThemes: vi.fn(),
    },
}));

describe("Theme Hooks", () => {
    const mockUpdateSettings = vi.fn();
    const mockTheme = {
        name: "light",
        isDark: false,
        colors: {
            primary: {
                500: "#3b82f6",
            },
            status: {
                up: "#10b981",
                down: "#ef4444",
                pending: "#f59e0b",
                unknown: "#6b7280",
            },
            success: "#10b981",
            warning: "#f59e0b",
            error: "#ef4444",
            background: {
                primary: "#ffffff",
                secondary: "#f8fafc",
                tertiary: "#f1f5f9",
            },
            text: {
                primary: "#1f2937",
                secondary: "#6b7280",
            },
        },
    };

    beforeEach(() => {
        vi.clearAllMocks();

        // Setup settings store mock
        vi.mocked(useSettingsStore).mockReturnValue({
            settings: { theme: "light" },
            updateSettings: mockUpdateSettings,
        });

        // Setup theme manager mocks
        (themeManager.getTheme as any).mockReturnValue(mockTheme);
        (themeManager.getSystemThemePreference as any).mockReturnValue("light");
        (themeManager.getAvailableThemes as any).mockReturnValue(["light", "dark"]);
        (themeManager.onSystemThemeChange as any).mockReturnValue(() => {});
        (themeManager.applyTheme as any).mockImplementation(() => {});
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe("useTheme", () => {
        it("should return initial theme state", () => {
            const { result } = renderHook(() => useTheme());

            expect(result.current.currentTheme).toEqual(mockTheme);
            expect(result.current.themeName).toBe("light");
            expect(result.current.isDark).toBe(false);
            expect(result.current.systemTheme).toBe("light");
            expect(result.current.availableThemes).toEqual(["light", "dark"]);
        });

        it("should set theme", () => {
            const { result } = renderHook(() => useTheme());

            act(() => {
                result.current.setTheme("dark");
            });

            expect(mockUpdateSettings).toHaveBeenCalledWith({ theme: "dark" });
        });

        it("should toggle theme from light to dark", () => {
            const { result } = renderHook(() => useTheme());

            act(() => {
                result.current.toggleTheme();
            });

            expect(mockUpdateSettings).toHaveBeenCalledWith({ theme: "dark" });
        });

        it("should toggle theme from dark to light", () => {
            const darkTheme = { ...mockTheme, isDark: true };
            (themeManager.getTheme as any).mockReturnValue(darkTheme);

            const { result } = renderHook(() => useTheme());

            act(() => {
                result.current.toggleTheme();
            });

            expect(mockUpdateSettings).toHaveBeenCalledWith({ theme: "light" });
        });

        it("should get color from theme", () => {
            const { result } = renderHook(() => useTheme());

            const color = result.current.getColor("primary.500");
            expect(color).toBe("#3b82f6");
        });

        it("should return fallback color for invalid path", () => {
            const { result } = renderHook(() => useTheme());

            const color = result.current.getColor("invalid.path");
            expect(color).toBe("#000000");
        });

        it("should get status color", () => {
            const { result } = renderHook(() => useTheme());

            expect(result.current.getStatusColor("up")).toBe("#10b981");
            expect(result.current.getStatusColor("down")).toBe("#ef4444");
            expect(result.current.getStatusColor("pending")).toBe("#f59e0b");
            expect(result.current.getStatusColor("unknown")).toBe("#6b7280");
        });

        it("should return fallback color for invalid status", () => {
            const { result } = renderHook(() => useTheme());

            const color = result.current.getStatusColor("invalid" as any);
            expect(color).toBe("#000000");
        });

        it("should listen for system theme changes", () => {
            const mockCleanup = vi.fn();
            const mockOnSystemThemeChange = vi.fn().mockReturnValue(mockCleanup);
            (themeManager.onSystemThemeChange as any).mockImplementation(mockOnSystemThemeChange);

            const { unmount } = renderHook(() => useTheme());

            expect(mockOnSystemThemeChange).toHaveBeenCalled();

            unmount();
            expect(mockCleanup).toHaveBeenCalled();
        });

        it("should update system theme when callback is triggered", () => {
            let themeChangeCallback: (isDark: boolean) => void = () => {};
            const mockCleanupFn = () => {};
            const mockImplementation = (callback: (isDark: boolean) => void) => {
                themeChangeCallback = callback;
                return mockCleanupFn;
            };
            (themeManager.onSystemThemeChange as any).mockImplementation(mockImplementation);

            const { result } = renderHook(() => useTheme());

            expect(result.current.systemTheme).toBe("light");

            act(() => {
                themeChangeCallback(true);
            });

            expect(result.current.systemTheme).toBe("dark");
        });
    });

    describe("useThemeValue", () => {
        it("should return selected value from theme", () => {
            const selector = (theme: any) => theme.colors.primary[500];
            const { result } = renderHook(() => useThemeValue(selector));

            expect(result.current).toBe("#3b82f6");
        });

        it("should return complex selected value", () => {
            const selector = (theme: any) => theme.isDark;
            const { result } = renderHook(() => useThemeValue(selector));

            expect(result.current).toBe(false);
        });
    });

    describe("useStatusColors", () => {
        it("should return status colors from theme", () => {
            const { result } = renderHook(() => useStatusColors());

            expect(result.current).toEqual({
                up: "#10b981",
                down: "#ef4444",
                pending: "#f59e0b",
                unknown: "#6b7280",
            });
        });
    });

    describe("useThemeClasses", () => {
        it("should return background class", () => {
            const { result } = renderHook(() => useThemeClasses());

            const backgroundClass = result.current.getBackgroundClass();
            expect(backgroundClass).toEqual({
                backgroundColor: "var(--color-background-primary)",
            });

            const secondaryClass = result.current.getBackgroundClass("secondary");
            expect(secondaryClass).toEqual({
                backgroundColor: "var(--color-background-secondary)",
            });
        });

        it("should return text class", () => {
            const { result } = renderHook(() => useThemeClasses());

            const textClass = result.current.getTextClass();
            expect(textClass).toEqual({
                color: "var(--color-text-primary)",
            });

            const secondaryClass = result.current.getTextClass("secondary");
            expect(secondaryClass).toEqual({
                color: "var(--color-text-secondary)",
            });
        });

        it("should return border class", () => {
            const { result } = renderHook(() => useThemeClasses());

            const borderClass = result.current.getBorderClass();
            expect(borderClass).toEqual({
                borderColor: "var(--color-border-primary)",
            });

            const focusClass = result.current.getBorderClass("focus");
            expect(focusClass).toEqual({
                borderColor: "var(--color-border-focus)",
            });
        });

        it("should return surface class", () => {
            const { result } = renderHook(() => useThemeClasses());

            const surfaceClass = result.current.getSurfaceClass();
            expect(surfaceClass).toEqual({
                backgroundColor: "var(--color-surface-base)",
            });

            const elevatedClass = result.current.getSurfaceClass("elevated");
            expect(elevatedClass).toEqual({
                backgroundColor: "var(--color-surface-elevated)",
            });
        });

        it("should return status class", () => {
            const { result } = renderHook(() => useThemeClasses());

            const statusClass = result.current.getStatusClass("up");
            expect(statusClass).toEqual({
                color: "var(--color-status-up)",
            });
        });

        it("should expose getColor function", () => {
            const { result } = renderHook(() => useThemeClasses());

            expect(typeof result.current.getColor).toBe("function");
        });
    });

    describe("useAvailabilityColors", () => {
        it("should return excellent color for 99.9%+", () => {
            const { result } = renderHook(() => useAvailabilityColors());

            const color = result.current.getAvailabilityColor(99.95);
            expect(color).toBe("#10b981"); // up color

            const description = result.current.getAvailabilityDescription(99.95);
            expect(description).toBe("Excellent");

            const variant = result.current.getAvailabilityVariant(99.95);
            expect(variant).toBe("success");
        });

        it("should return very good color for 99%+", () => {
            const { result } = renderHook(() => useAvailabilityColors());

            const color = result.current.getAvailabilityColor(99.5);
            expect(color).toBe("#10b981"); // up color

            const description = result.current.getAvailabilityDescription(99.5);
            expect(description).toBe("Very Good");

            const variant = result.current.getAvailabilityVariant(99.5);
            expect(variant).toBe("success");
        });

        it("should return good color for 95%+", () => {
            const { result } = renderHook(() => useAvailabilityColors());

            const color = result.current.getAvailabilityColor(96);
            expect(color).toBe("#10b981"); // success color

            const description = result.current.getAvailabilityDescription(96);
            expect(description).toBe("Good");

            const variant = result.current.getAvailabilityVariant(96);
            expect(variant).toBe("success");
        });

        it("should return fair color for 90%+", () => {
            const { result } = renderHook(() => useAvailabilityColors());

            const color = result.current.getAvailabilityColor(92);
            expect(color).toBe("#10b981"); // up color

            const description = result.current.getAvailabilityDescription(92);
            expect(description).toBe("Fair");

            const variant = result.current.getAvailabilityVariant(92);
            expect(variant).toBe("warning");
        });

        it("should return warning color for 80%+", () => {
            const { result } = renderHook(() => useAvailabilityColors());

            const color = result.current.getAvailabilityColor(85);
            expect(color).toBe("#f59e0b"); // pending color

            const description = result.current.getAvailabilityDescription(85);
            expect(description).toBe("Poor");

            const variant = result.current.getAvailabilityVariant(85);
            expect(variant).toBe("warning");
        });

        it("should return poor color for 70%+", () => {
            const { result } = renderHook(() => useAvailabilityColors());

            const color = result.current.getAvailabilityColor(75);
            expect(color).toBe("#f59e0b"); // warning color

            const description = result.current.getAvailabilityDescription(75);
            expect(description).toBe("Critical");

            const variant = result.current.getAvailabilityVariant(75);
            expect(variant).toBe("danger");
        });

        it("should return critical color for 50%+", () => {
            const { result } = renderHook(() => useAvailabilityColors());

            const color = result.current.getAvailabilityColor(60);
            expect(color).toBe("#ef4444"); // error color

            const description = result.current.getAvailabilityDescription(60);
            expect(description).toBe("Critical");

            const variant = result.current.getAvailabilityVariant(60);
            expect(variant).toBe("danger");
        });

        it("should return failed color for <50%", () => {
            const { result } = renderHook(() => useAvailabilityColors());

            const color = result.current.getAvailabilityColor(30);
            expect(color).toBe("#ef4444"); // down color

            const description = result.current.getAvailabilityDescription(30);
            expect(description).toBe("Failed");

            const variant = result.current.getAvailabilityVariant(30);
            expect(variant).toBe("danger");
        });

        it("should clamp percentage values", () => {
            const { result } = renderHook(() => useAvailabilityColors());

            // Test above 100
            const colorHigh = result.current.getAvailabilityColor(110);
            expect(colorHigh).toBe("#10b981"); // Should treat as 100%

            // Test below 0
            const colorLow = result.current.getAvailabilityColor(-10);
            expect(colorLow).toBe("#ef4444"); // Should treat as 0%

            const descriptionHigh = result.current.getAvailabilityDescription(110);
            expect(descriptionHigh).toBe("Excellent");

            const descriptionLow = result.current.getAvailabilityDescription(-10);
            expect(descriptionLow).toBe("Failed");
        });
    });
});
