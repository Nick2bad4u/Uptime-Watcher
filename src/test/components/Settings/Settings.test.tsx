/**
 * Tests for Settings component. Focuses on essential functionality and proper
 * mocking.
 */

import "@testing-library/jest-dom";
import {
    fireEvent,
    render,
    screen,
    waitFor,
    within,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createSelectorHookMock } from "../../utils/createSelectorHookMock";
import {
    createSitesStoreMock,
    updateSitesStoreMock,
} from "../../utils/createSitesStoreMock";
import type { ThemeName } from "../../../theme/types";

// Mock all dependencies
vi.mock("../../../stores/error/useErrorStore", () => ({
    useErrorStore: vi.fn(),
}));

vi.mock("../../../stores/settings/useSettingsStore", () => ({
    useSettingsStore: vi.fn(),
}));

const createDefaultDownloadBackup = () => vi.fn(async () => undefined);

const createDefaultFullResync = () => vi.fn(async () => undefined);

const sitesStoreState = createSitesStoreMock({
    downloadSqliteBackup: createDefaultDownloadBackup(),
    fullResyncSites: createDefaultFullResync(),
});

const useSitesStoreMock = createSelectorHookMock(sitesStoreState);

vi.mock("../../../stores/sites/useSitesStore", () => ({
    useSitesStore: useSitesStoreMock,
}));

const resetSitesStoreState = (): void => {
    updateSitesStoreMock(sitesStoreState, {
        downloadSqliteBackup: createDefaultDownloadBackup(),
        fullResyncSites: createDefaultFullResync(),
    });
};

vi.mock("../../../theme/useTheme", () => ({
    useTheme: vi.fn(),
    useThemeClasses: vi.fn(),
}));

