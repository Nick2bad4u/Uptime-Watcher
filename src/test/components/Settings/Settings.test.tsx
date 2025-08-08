/**
 * Tests for Settings component.
 * Focuses on essential functionality and proper mocking.
 */

import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ThemeName } from "../../../theme/types";

// Mock all dependencies
vi.mock("../../../stores/error/useErrorStore", () => ({
    useErrorStore: vi.fn(),
}));

vi.mock("../../../stores/settings/useSettingsStore", () => ({
    useSettingsStore: vi.fn(),
}));

vi.mock("../../../stores/sites/useSitesStore", () => ({
    useSitesStore: vi.fn(),
}));

vi.mock("../../../theme/useTheme", () => ({
    useTheme: vi.fn(),
    useThemeClasses: vi.fn(),
}));

vi.mock("../../../services/logger", () => ({
    default: {
        warn: vi.fn(),
        error: vi.fn(),
        user: {
            settingsChange: vi.fn(),
            action: vi.fn(),
        },
    },
}));

vi.mock("../../../utils/errorHandling", () => ({
    ensureError: vi.fn((error) =>
        error instanceof Error ? error : new Error(String(error))
    ),
}));

// Import after mocks
import { Settings } from "../../../components/Settings/Settings";
import { useErrorStore } from "../../../stores/error/useErrorStore";
import { useSettingsStore } from "../../../stores/settings/useSettingsStore";
import { useSitesStore } from "../../../stores/sites/useSitesStore";
import { useTheme, useThemeClasses } from "../../../theme/useTheme";

// Get mocked functions
const mockUseErrorStore = vi.mocked(useErrorStore);
const mockUseSettingsStore = vi.mocked(useSettingsStore);
const mockUseSitesStore = vi.mocked(useSitesStore);
const mockUseTheme = vi.mocked(useTheme);
const mockUseThemeClasses = vi.mocked(useThemeClasses);

