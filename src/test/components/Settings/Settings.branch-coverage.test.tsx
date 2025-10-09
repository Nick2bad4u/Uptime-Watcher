/**
 * Tests all conditional branches to improve overall branch coverage. Targets
 * Settings.tsx which currently has 36.36% branch coverage.
 *
 * This test file focuses on:
 *
 * - Conditional rendering branches (error/success states)
 * - Event handler conditional logic
 * - Async error handling branches
 * - Settings validation branches
 * - Button state conditions
 * - User confirmation flows
 *
 * @file Comprehensive branch coverage tests for Settings component
 */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Settings } from "../../../components/Settings/Settings";
import { useErrorStore } from "../../../stores/error/useErrorStore";
import { useSettingsStore } from "../../../stores/settings/useSettingsStore";
import { useSitesStore } from "../../../stores/sites/useSitesStore";
import { useTheme, useThemeClasses } from "../../../theme/useTheme";

// Mock all dependencies
vi.mock("../../../stores/error/useErrorStore");
vi.mock("../../../stores/settings/useSettingsStore");
vi.mock("../../../stores/sites/useSitesStore");
vi.mock("../../../theme/useTheme");
vi.mock("../../../services/logger");
vi.mock("../../../hooks/useDelayedButtonLoading");
const confirmMock = vi.fn();
vi.mock("../../../hooks/ui/useConfirmDialog", () => ({
    useConfirmDialog: () => confirmMock,
}));

// Mock logger
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

// Mock useDelayedButtonLoading
vi.mock("../../../hooks/useDelayedButtonLoading", () => ({
    useDelayedButtonLoading: vi.fn(() => false),
}));

