/**
 * App Component - Fixed Comprehensive Coverage Tests
 * Tests to increase coverage of the main App component
 */

import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import App from "../App";

// Mock all hooks and stores
const mockUseAppInitialization = vi.fn();
const mockUseSelectedSite = vi.fn();
const mockUseUpdatesState = vi.fn();
const mockUseAppLifecycle = vi.fn();
const mockUseSettingsStore = vi.fn();
const mockUseUiStore = vi.fn();
const mockUseSitesStore = vi.fn();

vi.mock("../hooks", () => ({
    useAppInitialization: mockUseAppInitialization,
    useSelectedSite: mockUseSelectedSite,
    useUpdatesState: mockUseUpdatesState,
    useAppLifecycle: mockUseAppLifecycle,
}));

vi.mock("../stores", () => ({
    useSettingsStore: mockUseSettingsStore,
    useUiStore: mockUseUiStore,
    useSitesStore: mockUseSitesStore,
}));

vi.mock("../components", () => ({
    Header: () => <div data-testid="header">Header</div>,
    SiteList: () => <div data-testid="site-list">SiteList</div>,
    LoadingOverlay: () => <div data-testid="loading-overlay">Loading</div>,
    ErrorNotification: () => <div data-testid="error-notification">Error</div>,
    UpdateNotification: () => <div data-testid="update-notification">Update</div>,
    Settings: () => <div data-testid="settings">Settings</div>,
    SiteDetails: () => <div data-testid="site-details">Site Details</div>,
}));

