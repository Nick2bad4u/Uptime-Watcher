/**
 * Property-based fuzzing tests for the Settings component notification inputs.
 *
 * @remarks
 * These tests focus exclusively on the new notification preference fields that
 * differentiate in-app alerts from system notifications. Each test stresses the
 * toggle invariants that guard the dependent sound controls and verifies that
 * user interactions remain deterministic under arbitrary store configurations.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import "@testing-library/jest-dom";

import type { AppSettings } from "../../../stores/types";
import type { ThemeName } from "../../../theme/types";

import { Settings } from "../../../components/Settings/Settings";
import { sanitizeDomProps } from "../../utils/domPropSanitizer";

interface ErrorStoreSnapshot {
    /** Last recorded error message, if any. */
    error: string | null;
    /** Loading flag representing in-flight operations. */
    isLoading: boolean;
    /** Cached message for display, allowing null when none. */
    lastError: string | undefined;
}

const {
    baseSettings: BASE_SETTINGS,
    state: storeState,
    mocks,
    resetState,
} = vi.hoisted(() => {
    const baseSettings: AppSettings = {
        autoStart: false,
        historyLimit: 1000,
        inAppAlertsEnabled: true,
        inAppAlertsSoundEnabled: false,
        inAppAlertVolume: 1,
        minimizeToTray: true,
        systemNotificationsEnabled: false,
        systemNotificationsSoundEnabled: false,
        theme: "system",
        mutedSiteNotificationIdentifiers: [],
    };

    const state = {
        settings: { ...baseSettings },
        error: {
            error: null as ErrorStoreSnapshot["error"],
            isLoading: false,
            lastError: undefined as ErrorStoreSnapshot["lastError"],
        },
    } satisfies {
        settings: AppSettings;
        error: ErrorStoreSnapshot;
    };

    const mocks = {
        setTheme: vi.fn((theme: ThemeName) => {
            state.settings = {
                ...state.settings,
                theme,
            };
        }),
        updateSettings: vi.fn((updates: Partial<AppSettings>) => {
            state.settings = {
                ...state.settings,
                ...updates,
            };
        }),
        persistHistoryLimit: vi.fn(async (limit: number) => {
            state.settings = {
                ...state.settings,
                historyLimit: limit,
            };
        }),
        resetSettings: vi.fn(async () => {
            state.settings = { ...baseSettings };
        }),
        setError: vi.fn((error: string | null) => {
            state.error.error = error;
            state.error.lastError = error ?? undefined;
        }),
        clearError: vi.fn(() => {
            state.error.error = null;
            state.error.lastError = undefined;
        }),
        downloadSqliteBackup: vi.fn(async () => undefined),
        fullResyncSites: vi.fn(async () => undefined),
        onClose: vi.fn(),
        confirm: vi.fn(async () => true),
        logger: {
            user: {
                action: vi.fn(),
                settingsChange: vi.fn(),
            },
            debug: vi.fn(),
            error: vi.fn(),
            warn: vi.fn(),
        },
    };

    const resetState = (): void => {
        state.settings = { ...baseSettings };
        state.error = {
            error: null,
            isLoading: false,
            lastError: undefined,
        } satisfies ErrorStoreSnapshot;

        mocks.setTheme.mockClear();
        mocks.updateSettings.mockClear();
        mocks.persistHistoryLimit.mockClear();
        mocks.resetSettings.mockClear();
        mocks.setError.mockClear();
        mocks.clearError.mockClear();
        mocks.downloadSqliteBackup.mockClear();
        mocks.fullResyncSites.mockClear();
        mocks.onClose.mockClear();
        mocks.confirm.mockClear();
        mocks.confirm.mockImplementation(async () => true);
        mocks.logger.user.action.mockClear();
        mocks.logger.user.settingsChange.mockClear();
        mocks.logger.debug.mockClear();
        mocks.logger.error.mockClear();
        mocks.logger.warn.mockClear();
    };

    return { baseSettings, state, mocks, resetState };
});

/**
 * Applies partial settings overrides for a single test iteration.
 *
 * @param overrides - Partial settings to merge into the mock store state.
 */
