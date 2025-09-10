/**
 * Property-based fuzzing tests for Settings component configuration handling.
 *
 * @remarks
 * These tests focus on the Settings component's ability to handle various
 * configuration scenarios, form input validation, state transitions, and data
 * persistence operations. The Settings component manages critical application
 * configuration and data operations.
 *
 * The Settings component handles:
 *
 * - Theme selection and system preferences
 * - History limit configuration with validation
 * - Notification and sound preferences
 * - Auto-start and tray behavior settings
 * - Data import/export operations
 * - Settings reset functionality
 * - Error handling and recovery
 *
 * Focus areas:
 *
 * - Form input validation with extreme values
 * - Settings state transitions and persistence
 * - Data export/import operations with edge cases
 * - Error handling and user feedback
 * - Performance with large configuration changes
 * - Accessibility and keyboard navigation
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { test as fcTest, fc } from "@fast-check/vitest";
import {
    render,
    screen,
    fireEvent,
    waitFor,
    act,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import type { AppSettings } from "../../../stores/types";
import type { ThemeName } from "../../../theme/types";
import { Settings } from "../../../components/Settings/Settings";

// Mock state for settings store
let mockSettingsState: AppSettings = {
    theme: "light",
    notifications: true,
    soundAlerts: true,
    autoStart: false,
    minimizeToTray: false,
    historyLimit: 1000,
};

// Mock state for other stores
let mockErrorState = {
    error: null as string | null,
    isLoading: false,
};

let mockSitesState = {
    sites: [],
    isLoading: false,
};

// Mock functions
const mockSetTheme = vi.fn((theme: ThemeName) => {
    mockSettingsState.theme = theme;
});

const mockUpdateSetting = vi.fn(async (key: keyof AppSettings, value: any) => {
    (mockSettingsState as any)[key] = value;
});

const mockResetSettings = vi.fn(async () => {
    mockSettingsState = {
        theme: "light",
        notifications: true,
        soundAlerts: true,
        autoStart: false,
        minimizeToTray: false,
        historyLimit: 1000,
    };
});

const mockSetError = vi.fn((error: string | null) => {
    mockErrorState.error = error;
});

const mockClearError = vi.fn(() => {
    mockErrorState.error = null;
});

const mockFullSyncFromBackend = vi.fn(async () => {
    // Simulate sync operation
});

const mockDownloadSQLiteBackup = vi.fn(async () => {
    // Simulate backup download
});

const mockOnClose = vi.fn();

// Mock stores
vi.mock("../../../stores/settings/useSettingsStore", () => ({
    useSettingsStore: vi.fn(() => ({
        settings: mockSettingsState,
        setTheme: mockSetTheme,
        updateSetting: mockUpdateSetting,
        resetSettings: mockResetSettings,
        isLoading: mockErrorState.isLoading,
    })),
}));

vi.mock("../../../stores/error/useErrorStore", () => ({
    useErrorStore: vi.fn(() => ({
        error: mockErrorState.error,
        setError: mockSetError,
        clearError: mockClearError,
        isLoading: mockErrorState.isLoading,
    })),
}));

vi.mock("../../../stores/sites/useSitesStore", () => ({
    useSitesStore: vi.fn(() => ({
        sites: mockSitesState.sites,
        isLoading: mockSitesState.isLoading,
        fullSyncFromBackend: mockFullSyncFromBackend,
        downloadSQLiteBackup: mockDownloadSQLiteBackup,
    })),
}));

vi.mock("../../../theme/useTheme", () => ({
    useTheme: vi.fn(() => ({
        theme: {
            name: mockSettingsState.theme,
            isDark: mockSettingsState.theme === "dark",
            colors: {},
        },
        availableThemes: [
            "light",
            "dark",
            "system",
        ],
        setTheme: mockSetTheme,
    })),
}));

// Mock themed components
vi.mock("../../../theme/components/ThemedBox", () => ({
    ThemedBox: vi.fn(({ children, className, ...props }) => (
        <div className={className} data-testid="themed-box" {...props}>
            {children}
        </div>
    )),
}));

vi.mock("../../../theme/components/ThemedText", () => ({
    ThemedText: vi.fn(({ children, className, ...props }) => (
        <span className={className} data-testid="themed-text" {...props}>
            {children}
        </span>
    )),
}));

vi.mock("../../../theme/components/ThemedButton", () => ({
    ThemedButton: vi.fn(
        ({ children, onClick, disabled, className, ...props }) => (
            <button
                className={className}
                onClick={onClick}
                disabled={disabled}
                data-testid="themed-button"
                {...props}
            >
                {children}
            </button>
        )
    ),
}));

vi.mock("../../../theme/components/ThemedSelect", () => ({
    ThemedSelect: vi.fn(({ children, onChange, value, disabled, ...props }) => (
        <select
            onChange={onChange}
            value={value}
            disabled={disabled}
            data-testid="themed-select"
            {...props}
        >
            {children}
        </select>
    )),
}));

vi.mock("../../../theme/components/ThemedCheckbox", () => ({
    ThemedCheckbox: vi.fn(({ checked, onChange, disabled, ...props }) => (
        <input
            type="checkbox"
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            data-testid="themed-checkbox"
            {...props}
        />
    )),
}));

vi.mock("../../../theme/components/StatusIndicator", () => ({
    StatusIndicator: vi.fn(({ status, size }) => (
        <div
            data-testid="status-indicator"
            data-status={status}
            data-size={size}
        />
    )),
}));

// Mock other components
vi.mock("../../../components/common/ErrorAlert/ErrorAlert", () => ({
    ErrorAlert: vi.fn(({ message }) => (
        <div data-testid="error-alert">{message}</div>
    )),
}));

vi.mock("../../../components/shared/SettingItem", () => ({
    SettingItem: vi.fn(({ control, description, title }) => (
        <div data-testid="setting-item">
            <div>{title}</div>
            <div>{description}</div>
            {control}
        </div>
    )),
}));

// Mock hooks
vi.mock("../../../hooks/useDelayedButtonLoading", () => ({
    useDelayedButtonLoading: vi.fn(() => ({
        isLoading: false,
        delayedLoading: false,
    })),
}));

// Mock constants
vi.mock("../../../constants", () => ({
    DEFAULT_HISTORY_LIMIT: 1000,
    HISTORY_LIMIT_OPTIONS: [
        { label: "25 records", value: 25 },
        { label: "50 records", value: 50 },
        { label: "100 records", value: 100 },
        { label: "500 records", value: 500 },
        { label: "1000 records", value: 1000 },
        { label: "5000 records", value: 5000 },
        { label: "Unlimited", value: -1 },
    ],
}));

/**
 * Fast-check arbitraries for generating test data
 */

