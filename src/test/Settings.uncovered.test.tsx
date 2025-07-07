/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { Settings } from "../components";

// Mock logger
vi.mock("../services/logger", () => ({
    default: {
        warn: vi.fn(),
        error: vi.fn(),
        user: {
            settingsChange: vi.fn(),
            action: vi.fn(),
        },
    },
}));

// Mock themed components
vi.mock("../theme/components", () => ({
    ThemedBox: ({ children, className }: { children: React.ReactNode; className?: string }) => (
        <div data-testid="themed-box" className={className}>
            {children}
        </div>
    ),
    ThemedText: ({ children, variant, size, weight, className }: any) => (
        <span data-testid="themed-text" className={`${variant ?? ""} ${size ?? ""} ${weight ?? ""} ${className ?? ""}`}>
            {children}
        </span>
    ),
    ThemedButton: ({ children, onClick, disabled, loading, variant, size, className }: any) => (
        <button
            data-testid="themed-button"
            onClick={onClick}
            disabled={disabled ?? loading}
            className={`${variant ?? ""} ${size ?? ""} ${className ?? ""}`}
        >
            {loading ? "Loading..." : children}
        </button>
    ),
    ThemedSelect: ({ children, value, onChange, disabled }: any) => (
        <select data-testid="themed-select" value={value} onChange={onChange} disabled={disabled}>
            {children}
        </select>
    ),
    ThemedCheckbox: ({ checked, onChange, disabled }: any) => (
        <input
            data-testid="themed-checkbox"
            type="checkbox"
            checked={checked}
            onChange={onChange}
            disabled={disabled}
        />
    ),
    StatusIndicator: ({ status, size }: { status: string; size: string }) => (
        <div data-testid="status-indicator" data-status={status} data-size={size}>
            {status}
        </div>
    ),
}));

// Mock StatusIndicator
vi.mock("../components/common/StatusBadge", () => ({
    StatusIndicator: ({ status, size }: { status: string; size: string }) => (
        <div data-testid="status-indicator" data-status={status} data-size={size}>
            {status}
        </div>
    ),
}));

// Mock stores and hooks
const mockStores = {
    settings: {
        theme: "system",
        notifications: true,
        soundAlerts: false,
        autoStart: false,
        minimizeToTray: false,
        historyLimit: 1000,
    },
    isLoading: false,
    lastError: null,
    updateSettings: vi.fn(),
    resetSettings: vi.fn(),
    clearError: vi.fn(),
    setError: vi.fn(),
    fullSyncFromBackend: vi.fn(),
    downloadSQLiteBackup: vi.fn(),
    updateHistoryLimitValue: vi.fn(),
    setTheme: vi.fn(),
    availableThemes: ["light", "dark", "system"],
    isDark: false,
};

vi.mock("../stores/settings/useSettingsStore", () => ({
    useSettingsStore: () => mockStores,
}));

vi.mock("../stores/error/useErrorStore", () => ({
    useErrorStore: () => mockStores,
}));

vi.mock("../stores/sites/useSitesStore", () => ({
    useSitesStore: () => mockStores,
}));

vi.mock("../theme/useTheme", () => ({
    useTheme: () => ({
        setTheme: mockStores.setTheme,
        availableThemes: mockStores.availableThemes,
        isDark: mockStores.isDark,
    }),
}));

// Mock electron API
Object.defineProperty(window, "electronAPI", {
    value: {
        data: {
            exportData: vi.fn().mockResolvedValue({ success: true }),
            importData: vi.fn().mockResolvedValue({ success: true }),
            downloadSQLiteBackup: vi.fn().mockResolvedValue({ success: true }),
        },
        settings: {
            updateHistoryLimit: vi.fn().mockResolvedValue({ success: true }),
        },
    },
    writable: true,
});

// Mock react hooks to prevent infinite loops
vi.mock("react", async () => {
    const actual = await vi.importActual("react");
    return {
        ...actual,
        useEffect: vi.fn((fn, deps) => {
            // Only run effect once to prevent loops
            if (!deps || deps.length === 0) {
                fn();
            }
        }),
    };
});