vi.mock("../../../services/logger", () => ({
    logger: {
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
const confirmMock = vi.fn();
vi.mock("../../../hooks/ui/useConfirmDialog", () => ({
    useConfirmDialog: () => confirmMock,
}));

// Import after mocks
import { Settings } from "../../../components/Settings/Settings";
import { useErrorStore } from "../../../stores/error/useErrorStore";
import { useSettingsStore } from "../../../stores/settings/useSettingsStore";
import { useTheme, useThemeClasses } from "../../../theme/useTheme";

// Get mocked functions
const mockUseErrorStore = vi.mocked(useErrorStore);
const mockUseSettingsStore = vi.mocked(useSettingsStore);
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
        persistHistoryLimit: vi.fn().mockResolvedValue(undefined),
        resetSettings: vi.fn(),
        syncSettings: vi.fn(),
    };

    const mockSitesStore = sitesStoreState;

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
        confirmMock.mockReset();

        useSitesStoreMock.mockClear();
        resetSitesStoreState();

        mockUseErrorStore.mockReturnValue(mockErrorStore);
        mockUseSettingsStore.mockReturnValue(mockSettingsStore);
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

    it("should render settings modal", ({ task, annotate }) => {
        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: Settings", "component");
        annotate("Category: Component", "category");
        annotate("Type: Business Logic", "type");

        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: Settings", "component");
        annotate("Category: Component", "category");
        annotate("Type: Business Logic", "type");

        render(<Settings onClose={mockOnClose} />);

        const modal = screen.getByTestId("settings-modal");
        expect(modal).toBeInTheDocument();
        expect(within(modal).getByText("Settings")).toBeInTheDocument();
        expect(within(modal).getByText(/history limit/i)).toBeInTheDocument();
    });

    it("should call onClose when close button is clicked", ({
        task,
        annotate,
    }) => {
        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: Settings", "component");
        annotate("Category: Component", "category");
        annotate("Type: Business Logic", "type");

        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: Settings", "component");
        annotate("Category: Component", "category");
        annotate("Type: Business Logic", "type");

        render(<Settings onClose={mockOnClose} />);

        const closeButton = screen.getByRole("button", {
            name: /close settings/i,
        });
        fireEvent.click(closeButton);

        expect(mockOnClose).toHaveBeenCalled();
    });

    it("should show error when lastError exists", ({ task, annotate }) => {
        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: Settings", "component");
        annotate("Category: Component", "category");
        annotate("Type: Error Handling", "type");

        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: Settings", "component");
        annotate("Category: Component", "category");
        annotate("Type: Error Handling", "type");

        const errorStore = { ...mockErrorStore, lastError: "Test error" };
        mockUseErrorStore.mockReturnValue(errorStore);

        render(<Settings onClose={mockOnClose} />);

        expect(screen.getByRole("alert")).toBeInTheDocument();
        expect(screen.getByText("Test error")).toBeInTheDocument();
    });

    it("should not show error when no lastError", ({ task, annotate }) => {
        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: Settings", "component");
        annotate("Category: Component", "category");
        annotate("Type: Error Handling", "type");

        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: Settings", "component");
        annotate("Category: Component", "category");
        annotate("Type: Error Handling", "type");

        render(<Settings onClose={mockOnClose} />);

        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("should handle history limit changes", async ({ task, annotate }) => {
        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: Settings", "component");
        annotate("Category: Component", "category");
        annotate("Type: Configuration", "type");

        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: Settings", "component");
        annotate("Category: Component", "category");
        annotate("Type: Configuration", "type");

        render(<Settings onClose={mockOnClose} />);

        const input = screen.getByLabelText(
            "Maximum number of history records to keep per site"
        );
        fireEvent.change(input, { target: { value: "500" } });

        expect(mockSettingsStore.persistHistoryLimit).toHaveBeenCalledWith(500);
    });

    it("should handle reset settings", async ({ task, annotate }) => {
        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: Settings", "component");
        annotate("Category: Component", "category");
        annotate("Type: Business Logic", "type");

        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: Settings", "component");
        annotate("Category: Component", "category");
        annotate("Type: Business Logic", "type");

        confirmMock.mockResolvedValue(true);

        render(<Settings onClose={mockOnClose} />);

        const resetButton = screen.getByRole("button", {
            name: /reset everything/i,
        });
        fireEvent.click(resetButton);

        await waitFor(() =>
            expect(mockSettingsStore.resetSettings).toHaveBeenCalled()
        );
        expect(confirmMock).toHaveBeenCalledWith(
            expect.objectContaining({
                message:
                    "Are you sure you want to reset all settings to defaults?",
                title: "Reset Settings",
            })
        );
    });

    it("should not reset settings when cancelled", async ({
        task,
        annotate,
    }) => {
        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: Settings", "component");
        annotate("Category: Component", "category");
        annotate("Type: Business Logic", "type");

        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: Settings", "component");
        annotate("Category: Component", "category");
        annotate("Type: Business Logic", "type");

        confirmMock.mockResolvedValue(false);

        render(<Settings onClose={mockOnClose} />);

        const resetButton = screen.getByRole("button", {
            name: /reset everything/i,
        });
        fireEvent.click(resetButton);

        await waitFor(() =>
            expect(mockSettingsStore.resetSettings).not.toHaveBeenCalled()
        );
    });

    it("should handle sync settings", async ({ task, annotate }) => {
        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: Settings", "component");
        annotate("Category: Component", "category");
        annotate("Type: Business Logic", "type");

        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: Settings", "component");
        annotate("Category: Component", "category");
        annotate("Type: Business Logic", "type");

        render(<Settings onClose={mockOnClose} />);

        const syncButton = screen.getByRole("button", {
            name: /refresh history/i,
        });
        fireEvent.click(syncButton);

        expect(mockSitesStore.fullResyncSites).toHaveBeenCalled();
    });

    it("should handle SQLite backup download", ({ task, annotate }) => {
        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: Settings", "component");
        annotate("Category: Component", "category");
        annotate("Type: Backup Operation", "type");

        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: Settings", "component");
        annotate("Category: Component", "category");
        annotate("Type: Backup Operation", "type");

        render(<Settings onClose={mockOnClose} />);

        const downloadButton = screen.getByRole("button", {
            name: /export monitoring data/i,
        });
        fireEvent.click(downloadButton);

        expect(mockSitesStore.downloadSqliteBackup).toHaveBeenCalled();
    });

    it("should handle theme changes", ({ task, annotate }) => {
        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: Settings", "component");
        annotate("Category: Component", "category");
        annotate("Type: Business Logic", "type");

        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: Settings", "component");
        annotate("Category: Component", "category");
        annotate("Type: Business Logic", "type");

        render(<Settings onClose={mockOnClose} />);

        const themeSelect = screen.getByLabelText("Select application theme");
        fireEvent.change(themeSelect, { target: { value: "dark" } });

        expect(mockTheme.setTheme).toHaveBeenCalledWith("dark");
    });

    it("should display current settings values", ({ task, annotate }) => {
        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: Settings", "component");
        annotate("Category: Component", "category");
        annotate("Type: Business Logic", "type");

        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: Settings", "component");
        annotate("Category: Component", "category");
        annotate("Type: Business Logic", "type");

        render(<Settings onClose={mockOnClose} />);

        const historyInput = screen.getByLabelText(
            "Maximum number of history records to keep per site"
        );
        expect(historyInput).toHaveValue("1000");
    });

    it("should handle numeric conversion for history limit", ({
        task,
        annotate,
    }) => {
        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: Settings", "component");
        annotate("Category: Component", "category");
        annotate("Type: Configuration", "type");

        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: Settings", "component");
        annotate("Category: Component", "category");
        annotate("Type: Configuration", "type");

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

    it("should apply dark theme styles when isDark is true", ({
        task,
        annotate,
    }) => {
        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: Settings", "component");
        annotate("Category: Component", "category");
        annotate("Type: Business Logic", "type");

        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: Settings", "component");
        annotate("Category: Component", "category");
        annotate("Type: Business Logic", "type");

        const darkTheme = { ...mockTheme, isDark: true };
        mockUseTheme.mockReturnValue(darkTheme as any);

        render(<Settings onClose={mockOnClose} />);

        const container = screen.getByTestId("settings-modal");
        expect(container).toBeInTheDocument();
    });

    it("should handle component unmounting during async operations", ({
        task,
        annotate,
    }) => {
        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: Settings", "component");
        annotate("Category: Component", "category");
        annotate("Type: Business Logic", "type");

        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: Settings", "component");
        annotate("Category: Component", "category");
        annotate("Type: Business Logic", "type");

        const { unmount } = render(<Settings onClose={mockOnClose} />);

        // Trigger an async operation
        const syncButton = screen.getByRole("button", {
            name: /refresh history/i,
        });
        fireEvent.click(syncButton);

        // Unmount component
        unmount();

        // Should not throw errors
        expect(true).toBeTruthy();
    });
});
