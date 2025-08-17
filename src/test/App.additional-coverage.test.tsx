/**
 * Additional coverage tests for App.tsx component Targets specific uncovered
 * lines for imports, constants, and error handling paths
 */

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom";

import { isDevelopment, isProduction } from "@shared/utils/environment";
import App from "../App";
import logger from "../services/logger";
import { useErrorStore } from "../stores/error/useErrorStore";
import { useSettingsStore } from "../stores/settings/useSettingsStore";
import { useSitesStore } from "../stores/sites/useSitesStore";
import { useUIStore } from "../stores/ui/useUiStore";
import { useUpdatesStore } from "../stores/updates/useUpdatesStore";
import { useTheme } from "../theme/useTheme";

// Mock modules with specific focus on coverage lines
vi.mock("@shared/utils/environment", () => ({
    isDevelopment: vi.fn().mockReturnValue(false),
    isProduction: vi.fn().mockReturnValue(true),
}));

vi.mock("./hooks/useBackendFocusSync", () => ({
    useBackendFocusSync: vi.fn(),
}));

vi.mock("./hooks/useSelectedSite", () => ({
    useSelectedSite: vi.fn().mockReturnValue(null),
}));

vi.mock("./hooks/useMount", () => ({
    useMount: vi.fn((initCallback, cleanupCallback) => {
        // Execute callbacks to ensure coverage, but with a delay to allow testing
        setTimeout(() => {
            initCallback();
        }, 10);
        return cleanupCallback;
    }),
}));

vi.mock("./services/logger", () => ({
    default: {
        app: {
            started: vi.fn(),
        },
        debug: vi.fn(),
    },
}));

vi.mock("./utils/cacheSync", () => ({
    setupCacheSync: vi.fn(() => vi.fn()),
}));

vi.mock("./components/Header/Header", () => ({
    Header: () => <header data-testid="header">Header</header>,
}));

vi.mock("./components/Dashboard/SiteList/SiteList", () => ({
    SiteList: () => <div data-testid="site-list">Site List</div>,
}));

vi.mock("./components/AddSiteForm/AddSiteModal", () => ({
    AddSiteModal: () => <div data-testid="add-site-modal">Add Site Modal</div>,
}));

vi.mock("./components/Settings/Settings", () => ({
    Settings: ({ onClose }: { onClose: () => void }) => (
        <div data-testid="settings">
            <button onClick={onClose}>Close Settings</button>
        </div>
    ),
}));

vi.mock("./components/SiteDetails/SiteDetails", () => ({
    SiteDetails: ({ onClose }: { onClose: () => void }) => (
        <div data-testid="site-details">
            <button onClick={onClose}>Close Site Details</button>
        </div>
    ),
}));

vi.mock("./components/common/ErrorAlert/ErrorAlert", () => ({
    ErrorAlert: ({
        message,
        onDismiss,
    }: {
        message: string;
        onDismiss: () => void;
    }) => (
        <div data-testid="error-alert">
            <span>{message}</span>
            <button onClick={onDismiss}>Close Error</button>
        </div>
    ),
}));

// Mock stores
vi.mock("./stores/error/useErrorStore");
vi.mock("./stores/settings/useSettingsStore");
vi.mock("./stores/sites/useSitesStore");
vi.mock("./stores/ui/useUiStore");
vi.mock("./stores/updates/useUpdatesStore");
vi.mock("./theme/useTheme");

