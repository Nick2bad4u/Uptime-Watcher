/**
 * Comprehensive test suite for App.tsx component. Tests all major functionality
 * including state management, modal behavior, error handling, loading states,
 * and update notifications.
 */

import { act, render, screen, waitFor } from "@testing-library/react";
import type { RenderResult } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
    sampleOne,
    siteNameArbitrary,
} from "@shared/test/arbitraries/siteArbitraries";
import "@testing-library/jest-dom";

import { App } from "../App";
import { UI_DELAYS } from "../constants";
import { useErrorStore } from "../stores/error/useErrorStore";
import { defaultSettings } from "../stores/settings/state";
import { useSettingsStore } from "../stores/settings/useSettingsStore";
import { useSitesStore } from "../stores/sites/useSitesStore";
import { useUIStore } from "../stores/ui/useUiStore";
import { useUpdatesStore } from "../stores/updates/useUpdatesStore";
import { useTheme } from "../theme/useTheme";
import { darkTheme, lightTheme } from "../theme/themes";
import type { Theme } from "../theme/types";

// Mock all required modules
vi.mock("../hooks/useBackendFocusSync", () => ({
    useBackendFocusSync: vi.fn(),
}));

vi.mock("../hooks/useSelectedSite", () => ({
    useSelectedSite: vi.fn().mockReturnValue(null),
}));

vi.mock("../services/logger", () => {
    const mockLogger = {
        app: {
            started: vi.fn(),
        },
        debug: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
    };

    return {
        Logger: mockLogger,
        logger: mockLogger,
    };
});

vi.mock("../utils/cacheSync", () => ({
    setupCacheSync: vi.fn(() => vi.fn()),
}));

vi.mock("../components/Header/Header", () => ({
    Header: () => <header data-testid="header">Header</header>,
}));

vi.mock("../components/Dashboard/SiteList/SiteList", () => ({
    SiteList: () => <div data-testid="site-list">Site List</div>,
}));

vi.mock("../components/AddSiteForm/AddSiteForm", () => ({
    AddSiteForm: () => <div data-testid="add-site-form">Add Site Form</div>,
}));

vi.mock("../components/Settings/Settings", () => ({
    Settings: ({ onClose }: { onClose: () => void }) => (
        <div data-testid="settings-modal">
            <button data-testid="close-settings" onClick={onClose}>
                Close Settings
            </button>
        </div>
    ),
}));

vi.mock("../components/SiteDetails/SiteDetails", () => ({
    SiteDetails: ({ onClose, site }: { onClose: () => void; site: any }) => (
        <div data-testid="site-details-modal">
            <span data-testid="site-details-identifier">{site.identifier}</span>
            <button data-testid="close-site-details" onClick={onClose}>
                Close Site Details
            </button>
        </div>
    ),
}));

vi.mock("../stores/error/useErrorStore");
vi.mock("../stores/settings/useSettingsStore");
vi.mock("../stores/sites/useSitesStore");
vi.mock("../stores/ui/useUiStore");
vi.mock("../stores/updates/useUpdatesStore");
vi.mock("../theme/useTheme");
vi.mock("../services/NotificationPreferenceService", () => ({
    NotificationPreferenceService: {
        initialize: vi.fn().mockResolvedValue(undefined),
        updatePreferences: vi.fn().mockResolvedValue(undefined),
    },
}));

const mockUseErrorStore = vi.mocked(useErrorStore);
const mockUseSettingsStore = vi.mocked(useSettingsStore);
const mockUseSitesStore = vi.mocked(useSitesStore);
const mockUseUIStore = vi.mocked(useUIStore);
const mockUseUpdatesStore = vi.mocked(useUpdatesStore);
const mockUseTheme = vi.mocked(useTheme);

// Mock environment functions
vi.mock("../../shared/utils/environment", () => ({
    isDevelopment: vi.fn(() => false),
    isProduction: vi.fn(() => true),
}));

// Create a mock site for testing
const mockSite = {
    identifier: "test-site-1",
    name: sampleOne(siteNameArbitrary),
    url: "https://example.com",
    monitors: [],
    monitoring: true,
};