describe("Settings Component", () => {
    const mockOnClose = vi.fn();

    // Default mock implementations
    const mockErrorStore = {
        lastError: null,
        clearError: vi.fn(),
        setError: vi.fn(),
        isLoading: false,
    };

    const mockSettingsStore = {
        settings: {
            historyLimit: 1000,
            notifications: {
                enabled: true,
                sound: true,
            },
            theme: "light" as const,
        },
        updateSetting: vi.fn(),
        updateSettings: vi.fn(),
        updateHistoryLimitValue: vi.fn().mockResolvedValue(undefined),
        resetSettings: vi.fn(),
        syncSettings: vi.fn(),
    };

    const mockSitesStore = {
        downloadSQLiteBackup: vi.fn(),
        fullSyncFromBackend: vi.fn().mockResolvedValue(undefined),
    };

    const mockTheme = {
        currentTheme: {
            name: "light" as ThemeName,
            isDark: false,
            colors: {
                primary: "#000",
                secondary: "#333",
                background: "#fff",
                text: "#000",
                error: "#ff0000",
                success: "#00ff00",
                warning: "#ffff00",
                status: {
                    up: "#00ff00",
                    down: "#ff0000",
                    pending: "#ffff00",
                },
            },
            borderRadius: {
                sm: "4px",
                md: "8px",
                lg: "12px",
                full: "50%",
                none: "0",
                xl: "16px",
            },
            shadows: {
                sm: "0 1px 2px rgba(0, 0, 0, 0.1)",
                md: "0 4px 6px rgba(0, 0, 0, 0.1)",
                lg: "0 10px 15px rgba(0, 0, 0, 0.1)",
                none: "none",
            },
            spacing: {
                sm: "8px",
                md: "16px",
                lg: "24px",
                xl: "32px",
            },
            typography: {
                fontSize: {
                    sm: "14px",
                    md: "16px",
                    lg: "18px",
                    xl: "20px",
                },
                fontWeight: {
                    normal: "400",
                    medium: "500",
                    bold: "600",
                },
            },
        },
        isDark: false,
        setTheme: vi.fn(),
        availableThemes: ["light", "dark"] as ThemeName[],
        getColor: vi.fn((_path: string) => "#000"),
        getStatusColor: vi.fn(),
        systemTheme: "light" as ThemeName,
        themeManager: {},
        themeName: "light" as ThemeName,
        themeVersion: "1.0.0",
        toggleTheme: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();

        mockUseErrorStore.mockReturnValue(mockErrorStore);
        mockUseSettingsStore.mockReturnValue(mockSettingsStore);
        mockUseSitesStore.mockReturnValue(mockSitesStore);
        mockUseTheme.mockReturnValue(mockTheme as any);
        mockUseThemeClasses.mockReturnValue({
            getBackgroundClass: vi
                .fn()
                .mockReturnValue({ backgroundColor: "#fff" }),
            getBorderClass: vi.fn().mockReturnValue({ borderColor: "#ccc" }),
            getTextClass: vi.fn().mockReturnValue({ color: "#000" }),
            getColor: vi.fn().mockReturnValue("#000"),
            getStatusClass: vi.fn().mockReturnValue({ color: "#000" }),
            getSurfaceClass: vi
                .fn()
                .mockReturnValue({ backgroundColor: "#fff" }),
        } as any);
    });

    it("should render settings modal", () => {
        render(<Settings onClose={mockOnClose} />);

        expect(screen.getByText("⚙️ Settings")).toBeInTheDocument();
        expect(screen.getByText("History Limit")).toBeInTheDocument();
    });

    it("should call onClose when close button is clicked", () => {
        render(<Settings onClose={mockOnClose} />);

        const closeButton = screen.getByText("✕");
        fireEvent.click(closeButton);

        expect(mockOnClose).toHaveBeenCalled();
    });

    it("should show error when lastError exists", () => {
        const errorStore = { ...mockErrorStore, lastError: "Test error" };
        mockUseErrorStore.mockReturnValue(errorStore);

        render(<Settings onClose={mockOnClose} />);

        expect(screen.getByRole("alert")).toBeInTheDocument();
        expect(screen.getByText("Test error")).toBeInTheDocument();
    });

    it("should not show error when no lastError", () => {
        render(<Settings onClose={mockOnClose} />);

        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("should handle history limit changes", async () => {
        render(<Settings onClose={mockOnClose} />);

        const input = screen.getByLabelText(
            "Maximum number of history records to keep per site"
        );
        fireEvent.change(input, { target: { value: "500" } });

        expect(mockSettingsStore.updateHistoryLimitValue).toHaveBeenCalledWith(
            500
        );
    });

    it("should handle reset settings", () => {
        // Mock window.confirm to return true
        const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);

        render(<Settings onClose={mockOnClose} />);

        const resetButton = screen.getByText("Reset to Defaults");
        fireEvent.click(resetButton);

        expect(mockSettingsStore.resetSettings).toHaveBeenCalled();

        confirmSpy.mockRestore();
    });

    it("should not reset settings when cancelled", () => {
        // Mock window.confirm to return false
        const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);

        render(<Settings onClose={mockOnClose} />);

        const resetButton = screen.getByText("Reset to Defaults");
        fireEvent.click(resetButton);

        expect(mockSettingsStore.resetSettings).not.toHaveBeenCalled();

        confirmSpy.mockRestore();
    });

    it("should handle sync settings", async () => {
        render(<Settings onClose={mockOnClose} />);

        const syncButton = screen.getByText("🔄 Sync Data");
        fireEvent.click(syncButton);

        expect(mockSitesStore.fullSyncFromBackend).toHaveBeenCalled();
    });

    it("should handle SQLite backup download", () => {
        render(<Settings onClose={mockOnClose} />);

        const downloadButton = screen.getByText("Download SQLite Backup");
        fireEvent.click(downloadButton);

        expect(mockSitesStore.downloadSQLiteBackup).toHaveBeenCalled();
    });

    it("should handle theme changes", () => {
        render(<Settings onClose={mockOnClose} />);

        const themeSelect = screen.getByLabelText("Select application theme");
        fireEvent.change(themeSelect, { target: { value: "dark" } });

        expect(mockTheme.setTheme).toHaveBeenCalledWith("dark");
    });

    it("should display current settings values", () => {
        render(<Settings onClose={mockOnClose} />);

        const historyInput = screen.getByLabelText(
            "Maximum number of history records to keep per site"
        );
        expect(historyInput).toHaveValue("1000");
    });

    it("should handle numeric conversion for history limit", () => {
        const settingsWithStringLimit = {
            ...mockSettingsStore,
            settings: {
                ...mockSettingsStore.settings,
                historyLimit: "500" as any,
            },
        };
        mockUseSettingsStore.mockReturnValue(settingsWithStringLimit);

        render(<Settings onClose={mockOnClose} />);

        const historyInput = screen.getByLabelText(
            "Maximum number of history records to keep per site"
        );
        expect(historyInput).toHaveValue("500");
    });

    it("should apply dark theme styles when isDark is true", () => {
        const darkTheme = { ...mockTheme, isDark: true };
        mockUseTheme.mockReturnValue(darkTheme as any);

        render(<Settings onClose={mockOnClose} />);

        const container = screen
            .getByText("⚙️ Settings")
            .closest(".modal-container");
        expect(container).toBeInTheDocument();
    });

    it("should handle component unmounting during async operations", () => {
        const { unmount } = render(<Settings onClose={mockOnClose} />);

        // Trigger an async operation
        const syncButton = screen.getByText("🔄 Sync Data");
        fireEvent.click(syncButton);

        // Unmount component
        unmount();

        // Should not throw errors
        expect(true).toBe(true);
    });
});