const applySettingsOverrides = (overrides: Partial<AppSettings> = {}): void => {
    storeState.settings = {
        ...BASE_SETTINGS,
        ...overrides,
    };
};

/**
 * Retrieves the most recent payload provided to the settings update mock.
 *
 * @returns The last update payload or {@code null} if no update occurred.
 */
const getLastSettingsUpdate = (): Partial<AppSettings> | null => {
    const lastCall = mocks.updateSettings.mock.calls.at(-1);
    return (lastCall?.[0] as Partial<AppSettings> | undefined) ?? null;
};

vi.mock("../../../hooks/ui/useConfirmDialog", () => ({
    useConfirmDialog: () => mocks.confirm,
}));

vi.mock("../../../stores/settings/useSettingsStore", () => ({
    useSettingsStore: (selector?: (state: unknown) => unknown) => {
        const store = {
            persistHistoryLimit: mocks.persistHistoryLimit,
            resetSettings: mocks.resetSettings,
            settings: storeState.settings,
            updateSettings: mocks.updateSettings,
        } satisfies {
            persistHistoryLimit: typeof mocks.persistHistoryLimit;
            resetSettings: typeof mocks.resetSettings;
            settings: AppSettings;
            updateSettings: typeof mocks.updateSettings;
        };

        return typeof selector === "function" ? selector(store) : store;
    },
}));

vi.mock("../../../stores/error/useErrorStore", () => ({
    useErrorStore: () => ({
        clearError: mocks.clearError,
        isLoading: storeState.error.isLoading,
        lastError: storeState.error.lastError ?? null,
        setError: mocks.setError,
    }),
}));

vi.mock("../../../stores/sites/useSitesStore", () => ({
    useSitesStore: (selector?: (state: unknown) => unknown) => {
        const state = {
            downloadSqliteBackup: mocks.downloadSqliteBackup,
            fullResyncSites: mocks.fullResyncSites,
        };
        return typeof selector === "function" ? selector(state) : state;
    },
}));

vi.mock("../../../theme/useTheme", () => ({
    useTheme: () => ({
        availableThemes: [
            "light",
            "dark",
            "system",
        ],
        isDark: storeState.settings.theme === "dark",
        setTheme: mocks.setTheme,
        theme: {
            colors: {
                primary: {
                    500: "#2563eb",
                },
            },
            isDark: storeState.settings.theme === "dark",
            name: storeState.settings.theme,
        },
    }),
    useThemeValue: (
        selector: (theme: {
            colors: { primary: Record<number, string> };
        }) => unknown
    ) =>
        selector({
            colors: {
                primary: {
                    500: "#2563eb",
                },
            },
        }),
}));

vi.mock("../../../services/logger", () => ({
    logger: mocks.logger,
}));

vi.mock("../../../hooks/useDelayedButtonLoading", () => ({
    useDelayedButtonLoading: () => ({
        delayedLoading: false,
        isLoading: storeState.error.isLoading,
    }),
}));

vi.mock("../../../theme/components/ThemedBox", () => ({
    ThemedBox: vi.fn(({ children, className, ...props }) => {
        const safeProps = sanitizeDomProps(props);
        return (
            <div className={className} data-testid="themed-box" {...safeProps}>
                {children}
            </div>
        );
    }),
}));

vi.mock("../../../theme/components/ThemedText", () => ({
    ThemedText: vi.fn(({ children, className, ...props }) => {
        const safeProps = sanitizeDomProps(props);
        return (
            <span
                className={className}
                data-testid="themed-text"
                {...safeProps}
            >
                {children}
            </span>
        );
    }),
}));

vi.mock("../../../theme/components/ThemedButton", () => ({
    ThemedButton: vi.fn(({ children, disabled, onClick, ...props }) => {
        const safeProps = sanitizeDomProps(props);
        return (
            <button
                type="button"
                disabled={disabled}
                onClick={onClick}
                {...safeProps}
            >
                {children}
            </button>
        );
    }),
}));

vi.mock("../../../theme/components/ThemedSelect", () => ({
    ThemedSelect: vi.fn(({ children, disabled, onChange, value, ...props }) => {
        const safeProps = sanitizeDomProps(props);
        return (
            <select
                data-testid="themed-select"
                disabled={disabled}
                onChange={onChange}
                value={value}
                {...safeProps}
            >
                {children}
            </select>
        );
    }),
}));

