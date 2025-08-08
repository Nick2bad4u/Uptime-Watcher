/**
 * Comprehensive test suite for App.tsx component.
 * Tests all major functionality including state management, modal behavior,
 * error handling, loading states, and update notifications.
 */

import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom";

import App from "../App";
import { useErrorStore } from "../stores/error/useErrorStore";
import { useSettingsStore } from "../stores/settings/useSettingsStore";
import { useSitesStore } from "../stores/sites/useSitesStore";
import { useUIStore } from "../stores/ui/useUiStore";
import { useUpdatesStore } from "../stores/updates/useUpdatesStore";
import { useTheme } from "../theme/useTheme";

// Mock all required modules
vi.mock("../hooks/useBackendFocusSync", () => ({
    useBackendFocusSync: vi.fn(),
}));

vi.mock("../hooks/useSelectedSite", () => ({
    useSelectedSite: vi.fn().mockReturnValue(null),
}));

vi.mock("../services/logger", () => ({
    default: {
        app: {
            started: vi.fn(),
        },
        debug: vi.fn(),
    },
}));

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
    name: "Example Site",
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
        getState: vi.fn(),
    };

    const defaultSitesStore = {
        sites: [],
        initializeSites: vi.fn().mockResolvedValue(undefined),
        subscribeToStatusUpdates: vi.fn(),
        unsubscribeFromStatusUpdates: vi.fn(),
        getState: vi.fn(),
    };

    const defaultUIStore = {
        setShowSettings: vi.fn(),
        setShowSiteDetails: vi.fn(),
        showSettings: false,
        showSiteDetails: false,
    };

    const defaultUpdatesStore = {
        applyUpdate: vi.fn(),
        setUpdateError: vi.fn(),
        setUpdateStatus: vi.fn(),
        updateError: null,
        updateStatus: "idle" as const,
    };

    const createMockTheme = (isDark = false) =>
        ({
            availableThemes: ["light", "dark"],
            currentTheme: {
                isDark,
                colors: {
                    status: { up: "#green", down: "#red", pending: "#yellow" },
                    success: "#green",
                    error: "#red",
                    warning: "#yellow",
                },
            },
            getColor: vi.fn(),
            getStatusColor: vi.fn(),
            isDark,
            setTheme: vi.fn(),
            systemTheme: "light",
            themeManager: {},
            themeName: "light",
            themeVersion: 1,
            toggleTheme: vi.fn(),
        }) as any;

    beforeEach(() => {
        vi.clearAllMocks();

        // Reset all mocks to default state
        mockUseErrorStore.mockReturnValue(defaultErrorStore);
        mockUseSettingsStore.mockReturnValue(defaultSettingsStore);
        mockUseSitesStore.mockReturnValue(defaultSitesStore);
        mockUseUIStore.mockReturnValue(defaultUIStore);
        mockUseUpdatesStore.mockReturnValue(defaultUpdatesStore);
        mockUseTheme.mockReturnValue(createMockTheme());

        // Set up getState mocks
        defaultSitesStore.getState.mockReturnValue(defaultSitesStore);
        defaultSettingsStore.getState.mockReturnValue(defaultSettingsStore);

        // Mock store static functions
        (mockUseSitesStore as any).getState = vi
            .fn()
            .mockReturnValue(defaultSitesStore);
        (mockUseSettingsStore as any).getState = vi
            .fn()
            .mockReturnValue(defaultSettingsStore);
    });

    describe("Basic Rendering", () => {
        it("should render the main app structure", () => {
            render(<App />);

            expect(screen.getByTestId("header")).toBeInTheDocument();
            expect(screen.getByTestId("site-list")).toBeInTheDocument();
            expect(screen.getByText("Monitored Sites (0)")).toBeInTheDocument();
            // AddSiteModal is conditionally rendered and not visible by default
        });

        it("should apply dark theme class when isDark is true", () => {
            mockUseTheme.mockReturnValue(createMockTheme(true));

            render(<App />);

            const appContainer = document.querySelector(".app-container");
            expect(appContainer).toHaveClass("dark");
        });

        it("should not apply dark theme class when isDark is false", () => {
            mockUseTheme.mockReturnValue(createMockTheme(false));

            render(<App />);

            const appContainer = document.querySelector(".app-container");
            expect(appContainer).not.toHaveClass("dark");
        });

        it("should display correct site count", () => {
            mockUseSitesStore.mockReturnValue({
                ...defaultSitesStore,
                sites: [mockSite, { ...mockSite, identifier: "test-site-2" }],
            });

            render(<App />);

            expect(screen.getByText("Monitored Sites (2)")).toBeInTheDocument();
        });
    });

    describe("Loading States", () => {
        it("should show loading overlay when isLoading is true", async () => {
            mockUseErrorStore.mockReturnValue({
                ...defaultErrorStore,
                isLoading: true,
            });

            render(<App />);

            // Wait for loading overlay to appear (after 100ms delay)
            await waitFor(
                () => {
                    expect(
                        screen.getByLabelText("Loading application")
                    ).toBeInTheDocument();
                },
                { timeout: 200 }
            );

            expect(screen.getByText("Loading...")).toBeInTheDocument();
        });

        it("should hide loading overlay when isLoading becomes false", async () => {
            const { rerender } = render(<App />);

            // Start with loading true
            mockUseErrorStore.mockReturnValue({
                ...defaultErrorStore,
                isLoading: true,
            });

            rerender(<App />);

            // Wait for loading to appear
            await waitFor(() => {
                expect(
                    screen.getByLabelText("Loading application")
                ).toBeInTheDocument();
            });

            // Change to loading false
            mockUseErrorStore.mockReturnValue({
                ...defaultErrorStore,
                isLoading: false,
            });

            rerender(<App />);

            // Loading should disappear after the timeout
            await waitFor(() => {
                expect(
                    screen.queryByLabelText("Loading application")
                ).not.toBeInTheDocument();
            });
        });

        it("should not show loading overlay for quick operations", async () => {
            mockUseErrorStore.mockReturnValue({
                ...defaultErrorStore,
                isLoading: true,
            });

            const { rerender } = render(<App />);

            // Quickly change to not loading before delay
            await act(async () => {
                mockUseErrorStore.mockReturnValue({
                    ...defaultErrorStore,
                    isLoading: false,
                });
                rerender(<App />);
            });

            // Should not show loading overlay
            expect(
                screen.queryByLabelText("Loading application")
            ).not.toBeInTheDocument();
        });
    });

    describe("Error Handling", () => {
        it("should display error notification when lastError is present", () => {
            mockUseErrorStore.mockReturnValue({
                ...defaultErrorStore,
                lastError: "Test error message",
            });

            render(<App />);

            expect(screen.getByRole("alert")).toBeInTheDocument();
            expect(screen.getByText("Test error message")).toBeInTheDocument();
            expect(screen.getByLabelText("Dismiss error")).toBeInTheDocument();
        });

        it("should clear error when close button is clicked", async () => {
            const clearError = vi.fn();
            mockUseErrorStore.mockReturnValue({
                ...defaultErrorStore,
                lastError: "Test error message",
                clearError,
            });

            render(<App />);

            const closeButton = screen.getByLabelText("Dismiss error");
            await userEvent.click(closeButton);

            expect(clearError).toHaveBeenCalledTimes(1);
        });

        it("should not display error notification when lastError is null", () => {
            mockUseErrorStore.mockReturnValue({
                ...defaultErrorStore,
                lastError: null,
            });

            render(<App />);

            expect(screen.queryByRole("alert")).not.toBeInTheDocument();
        });
    });

    describe("Update Notifications", () => {
        it("should display available update notification", () => {
            mockUseUpdatesStore.mockReturnValue({
                ...defaultUpdatesStore,
                updateStatus: "available",
            });

            render(<App />);

            expect(
                screen.getByText("A new update is available. Downloading...")
            ).toBeInTheDocument();
            expect(screen.getByText("⬇️")).toBeInTheDocument();
        });

        it("should display downloading update notification", () => {
            mockUseUpdatesStore.mockReturnValue({
                ...defaultUpdatesStore,
                updateStatus: "downloading",
            });

            render(<App />);

            expect(
                screen.getByText("Update is downloading...")
            ).toBeInTheDocument();
            expect(screen.getByText("⏬")).toBeInTheDocument();
        });

        it("should display downloaded update notification with restart button", () => {
            mockUseUpdatesStore.mockReturnValue({
                ...defaultUpdatesStore,
                updateStatus: "downloaded",
            });

            render(<App />);

            expect(
                screen.getByText("Update downloaded! Restart to apply.")
            ).toBeInTheDocument();
            expect(screen.getByText("✅")).toBeInTheDocument();
            expect(screen.getByText("Restart Now")).toBeInTheDocument();
        });

        it("should display error update notification", () => {
            mockUseUpdatesStore.mockReturnValue({
                ...defaultUpdatesStore,
                updateStatus: "error",
                updateError: "Custom error message",
            });

            render(<App />);

            expect(
                screen.getByText("Custom error message")
            ).toBeInTheDocument();
            expect(screen.getByText("Dismiss")).toBeInTheDocument();
        });

        it("should display fallback error message when updateError is null", () => {
            mockUseUpdatesStore.mockReturnValue({
                ...defaultUpdatesStore,
                updateStatus: "error",
                updateError: null,
            });

            render(<App />);

            expect(screen.getByText("Update failed.")).toBeInTheDocument();
        });

        it("should apply update when restart button is clicked", async () => {
            const applyUpdate = vi.fn();
            mockUseUpdatesStore.mockReturnValue({
                ...defaultUpdatesStore,
                updateStatus: "downloaded",
                applyUpdate,
            });

            render(<App />);

            const restartButton = screen.getByText("Restart Now");
            await userEvent.click(restartButton);

            expect(applyUpdate).toHaveBeenCalledTimes(1);
        });

        it("should dismiss update notification when dismiss button is clicked", async () => {
            const setUpdateStatus = vi.fn();
            const setUpdateError = vi.fn();
            mockUseUpdatesStore.mockReturnValue({
                ...defaultUpdatesStore,
                updateStatus: "error",
                updateError: "Test error",
                setUpdateStatus,
                setUpdateError,
            });

            render(<App />);

            const dismissButton = screen.getByText("Dismiss");
            await userEvent.click(dismissButton);

            expect(setUpdateStatus).toHaveBeenCalledWith("idle");
            expect(setUpdateError).toHaveBeenCalledWith(undefined);
        });
    });

    describe("Modal Management", () => {
        it("should show settings modal when showSettings is true", () => {
            mockUseUIStore.mockReturnValue({
                ...defaultUIStore,
                showSettings: true,
            });

            render(<App />);

            expect(screen.getByTestId("settings-modal")).toBeInTheDocument();
        });

        it("should hide settings modal when showSettings is false", () => {
            mockUseUIStore.mockReturnValue({
                ...defaultUIStore,
                showSettings: false,
            });

            render(<App />);

            expect(
                screen.queryByTestId("settings-modal")
            ).not.toBeInTheDocument();
        });

        it("should close settings modal when close handler is called", async () => {
            const setShowSettings = vi.fn();
            mockUseUIStore.mockReturnValue({
                ...defaultUIStore,
                showSettings: true,
                setShowSettings,
            });

            render(<App />);

            const closeButton = screen.getByTestId("close-settings");
            await userEvent.click(closeButton);

            expect(setShowSettings).toHaveBeenCalledWith(false);
        });

        it("should show site details modal when showSiteDetails is true and site is selected", async () => {
            mockUseUIStore.mockReturnValue({
                ...defaultUIStore,
                showSiteDetails: true,
            });

            // Mock useSelectedSite to return a site
            const mockUseSelectedSite = await import(
                "../hooks/useSelectedSite"
            );
            vi.mocked(mockUseSelectedSite.useSelectedSite).mockReturnValue(
                mockSite
            );

            render(<App />);

            expect(
                screen.getByTestId("site-details-modal")
            ).toBeInTheDocument();
            expect(
                screen.getByTestId("site-details-identifier")
            ).toHaveTextContent("test-site-1");
        });

        it("should not show site details modal when showSiteDetails is true but no site is selected", async () => {
            mockUseUIStore.mockReturnValue({
                ...defaultUIStore,
                showSiteDetails: true,
            });

            // Mock useSelectedSite to return null
            const mockUseSelectedSite = await import(
                "../hooks/useSelectedSite"
            );
            vi.mocked(mockUseSelectedSite.useSelectedSite).mockReturnValue(
                undefined
            );

            render(<App />);

            expect(
                screen.queryByTestId("site-details-modal")
            ).not.toBeInTheDocument();
        });

        it("should close site details modal when close handler is called", async () => {
            const setShowSiteDetails = vi.fn();
            mockUseUIStore.mockReturnValue({
                ...defaultUIStore,
                showSiteDetails: true,
                setShowSiteDetails,
            });

            // Mock useSelectedSite to return a site
            const mockUseSelectedSite = await import(
                "../hooks/useSelectedSite"
            );
            vi.mocked(mockUseSelectedSite.useSelectedSite).mockReturnValue(
                mockSite
            );

            render(<App />);

            const closeButton = screen.getByTestId("close-site-details");
            await userEvent.click(closeButton);

            expect(setShowSiteDetails).toHaveBeenCalledWith(false);
        });
    });

    describe("Initialization and Cleanup", () => {
        it("should initialize stores on mount", async () => {
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

            render(<App />);

            await waitFor(() => {
                expect(initializeSites).toHaveBeenCalledTimes(1);
                expect(initializeSettings).toHaveBeenCalledTimes(1);
            });
        });

        it("should set up cache sync on mount", async () => {
            const mockCacheSync = await import("../utils/cacheSync");

            render(<App />);

            await waitFor(() => {
                expect(mockCacheSync.setupCacheSync).toHaveBeenCalledTimes(1);
            });
        });

        it("should subscribe to status updates on mount", async () => {
            const subscribeToStatusUpdates = vi.fn();

            const sitesStore = {
                ...defaultSitesStore,
                subscribeToStatusUpdates,
            };

            (mockUseSitesStore as any).getState.mockReturnValue(sitesStore);

            render(<App />);

            await waitFor(() => {
                expect(subscribeToStatusUpdates).toHaveBeenCalledTimes(1);
            });
        });

        it("should cleanup subscriptions on unmount", async () => {
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

            const { unmount } = render(<App />);

            // Wait for initialization to complete
            await waitFor(() => {
                expect(mockCacheSync.setupCacheSync).toHaveBeenCalled();
            });

            unmount();

            expect(unsubscribeFromStatusUpdates).toHaveBeenCalledTimes(1);
            expect(cacheSyncCleanup).toHaveBeenCalledTimes(1);
        });
    });

    describe("Status Update Handling", () => {
        it("should handle status updates in development mode", async () => {
            const mockEnvironment = await import(
                "../../shared/utils/environment"
            );
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

            render(<App />);

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

            expect(mockLogger.default.debug).toHaveBeenCalledWith(
                expect.stringContaining(
                    "Status update received for site: test-site"
                )
            );
        });
    });

    describe("Backend Focus Sync", () => {
        it("should call useBackendFocusSync with disabled state", async () => {
            const mockBackendFocusSync = await import(
                "../hooks/useBackendFocusSync"
            );

            render(<App />);

            expect(
                mockBackendFocusSync.useBackendFocusSync
            ).toHaveBeenCalledWith(false);
        });
    });

    describe("Production vs Development Behavior", () => {
        it("should log app started in production mode", async () => {
            const mockEnvironment = await import(
                "../../shared/utils/environment"
            );
            vi.mocked(mockEnvironment.isProduction).mockReturnValue(true);

            const mockLogger = await import("../services/logger");

            render(<App />);

            await waitFor(() => {
                expect(mockLogger.default.app.started).toHaveBeenCalledTimes(1);
            });
        });

        it("should not log app started in non-production mode", async () => {
            const mockEnvironment = await import(
                "../../shared/utils/environment"
            );
            vi.mocked(mockEnvironment.isProduction).mockReturnValue(false);

            const mockLogger = await import("../services/logger");

            render(<App />);

            // Wait a bit to ensure initialization completes
            await new Promise((resolve) => setTimeout(resolve, 50));

            expect(mockLogger.default.app.started).not.toHaveBeenCalled();
        });
    });
});
