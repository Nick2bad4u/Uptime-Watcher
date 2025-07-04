/**
 * Comprehensive tests for the main App component.
 * Tests global state management, modals, notifications, and layout.
 */

import { render, screen, act } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import type { Site, UpdateStatus } from "../types";

// Mock all the child components
vi.mock("../components/AddSiteForm/AddSiteForm", () => ({
    AddSiteForm: () => <div data-testid="add-site-form">Add Site Form</div>,
}));

vi.mock("../components/Dashboard/SiteList", () => ({
    SiteList: () => <div data-testid="site-list">Site List</div>,
}));

vi.mock("../components/Header/Header", () => ({
    Header: () => <div data-testid="header">Header</div>,
}));

vi.mock("../components/Settings/Settings", () => ({
    Settings: ({ onClose }: { onClose: () => void }) => (
        <div data-testid="settings-modal">
            <button onClick={onClose} data-testid="close-settings">
                Close Settings
            </button>
        </div>
    ),
}));

vi.mock("../components/SiteDetails/SiteDetails", () => ({
    SiteDetails: ({ site, onClose }: { site: { name: string }; onClose: () => void }) => (
        <div data-testid="site-details-modal">
            <div>Site Details for {site.name}</div>
            <button onClick={onClose} data-testid="close-site-details">
                Close Site Details
            </button>
        </div>
    ),
}));

vi.mock("../hooks/useBackendFocusSync", () => ({
    useBackendFocusSync: vi.fn(),
}));

vi.mock("../services/logger", () => ({
    default: {
        app: {
            started: vi.fn(),
        },
    },
}));

// Mock theme components
vi.mock("../theme/components", () => ({
    ThemeProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="theme-provider">{children}</div>,
    ThemedBox: ({
        children,
        className,
        ...props
    }: {
        children?: React.ReactNode;
        className?: string;
        [key: string]: unknown;
    }) => {
        const filteredProps = { ...props };
        delete filteredProps.border;
        return (
            <div data-testid="themed-box" className={className} {...filteredProps}>
                {children}
            </div>
        );
    },
    ThemedText: ({
        children,
        variant,
        size,
        weight,
        className,
    }: {
        children?: React.ReactNode;
        variant?: string;
        size?: string;
        weight?: string;
        className?: string;
    }) => (
        <span data-testid="themed-text" className={`${variant ?? ""} ${size ?? ""} ${weight ?? ""} ${className ?? ""}`}>
            {children}
        </span>
    ),
    ThemedButton: ({
        children,
        onClick,
        className,
        variant,
        size,
    }: {
        children?: React.ReactNode;
        onClick?: () => void;
        className?: string;
        variant?: string;
        size?: string;
    }) => (
        <button
            data-testid="themed-button"
            onClick={onClick}
            className={`${variant ?? ""} ${size ?? ""} ${className ?? ""}`}
        >
            {children}
        </button>
    ),
}));

vi.mock("../theme/useTheme", () => ({
    useTheme: vi.fn(() => ({ isDark: false })),
}));

// Mock the stores with the new focused structure
const mockErrorStore = {
    clearError: vi.fn(),
    isLoading: false,
    lastError: null as string | null,
    setError: vi.fn(),
    clearAllErrors: vi.fn(),
    clearStoreError: vi.fn(),
    getOperationLoading: vi.fn(),
    getStoreError: vi.fn(),
    operationLoading: {},
    setLoading: vi.fn(),
    setOperationLoading: vi.fn(),
    setStoreError: vi.fn(),
    storeErrors: {},
};

const mockSitesStore = {
    addMonitorToSite: vi.fn(),
    addSite: vi.fn(),
    checkSiteNow: vi.fn(),
    createSite: vi.fn(),
    fullSyncFromBackend: vi.fn(),
    initializeSites: vi.fn(),
    removeSite: vi.fn(),
    sites: [] as Site[],
    subscribeToStatusUpdates: vi.fn(),
    syncSitesFromBackend: vi.fn(),
    unsubscribeFromStatusUpdates: vi.fn(),
    updateSite: vi.fn(),
    updateSiteStatus: vi.fn(),
};

const mockSettingsStore = {
    initializeSettings: vi.fn(),
    settings: {
        notifications: true,
        autoStart: false,
        minimizeToTray: false,
        theme: "system" as const,
        soundAlerts: false,
        historyLimit: 1000,
    },
    updateSettings: vi.fn(),
    resetSettings: vi.fn(),
};