describe("App Component - Comprehensive Coverage", () => {
    // Default mock implementations
    const defaultErrorStore = {
        clearError: vi.fn(),
        isLoading: false,
        lastError: null,
    };

    const defaultSettingsStore = {
        initializeSettings: vi.fn().mockResolvedValue(undefined),
        resetSettings: vi.fn(),
        settings: { ...defaultSettings },
        updateSetting: vi.fn(),
        updateSettings: vi.fn(),
        getState: vi.fn(),
    };
    defaultSettingsStore.getState.mockReturnValue(defaultSettingsStore);

    const defaultSitesStore = {
        sites: [] as any[],
        initializeSites: vi.fn().mockResolvedValue(undefined),
        subscribeToStatusUpdates: vi.fn(),
        unsubscribeFromStatusUpdates: vi.fn(),
        getState: vi.fn(),
    };

    const defaultUIStore = {
        setShowAddSiteModal: vi.fn(),
        setShowSettings: vi.fn(),
        setShowSiteDetails: vi.fn(),
        setSiteListLayout: vi.fn(),
        setSiteCardPresentation: vi.fn(),
        setSiteDetailsChartTimeRange: vi.fn(),
        setSiteTableColumnWidths: vi.fn(),
        syncActiveSiteDetailsTab: vi.fn(),
        selectSite: vi.fn(),
        showAddSiteModal: false,
        showSettings: false,
        showSiteDetails: false,
        siteCardPresentation: "stacked" as const,
        siteDetailsChartTimeRange: "24h" as const,
        siteDetailsTabState: {},
        siteListLayout: "card-large" as const,
        siteTableColumnWidths: {
            controls: 16,
            monitor: 14,
            response: 12,
            running: 10,
            site: 24,
            status: 12,
            uptime: 12,
        },
    };

    const defaultUpdatesStore = {
        applyUpdate: vi.fn(),
        setUpdateError: vi.fn(),
        applyUpdateStatus: vi.fn(),
        subscribeToUpdateStatusEvents: vi.fn(() => vi.fn()),
        updateError: null,
        updateStatus: "idle" as const,
    };

    const cloneTheme = (theme: Theme): Theme => structuredClone(theme);

    const getThemeColorByPath = (theme: Theme, path: string): string => {
        if (!path) {
            return "";
        }

        const segments = path.split(".");
        let current: unknown = theme;

        for (const segment of segments) {
            if (
                current !== null &&
                typeof current === "object" &&
                segment in (current as Record<string, unknown>)
            ) {
                current = (current as Record<string, unknown>)[segment];
            } else {
                return "";
            }
        }

        return typeof current === "string" ? current : "";
    };

    const createMockTheme = (isDark = false) => {
        const baseTheme = isDark ? darkTheme : lightTheme;
        const currentTheme = cloneTheme(baseTheme);
        const mockGetColor = vi.fn((path: string) =>
            getThemeColorByPath(currentTheme, path)
        );
        const mockGetStatusColor = vi.fn(
            (status: keyof typeof currentTheme.colors.status) =>
                currentTheme.colors.status[status] ??
                currentTheme.colors.status.up
        );

        return {
            availableThemes: [
                "light",
                "dark",
                "system",
            ],
            currentTheme,
            getColor: mockGetColor,
            getStatusColor: mockGetStatusColor,
            isDark,
            setTheme: vi.fn(),
            systemTheme: isDark ? "dark" : "light",
            themeManager: {
                applyTheme: vi.fn(),
                getTheme: vi.fn().mockReturnValue(currentTheme),
            },
            themeName: isDark ? "dark" : "light",
            themeVersion: 1,
            toggleTheme: vi.fn(),
        } as any;
    };

    const renderApp = (): RenderResult => render(<App />);

    const rerenderApp = (utils: RenderResult): RenderResult => {
        utils.rerender(<App />);
        return utils;
    };

    const unmountApp = (utils: RenderResult): void => {
        utils.unmount();
    };

    /**
     * Retrieves the dashboard overview card that displays the monitored sites
     * metric.
     *
     * @returns The overview card element containing the monitored sites label.
     */
    const getMonitoredSitesCard = (): HTMLElement => {
        const labelElements = screen.getAllByText("Monitored Sites");

        for (const labelElement of labelElements) {
            const card = labelElement.closest(".dashboard-overview__card");
            if (card) {
                return card as HTMLElement;
            }
        }

        throw new Error("Unable to locate monitored sites overview card");
    };

    /**
     * Retrieves the site count value rendered within the monitored sites
     * overview card.
     *
     * @returns Trimmed string representing the total monitored sites value.
     */
    const getMonitoredSitesCardValue = (): string => {
        const card = getMonitoredSitesCard();
        const valueElement = card.querySelector(
            ".dashboard-overview__card-value"
        );

        if (!valueElement) {
            throw new Error("Unable to locate monitored sites value element");
        }

        return valueElement.textContent?.trim() ?? "";
    };

    beforeEach(() => {
        vi.clearAllMocks();

        // Reset all mocks to default state
        mockUseErrorStore.mockImplementation(() => defaultErrorStore);
        mockUseSettingsStore.mockImplementation((selector?: unknown) =>
            typeof selector === "function"
                ? (selector as (state: typeof defaultSettingsStore) => unknown)(
                      defaultSettingsStore
                  )
                : defaultSettingsStore
        );
        mockUseSitesStore.mockImplementation((selector: any) =>
            typeof selector === "function"
                ? selector(defaultSitesStore)
                : defaultSitesStore
        );
        mockUseUIStore.mockImplementation((selector: any) =>
            typeof selector === "function"
                ? selector(defaultUIStore)
                : defaultUIStore
        );
        mockUseUpdatesStore.mockImplementation(() => defaultUpdatesStore);
        mockUseTheme.mockReturnValue(createMockTheme());

        // Set up getState mocks
        defaultSitesStore.getState.mockReturnValue(defaultSitesStore);
        defaultSettingsStore.getState.mockReturnValue(defaultSettingsStore);

        // Reset mutable store state between tests
        defaultSitesStore.sites = [];
        defaultSettingsStore.settings = { ...defaultSettings };
        Object.assign(defaultUIStore, {
            setShowAddSiteModal: vi.fn(),
            setShowSettings: vi.fn(),
            setShowSiteDetails: vi.fn(),
            setSiteListLayout: vi.fn(),
            setSiteCardPresentation: vi.fn(),
            setSiteDetailsChartTimeRange: vi.fn(),
            setSiteTableColumnWidths: vi.fn(),
            syncActiveSiteDetailsTab: vi.fn(),
            selectSite: vi.fn(),
            showAddSiteModal: false,
            showSettings: false,
            showSiteDetails: false,
            siteCardPresentation: "stacked" as const,
            siteDetailsChartTimeRange: "24h" as const,
            siteDetailsTabState: {},
            siteListLayout: "card-large" as const,
            siteTableColumnWidths: {
                controls: 16,
                monitor: 14,
                response: 12,
                running: 10,
                site: 24,
                status: 12,
                uptime: 12,
            },
        });

        // Mock store static functions
        (mockUseSitesStore as any).getState = vi
            .fn()
            .mockReturnValue(defaultSitesStore);
        (mockUseSettingsStore as any).getState = vi
            .fn()
            .mockReturnValue(defaultSettingsStore);
    });

    describe("Basic Rendering", () => {
        it("should render the main app structure", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: App", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: App", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            await renderApp();

            const user = userEvent.setup();

            const user = userEvent.setup();

            expect(screen.getByTestId("header")).toBeInTheDocument();
            expect(screen.getByTestId("site-list")).toBeInTheDocument();
            expect(getMonitoredSitesCardValue()).toBe("0");
            // AddSiteModal is conditionally rendered and not visible by default
        });

        it("should apply dark theme class when isDark is true", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: App", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: App", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            mockUseTheme.mockReturnValue(createMockTheme(true));

            await renderApp();

            const appContainer = screen.getByTestId("app-container");
            expect(appContainer).toHaveClass("app-shell--dark");
        });

        it("should not apply dark theme class when isDark is false", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: App", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: App", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            mockUseTheme.mockReturnValue(createMockTheme(false));

            await renderApp();

            const appContainer = screen.getByTestId("app-container");
            expect(appContainer).not.toHaveClass("app-shell--dark");
        });

        it("should display correct site count", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: App", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: App", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            defaultSitesStore.sites = [
                mockSite,
                { ...mockSite, identifier: "test-site-2" },
            ];

            await renderApp();

            expect(getMonitoredSitesCardValue()).toBe("2");
        });
    });

    describe("Loading States", () => {
        it("should show loading overlay when isLoading is true", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: App", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Data Loading", "type");

            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: App", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Data Loading", "type");

            mockUseErrorStore.mockReturnValue({
                ...defaultErrorStore,
                isLoading: true,
            });

            await renderApp();

            // The overlay is intentionally delayed (UI_DELAYS.LOADING_OVERLAY) and
            // gated behind initialization.
            await waitFor(
                () => {
                    expect(
                        screen.getByLabelText("Loading application")
                    ).toBeInTheDocument();
                },
                { timeout: UI_DELAYS.LOADING_OVERLAY + 1500 }
            );

            expect(screen.getByText("Loading...")).toBeInTheDocument();
        });

        it("should not show loading overlay when isLoading is false", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: App", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Data Loading", "type");

            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: App", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Data Loading", "type");

            // Start with loading false - overlay should not appear
            mockUseErrorStore.mockReturnValue({
                ...defaultErrorStore,
                isLoading: false,
            });

            await renderApp();

            // Wait a moment to ensure any potential loading overlay would have appeared
            await new Promise((resolve) => setTimeout(resolve, 150));

            // Loading overlay should not be present
            expect(
                screen.queryByLabelText("Loading application")
            ).not.toBeInTheDocument();
        });

        it("should not show loading overlay for quick operations", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: App", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Data Loading", "type");

            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: App", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Data Loading", "type");

            mockUseErrorStore.mockReturnValue({
                ...defaultErrorStore,
                isLoading: true,
            });

            const utils = renderApp();

            // Quickly change to not loading before delay
            mockUseErrorStore.mockReturnValue({
                ...defaultErrorStore,
                isLoading: false,
            });
            rerenderApp(utils);

            // Should not show loading overlay
            expect(
                screen.queryByLabelText("Loading application")
            ).not.toBeInTheDocument();
        });
    });

    describe("Error Handling", () => {
        it("should display error notification when lastError is present", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: App", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Error Handling", "type");

            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: App", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Error Handling", "type");

            mockUseErrorStore.mockReturnValue({
                ...defaultErrorStore,
                lastError: "Test error message",
            });

            await renderApp();

            expect(screen.getByRole("alert")).toBeInTheDocument();
            expect(screen.getByText("Test error message")).toBeInTheDocument();
            expect(screen.getByLabelText("Dismiss error")).toBeInTheDocument();
        });

        it("should clear error when close button is clicked", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: App", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Error Handling", "type");

            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: App", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Error Handling", "type");

            const clearError = vi.fn();
            mockUseErrorStore.mockReturnValue({
                ...defaultErrorStore,
                lastError: "Test error message",
                clearError,
            });

            await renderApp();

            const user = userEvent.setup();

            const closeButton = screen.getByLabelText("Dismiss error");
            await user.click(closeButton);

            expect(clearError).toHaveBeenCalledTimes(1);
        });

        it("should not display error notification when lastError is null", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: App", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Error Handling", "type");

            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: App", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Error Handling", "type");

            mockUseErrorStore.mockReturnValue({
                ...defaultErrorStore,
                lastError: null,
            });

            await renderApp();

            expect(screen.queryByRole("alert")).not.toBeInTheDocument();
        });
    });

    describe("Update Notifications", () => {
        it("should display available update notification", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: App", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Data Update", "type");

            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: App", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Data Update", "type");

            mockUseUpdatesStore.mockReturnValue({
                ...defaultUpdatesStore,
                updateStatus: "available",
            });

            await renderApp();

            const message = screen.getByText(
                "A new update is available. Downloading..."
            );
            expect(message).toBeInTheDocument();

            const alert = message.closest(".update-alert");
            expect(alert).not.toBeNull();
            expect(alert).toHaveClass("update-alert--available");
            expect(
                alert?.querySelector(".update-alert__icon svg")
            ).not.toBeNull();
        });

        it("should display downloading update notification", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: App", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Data Loading", "type");

            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: App", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Data Loading", "type");

            mockUseUpdatesStore.mockReturnValue({
                ...defaultUpdatesStore,
                updateStatus: "downloading",
            });

            await renderApp();

            const message = screen.getByText("Update is downloading...");
            expect(message).toBeInTheDocument();

            const alert = message.closest(".update-alert");
            expect(alert).not.toBeNull();
            expect(alert).toHaveClass("update-alert--downloading");
            expect(
                alert?.querySelector(".update-alert__icon svg")
            ).not.toBeNull();
        });

        it("should display downloaded update notification with restart button", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: App", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Data Loading", "type");

            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: App", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Data Loading", "type");

            mockUseUpdatesStore.mockReturnValue({
                ...defaultUpdatesStore,
                updateStatus: "downloaded",
            });

            await renderApp();

            const message = screen.getByText(
                "Update downloaded! Restart to apply."
            );
            expect(message).toBeInTheDocument();

            const alert = message.closest(".update-alert");
            expect(alert).not.toBeNull();
            expect(alert).toHaveClass("update-alert--downloaded");
            expect(
                alert?.querySelector(".update-alert__icon svg")
            ).not.toBeNull();
            expect(screen.getByText("Restart Now")).toBeInTheDocument();
        });

        it("should display error update notification", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: App", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Error Handling", "type");

            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: App", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Error Handling", "type");

            mockUseUpdatesStore.mockReturnValue({
                ...defaultUpdatesStore,
                updateStatus: "error",
                updateError: "Custom error message",
            });

            await renderApp();

            const message = screen.getByText("Custom error message");
            expect(message).toBeInTheDocument();

            const alert = message.closest(".update-alert");
            expect(alert).not.toBeNull();
            expect(alert).toHaveClass("update-alert--error");
            expect(
                alert?.querySelector(".update-alert__icon svg")
            ).not.toBeNull();
            expect(screen.getByText("Dismiss")).toBeInTheDocument();
        });

        it("should display fallback error message when updateError is null", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: App", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Error Handling", "type");

            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: App", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Error Handling", "type");

            mockUseUpdatesStore.mockReturnValue({
                ...defaultUpdatesStore,
                updateStatus: "error",
                updateError: null,
            });

            await renderApp();

            const fallback = screen.getByText("Update failed.");
            expect(fallback).toBeInTheDocument();

            const alert = fallback.closest(".update-alert");
            expect(alert).not.toBeNull();
            expect(alert).toHaveClass("update-alert--error");
            expect(
                alert?.querySelector(".update-alert__icon svg")
            ).not.toBeNull();
        });

        it("should apply update when restart button is clicked", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: App", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Data Update", "type");

            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: App", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Data Update", "type");

            const applyUpdate = vi.fn();
            mockUseUpdatesStore.mockReturnValue({
                ...defaultUpdatesStore,
                updateStatus: "downloaded",
                applyUpdate,
            });

            await renderApp();

            const user = userEvent.setup();

            const restartButton = screen.getByText("Restart Now");
            await user.click(restartButton);

            expect(applyUpdate).toHaveBeenCalledTimes(1);
        });

        it("should dismiss update notification when dismiss button is clicked", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: App", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Data Update", "type");

            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: App", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Data Update", "type");

            const applyUpdateStatus = vi.fn();
            const setUpdateError = vi.fn();
            mockUseUpdatesStore.mockReturnValue({
                ...defaultUpdatesStore,
                updateStatus: "error",
                updateError: "Test error",
                applyUpdateStatus,
                setUpdateError,
            });

            await renderApp();

            const user = userEvent.setup();

            const dismissButton = screen.getByText("Dismiss");
            await user.click(dismissButton);

            expect(applyUpdateStatus).toHaveBeenCalledWith("idle");
            expect(setUpdateError).toHaveBeenCalledWith(undefined);
        });
    });

    describe("Modal Management", () => {
        it("should show settings modal when showSettings is true", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: App", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: App", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            mockUseUIStore.mockReturnValue({
                ...defaultUIStore,
                showSettings: true,
            });

            await renderApp();

            await expect(
                screen.findByTestId("settings-modal")
            ).resolves.toBeInTheDocument();
        });

        it("should hide settings modal when showSettings is false", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: App", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: App", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            mockUseUIStore.mockReturnValue({
                ...defaultUIStore,
                showSettings: false,
            });

            await renderApp();

            expect(
                screen.queryByTestId("settings-modal")
            ).not.toBeInTheDocument();
        });

        it("should close settings modal when close handler is called", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: App", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: App", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const setShowSettings = vi.fn();
            mockUseUIStore.mockReturnValue({
                ...defaultUIStore,
                showSettings: true,
                setShowSettings,
            });

            await renderApp();

            const closeButton = screen.getByTestId("close-settings");
            await user.click(closeButton);

            expect(setShowSettings).toHaveBeenCalledWith(false);
        });

        it("should show site details modal when showSiteDetails is true and site is selected", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: App", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: App", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            mockUseUIStore.mockReturnValue({
                ...defaultUIStore,
                showSiteDetails: true,
            });

            // Mock useSelectedSite to return a site
            const mockUseSelectedSite =
                await import("../hooks/useSelectedSite");
            vi.mocked(mockUseSelectedSite.useSelectedSite).mockReturnValue(
                mockSite
            );

            await renderApp();

            await expect(
                screen.findByTestId("site-details-modal")
            ).resolves.toBeInTheDocument();
            await expect(
                screen.findByTestId("site-details-identifier")
            ).resolves.toHaveTextContent("test-site-1");
        });

        it("should not show site details modal when showSiteDetails is true but no site is selected", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: App", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: App", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            mockUseUIStore.mockReturnValue({
                ...defaultUIStore,
                showSiteDetails: true,
            });

            // Mock useSelectedSite to return null
            const mockUseSelectedSite =
                await import("../hooks/useSelectedSite");
            vi.mocked(mockUseSelectedSite.useSelectedSite).mockReturnValue(
                undefined
            );

            await renderApp();

            expect(
                screen.queryByTestId("site-details-modal")
            ).not.toBeInTheDocument();
        });

        it("should close site details modal when close handler is called", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: App", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: App", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const setShowSiteDetails = vi.fn();
            mockUseUIStore.mockReturnValue({
                ...defaultUIStore,
                showSiteDetails: true,
                setShowSiteDetails,
            });

            // Mock useSelectedSite to return a site
            const mockUseSelectedSite =
                await import("../hooks/useSelectedSite");
            vi.mocked(mockUseSelectedSite.useSelectedSite).mockReturnValue(
                mockSite
            );

            await renderApp();

            const closeButton = screen.getByTestId("close-site-details");
            await user.click(closeButton);

            expect(setShowSiteDetails).toHaveBeenCalledWith(false);
        });
    });

    describe("Initialization and Cleanup", () => {
        it("should initialize stores on mount", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: App", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Initialization", "type");

            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: App", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Initialization", "type");

            const initializeSites = vi.fn().mockResolvedValue(undefined);
            const initializeSettings = vi.fn().mockResolvedValue(undefined);

            const sitesStore = {
                ...defaultSitesStore,
                initializeSites,
            };

            const settingsStore = {
                ...defaultSettingsStore,
                initializeSettings,
            };

            (mockUseSitesStore as any).getState.mockReturnValue(sitesStore);
            (mockUseSettingsStore as any).getState.mockReturnValue(
                settingsStore
            );

            await renderApp();

            await waitFor(() => {
                expect(initializeSites).toHaveBeenCalledTimes(1);
            });

            await waitFor(() => {
                expect(initializeSettings).toHaveBeenCalledTimes(1);
            });
        });

        it("should set up cache sync on mount", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: App", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Caching", "type");

            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: App", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Caching", "type");

            const mockCacheSync = await import("../utils/cacheSync");

            await renderApp();

            await waitFor(() => {
                expect(mockCacheSync.setupCacheSync).toHaveBeenCalledTimes(1);
            });
        });

        it("should subscribe to status updates on mount", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: App", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Data Update", "type");

            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: App", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Data Update", "type");

            const subscribeToStatusUpdates = vi.fn();

            const sitesStore = {
                ...defaultSitesStore,
                subscribeToStatusUpdates,
            };

            (mockUseSitesStore as any).getState.mockReturnValue(sitesStore);

            await renderApp();

            await waitFor(() => {
                expect(subscribeToStatusUpdates).toHaveBeenCalledTimes(1);
            });
        });

        it("should cleanup subscriptions on unmount", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: App", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: App", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const unsubscribeFromStatusUpdates = vi.fn();
            const cacheSyncCleanup = vi.fn();

            const sitesStore = {
                ...defaultSitesStore,
                unsubscribeFromStatusUpdates,
            };

            (mockUseSitesStore as any).getState.mockReturnValue(sitesStore);

            const mockCacheSync = await import("../utils/cacheSync");
            vi.mocked(mockCacheSync.setupCacheSync).mockReturnValue(
                cacheSyncCleanup
            );

            const utils = renderApp();

            // Wait for initialization to complete
            await waitFor(() => {
                expect(mockCacheSync.setupCacheSync).toHaveBeenCalled();
            });

            unmountApp(utils);

            expect(unsubscribeFromStatusUpdates).toHaveBeenCalledTimes(1);
            expect(cacheSyncCleanup).toHaveBeenCalledTimes(1);
        });
    });

    describe("Status Update Handling", () => {
        it("should handle status updates in development mode", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: App", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Data Update", "type");

            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: App", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Data Update", "type");

            const mockEnvironment =
                await import("../../shared/utils/environment");
            vi.mocked(mockEnvironment.isDevelopment).mockReturnValue(true);

            const mockLogger = await import("../services/logger");

            let statusUpdateCallback: any;
            const subscribeToStatusUpdates = vi.fn((callback) => {
                statusUpdateCallback = callback;
            });

            const sitesStore = {
                ...defaultSitesStore,
                subscribeToStatusUpdates,
            };

            (mockUseSitesStore as any).getState.mockReturnValue(sitesStore);

            await renderApp();

            await waitFor(() => {
                expect(subscribeToStatusUpdates).toHaveBeenCalled();
            });

            // Simulate a status update
            act(() => {
                statusUpdateCallback({
                    site: { identifier: "test-site" },
                    siteIdentifier: "test-site",
                });
            });

            expect(mockLogger.logger.debug).toHaveBeenCalledWith(
                expect.stringContaining(
                    "Status update received for site: test-site"
                )
            );
        });
    });

    describe("Backend Focus Sync", () => {
        it("should call useBackendFocusSync with disabled state", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: App", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: App", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const mockBackendFocusSync =
                await import("../hooks/useBackendFocusSync");

            await renderApp();

            await waitFor(() => {
                expect(
                    mockBackendFocusSync.useBackendFocusSync
                ).toHaveBeenCalledWith(false);
            });
        });
    });

    describe("Production vs Development Behavior", () => {
        it("should log app started in production mode", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: App", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: App", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const mockEnvironment =
                await import("../../shared/utils/environment");
            vi.mocked(mockEnvironment.isProduction).mockReturnValue(true);

            const mockLogger = await import("../services/logger");

            await renderApp();

            await waitFor(() => {
                expect(mockLogger.logger.app.started).toHaveBeenCalledTimes(1);
            });
        });

        it("should not log app started in non-production mode", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: App", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: App", "component");
            await annotate("Category: Core", "category");
            await annotate("Type: Business Logic", "type");

            const mockEnvironment =
                await import("../../shared/utils/environment");
            vi.mocked(mockEnvironment.isProduction).mockReturnValue(false);

            const mockLogger = await import("../services/logger");

            await renderApp();

            // Flush pending microtasks so App initialization effects settle
            // without leaking state updates outside of act(...).
            await act(async () => {
                await Promise.resolve();
            });

            expect(mockLogger.logger.app.started).not.toHaveBeenCalled();
        });
    });
});