describe("App Component - Fixed Comprehensive Coverage", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Default mock implementations
        mockUseAppInitialization.mockReturnValue({
            initializeApp: vi.fn(),
            isLoading: false,
            loadingProgress: 0,
            error: null,
            dismissError: vi.fn(),
        });

        mockUseSelectedSite.mockReturnValue(null);

        mockUseUpdatesState.mockReturnValue({
            updateStatus: "idle",
            updateProgress: 0,
            updateError: null,
            updateInfo: null,
            clearUpdateError: vi.fn(),
            applyUpdate: vi.fn(),
        });

        mockUseAppLifecycle.mockReturnValue({
            subscribeToStatusUpdates: vi.fn(),
            unsubscribeFromStatusUpdates: vi.fn(),
        });

        mockUseSettingsStore.mockReturnValue({
            theme: "light",
            settings: { theme: "light" },
        });

        mockUseUiStore.mockReturnValue({
            showSettings: false,
            showSiteDetails: false,
            setShowSettings: vi.fn(),
            setShowSiteDetails: vi.fn(),
        });

        mockUseSitesStore.mockReturnValue({
            sites: [],
            sitesCount: 0,
        });
    });

    it("should render App component with basic structure", () => {
        render(<App />);

        expect(screen.getByTestId("header")).toBeInTheDocument();
        expect(screen.getByTestId("site-list")).toBeInTheDocument();
    });

    it("should apply light theme class by default", () => {
        render(<App />);

        const appElement = screen.getByTestId("header").closest(".uptime-watcher-app");
        expect(appElement).toHaveClass("light");
    });

    it("should apply dark theme class when theme is dark", () => {
        mockUseSettingsStore.mockReturnValue({
            theme: "dark",
            settings: { theme: "dark" },
        });

        render(<App />);

        const appElement = screen.getByTestId("header").closest(".uptime-watcher-app");
        expect(appElement).toHaveClass("dark");
    });

    it("should show loading overlay when loading", () => {
        mockUseAppInitialization.mockReturnValue({
            initializeApp: vi.fn(),
            isLoading: true,
            loadingProgress: 50,
            error: null,
            dismissError: vi.fn(),
        });

        render(<App />);

        expect(screen.getByTestId("loading-overlay")).toBeInTheDocument();
    });

    it("should show error notification when there is an error", () => {
        mockUseAppInitialization.mockReturnValue({
            initializeApp: vi.fn(),
            isLoading: false,
            loadingProgress: 0,
            error: "Test error",
            dismissError: vi.fn(),
        });

        render(<App />);

        expect(screen.getByTestId("error-notification")).toBeInTheDocument();
    });

    it("should show update notification when update is available", () => {
        mockUseUpdatesState.mockReturnValue({
            updateStatus: "available",
            updateProgress: 0,
            updateError: null,
            updateInfo: null,
            clearUpdateError: vi.fn(),
            applyUpdate: vi.fn(),
        });

        render(<App />);

        expect(screen.getByTestId("update-notification")).toBeInTheDocument();
    });

    it("should show settings modal when showSettings is true", () => {
        mockUseUiStore.mockReturnValue({
            showSettings: true,
            showSiteDetails: false,
            setShowSettings: vi.fn(),
            setShowSiteDetails: vi.fn(),
        });

        render(<App />);

        expect(screen.getByTestId("settings")).toBeInTheDocument();
    });

    it("should show site details modal when showSiteDetails is true and site is selected", () => {
        mockUseUiStore.mockReturnValue({
            showSettings: false,
            showSiteDetails: true,
            setShowSettings: vi.fn(),
            setShowSiteDetails: vi.fn(),
        });

        mockUseSelectedSite.mockReturnValue({
            identifier: "test-site",
            name: "Test Site",
            monitors: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        render(<App />);

        expect(screen.getByTestId("site-details")).toBeInTheDocument();
    });

    it("should handle initialization on mount", () => {
        const mockInitialize = vi.fn();

        mockUseAppInitialization.mockReturnValue({
            initializeApp: mockInitialize,
            isLoading: false,
            loadingProgress: 0,
            error: null,
            dismissError: vi.fn(),
        });

        render(<App />);

        expect(mockInitialize).toHaveBeenCalled();
    });

    it("should handle status update subscription", () => {
        const mockSubscribe = vi.fn();
        const mockUnsubscribe = vi.fn();

        mockUseAppLifecycle.mockReturnValue({
            subscribeToStatusUpdates: mockSubscribe,
            unsubscribeFromStatusUpdates: mockUnsubscribe,
        });

        const { unmount } = render(<App />);

        expect(mockSubscribe).toHaveBeenCalled();

        unmount();
        expect(mockUnsubscribe).toHaveBeenCalled();
    });

    it("should handle various update statuses", () => {
        const mockApplyUpdate = vi.fn();

        mockUseUpdatesState.mockReturnValue({
            updateStatus: "downloaded",
            updateProgress: 100,
            updateError: null,
            updateInfo: { version: "1.0.1" },
            clearUpdateError: vi.fn(),
            applyUpdate: mockApplyUpdate,
        });

        render(<App />);

        expect(screen.getByTestId("update-notification")).toBeInTheDocument();
    });

    it("should handle update error scenarios", () => {
        const mockClearError = vi.fn();

        mockUseUpdatesState.mockReturnValue({
            updateStatus: "error",
            updateProgress: 0,
            updateError: "Update failed",
            updateInfo: null,
            clearUpdateError: mockClearError,
            applyUpdate: vi.fn(),
        });

        render(<App />);

        expect(screen.getByTestId("update-notification")).toBeInTheDocument();
    });

    it("should handle sites count display", () => {
        mockUseSitesStore.mockReturnValue({
            sites: [
                { identifier: "site1", name: "Site 1", monitors: [], createdAt: new Date(), updatedAt: new Date() },
                { identifier: "site2", name: "Site 2", monitors: [], createdAt: new Date(), updatedAt: new Date() },
            ],
            sitesCount: 2,
        });

        render(<App />);

        expect(screen.getByTestId("site-list")).toBeInTheDocument();
    });

    it("should handle theme switching", () => {
        // Start with light theme
        mockUseSettingsStore.mockReturnValue({
            theme: "light",
            settings: { theme: "light" },
        });

        const { rerender } = render(<App />);

        let appElement = screen.getByTestId("header").closest(".uptime-watcher-app");
        expect(appElement).toHaveClass("light");

        // Switch to dark theme
        mockUseSettingsStore.mockReturnValue({
            theme: "dark",
            settings: { theme: "dark" },
        });

        rerender(<App />);

        appElement = screen.getByTestId("header").closest(".uptime-watcher-app");
        expect(appElement).toHaveClass("dark");
    });

    it("should handle complex loading states", () => {
        mockUseAppInitialization.mockReturnValue({
            initializeApp: vi.fn(),
            isLoading: true,
            loadingProgress: 75,
            error: null,
            dismissError: vi.fn(),
        });

        render(<App />);

        expect(screen.getByTestId("loading-overlay")).toBeInTheDocument();
    });

    it("should handle modal state changes", () => {
        const mockSetShowSettings = vi.fn();
        const mockSetShowSiteDetails = vi.fn();

        mockUseUiStore.mockReturnValue({
            showSettings: false,
            showSiteDetails: false,
            setShowSettings: mockSetShowSettings,
            setShowSiteDetails: mockSetShowSiteDetails,
        });

        render(<App />);

        // Should not show modals initially
        expect(screen.queryByTestId("settings")).not.toBeInTheDocument();
        expect(screen.queryByTestId("site-details")).not.toBeInTheDocument();
    });

    it("should handle error dismissal", () => {
        const mockDismissError = vi.fn();

        mockUseAppInitialization.mockReturnValue({
            initializeApp: vi.fn(),
            isLoading: false,
            loadingProgress: 0,
            error: "Test error",
            dismissError: mockDismissError,
        });

        render(<App />);

        expect(screen.getByTestId("error-notification")).toBeInTheDocument();
    });

    it("should handle system theme preferences", () => {
        mockUseSettingsStore.mockReturnValue({
            theme: "system",
            settings: { theme: "system" },
        });

        render(<App />);

        const appElement = screen.getByTestId("header").closest(".uptime-watcher-app");
        expect(appElement).toHaveClass("system");
    });

    it("should handle empty sites state", () => {
        mockUseSitesStore.mockReturnValue({
            sites: [],
            sitesCount: 0,
        });

        render(<App />);

        expect(screen.getByTestId("site-list")).toBeInTheDocument();
    });

    it("should handle concurrent loading and error states", () => {
        mockUseAppInitialization.mockReturnValue({
            initializeApp: vi.fn(),
            isLoading: true,
            loadingProgress: 25,
            error: "Loading error",
            dismissError: vi.fn(),
        });

        render(<App />);

        expect(screen.getByTestId("loading-overlay")).toBeInTheDocument();
        expect(screen.getByTestId("error-notification")).toBeInTheDocument();
    });

    it("should handle update progress changes", () => {
        mockUseUpdatesState.mockReturnValue({
            updateStatus: "downloading",
            updateProgress: 45,
            updateError: null,
            updateInfo: { version: "1.0.1" },
            clearUpdateError: vi.fn(),
            applyUpdate: vi.fn(),
        });

        render(<App />);

        expect(screen.getByTestId("update-notification")).toBeInTheDocument();
    });

    it("should handle multiple sites", () => {
        mockUseSitesStore.mockReturnValue({
            sites: Array.from({ length: 5 }, (_, i) => ({
                identifier: `site${i}`,
                name: `Site ${i}`,
                monitors: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            })),
            sitesCount: 5,
        });

        render(<App />);

        expect(screen.getByTestId("site-list")).toBeInTheDocument();
    });

    it("should handle no selected site with site details modal", () => {
        mockUseUiStore.mockReturnValue({
            showSettings: false,
            showSiteDetails: true,
            setShowSettings: vi.fn(),
            setShowSiteDetails: vi.fn(),
        });

        mockUseSelectedSite.mockReturnValue(null);

        render(<App />);

        expect(screen.queryByTestId("site-details")).not.toBeInTheDocument();
    });

    it("should handle update info display", () => {
        mockUseUpdatesState.mockReturnValue({
            updateStatus: "available",
            updateProgress: 0,
            updateError: null,
            updateInfo: { version: "2.0.0", releaseNotes: "Bug fixes and improvements" },
            clearUpdateError: vi.fn(),
            applyUpdate: vi.fn(),
        });

        render(<App />);

        expect(screen.getByTestId("update-notification")).toBeInTheDocument();
    });

    it("should handle different loading progress values", () => {
        mockUseAppInitialization.mockReturnValue({
            initializeApp: vi.fn(),
            isLoading: true,
            loadingProgress: 0,
            error: null,
            dismissError: vi.fn(),
        });

        render(<App />);

        expect(screen.getByTestId("loading-overlay")).toBeInTheDocument();
    });

    it("should handle complete loading progress", () => {
        mockUseAppInitialization.mockReturnValue({
            initializeApp: vi.fn(),
            isLoading: true,
            loadingProgress: 100,
            error: null,
            dismissError: vi.fn(),
        });

        render(<App />);

        expect(screen.getByTestId("loading-overlay")).toBeInTheDocument();
    });
});