vi.mock("../../../theme/components/ThemedCheckbox", () => ({
    ThemedCheckbox: vi.fn(({ checked, disabled, onChange, ...props }) => {
        const safeProps = sanitizeDomProps(props);
        return (
            <input
                type="checkbox"
                data-testid="themed-checkbox"
                checked={checked}
                disabled={disabled}
                onChange={onChange}
                {...safeProps}
            />
        );
    }),
}));

vi.mock("../../../theme/components/StatusIndicator", () => ({
    StatusIndicator: vi.fn(({ status }) => (
        <div data-testid="status-indicator" data-status={status} />
    )),
}));

vi.mock("../../../components/common/ErrorAlert/ErrorAlert", () => ({
    ErrorAlert: vi.fn(({ message }) => (
        <div data-testid="error-alert">{message}</div>
    )),
}));

vi.mock("../../../components/common/Tooltip/Tooltip", () => ({
    Tooltip: vi.fn(({ children }) => <>{children}</>),
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

// Cloud sync is tested separately; exclude it from notification fuzz scenarios.
vi.mock("../../../components/Settings/CloudSettingsSection", () => ({
    CloudSettingsSection: (): null => null,
}));

vi.mock("../../../utils/icons", () => {
    const Icon = () => <span data-testid="app-icon" />;
    return {
        AppIcons: {
            actions: {
                download: Icon,
                refresh: Icon,
                remove: Icon,
            },
            metrics: {
                monitor: Icon,
            },
            settings: {
                gearFilled: Icon,
            },
            status: {
                upFilled: Icon,
            },
            ui: {
                bell: Icon,
                close: Icon,
                cloud: Icon,
                database: Icon,
                home: Icon,
            },
        },
    };
});

vi.mock("../../../constants", () => ({
    ARIA_LABEL: "aria-label",
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
    TRANSITION_ALL: "all 0.2s ease-in-out",
}));

type TestingRenderResult = ReturnType<typeof render>;

let activeRender: TestingRenderResult | null = null;

/**
 * Renders the Settings component against a pristine DOM container.
 *
 * @returns The testing-library render result for further queries.
 */
const renderSettingsComponent = (): TestingRenderResult => {
    if (activeRender) {
        activeRender.unmount();
        activeRender = null;
    }

    document.body.innerHTML = "";
    const container = document.createElement("div");
    container.id = "vitest-test-root";
    document.body.append(container);

    const view = render(<Settings onClose={mocks.onClose} />, {
        container,
    });

    activeRender = view;

    return view;
};

beforeEach(() => {
    resetState();
    applySettingsOverrides();
});

afterEach(() => {
    if (activeRender) {
        activeRender.unmount();
        activeRender = null;
    }
    document.body.innerHTML = "";
});

describe("Settings Component - Notification preference scenarios", () => {
    const inAppToggleScenarios = [
        { alertsEnabled: true, soundEnabled: true },
        { alertsEnabled: true, soundEnabled: false },
        { alertsEnabled: false, soundEnabled: true },
        { alertsEnabled: false, soundEnabled: false },
    ] as const;

    for (const { alertsEnabled, soundEnabled } of inAppToggleScenarios) {
        it(`enforces invariants when toggling in-app alerts (alertsEnabled=${alertsEnabled}, soundEnabled=${soundEnabled})`, () => {
            resetState();
            applySettingsOverrides({
                inAppAlertsEnabled: alertsEnabled,
                inAppAlertsSoundEnabled: soundEnabled,
            });

            renderSettingsComponent();

            const alertsToggle = screen.getByLabelText("Enable in-app alerts");
            fireEvent.click(alertsToggle);

            const lastUpdate = getLastSettingsUpdate();
            expect(lastUpdate).not.toBeNull();
            expect(lastUpdate).toMatchObject({
                inAppAlertsEnabled: !alertsEnabled,
            });

            if (alertsEnabled) {
                expect(lastUpdate).toMatchObject({
                    inAppAlertsSoundEnabled: false,
                });
            } else {
                expect(lastUpdate).not.toHaveProperty(
                    "inAppAlertsSoundEnabled"
                );
            }
        });
    }

    const systemToggleScenarios = [
        { notificationsEnabled: true, soundEnabled: true },
        { notificationsEnabled: true, soundEnabled: false },
        { notificationsEnabled: false, soundEnabled: true },
        { notificationsEnabled: false, soundEnabled: false },
    ] as const;

    for (const {
        notificationsEnabled,
        soundEnabled,
    } of systemToggleScenarios) {
        it(`enforces invariants when toggling system notifications (notificationsEnabled=${notificationsEnabled}, soundEnabled=${soundEnabled})`, () => {
            resetState();
            applySettingsOverrides({
                systemNotificationsEnabled: notificationsEnabled,
                systemNotificationsSoundEnabled: soundEnabled,
            });

            renderSettingsComponent();

            const systemToggle = screen.getByLabelText(
                "Enable system notifications"
            );
            fireEvent.click(systemToggle);

            const lastUpdate = getLastSettingsUpdate();
            expect(lastUpdate).not.toBeNull();
            expect(lastUpdate).toMatchObject({
                systemNotificationsEnabled: !notificationsEnabled,
            });

            if (notificationsEnabled) {
                expect(lastUpdate).toMatchObject({
                    systemNotificationsSoundEnabled: false,
                });
            } else {
                expect(lastUpdate).not.toHaveProperty(
                    "systemNotificationsSoundEnabled"
                );
            }
        });
    }

    const soundToggleCases = [true, false] as const;

    for (const soundEnabled of soundToggleCases) {
        it(`toggles in-app alert sound when enabled (initialSound=${soundEnabled})`, () => {
            resetState();
            applySettingsOverrides({
                inAppAlertsEnabled: true,
                inAppAlertsSoundEnabled: soundEnabled,
            });

            renderSettingsComponent();

            const soundToggle = screen.getByLabelText(
                "Play sound for in-app alerts"
            );
            fireEvent.click(soundToggle);

            const lastUpdate = getLastSettingsUpdate();
            expect(lastUpdate).not.toBeNull();
            expect(lastUpdate).toMatchObject({
                inAppAlertsSoundEnabled: !soundEnabled,
            });
        });
    }

    for (const soundEnabled of soundToggleCases) {
        it(`toggles system notification sound when notifications are enabled (initialSound=${soundEnabled})`, () => {
            resetState();
            applySettingsOverrides({
                systemNotificationsEnabled: true,
                systemNotificationsSoundEnabled: soundEnabled,
            });

            renderSettingsComponent();

            const soundToggle = screen.getByLabelText(
                "Play sound for system notifications"
            );
            fireEvent.click(soundToggle);

            const lastUpdate = getLastSettingsUpdate();
            expect(lastUpdate).not.toBeNull();
            expect(lastUpdate).toMatchObject({
                systemNotificationsSoundEnabled: !soundEnabled,
            });
        });
    }

    const dependentToggleScenarios = [
        { inAppEnabled: true, systemEnabled: true },
        { inAppEnabled: true, systemEnabled: false },
        { inAppEnabled: false, systemEnabled: true },
        { inAppEnabled: false, systemEnabled: false },
    ] as const;

    for (const { inAppEnabled, systemEnabled } of dependentToggleScenarios) {
        it(`reflects disabled state for dependent sound toggles (inAppEnabled=${inAppEnabled}, systemEnabled=${systemEnabled})`, () => {
            resetState();
            applySettingsOverrides({
                inAppAlertsEnabled: inAppEnabled,
                systemNotificationsEnabled: systemEnabled,
            });

            renderSettingsComponent();

            const inAppSoundToggle = screen.getByLabelText(
                "Play sound for in-app alerts"
            );
            const systemSoundToggle = screen.getByLabelText(
                "Play sound for system notifications"
            );

            expect(inAppSoundToggle).toHaveProperty("disabled", !inAppEnabled);
            expect(systemSoundToggle).toHaveProperty(
                "disabled",
                !systemEnabled
            );
        });
    }
});
