/**
 * Tests for Settings component. Focuses on essential functionality and proper
 * mocking.
 */

import "@testing-library/jest-dom";
import {
    act,
    fireEvent,
    render,
    screen,
    waitFor,
    within,
} from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { UnknownRecord } from "type-fest";

import { createSelectorHookMock } from "../../utils/createSelectorHookMock";
import {
    createSerializedBackupResult,
    createSerializedRestoreResult,
} from "../../utils/createSerializedBackupResult";
import {
    createSitesStoreMock,
    updateSitesStoreMock,
} from "../../utils/createSitesStoreMock";
import type { ThemeName } from "../../../theme/types";

const errorStoreState = {
    clearError: vi.fn(),
    isLoading: false,
    lastError: null as null | string,
    setError: vi.fn(),
};

const settingsStoreState = {
    exportSettings: vi.fn(),
    importSettings: vi.fn(),
    initializeSettings: vi.fn(),
    persistHistoryLimit: vi.fn().mockResolvedValue(undefined),
    resetSettings: vi.fn(),
    settings: {
        historyLimit: 1000,
        inAppAlertVolume: 1,
        inAppAlertsEnabled: true,
        inAppAlertsSoundEnabled: true,
        systemNotificationsEnabled: true,
        systemNotificationsSoundEnabled: true,
        theme: "light" as const,
    },
    syncSettings: vi.fn(),
    updateSetting: vi.fn(),
    updateSettings: vi.fn(),
};

const useErrorStoreMock = createSelectorHookMock(errorStoreState);
const useSettingsStoreMock = createSelectorHookMock(settingsStoreState);

interface GlobalWithSettingsMocks extends UnknownRecord {
    __useErrorStoreMock_settings__?: typeof useErrorStoreMock;
    __useSettingsStoreMock_settings__?: typeof useSettingsStoreMock;
    __useSitesStoreMock_settings__?: typeof useSitesStoreMock;
}

const globalWithSettingsMocks =
    globalThis as unknown as GlobalWithSettingsMocks;

globalWithSettingsMocks.__useErrorStoreMock_settings__ = useErrorStoreMock;
globalWithSettingsMocks.__useSettingsStoreMock_settings__ =
    useSettingsStoreMock;

// Mock all dependencies
vi.mock("../../../stores/error/useErrorStore", () => ({
    useErrorStore: <Result = typeof errorStoreState,>(
        selector?: (state: typeof errorStoreState) => Result,
        equality?: (a: Result, b: Result) => boolean
    ): Result | typeof errorStoreState => {
        const hook = globalWithSettingsMocks.__useErrorStoreMock_settings__;
        if (!hook) {
            throw new Error("useErrorStore mock was not initialized");
        }

        return hook(selector, equality) as Result | typeof errorStoreState;
    },
}));

vi.mock("../../../stores/settings/useSettingsStore", () => ({
    useSettingsStore: <Result = typeof settingsStoreState,>(
        selector?: (state: typeof settingsStoreState) => Result,
        equality?: (a: Result, b: Result) => boolean
    ): Result | typeof settingsStoreState => {
        const hook = globalWithSettingsMocks.__useSettingsStoreMock_settings__;
        if (!hook) {
            throw new Error("useSettingsStore mock was not initialized");
        }

        return hook(selector, equality) as Result | typeof settingsStoreState;
    },
}));

// Cloud settings integration triggers side-effectful store operations and IPC
// calls. This suite focuses on the baseline Settings UI; CloudSettingsSection
// has its own dedicated tests.
vi.mock("../../../components/Settings/CloudSettingsSection", () => ({
    CloudSettingsSection: (): null => null,
}));

const createDefaultSaveBackup = () =>
    vi.fn(async () => ({
        canceled: false as const,
        fileName: "uptime-watcher-backup.sqlite",
        filePath: "/tmp/uptime-watcher-backup.sqlite",
        metadata: createSerializedBackupResult().metadata,
    }));

const createDefaultRestoreBackup = () =>
    vi.fn(async () => createSerializedRestoreResult());

const createDefaultFullResync = () => vi.fn(async () => undefined);

// Standard creation bridged through global to avoid hoist-time import errors
const sitesStoreState = createSitesStoreMock({
    saveSqliteBackup: createDefaultSaveBackup(),
    restoreSqliteBackup: createDefaultRestoreBackup(),
    fullResyncSites: createDefaultFullResync(),
    lastBackupMetadata: createSerializedBackupResult().metadata,
    setLastBackupMetadata: vi.fn(),
});

const useSitesStoreMock = createSelectorHookMock(sitesStoreState);

globalWithSettingsMocks.__useSitesStoreMock_settings__ = useSitesStoreMock;

vi.mock("../../../stores/sites/useSitesStore", () => ({
    useSitesStore: <Result = typeof sitesStoreState,>(
        selector?: (state: typeof sitesStoreState) => Result,
        equality?: (a: Result, b: Result) => boolean
    ): Result | typeof sitesStoreState => {
        const hook = globalWithSettingsMocks.__useSitesStoreMock_settings__;
        if (!hook) {
            throw new Error("useSitesStore mock was not initialized");
        }

        return hook(selector, equality) as Result | typeof sitesStoreState;
    },
}));