const mockUIStore = {
    getSelectedSite: vi.fn(() => null as Site | null),
    selectedSiteId: null,
    setSelectedSite: vi.fn(),
    setShowSettings: vi.fn(),
    setShowSiteDetails: vi.fn(),
    showSettings: false,
    showSiteDetails: false,
};

const mockUpdatesStore = {
    applyUpdate: vi.fn(),
    checkForUpdates: vi.fn(),
    setUpdateError: vi.fn(),
    setUpdateStatus: vi.fn(),
    updateError: null as string | null,
    updateStatus: "idle" as UpdateStatus,
};

vi.mock("../stores", () => ({
    ErrorBoundary: ({ children }: { children: React.ReactNode }) => <div data-testid="error-boundary">{children}</div>,
    useErrorStore: () => mockErrorStore,
    useSitesStore: () => mockSitesStore,
    useSettingsStore: () => mockSettingsStore,
    useUIStore: () => mockUIStore,
    useUpdatesStore: () => mockUpdatesStore,
}));

import App from "../App";

// Import the mocked module so we can modify it in tests
import * as themeModule from "../theme/useTheme";

describe("App Component", () => {
    const user = userEvent.setup();

    beforeEach(() => {
        vi.clearAllMocks();
        // Reset mock stores to defaults
        Object.assign(mockErrorStore, {
            clearError: vi.fn(),
            isLoading: false,
            lastError: null,
            setError: vi.fn(),
            clearAllErrors: vi.fn(),
            clearStoreError: vi.fn(),
            getOperationLoading: vi.fn(),
            getStoreError: vi.fn(),
            operationLoading: {},
            setLoading: vi.fn(),
            setOperationLoading: vi.fn(),
            setStoreError: vi.fn(),
            storeErrors: {},
        });

        Object.assign(mockSitesStore, {
            addMonitorToSite: vi.fn(),
            addSite: vi.fn(),
            checkSiteNow: vi.fn(),
            createSite: vi.fn(),
            initializeSites: vi.fn(),
            removeSite: vi.fn(),
            sites: [],
            subscribeToStatusUpdates: vi.fn(),
            syncSitesFromBackend: vi.fn(),
            unsubscribeFromStatusUpdates: vi.fn(),
            updateSite: vi.fn(),
            updateSiteStatus: vi.fn(),
        });

        Object.assign(mockSettingsStore, {
            initializeSettings: vi.fn(),
            settings: {
                notifications: true,
                autoStart: false,
                minimizeToTray: false,
                theme: "system" as const,
                soundAlerts: false,
                historyLimit: 1000,
            },
            updateSettings: vi.fn(),
            resetSettings: vi.fn(),
        });

        Object.assign(mockUIStore, {
            getSelectedSite: vi.fn(() => null),
            selectedSiteId: null,
            setSelectedSite: vi.fn(),
            setShowSettings: vi.fn(),
            setShowSiteDetails: vi.fn(),
            showSettings: false,
            showSiteDetails: false,
        });

        Object.assign(mockUpdatesStore, {
            applyUpdate: vi.fn(),
            checkForUpdates: vi.fn(),
            setUpdateError: vi.fn(),
            setUpdateStatus: vi.fn(),
            updateError: null,
            updateStatus: "idle" as UpdateStatus,
        });

        // Reset useTheme mock to default
        vi.mocked(themeModule.useTheme).mockReturnValue({
            isDark: false,
            availableThemes: [],
            currentTheme: { isDark: false, colors: {} } as never,
            getColor: vi.fn(),
            getStatusColor: vi.fn(),
            setTheme: vi.fn(),
            systemTheme: "light",
            themeManager: {} as never,
            themeName: "light",
            themeVersion: 1,
            toggleTheme: vi.fn(),
        });
    });

    afterEach(() => {
        vi.clearAllTimers();
    });

    describe("Basic Rendering", () => {
        it("renders without crashing", () => {
            render(<App />);
            expect(screen.getByTestId("theme-provider")).toBeInTheDocument();
        });

        it("renders all main components", () => {
            render(<App />);

            expect(screen.getByTestId("header")).toBeInTheDocument();
            expect(screen.getByTestId("site-list")).toBeInTheDocument();
            expect(screen.getByTestId("add-site-form")).toBeInTheDocument();
            expect(screen.getByText("Monitored Sites (0)")).toBeInTheDocument();
            expect(screen.getByText("Add New Site")).toBeInTheDocument();
        });

        it("applies correct CSS class based on theme", () => {
            const { container } = render(<App />);
            const appContainer = container.querySelector(".app-container");
            expect(appContainer).not.toHaveClass("dark");
        });

        it("applies dark CSS class when dark theme is enabled", () => {
            // Temporarily override the useTheme mock to return isDark: true
            vi.mocked(themeModule.useTheme).mockReturnValueOnce({
                isDark: true,
                availableThemes: [],
                currentTheme: { isDark: true, colors: {} } as never,
                getColor: vi.fn(),
                getStatusColor: vi.fn(),
                setTheme: vi.fn(),
                systemTheme: "dark",
                themeManager: {} as never,
                themeName: "dark",
                themeVersion: 1,
                toggleTheme: vi.fn(),
            });

            const { container } = render(<App />);
            const appContainer = container.querySelector(".app-container");
            expect(appContainer).toHaveClass("dark");
        });

        it("displays correct site count", () => {
            mockSitesStore.sites = [
                { identifier: "1", name: "Test Site", monitors: [] },
                { identifier: "2", name: "Another Site", monitors: [] },
            ];
            render(<App />);
            expect(screen.getByText("Monitored Sites (2)")).toBeInTheDocument();
        });
    });

    describe("Initialization", () => {
        it("calls initializeApp on mount", () => {
            render(<App />);
            expect(mockSitesStore.initializeSites).toHaveBeenCalled();
            expect(mockSettingsStore.initializeSettings).toHaveBeenCalled();
        });

        it("subscribes to status updates on mount", () => {
            render(<App />);
            expect(mockSitesStore.subscribeToStatusUpdates).toHaveBeenCalled();
        });

        it("unsubscribes from status updates on unmount", () => {
            const { unmount } = render(<App />);
            unmount();
            expect(mockSitesStore.unsubscribeFromStatusUpdates).toHaveBeenCalled();
        });
    });

    describe("Loading States", () => {
        beforeEach(() => {
            vi.useFakeTimers();
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it("does not show loading overlay immediately when loading", () => {
            mockErrorStore.isLoading = true;
            render(<App />);

            // Should not show loading overlay immediately
            expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
        });

        it("shows loading overlay after delay when loading", async () => {
            mockErrorStore.isLoading = true;
            render(<App />);

            // Fast-forward past the delay
            act(() => {
                vi.advanceTimersByTime(100);
            });

            expect(screen.getByText("Loading...")).toBeInTheDocument();

            // Verify all the loading overlay elements are present to cover line 110 branch
            const loadingOverlay = document.querySelector(".loading-overlay");
            expect(loadingOverlay).toBeInTheDocument();

            const loadingContent = document.querySelector(".loading-content");
            expect(loadingContent).toBeInTheDocument();

            const loadingSpinner = document.querySelector(".loading-spinner");
            expect(loadingSpinner).toBeInTheDocument();

            // Verify the loading overlay contains the themed components
            const loadingText = screen.getByText("Loading...");
            expect(loadingText).toHaveAttribute("data-testid", "themed-text");

            // Verify the loading overlay ThemedBox is present within the loading-overlay
            const themedBoxInLoading = loadingOverlay?.querySelector('[data-testid="themed-box"]');
            expect(themedBoxInLoading).toBeInTheDocument();
        });

        it("hides loading overlay when not loading", () => {
            mockErrorStore.isLoading = false;
            render(<App />);

            act(() => {
                vi.advanceTimersByTime(200);
            });

            expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
        });

        it("clears loading timeout when loading stops", () => {
            mockErrorStore.isLoading = true;
            const { rerender } = render(<App />);

            // Change to not loading before timeout
            mockErrorStore.isLoading = false;
            rerender(<App />);

            act(() => {
                vi.advanceTimersByTime(200);
            });

            expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
        });
    });

    describe("Error Handling", () => {
        it("displays error notification when there is an error", () => {
            mockErrorStore.lastError = "Test error message";
            render(<App />);

            expect(screen.getByText("Test error message")).toBeInTheDocument();
            expect(screen.getByText("⚠️")).toBeInTheDocument();
        });

        it("can dismiss error notification", async () => {
            mockErrorStore.lastError = "Test error message";
            render(<App />);

            const closeButton = screen.getByText("✕");
            await user.click(closeButton);

            expect(mockErrorStore.clearError).toHaveBeenCalled();
        });

        it("does not display error notification when no error", () => {
            mockErrorStore.lastError = null;
            render(<App />);

            expect(screen.queryByText("⚠️")).not.toBeInTheDocument();
        });
    });

    describe("Update Notifications", () => {
        it("shows update available notification", () => {
            mockUpdatesStore.updateStatus = "available";
            render(<App />);

            expect(screen.getByText("A new update is available. Downloading...")).toBeInTheDocument();
            expect(screen.getByText("⬇️")).toBeInTheDocument();
        });

        it("shows downloading notification", () => {
            mockUpdatesStore.updateStatus = "downloading";
            render(<App />);

            expect(screen.getByText("Update is downloading...")).toBeInTheDocument();
            expect(screen.getByText("⏬")).toBeInTheDocument();
        });

        it("shows downloaded notification with restart button", async () => {
            mockUpdatesStore.updateStatus = "downloaded";
            render(<App />);

            expect(screen.getByText("Update downloaded! Restart to apply.")).toBeInTheDocument();
            expect(screen.getByText("✅")).toBeInTheDocument();

            const restartButton = screen.getByText("Restart Now");
            await user.click(restartButton);

            expect(mockUpdatesStore.applyUpdate).toHaveBeenCalled();
        });

        it("shows error notification with dismiss button", async () => {
            mockUpdatesStore.updateStatus = "error";
            mockUpdatesStore.updateError = "Update failed due to network error";
            render(<App />);

            expect(screen.getByText("Update failed due to network error")).toBeInTheDocument();
            expect(screen.getByText("⚠️")).toBeInTheDocument();

            const dismissButton = screen.getByText("Dismiss");
            await user.click(dismissButton);

            expect(mockUpdatesStore.setUpdateStatus).toHaveBeenCalledWith("idle");
            expect(mockUpdatesStore.setUpdateError).toHaveBeenCalledWith(undefined);
        });

        it("shows generic error message when no specific error", () => {
            mockUpdatesStore.updateStatus = "error";
            mockUpdatesStore.updateError = null;
            render(<App />);

            expect(screen.getByText("Update failed.")).toBeInTheDocument();
        });

        it("does not show update notification for idle status", () => {
            mockUpdatesStore.updateStatus = "idle";
            render(<App />);

            expect(screen.queryByText(/update/i)).not.toBeInTheDocument();
        });
    });

    describe("Modals", () => {
        it("shows settings modal when showSettings is true", () => {
            mockUIStore.showSettings = true;
            render(<App />);

            expect(screen.getByTestId("settings-modal")).toBeInTheDocument();
        });

        it("can close settings modal", async () => {
            mockUIStore.showSettings = true;
            render(<App />);

            const closeButton = screen.getByTestId("close-settings");
            await user.click(closeButton);

            expect(mockUIStore.setShowSettings).toHaveBeenCalledWith(false);
        });

        it("does not show settings modal when showSettings is false", () => {
            mockUIStore.showSettings = false;
            render(<App />);

            expect(screen.queryByTestId("settings-modal")).not.toBeInTheDocument();
        });

        it("shows site details modal when showSiteDetails is true and site is selected", () => {
            mockUIStore.showSiteDetails = true;
            mockUIStore.getSelectedSite.mockReturnValue({ identifier: "1", name: "Test Site", monitors: [] });
            render(<App />);

            expect(screen.getByTestId("site-details-modal")).toBeInTheDocument();
            expect(screen.getByText("Site Details for Test Site")).toBeInTheDocument();
        });

        it("can close site details modal", async () => {
            mockUIStore.showSiteDetails = true;
            mockUIStore.getSelectedSite.mockReturnValue({ identifier: "1", name: "Test Site", monitors: [] });
            render(<App />);

            const closeButton = screen.getByTestId("close-site-details");
            await user.click(closeButton);

            expect(mockUIStore.setShowSiteDetails).toHaveBeenCalledWith(false);
        });

        it("does not show site details modal when no site is selected", () => {
            mockUIStore.showSiteDetails = true;
            mockUIStore.getSelectedSite.mockReturnValue(null);
            render(<App />);

            expect(screen.queryByTestId("site-details-modal")).not.toBeInTheDocument();
        });
    });

    describe("Environment-specific behavior", () => {
        it("logs app start in production environment", async () => {
            const originalEnv = process.env.NODE_ENV;
            process.env.NODE_ENV = "production";

            // Dynamically import to get fresh mock
            const { default: logger } = await import("../services/logger");
            render(<App />);

            expect(logger.app.started).toHaveBeenCalled();

            process.env.NODE_ENV = originalEnv;
        });
    });
});