// Generate theme names
const themeNameArbitrary = fc.constantFrom(
    "light",
    "dark",
    "system"
) as fc.Arbitrary<ThemeName>;

// Generate valid history limit values
const historyLimitArbitrary = fc.constantFrom(25, 50, 100, 500, 1000, 5000, -1);

// Generate invalid history limit values for boundary testing
const invalidHistoryLimitArbitrary = fc.oneof(
    fc.integer({ min: -1000, max: -2 }), // Invalid negative numbers
    fc.integer({ min: 0, max: 24 }), // Too small
    fc.integer({ min: 50_001, max: 100_000 }), // Too large
    fc.float(), // Decimal numbers
    fc.constant(Number.NaN),
    fc.constant(Infinity),
    fc.constant(-Infinity)
);

// Generate settings configurations
const settingsArbitrary = fc.record({
    theme: themeNameArbitrary,
    notifications: fc.boolean(),
    soundAlerts: fc.boolean(),
    autoStart: fc.boolean(),
    minimizeToTray: fc.boolean(),
    historyLimit: historyLimitArbitrary,
}) as fc.Arbitrary<AppSettings>;

// Generate extreme settings configurations
const extremeSettingsArbitrary = fc.record({
    theme: fc.oneof(themeNameArbitrary, fc.string() as fc.Arbitrary<ThemeName>),
    notifications: fc.boolean(),
    soundAlerts: fc.boolean(),
    autoStart: fc.boolean(),
    minimizeToTray: fc.boolean(),
    historyLimit: fc.oneof(historyLimitArbitrary, invalidHistoryLimitArbitrary),
});

// Generate error scenarios
const errorScenarioArbitrary = fc.record({
    hasError: fc.boolean(),
    errorMessage: fc.oneof(
        fc.string({ minLength: 1, maxLength: 200 }),
        fc.constant("Network error"),
        fc.constant("Database connection failed"),
        fc.constant("Invalid configuration"),
        fc.constant(""),
        fc.constant(null)
    ),
    isLoading: fc.boolean(),
});