const resetSitesStoreState = (): void => {
    updateSitesStoreMock(sitesStoreState, {
        saveSqliteBackup: createDefaultSaveBackup(),
        restoreSqliteBackup: createDefaultRestoreBackup(),
        fullResyncSites: createDefaultFullResync(),
        lastBackupMetadata: createSerializedBackupResult().metadata,
        setLastBackupMetadata: vi.fn(),
    });
};

const defaultThemeForSelectors = {
    currentTheme: {
        colors: {
            primary: {
                500: "#2563eb",
                base: "#2563eb",
            },
        },
        isDark: false,
        name: "light",
    },
};

const themeState: { current: UnknownRecord } = {
    current: defaultThemeForSelectors,
};

vi.mock("../../../theme/useTheme", () => {
    const useThemeMock = vi.fn(() => themeState.current);
    const useThemeClassesMock = vi.fn(() => ({
        join: vi.fn((...classes: readonly string[]) =>
            classes.filter(Boolean).join(" ")
        ),
        cx: vi.fn((...classes: readonly string[]) =>
            classes.filter(Boolean).join(" ")
        ),
    }));
    const useThemeValueMock = vi.fn(
        (selector: (theme: Record<string, unknown>) => unknown) =>
            selector(
                (themeState.current["currentTheme"] ?? {}) as Record<
                    string,
                    unknown
                >
            )
    );

    return {
        useTheme: useThemeMock,
        useThemeClasses: useThemeClassesMock,
        useThemeValue: useThemeValueMock,
    };
});

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

vi.mock("../../../hooks/usePrefersReducedMotion", () => ({
    usePrefersReducedMotion: () => false,
}));
vi.mock("../../../components/Alerts/alertCoordinator", () => ({
    playInAppAlertTone: vi.fn().mockResolvedValue(undefined),
}));
const confirmMock = vi.fn();
vi.mock("../../../hooks/ui/useConfirmDialog", () => ({
    useConfirmDialog: () => confirmMock,
}));

// Import after mocks
import { Settings } from "../../../components/Settings/Settings";
import { playInAppAlertTone } from "../../../components/Alerts/alertCoordinator";
import { useTheme, useThemeClasses } from "../../../theme/useTheme";

// Get mocked functions
const mockUseTheme = vi.mocked(useTheme);
const mockUseThemeClasses = vi.mocked(useThemeClasses);
const mockPlayInAppAlertTone = vi.mocked(playInAppAlertTone);

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
            inAppAlertsEnabled: true,
            inAppAlertsSoundEnabled: true,
            inAppAlertVolume: 1,
            systemNotificationsEnabled: true,
            systemNotificationsSoundEnabled: true,
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
                primary: {
                    500: "#000",
                    base: "#000",
                },
                secondary: {
                    500: "#333",
                    base: "#333",
                },
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
        vi.useRealTimers();
        vi.clearAllMocks();
        confirmMock.mockReset();

        useSitesStoreMock.mockClear();
        resetSitesStoreState();

        mockSettingsStore.settings.inAppAlertsSoundEnabled = true;
        mockSettingsStore.settings.inAppAlertVolume = 1;

        useErrorStoreMock.setState({
            ...mockErrorStore,
        });
        useSettingsStoreMock.setState({
            ...mockSettingsStore,
            settings: mockSettingsStore.settings,
        });
        themeState.current = mockTheme as UnknownRecord;
        mockUseTheme.mockReturnValue(
            themeState.current as unknown as ReturnType<typeof useTheme>
        );
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
        } satisfies ReturnType<typeof useThemeClasses>);
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

    it("should call onClose when close button is clicked", async ({
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

        await waitFor(() => {
            expect(mockOnClose).toHaveBeenCalled();
        });
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

        useErrorStoreMock.setState({ lastError: "Test error" });

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

    it("should handle SQLite backup save", ({ task, annotate }) => {
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

        expect(mockSitesStore.saveSqliteBackup).toHaveBeenCalled();
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
                historyLimit: "500" as unknown as number,
            },
        };
        useSettingsStoreMock.setState(settingsWithStringLimit);

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

        const darkTheme = {
            ...mockTheme,
            currentTheme: {
                ...mockTheme.currentTheme,
                isDark: true,
            },
        };
        themeState.current = darkTheme as UnknownRecord;
        mockUseTheme.mockReturnValue(
            themeState.current as unknown as ReturnType<typeof useTheme>
        );

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

    it("previews the alert tone when the volume slider changes", async () => {
        vi.useFakeTimers();
        mockPlayInAppAlertTone.mockClear();

        try {
            render(<Settings onClose={mockOnClose} />);

            const slider = screen.getByLabelText("In-app alert volume");
            fireEvent.change(slider, { target: { value: "40" } });

            expect(mockSettingsStore.updateSettings).toHaveBeenCalledWith({
                inAppAlertVolume: 0.4,
            });

            await act(async () => {
                await vi.advanceTimersByTimeAsync(200);
            });

            expect(mockPlayInAppAlertTone).toHaveBeenCalled();
        } finally {
            vi.useRealTimers();
        }
    });

    it("disables the alert volume slider when sound alerts are disabled", () => {
        mockSettingsStore.settings.inAppAlertsSoundEnabled = false;

        render(<Settings onClose={mockOnClose} />);

        const slider = screen.getByLabelText("In-app alert volume");
        expect(slider).toBeDisabled();
    });
});