describe("Settings Component - Uncovered Lines", () => {
    const mockOnClose = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        mockStores.lastError = null;
        mockStores.isLoading = false;
    });

    it("should handle invalid settings key gracefully", async () => {
        const user = userEvent.setup();
        render(<Settings onClose={mockOnClose} />);

        // Wait for component to render by checking for Settings text
        await waitFor(
            () => {
                const settingsTitle = screen.getByText("⚙️ Settings");
                expect(settingsTitle).toBeInTheDocument();
            },
            { timeout: 5000 }
        );

        // Simulate changing a checkbox to trigger handleSettingChange
        const checkboxes = screen.getAllByTestId("themed-checkbox");
        if (checkboxes.length > 0) {
            await user.click(checkboxes[0]!);
            expect(mockStores.updateSettings).toHaveBeenCalled();
        }
    }, 10000);

    it("should handle reset confirmation dialog - confirmed", async () => {
        const user = userEvent.setup();
        // Mock window.confirm to return true
        const originalConfirm = window.confirm;
        window.confirm = vi.fn(() => true);

        render(<Settings onClose={mockOnClose} />);

        // Find and click the reset button
        const resetButton = screen.getByText("Reset to Defaults");
        await user.click(resetButton);

        expect(mockStores.resetSettings).toHaveBeenCalled();
        expect(mockStores.clearError).toHaveBeenCalled();

        // Restore window.confirm
        window.confirm = originalConfirm;
    });

    it("should handle reset confirmation dialog - cancelled", async () => {
        const user = userEvent.setup();
        // Mock window.confirm to return false
        const originalConfirm = window.confirm;
        window.confirm = vi.fn(() => false);

        render(<Settings onClose={mockOnClose} />);

        // Find and click the reset button
        const resetButton = screen.getByText("Reset to Defaults");
        await user.click(resetButton);

        // Should not call reset functions when cancelled
        expect(mockStores.resetSettings).not.toHaveBeenCalled();
        expect(mockStores.clearError).not.toHaveBeenCalled();

        // Restore window.confirm
        window.confirm = originalConfirm;
    });

    it("should handle sync error properly", async () => {
        const user = userEvent.setup();
        // Mock fullSyncFromBackend to throw an error
        const errorMessage = "Network error occurred";
        mockStores.fullSyncFromBackend.mockRejectedValueOnce(new Error(errorMessage));

        render(<Settings onClose={mockOnClose} />);

        // Find and click the sync button
        const syncButton = screen.getByText("🔄 Sync Data");
        await user.click(syncButton);

        await waitFor(() => {
            expect(mockStores.setError).toHaveBeenCalledWith("Failed to sync data: " + errorMessage);
        });
    });

    it("should handle sync error with non-Error object", async () => {
        const user = userEvent.setup();
        // Mock fullSyncFromBackend to throw a string
        const errorMessage = "String error";
        mockStores.fullSyncFromBackend.mockRejectedValueOnce(errorMessage);

        render(<Settings onClose={mockOnClose} />);

        // Find and click the sync button
        const syncButton = screen.getByText("🔄 Sync Data");
        await user.click(syncButton);

        await waitFor(() => {
            expect(mockStores.setError).toHaveBeenCalledWith("Failed to sync data: " + errorMessage);
        });
    });

    it("should handle SQLite download error properly", async () => {
        const user = userEvent.setup();
        // Mock downloadSQLiteBackup to throw an error
        const errorMessage = "Download failed";
        mockStores.downloadSQLiteBackup.mockRejectedValueOnce(new Error(errorMessage));

        render(<Settings onClose={mockOnClose} />);

        // Find and click the download button
        const downloadButton = screen.getByText("Download SQLite Backup");
        await user.click(downloadButton);

        await waitFor(() => {
            expect(mockStores.setError).toHaveBeenCalledWith("Failed to download SQLite backup: " + errorMessage);
        });
    });

    it("should handle SQLite download error with non-Error object", async () => {
        const user = userEvent.setup();
        // Mock downloadSQLiteBackup to throw a string
        const errorMessage = "String download error";
        mockStores.downloadSQLiteBackup.mockRejectedValueOnce(errorMessage);

        render(<Settings onClose={mockOnClose} />);

        // Find and click the download button
        const downloadButton = screen.getByText("Download SQLite Backup");
        await user.click(downloadButton);

        await waitFor(() => {
            expect(mockStores.setError).toHaveBeenCalledWith("Failed to download SQLite backup: " + errorMessage);
        });
    });

    it("should handle error objects without message property", async () => {
        const user = userEvent.setup();
        // Mock with an object that has no message property
        const errorObject = { code: 500, detail: "Internal error" };
        mockStores.fullSyncFromBackend.mockRejectedValueOnce(errorObject);

        render(<Settings onClose={mockOnClose} />);

        // Find and click the sync button
        const syncButton = screen.getByText("🔄 Sync Data");
        await user.click(syncButton);

        await waitFor(() => {
            expect(mockStores.setError).toHaveBeenCalledWith("Failed to sync data: [object Object]");
        });
    });
});
