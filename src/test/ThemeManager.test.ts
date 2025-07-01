/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { ThemeManager } from "../theme/ThemeManager";

// Mock window.matchMedia
const mockMatchMedia = vi.fn();

Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: mockMatchMedia,
});

describe("ThemeManager", () => {
    let themeManager: ThemeManager;

    beforeEach(() => {
        vi.clearAllMocks();
        themeManager = ThemeManager.getInstance();
        
        // Mock matchMedia to return a MediaQueryList-like object
        mockMatchMedia.mockReturnValue({
            matches: false,
            addEventListener: vi.fn(),
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

    it("should handle system theme with light preference", () => {
        mockMatchMedia.mockReturnValue({
            matches: false, // Light mode
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
        });

        const systemTheme = themeManager.getTheme("system");
        
        expect(systemTheme).toBeDefined();
        expect(systemTheme.isDark).toBe(false);
    });

    it("should handle system theme with dark preference", () => {
        mockMatchMedia.mockReturnValue({
            matches: true, // Dark mode
            addEventListener: vi.fn(),
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
            matches: false,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
        });

        const preference = themeManager.getSystemThemePreference();
        expect(preference).toBe("light");

        mockMatchMedia.mockReturnValue({
            matches: true,
            addEventListener: vi.fn(),
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
            matches: false,
            addEventListener: mockAddEventListener,
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
            matches: undefined, // Invalid value
            addEventListener: vi.fn(),
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
});