describe("Settings Component - Property-Based Fuzzing", () => {
    beforeEach(() => {
        // Reset mocks
        vi.clearAllMocks();

        // Reset mock state
        mockSettingsState = {
            theme: "light",
            notifications: true,
            soundAlerts: true,
            autoStart: false,
            minimizeToTray: false,
            historyLimit: 1000,
        };

        mockErrorState = {
            error: null,
            isLoading: false,
        };

        mockSitesState = {
            sites: [],
            isLoading: false,
        };

        // Mock window.confirm for reset tests
        Object.defineProperty(window, "confirm", {
            writable: true,
            value: vi.fn(() => true),
        });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe("Settings Configuration Fuzzing", () => {
        fcTest.prop([settingsArbitrary], {
            numRuns: 100,
            timeout: 10_000,
        })(
            "should handle arbitrary valid settings configurations",
            async (settings) => {
                mockSettingsState = settings;

                expect(() => {
                    render(<Settings onClose={mockOnClose} />);
                }).not.toThrow();

                // Verify settings modal renders
                expect(screen.getByText("⚙️ Settings")).toBeInTheDocument();
            }
        );

        fcTest.prop([extremeSettingsArbitrary], {
            numRuns: 50,
            timeout: 10_000,
        })(
            "should handle extreme settings configurations gracefully",
            async (extremeSettings) => {
                mockSettingsState = extremeSettings as AppSettings;

                expect(() => {
                    render(<Settings onClose={mockOnClose} />);
                }).not.toThrow();

                // Component should still render with defensive programming
                expect(screen.getByText("⚙️ Settings")).toBeInTheDocument();
            }
        );
    });

    describe("Theme Selection Fuzzing", () => {
        fcTest.prop([themeNameArbitrary], {
            numRuns: 50,
            timeout: 5000,
        })("should handle theme selection correctly", async (themeName) => {
            render(<Settings onClose={mockOnClose} />);

            const themeSelect = screen.getByLabelText(
                "Select application theme"
            );

            fireEvent.change(themeSelect, { target: { value: themeName } });

            expect(mockSetTheme).toHaveBeenCalledWith(themeName);
        });

        fcTest.prop([fc.integer({ min: 1, max: 10 })], {
            numRuns: 30,
            timeout: 10_000,
        })(
            "should handle rapid theme changes without issues",
            async (changeCount) => {
                render(<Settings onClose={mockOnClose} />);

                const themeSelect = screen.getByLabelText(
                    "Select application theme"
                );
                const themes: ThemeName[] = [
                    "light",
                    "dark",
                    "system",
                ];

                for (let i = 0; i < changeCount; i++) {
                    const theme = themes[i % themes.length];
                     fireEvent.change(themeSelect, {
                            target: { value: theme },
                        });

                }

                expect(mockSetTheme).toHaveBeenCalledTimes(changeCount);
            }
        );
    });

    describe("History Limit Configuration Fuzzing", () => {
        fcTest.prop([historyLimitArbitrary], {
            numRuns: 50,
            timeout: 5000,
        })(
            "should handle valid history limit changes",
            async (historyLimit) => {
                render(<Settings onClose={mockOnClose} />);

                const historySelect = screen.getByLabelText(
                    "Maximum number of history records to keep per site"
                );

                 fireEvent.change(historySelect, {
                        target: { value: historyLimit.toString() },
                    });


                expect(mockUpdateSetting).toHaveBeenCalledWith(
                    "historyLimit",
                    historyLimit
                );
            }
        );

        fcTest.prop([invalidHistoryLimitArbitrary], {
            numRuns: 50,
            timeout: 5000,
        })(
            "should handle invalid history limit values gracefully",
            async (invalidLimit) => {
                render(<Settings onClose={mockOnClose} />);

                const historySelect = screen.getByLabelText(
                    "Maximum number of history records to keep per site"
                );

                // Component should not crash with invalid values
                expect(() => {
                    fireEvent.change(historySelect, {
                        target: { value: invalidLimit.toString() },
                    });
                }).not.toThrow();
            }
        );
    });

    describe("Checkbox Settings Fuzzing", () => {
        fcTest.prop(
            [
                fc.record({
                    notifications: fc.boolean(),
                    soundAlerts: fc.boolean(),
                    autoStart: fc.boolean(),
                    minimizeToTray: fc.boolean(),
                }),
            ],
            {
                numRuns: 100,
                timeout: 10_000,
            }
        )(
            "should handle checkbox setting changes",
            async (checkboxSettings) => {
                render(<Settings onClose={mockOnClose} />);

                // Test notifications checkbox
                const notificationsCheckbox = screen.getByLabelText(
                    "Desktop notifications"
                );
                 fireEvent.click(notificationsCheckbox);


                // Test sound alerts checkbox
                const soundAlertsCheckbox =
                    screen.getByLabelText("Sound alerts");
                 fireEvent.click(soundAlertsCheckbox);


                // Test auto start checkbox
                const autoStartCheckbox = screen.getByLabelText(
                    "Start application automatically"
                );
                 fireEvent.click(autoStartCheckbox);


                // Test minimize to tray checkbox
                const minimizeToTrayCheckbox = screen.getByLabelText(
                    "Minimize to system tray"
                );
                 fireEvent.click(minimizeToTrayCheckbox);


                // Verify update calls were made
                expect(mockUpdateSetting).toHaveBeenCalled();
            }
        );

        fcTest.prop([fc.integer({ min: 1, max: 20 })], {
            numRuns: 30,
            timeout: 15_000,
        })("should handle rapid checkbox toggling", async (toggleCount) => {
            render(<Settings onClose={mockOnClose} />);

            const notificationsCheckbox = screen.getByLabelText(
                "Desktop notifications"
            );

            for (let i = 0; i < toggleCount; i++) {
                 fireEvent.click(notificationsCheckbox);

            }

            expect(mockUpdateSetting).toHaveBeenCalledTimes(toggleCount);
        });
    });

    describe("Data Operations Fuzzing", () => {
        fcTest.prop([fc.boolean()], {
            numRuns: 50,
            timeout: 10_000,
        })("should handle sync operations", async (shouldFail) => {
            if (shouldFail) {
                mockFullSyncFromBackend.mockRejectedValueOnce(
                    new Error("Sync failed")
                );
            } else {
                mockFullSyncFromBackend.mockResolvedValueOnce(undefined);
            }

            render(<Settings onClose={mockOnClose} />);

            const syncButton = screen.getByText("Sync Now");

             fireEvent.click(syncButton);


            expect(mockFullSyncFromBackend).toHaveBeenCalledTimes(1);

            if (shouldFail) {
                expect(mockSetError).toHaveBeenCalled();
            }
        });

        fcTest.prop([fc.boolean()], {
            numRuns: 50,
            timeout: 10_000,
        })("should handle backup download operations", async (shouldFail) => {
            if (shouldFail) {
                mockDownloadSQLiteBackup.mockRejectedValueOnce(
                    new Error("Download failed")
                );
            } else {
                mockDownloadSQLiteBackup.mockResolvedValueOnce(undefined);
            }

            render(<Settings onClose={mockOnClose} />);

            const downloadButton = screen.getByText("Download SQLite Backup");

             fireEvent.click(downloadButton);


            expect(mockDownloadSQLiteBackup).toHaveBeenCalledTimes(1);

            if (shouldFail) {
                expect(mockSetError).toHaveBeenCalled();
            }
        });
    });

    describe("Settings Reset Fuzzing", () => {
        fcTest.prop([fc.boolean()], {
            numRuns: 50,
            timeout: 10_000,
        })(
            "should handle settings reset with confirmation",
            async (confirmReset) => {
                (window.confirm as any).mockReturnValue(confirmReset);

                render(<Settings onClose={mockOnClose} />);

                const resetButton = screen.getByText("Reset to Defaults");

                 fireEvent.click(resetButton);


                expect(window.confirm).toHaveBeenCalledWith(
                    "Are you sure you want to reset all settings to defaults?"
                );

                if (confirmReset) {
                    expect(mockResetSettings).toHaveBeenCalledTimes(1);
                    expect(mockClearError).toHaveBeenCalledTimes(1);
                } else {
                    expect(mockResetSettings).not.toHaveBeenCalled();
                }
            }
        );
    });

    describe("Error Handling Fuzzing", () => {
        fcTest.prop([errorScenarioArbitrary], {
            numRuns: 100,
            timeout: 10_000,
        })(
            "should handle error scenarios gracefully",
            async (errorScenario) => {
                if (errorScenario.hasError && errorScenario.errorMessage) {
                    mockErrorState.error = errorScenario.errorMessage as string;
                }
                mockErrorState.isLoading = errorScenario.isLoading;

                expect(() => {
                    render(<Settings onClose={mockOnClose} />);
                }).not.toThrow();

                // Verify error display when present
                if (errorScenario.hasError && errorScenario.errorMessage) {
                    expect(
                        screen.getByTestId("error-alert")
                    ).toBeInTheDocument();
                }
            }
        );
    });

    describe("Modal Behavior Fuzzing", () => {
        fcTest.prop([fc.integer({ min: 1, max: 5 })], {
            numRuns: 30,
            timeout: 10_000,
        })("should handle close button interactions", async (clickCount) => {
            render(<Settings onClose={mockOnClose} />);

            const closeButton = screen.getByLabelText("Close settings");

            for (let i = 0; i < clickCount; i++) {
                 fireEvent.click(closeButton);

            }

            expect(mockOnClose).toHaveBeenCalledTimes(clickCount);
        });
    });

    describe("Accessibility Fuzzing", () => {
        fcTest.prop([settingsArbitrary], {
            numRuns: 50,
            timeout: 10_000,
        })(
            "should maintain accessibility attributes under all conditions",
            async (settings) => {
                mockSettingsState = settings;

                render(<Settings onClose={mockOnClose} />);

                // Verify essential accessibility attributes are present
                expect(
                    screen.getByLabelText("Select application theme")
                ).toBeInTheDocument();
                expect(
                    screen.getByLabelText(
                        "Maximum number of history records to keep per site"
                    )
                ).toBeInTheDocument();
                expect(
                    screen.getByLabelText("Desktop notifications")
                ).toBeInTheDocument();
                expect(
                    screen.getByLabelText("Sound alerts")
                ).toBeInTheDocument();
                expect(
                    screen.getByLabelText("Start application automatically")
                ).toBeInTheDocument();
                expect(
                    screen.getByLabelText("Minimize to system tray")
                ).toBeInTheDocument();

                // Verify form elements are properly labeled
                const formElements = screen.getAllByRole("button");
                const selectElements = screen.getAllByRole("combobox");
                const checkboxElements = screen.getAllByRole("checkbox");

                // All interactive elements should be focusable
                for (const element of [
                    ...formElements,
                    ...selectElements,
                    ...checkboxElements,
                ]) {
                    expect(element).not.toHaveAttribute("tabindex", "-1");
                }
            }
        );
    });

    describe("Performance Fuzzing", () => {
        fcTest.prop(
            [
                fc.record({
                    rapidChanges: fc.integer({ min: 5, max: 50 }),
                    settingType: fc.constantFrom(
                        "theme",
                        "historyLimit",
                        "notifications",
                        "soundAlerts"
                    ),
                }),
            ],
            {
                numRuns: 20,
                timeout: 30_000,
            }
        )(
            "should handle rapid setting changes efficiently",
            async (scenario) => {
                render(<Settings onClose={mockOnClose} />);

                const startTime = performance.now();

                // Perform rapid changes based on setting type
                switch (scenario.settingType) {
                    case "theme": {
                        const themeSelect = screen.getByLabelText(
                            "Select application theme"
                        );
                        const themes = [
                            "light",
                            "dark",
                            "system",
                        ];
                        for (let i = 0; i < scenario.rapidChanges; i++) {
                            const theme = themes[i % themes.length];
                             fireEvent.change(themeSelect, {
                                    target: { value: theme },
                                });

                        }
                        break;
                    }
                    case "historyLimit": {
                        const historySelect = screen.getByLabelText(
                            "Maximum number of history records to keep per site"
                        );
                        const limits = [
                            25,
                            50,
                            100,
                            500,
                            1000,
                        ];
                        for (let i = 0; i < scenario.rapidChanges; i++) {
                            const limit = limits[i % limits.length];
                             fireEvent.change(historySelect, {
                                    target: { value: limit.toString() },
                                });

                        }
                        break;
                    }
                    case "notifications": {
                        const checkbox = screen.getByLabelText(
                            "Desktop notifications"
                        );
                        for (let i = 0; i < scenario.rapidChanges; i++) {
                             fireEvent.click(checkbox);

                        }
                        break;
                    }
                    case "soundAlerts": {
                        const checkbox = screen.getByLabelText("Sound alerts");
                        for (let i = 0; i < scenario.rapidChanges; i++) {
                             fireEvent.click(checkbox);

                        }
                        break;
                    }
                }

                const endTime = performance.now();
                const operationTime = endTime - startTime;

                // Should handle rapid changes efficiently
                expect(operationTime).toBeLessThan(10_000); // 10 seconds max
            }
        );
    });
});