describe("App Additional Coverage Tests", () => {
    const mockUseErrorStore = vi.mocked(useErrorStore);
    const mockUseSettingsStore = vi.mocked(useSettingsStore);
    const mockUseSitesStore = vi.mocked(useSitesStore);
    const mockUseUIStore = vi.mocked(useUIStore);
    const mockUseUpdatesStore = vi.mocked(useUpdatesStore);
    const mockUseTheme = vi.mocked(useTheme);

    beforeEach(() => {
        vi.clearAllMocks();

        // Default mock implementations
        mockUseErrorStore.mockReturnValue({
            clearError: vi.fn(),
            isLoading: false,
            lastError: null,
        });

        mockUseSitesStore.mockReturnValue({
            sites: [],
            initializeSites: vi.fn().mockResolvedValue(undefined),
            subscribeToStatusUpdates: vi.fn(),
            unsubscribeFromStatusUpdates: vi.fn(),
        });

        mockUseSettingsStore.mockReturnValue({
            initializeSettings: vi.fn().mockResolvedValue(undefined),
        });

        mockUseUIStore.mockReturnValue({
            setShowSettings: vi.fn(),
            setShowSiteDetails: vi.fn(),
            showSettings: false,
            showSiteDetails: false,
        });

        mockUseUpdatesStore.mockReturnValue({
            applyUpdate: vi.fn(),
            setUpdateError: vi.fn(),
            setUpdateStatus: vi.fn(),
            updateError: null,
            updateStatus: "idle",
        });

        mockUseTheme.mockReturnValue({
            isDark: false,
            availableThemes: ["light", "dark"],
            currentTheme: {
                name: "light",
                colors: {},
                spacing: {},
                typography: {},
                borderRadius: {},
                shadows: {},
            } as any,
            getColor: vi.fn(),
            getStatusColor: vi.fn(),
            setTheme: vi.fn(),
            toggleTheme: vi.fn(),
            systemTheme: "light",
            themeManager: {} as any,
            themeName: "light",
            themeVersion: 1,
        });

        // Mock useSitesStore.getState() for initialization
        mockUseSitesStore.getState = vi.fn().mockReturnValue({
            initializeSites: vi.fn().mockResolvedValue(undefined),
            subscribeToStatusUpdates: vi.fn(),
            unsubscribeFromStatusUpdates: vi.fn(),
        });

        // Mock useSettingsStore.getState() for initialization
        mockUseSettingsStore.getState = vi.fn().mockReturnValue({
            initializeSettings: vi.fn().mockResolvedValue(undefined),
        });
    });

    it("should use all imported modules and constants", () => {
        render(<App />);

        // Verify that components are rendered (covers imports lines 11-16)
        expect(screen.getByTestId("header")).toBeInTheDocument();
        expect(screen.getByTestId("site-list")).toBeInTheDocument();
        expect(screen.getByTestId("add-site-modal")).toBeInTheDocument();
    });

    it("should use UI_MESSAGES constants for text content", () => {
        mockUseSitesStore.mockReturnValue({
            sites: [{ id: "1", name: "Test Site" }],
            initializeSites: vi.fn().mockResolvedValue(undefined),
            subscribeToStatusUpdates: vi.fn(),
            unsubscribeFromStatusUpdates: vi.fn(),
        });

        render(<App />);

        // Check that UI_MESSAGES constants are used (covers lines 42-44, 48-49, 54-55)
        expect(screen.getByText("Monitored Sites (1)")).toBeInTheDocument();
    });

    it("should show loading overlay with correct message", async () => {
        mockUseErrorStore.mockReturnValue({
            clearError: vi.fn(),
            isLoading: true,
            lastError: null,
        });

        render(<App />);

        // Wait for initialization and loading overlay timeout
        await waitFor(
            () => {
                expect(screen.getByText("Loading...")).toBeInTheDocument();
            },
            { timeout: 200 }
        );

        expect(
            screen.getByLabelText("Loading application")
        ).toBeInTheDocument();
    });

    it("should display error alert when lastError exists", async () => {
        const clearErrorMock = vi.fn();
        mockUseErrorStore.mockReturnValue({
            clearError: clearErrorMock,
            isLoading: false,
            lastError: "Test error message",
        });

        render(<App />);

        // Verify error alert is displayed
        expect(screen.getByTestId("error-alert")).toBeInTheDocument();
        expect(screen.getByText("Test error message")).toBeInTheDocument();

        // Test error dismissal
        const closeButton = screen.getByText("Close Error");
        await userEvent.click(closeButton);
        expect(clearErrorMock).toHaveBeenCalled();
    });

    it("should display update error notification", () => {
        mockUseUpdatesStore.mockReturnValue({
            applyUpdate: vi.fn(),
            setUpdateError: vi.fn(),
            setUpdateStatus: vi.fn(),
            updateError: "Update failed error",
            updateStatus: "error",
        });

        render(<App />);

        // Check update error alert uses UI_MESSAGES fallback
        expect(screen.getByText("Update failed error")).toBeInTheDocument();
        expect(screen.getByText("Dismiss")).toBeInTheDocument();
    });

    it("should display update error fallback when updateError is null", () => {
        mockUseUpdatesStore.mockReturnValue({
            applyUpdate: vi.fn(),
            setUpdateError: vi.fn(),
            setUpdateStatus: vi.fn(),
            updateError: null,
            updateStatus: "error",
        });

        render(<App />);

        // Check update error fallback message
        expect(screen.getByText("Update failed.")).toBeInTheDocument();
    });

    it("should display update available notification", () => {
        mockUseUpdatesStore.mockReturnValue({
            applyUpdate: vi.fn(),
            setUpdateError: vi.fn(),
            setUpdateStatus: vi.fn(),
            updateError: null,
            updateStatus: "available",
        });

        render(<App />);

        // Check update available message
        expect(
            screen.getByText("A new update is available. Downloading...")
        ).toBeInTheDocument();
        expect(screen.getByText("⬇️")).toBeInTheDocument();
    });

    it("should display update downloading notification", () => {
        mockUseUpdatesStore.mockReturnValue({
            applyUpdate: vi.fn(),
            setUpdateError: vi.fn(),
            setUpdateStatus: vi.fn(),
            updateError: null,
            updateStatus: "downloading",
        });

        render(<App />);

        // Check update downloading message
        expect(
            screen.getByText("Update is downloading...")
        ).toBeInTheDocument();
        expect(screen.getByText("⏬")).toBeInTheDocument();
    });

    it("should display update downloaded notification with restart button", async () => {
        const applyUpdateMock = vi.fn();
        mockUseUpdatesStore.mockReturnValue({
            applyUpdate: applyUpdateMock,
            setUpdateError: vi.fn(),
            setUpdateStatus: vi.fn(),
            updateError: null,
            updateStatus: "downloaded",
        });

        render(<App />);

        // Check update downloaded message and restart button
        expect(
            screen.getByText("Update downloaded! Restart to apply.")
        ).toBeInTheDocument();
        expect(screen.getByText("✅")).toBeInTheDocument();
        expect(screen.getByText("Restart Now")).toBeInTheDocument();

        // Test restart button click
        const restartButton = screen.getByText("Restart Now");
        await userEvent.click(restartButton);
        expect(applyUpdateMock).toHaveBeenCalled();
    });

    it("should show settings modal when showSettings is true", () => {
        mockUseUIStore.mockReturnValue({
            setShowSettings: vi.fn(),
            setShowSiteDetails: vi.fn(),
            showSettings: true,
            showSiteDetails: false,
        });

        render(<App />);

        expect(screen.getByTestId("settings")).toBeInTheDocument();
    });

    it("should apply dark theme class when isDark is true", () => {
        mockUseTheme.mockReturnValue({
            isDark: true,
            availableThemes: ["light", "dark"],
            currentTheme: {
                name: "dark",
                colors: {},
                spacing: {},
                typography: {},
                borderRadius: {},
                shadows: {},
            } as any,
            getColor: vi.fn(),
            getStatusColor: vi.fn(),
            setTheme: vi.fn(),
            toggleTheme: vi.fn(),
            systemTheme: "dark",
            themeManager: {} as any,
            themeName: "dark",
            themeVersion: 1,
        });

        render(<App />);

        const appContainer = document.querySelector(".app-container");
        expect(appContainer).toHaveClass("dark");
    });

    it("should handle update action dismiss when status is not downloaded", async () => {
        const setUpdateStatusMock = vi.fn();
        const setUpdateErrorMock = vi.fn();

        mockUseUpdatesStore.mockReturnValue({
            applyUpdate: vi.fn(),
            setUpdateError: setUpdateErrorMock,
            setUpdateStatus: setUpdateStatusMock,
            updateError: "Test error",
            updateStatus: "error",
        });

        render(<App />);

        // Click dismiss button
        const dismissButton = screen.getByText("Dismiss");
        await userEvent.click(dismissButton);

        expect(setUpdateStatusMock).toHaveBeenCalledWith("idle");
        expect(setUpdateErrorMock).toHaveBeenCalledWith(undefined);
    });

    it("should execute development logging in status updates callback", async () => {
        // Mock isDevelopment to return true to enable development logging
        vi.mocked(isDevelopment).mockReturnValue(true);

        const subscribeToStatusUpdatesMock = vi.fn();

        // Mock useSitesStore.getState() to return our mock
        const mockSitesStoreState = {
            initializeSites: vi.fn().mockResolvedValue(undefined),
            subscribeToStatusUpdates: subscribeToStatusUpdatesMock,
            unsubscribeFromStatusUpdates: vi.fn(),
        };

        mockUseSitesStore.getState = vi.fn().mockReturnValue(mockSitesStoreState);

        // Mock logger.debug
        const debugSpy = vi.spyOn(logger, "debug");

        render(<App />);

        // Wait for initialization to complete
        await waitFor(
            () => {
                expect(subscribeToStatusUpdatesMock).toHaveBeenCalled();
            },
            { timeout: 1000 }
        );

        // Get the callback function passed to subscribeToStatusUpdates
        const statusUpdateCallback = subscribeToStatusUpdatesMock.mock.calls[0][0];

        // Create a mock status update
        const mockUpdate = {
            site: { identifier: "test-site-id" },
            siteIdentifier: "fallback-site-id",
        };

        // Call the callback to trigger development logging
        statusUpdateCallback(mockUpdate);

        // Verify that logger.debug was called
        expect(debugSpy).toHaveBeenCalledWith(
            expect.stringMatching(/\[\d{1,2}:\d{2}:\d{2} [AP]M\] Status update received for site: test-site-id/)
        );

        debugSpy.mockRestore();
    });

    it("should use fallback siteIdentifier when site.identifier is undefined", async () => {
        // Mock isDevelopment to return true to enable development logging
        vi.mocked(isDevelopment).mockReturnValue(true);

        const subscribeToStatusUpdatesMock = vi.fn();

        // Mock useSitesStore.getState() to return our mock
        const mockSitesStoreState = {
            initializeSites: vi.fn().mockResolvedValue(undefined),
            subscribeToStatusUpdates: subscribeToStatusUpdatesMock,
            unsubscribeFromStatusUpdates: vi.fn(),
        };

        mockUseSitesStore.getState = vi.fn().mockReturnValue(mockSitesStoreState);

        // Mock logger.debug
        const debugSpy = vi.spyOn(logger, "debug");

        render(<App />);

        // Wait for initialization to complete
        await waitFor(
            () => {
                expect(subscribeToStatusUpdatesMock).toHaveBeenCalled();
            },
            { timeout: 1000 }
        );

        // Get the callback function passed to subscribeToStatusUpdates
        const statusUpdateCallback = subscribeToStatusUpdatesMock.mock.calls[0][0];

        // Create a mock status update with undefined site.identifier
        const mockUpdate = {
            site: { identifier: undefined },
            siteIdentifier: "fallback-site-id",
        };

        // Call the callback to trigger development logging with fallback
        statusUpdateCallback(mockUpdate);

        // Verify that logger.debug was called with fallback identifier
        expect(debugSpy).toHaveBeenCalledWith(
            expect.stringMatching(/\[\d{1,2}:\d{2}:\d{2} [AP]M\] Status update received for site: fallback-site-id/)
        );

        debugSpy.mockRestore();
    });
});