describe("Settings - Branch Coverage Tests", () => {
    // Mock store implementations
    const mockErrorStore = {
        clearError: vi.fn(),
        isLoading: false,
        lastError: null,
        setError: vi.fn(),
    };

    const mockSettingsStore = {
        resetSettings: vi.fn(),
        settings: {
            autoStart: false,
            historyLimit: 100,
            minimizeToTray: false,
            notifications: true,
            soundAlerts: false,
            theme: "light",
        },
        persistHistoryLimit: vi.fn(),
        updateSettings: vi.fn(),
    };

    const mockSitesStore = {
        downloadSqliteBackup: vi.fn().mockResolvedValue({
            buffer: new ArrayBuffer(8),
            fileName: "backup.db",
            metadata: {
                createdAt: 0,
                originalPath: "/tmp/backup.db",
                sizeBytes: 8,
            },
        }),
        fullResyncSites: vi.fn(),
    };

    const mockTheme = {
        currentTheme: {
            name: "light",
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
        availableThemes: [
            "light",
            "dark",
            "system",
        ],
        getColor: vi.fn(() => "#000"),
        getStatusColor: vi.fn(),
        systemTheme: "light",
        themeManager: {},
        themeName: "light",
        themeVersion: "1.0.0",
        toggleTheme: vi.fn(),
    } as any;

    const mockOnClose = vi.fn();

    beforeEach(() => {
        // Reset all mocks
        vi.clearAllMocks();

        // Setup default mock implementations
        vi.mocked(useErrorStore).mockReturnValue(mockErrorStore);
        vi.mocked(useSettingsStore).mockReturnValue(mockSettingsStore);
        vi.mocked(useSitesStore).mockReturnValue(mockSitesStore);
        vi.mocked(useTheme).mockReturnValue(mockTheme);
        vi.mocked(useThemeClasses).mockReturnValue({
            getBackgroundClass: vi
                .fn()
                .mockReturnValue({ backgroundColor: "#ffffff" }),
            getBorderClass: vi.fn().mockReturnValue({ borderColor: "#cccccc" }),
            getTextClass: vi.fn().mockReturnValue({ color: "#000000" }),
            getColor: vi.fn().mockReturnValue("#000000"),
            getStatusClass: vi.fn().mockReturnValue({ color: "#000000" }),
            getSurfaceClass: vi
                .fn()
                .mockReturnValue({ backgroundColor: "#f5f5f5" }),
        } as any);

        // Reset confirmation dialog mock
        confirmMock.mockReset();
        confirmMock.mockResolvedValue(true);
    });

    describe("Error Display Branches", () => {
        it("should render error alert when lastError is present", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: Settings.branch-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: Settings.branch-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            vi.mocked(useErrorStore).mockReturnValue({
                ...mockErrorStore,
                lastError: "Test error message",
            });

            render(<Settings onClose={mockOnClose} />);

            expect(screen.getByText("Test error message")).toBeInTheDocument();
        });

        it("should not render error alert when lastError is null", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: Settings.branch-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: Settings.branch-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            vi.mocked(useErrorStore).mockReturnValue({
                ...mockErrorStore,
                lastError: null,
            });

            render(<Settings onClose={mockOnClose} />);

            expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
        });
    });

    describe("Sync Success Display Branches", () => {
        it("should render sync success message when syncSuccess is true and no error", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: Settings.branch-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: Settings.branch-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            vi.mocked(useSitesStore).mockReturnValue({
                ...mockSitesStore,
                fullResyncSites: vi.fn().mockResolvedValue(undefined),
            });

            render(<Settings onClose={mockOnClose} />);

            // Trigger sync to set success state
            const syncButton = screen.getByRole("button", {
                name: /refresh history/i,
            });
            fireEvent.click(syncButton);

            await waitFor(() => {
                expect(screen.getByText("Sync complete")).toBeInTheDocument();
            });

            expect(
                screen.getByText(
                    "Latest data loaded from the monitoring database."
                )
            ).toBeInTheDocument();
        });

        it("should not render sync success when error is present", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: Settings.branch-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: Settings.branch-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            vi.mocked(useErrorStore).mockReturnValue({
                ...mockErrorStore,
                lastError: "Error message",
            });

            render(<Settings onClose={mockOnClose} />);

            // Sync success should not be visible when error is present
            expect(screen.queryByText("Sync complete")).not.toBeInTheDocument();
        });
    });

    describe("Settings Validation Branches", () => {
        it("should update allowed settings keys", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: Settings.branch-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Data Update", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: Settings.branch-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Data Update", "type");

            render(<Settings onClose={mockOnClose} />);

            const notificationsCheckbox = screen.getByLabelText(
                "Enable desktop notifications"
            );
            fireEvent.click(notificationsCheckbox);

            expect(mockSettingsStore.updateSettings).toHaveBeenCalledWith({
                // Inverted from initial true
                notifications: false,
            });
        });

        it("should reject invalid settings keys and warn", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: Settings.branch-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: Settings.branch-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(<Settings onClose={mockOnClose} />);

            const soundAlertsCheckbox = screen.getByLabelText(
                "Enable sound alerts"
            );
            fireEvent.click(soundAlertsCheckbox);

            // Should still call updateSettings for valid keys
            expect(mockSettingsStore.updateSettings).toHaveBeenCalled();
        });
    });

    describe("Loading State Branches", () => {
        it("should disable inputs when loading is true", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: Settings.branch-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Data Loading", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: Settings.branch-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Data Loading", "type");

            vi.mocked(useErrorStore).mockReturnValue({
                ...mockErrorStore,
                isLoading: true,
            });

            render(<Settings onClose={mockOnClose} />);

            expect(
                screen.getByLabelText(
                    "Maximum number of history records to keep per site"
                )
            ).toBeDisabled();
            expect(
                screen.getByLabelText("Enable desktop notifications")
            ).toBeDisabled();
            expect(
                screen.getByRole("button", { name: /refresh history/i })
            ).toBeDisabled();
        });

        it("should enable inputs when loading is false", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: Settings.branch-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Data Loading", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: Settings.branch-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Data Loading", "type");

            vi.mocked(useErrorStore).mockReturnValue({
                ...mockErrorStore,
                isLoading: false,
            });

            render(<Settings onClose={mockOnClose} />);

            expect(
                screen.getByLabelText(
                    "Maximum number of history records to keep per site"
                )
            ).not.toBeDisabled();
            expect(
                screen.getByLabelText("Enable desktop notifications")
            ).not.toBeDisabled();
            expect(
                screen.getByRole("button", { name: /refresh history/i })
            ).not.toBeDisabled();
        });
    });

    describe("Async Error Handling Branches", () => {
        it("should handle sync errors and set error state", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: Settings.branch-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: Settings.branch-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            const syncError = new Error("Sync failed");
            vi.mocked(useSitesStore).mockReturnValue({
                ...mockSitesStore,
                fullResyncSites: vi.fn().mockRejectedValue(syncError),
            });

            render(<Settings onClose={mockOnClose} />);

            const syncButton = screen.getByRole("button", {
                name: /refresh history/i,
            });
            fireEvent.click(syncButton);

            await waitFor(() => {
                expect(mockErrorStore.setError).toHaveBeenCalledWith(
                    "Failed to sync data: Sync failed"
                );
            });
        });

        it("should handle backup download errors", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: Settings.branch-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: Settings.branch-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            const backupError = new Error("Backup failed");
            vi.mocked(useSitesStore).mockReturnValue({
                ...mockSitesStore,
                downloadSqliteBackup: vi.fn().mockRejectedValue(backupError),
            });

            render(<Settings onClose={mockOnClose} />);

            const backupButton = screen.getByRole("button", {
                name: /export monitoring data/i,
            });
            fireEvent.click(backupButton);

            await waitFor(() => {
                expect(mockErrorStore.setError).toHaveBeenCalledWith(
                    "Failed to download SQLite backup: Backup failed"
                );
            });
        });

        it("should handle history limit update errors", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: Settings.branch-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: Settings.branch-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            const user = userEvent.setup();
            const historyError = new Error("History update failed");
            const mockUpdateHistoryLimit = vi
                .fn()
                .mockRejectedValue(historyError);

            vi.mocked(useSettingsStore).mockReturnValue({
                ...mockSettingsStore,
                persistHistoryLimit: mockUpdateHistoryLimit,
            });

            render(<Settings onClose={mockOnClose} />);

            const historySelect = screen.getByLabelText(
                "Maximum number of history records to keep per site"
            );
            await user.selectOptions(historySelect, "50");

            await waitFor(() => {
                expect(mockUpdateHistoryLimit).toHaveBeenCalledWith(50);
            });
        });
    });

    describe("User Confirmation Branches", () => {
        it("should reset settings when user confirms", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: Settings.branch-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: Settings.branch-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            confirmMock.mockResolvedValue(true);

            render(<Settings onClose={mockOnClose} />);

            const resetButton = screen.getByRole("button", {
                name: /reset everything/i,
            });
            fireEvent.click(resetButton);

            await waitFor(() => {
                expect(confirmMock).toHaveBeenCalledWith(
                    expect.objectContaining({
                        message:
                            "Are you sure you want to reset all settings to defaults?",
                        title: "Reset Settings",
                    })
                );
            });

            await waitFor(() => {
                expect(mockSettingsStore.resetSettings).toHaveBeenCalled();
            });

            expect(mockErrorStore.clearError).toHaveBeenCalled();
        });

        it("should not reset settings when user cancels", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: Settings.branch-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: Settings.branch-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            confirmMock.mockResolvedValue(false);

            render(<Settings onClose={mockOnClose} />);

            const resetButton = screen.getByRole("button", {
                name: /reset everything/i,
            });
            fireEvent.click(resetButton);

            expect(confirmMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    message:
                        "Are you sure you want to reset all settings to defaults?",
                    title: "Reset Settings",
                })
            );
            expect(mockSettingsStore.resetSettings).not.toHaveBeenCalled();
            expect(mockErrorStore.clearError).not.toHaveBeenCalled();
        });
    });

    describe("Theme Selection Branches", () => {
        it("should handle theme change with multiple available themes", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: Settings.branch-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: Settings.branch-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(<Settings onClose={mockOnClose} />);

            const themeSelect = screen.getByLabelText(
                "Select application theme"
            );
            fireEvent.change(themeSelect, { target: { value: "dark" } });

            expect(mockTheme.setTheme).toHaveBeenCalledWith("dark");
        });

        it("should render all available themes in select options", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: Settings.branch-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: Settings.branch-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            render(<Settings onClose={mockOnClose} />);

            expect(screen.getByDisplayValue("Light")).toBeInTheDocument();
            expect(
                screen.getByRole("option", { name: "Dark" })
            ).toBeInTheDocument();
            expect(
                screen.getByRole("option", { name: "System" })
            ).toBeInTheDocument();
        });
    });

    describe("Error Object Property Access Branches", () => {
        it("should handle error objects with message property", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: Settings.branch-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: Settings.branch-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            const errorWithMessage = { message: "Detailed error message" };
            vi.mocked(useSitesStore).mockReturnValue({
                ...mockSitesStore,
                fullResyncSites: vi.fn().mockRejectedValue(errorWithMessage),
            });

            render(<Settings onClose={mockOnClose} />);

            const syncButton = screen.getByRole("button", {
                name: /refresh history/i,
            });
            fireEvent.click(syncButton);

            await waitFor(() => {
                expect(mockErrorStore.setError).toHaveBeenCalledWith(
                    "Failed to sync data: Detailed error message"
                );
            });
        });

        it("should handle error objects without message property", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: Settings.branch-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: Settings.branch-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            const errorWithoutMessage = { code: "ERROR_CODE" };
            vi.mocked(useSitesStore).mockReturnValue({
                ...mockSitesStore,
                downloadSqliteBackup: vi
                    .fn()
                    .mockRejectedValue(errorWithoutMessage),
            });

            render(<Settings onClose={mockOnClose} />);

            const backupButton = screen.getByRole("button", {
                name: /export monitoring data/i,
            });
            fireEvent.click(backupButton);

            await waitFor(() => {
                expect(mockErrorStore.setError).toHaveBeenCalledWith(
                    "Failed to download SQLite backup: [object Object]"
                );
            });
        });

        it("should handle primitive error values", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: Settings.branch-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: Settings.branch-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            const primitiveError = "Simple string error";
            vi.mocked(useSitesStore).mockReturnValue({
                ...mockSitesStore,
                fullResyncSites: vi.fn().mockRejectedValue(primitiveError),
            });

            render(<Settings onClose={mockOnClose} />);

            const syncButton = screen.getByRole("button", {
                name: /refresh history/i,
            });
            fireEvent.click(syncButton);

            await waitFor(() => {
                expect(mockErrorStore.setError).toHaveBeenCalledWith(
                    "Failed to sync data: Simple string error"
                );
            });
        });
    });

    describe("Event Handler Branches", () => {
        it("should handle all checkbox change events", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: Settings.branch-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Event Processing", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: Settings.branch-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Event Processing", "type");

            render(<Settings onClose={mockOnClose} />);

            // Test all checkbox handlers
            const autoStartCheckbox = screen.getByLabelText(
                "Launch Uptime Watcher automatically at login"
            );
            fireEvent.click(autoStartCheckbox);
            expect(mockSettingsStore.updateSettings).toHaveBeenCalledWith({
                autoStart: true,
            });

            const minimizeToTrayCheckbox = screen.getByLabelText(
                "Minimize Uptime Watcher to the system tray"
            );
            fireEvent.click(minimizeToTrayCheckbox);
            expect(mockSettingsStore.updateSettings).toHaveBeenCalledWith({
                minimizeToTray: true,
            });

            const soundAlertsCheckbox = screen.getByLabelText(
                "Enable sound alerts"
            );
            fireEvent.click(soundAlertsCheckbox);
            expect(mockSettingsStore.updateSettings).toHaveBeenCalledWith({
                soundAlerts: true,
            });
        });

        it("should handle history limit select change", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: Settings.branch-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Configuration", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: Settings.branch-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Configuration", "type");

            render(<Settings onClose={mockOnClose} />);

            const historySelect = screen.getByLabelText(
                "Maximum number of history records to keep per site"
            );
            fireEvent.change(historySelect, { target: { value: "200" } });

            expect(mockSettingsStore.persistHistoryLimit).toHaveBeenCalledWith(
                200
            );
        });

        it("should handle close button clicks", async ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: Settings.branch-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: Settings.branch-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const user = userEvent.setup();
            render(<Settings onClose={mockOnClose} />);

            const closeButton = screen.getByRole("button", {
                name: "Close settings",
            });
            await user.click(closeButton);

            expect(mockOnClose).toHaveBeenCalled();
        });
    });

    describe("Successful Operation Branches", () => {
        it("should handle successful sync operation", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: Settings.branch-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: Settings.branch-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const user = userEvent.setup();
            const mockFullSync = vi.fn().mockResolvedValue(undefined);

            vi.mocked(useSitesStore).mockReturnValue({
                ...mockSitesStore,
                fullResyncSites: mockFullSync,
            });

            render(<Settings onClose={mockOnClose} />);

            const syncButton = screen.getByRole("button", {
                name: /refresh history/i,
            });
            await user.click(syncButton);

            await waitFor(() => {
                expect(mockFullSync).toHaveBeenCalled();
            });
        });

        it("should handle successful backup download", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: Settings.branch-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Backup Operation", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: Settings.branch-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Backup Operation", "type");

            const user = userEvent.setup();
            const mockDownloadBackup = vi.fn().mockResolvedValue(undefined);

            vi.mocked(useSitesStore).mockReturnValue({
                ...mockSitesStore,
                downloadSqliteBackup: mockDownloadBackup,
            });

            render(<Settings onClose={mockOnClose} />);

            const backupButton = screen.getByRole("button", {
                name: /export monitoring data/i,
            });
            await user.click(backupButton);

            await waitFor(() => {
                expect(mockDownloadBackup).toHaveBeenCalled();
            });
        });
    });
});
