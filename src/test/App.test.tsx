/**
 * Comprehensive tests for the main App component.
 * Tests global state management, modals, notifications, and layout.
 */

import { render, screen, act } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

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
    }) => (
        <div data-testid="themed-box" className={className} {...props}>
            {children}
        </div>
    ),
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
        <span data-testid="themed-text" className={`${variant || ""} ${size || ""} ${weight || ""} ${className || ""}`}>
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
            className={`${variant || ""} ${size || ""} ${className || ""}`}
        >
            {children}
        </button>
    ),
}));

vi.mock("../theme/useTheme", () => ({
    useTheme: () => ({ isDark: false }),
}));

// Mock the store
const mockStore = {
    applyUpdate: vi.fn(),
    clearError: vi.fn(),
    getSelectedSite: vi.fn(() => null),
    initializeApp: vi.fn(),
    isLoading: false,
    lastError: null,
    setShowSettings: vi.fn(),
    setShowSiteDetails: vi.fn(),
    setUpdateError: vi.fn(),
    setUpdateStatus: vi.fn(),
    showSettings: false,
    showSiteDetails: false,
    sites: [],
    subscribeToStatusUpdates: vi.fn(),
    unsubscribeFromStatusUpdates: vi.fn(),
    updateError: null,
    updateStatus: "idle",
};

vi.mock("../store", () => ({
    useStore: () => mockStore,
}));

import App from "../App";

describe("App Component", () => {
    const user = userEvent.setup();

    beforeEach(() => {
        vi.clearAllMocks();
        // Reset mock store to defaults
        Object.assign(mockStore, {
            applyUpdate: vi.fn(),
            clearError: vi.fn(),
            getSelectedSite: vi.fn(() => null),
            initializeApp: vi.fn(),
            isLoading: false,
            lastError: null,
            setShowSettings: vi.fn(),
            setShowSiteDetails: vi.fn(),
            setUpdateError: vi.fn(),
            setUpdateStatus: vi.fn(),
            showSettings: false,
            showSiteDetails: false,
            sites: [],
            subscribeToStatusUpdates: vi.fn(),
            unsubscribeFromStatusUpdates: vi.fn(),
            updateError: null,
            updateStatus: "idle",
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

        it("displays correct site count", () => {
            mockStore.sites = [
                { id: "1", name: "Test Site" },
                { id: "2", name: "Another Site" },
            ];
            render(<App />);
            expect(screen.getByText("Monitored Sites (2)")).toBeInTheDocument();
        });
    });

    describe("Initialization", () => {
        it("calls initializeApp on mount", () => {
            render(<App />);
            expect(mockStore.initializeApp).toHaveBeenCalled();
        });

        it("subscribes to status updates on mount", () => {
            render(<App />);
            expect(mockStore.subscribeToStatusUpdates).toHaveBeenCalled();
        });

        it("unsubscribes from status updates on unmount", () => {
            const { unmount } = render(<App />);
            unmount();
            expect(mockStore.unsubscribeFromStatusUpdates).toHaveBeenCalled();
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
            mockStore.isLoading = true;
            render(<App />);

            // Should not show loading overlay immediately
            expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
        });

        it("shows loading overlay after delay when loading", async () => {
            mockStore.isLoading = true;
            render(<App />);

            // Fast-forward past the delay
            act(() => {
                vi.advanceTimersByTime(100);
            });

            expect(screen.getByText("Loading...")).toBeInTheDocument();
        });

        it("hides loading overlay when not loading", () => {
            mockStore.isLoading = false;
            render(<App />);

            act(() => {
                vi.advanceTimersByTime(200);
            });

            expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
        });

        it("clears loading timeout when loading stops", () => {
            mockStore.isLoading = true;
            const { rerender } = render(<App />);

            // Change to not loading before timeout
            mockStore.isLoading = false;
            rerender(<App />);

            act(() => {
                vi.advanceTimersByTime(200);
            });

            expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
        });
    });

    describe("Error Handling", () => {
        it("displays error notification when there is an error", () => {
            mockStore.lastError = "Test error message";
            render(<App />);

            expect(screen.getByText("Test error message")).toBeInTheDocument();
            expect(screen.getByText("⚠️")).toBeInTheDocument();
        });

        it("can dismiss error notification", async () => {
            mockStore.lastError = "Test error message";
            render(<App />);

            const closeButton = screen.getByText("✕");
            await user.click(closeButton);

            expect(mockStore.clearError).toHaveBeenCalled();
        });

        it("does not display error notification when no error", () => {
            mockStore.lastError = null;
            render(<App />);

            expect(screen.queryByText("⚠️")).not.toBeInTheDocument();
        });
    });

    describe("Update Notifications", () => {
        it("shows update available notification", () => {
            mockStore.updateStatus = "available";
            render(<App />);

            expect(screen.getByText("A new update is available. Downloading...")).toBeInTheDocument();
            expect(screen.getByText("⬇️")).toBeInTheDocument();
        });

        it("shows downloading notification", () => {
            mockStore.updateStatus = "downloading";
            render(<App />);

            expect(screen.getByText("Update is downloading...")).toBeInTheDocument();
            expect(screen.getByText("⏬")).toBeInTheDocument();
        });

        it("shows downloaded notification with restart button", async () => {
            mockStore.updateStatus = "downloaded";
            render(<App />);

            expect(screen.getByText("Update downloaded! Restart to apply.")).toBeInTheDocument();
            expect(screen.getByText("✅")).toBeInTheDocument();

            const restartButton = screen.getByText("Restart Now");
            await user.click(restartButton);

            expect(mockStore.applyUpdate).toHaveBeenCalled();
        });

        it("shows error notification with dismiss button", async () => {
            mockStore.updateStatus = "error";
            mockStore.updateError = "Update failed due to network error";
            render(<App />);

            expect(screen.getByText("Update failed due to network error")).toBeInTheDocument();
            expect(screen.getByText("⚠️")).toBeInTheDocument();

            const dismissButton = screen.getByText("Dismiss");
            await user.click(dismissButton);

            expect(mockStore.setUpdateStatus).toHaveBeenCalledWith("idle");
            expect(mockStore.setUpdateError).toHaveBeenCalledWith(undefined);
        });

        it("shows generic error message when no specific error", () => {
            mockStore.updateStatus = "error";
            mockStore.updateError = null;
            render(<App />);

            expect(screen.getByText("Update failed.")).toBeInTheDocument();
        });

        it("does not show update notification for idle status", () => {
            mockStore.updateStatus = "idle";
            render(<App />);

            expect(screen.queryByText(/update/i)).not.toBeInTheDocument();
        });
    });

    describe("Modals", () => {
        it("shows settings modal when showSettings is true", () => {
            mockStore.showSettings = true;
            render(<App />);

            expect(screen.getByTestId("settings-modal")).toBeInTheDocument();
        });

        it("can close settings modal", async () => {
            mockStore.showSettings = true;
            render(<App />);

            const closeButton = screen.getByTestId("close-settings");
            await user.click(closeButton);

            expect(mockStore.setShowSettings).toHaveBeenCalledWith(false);
        });

        it("does not show settings modal when showSettings is false", () => {
            mockStore.showSettings = false;
            render(<App />);

            expect(screen.queryByTestId("settings-modal")).not.toBeInTheDocument();
        });

        it("shows site details modal when showSiteDetails is true and site is selected", () => {
            mockStore.showSiteDetails = true;
            mockStore.getSelectedSite.mockReturnValue({ id: "1", name: "Test Site" });
            render(<App />);

            expect(screen.getByTestId("site-details-modal")).toBeInTheDocument();
            expect(screen.getByText("Site Details for Test Site")).toBeInTheDocument();
        });

        it("can close site details modal", async () => {
            mockStore.showSiteDetails = true;
            mockStore.getSelectedSite.mockReturnValue({ id: "1", name: "Test Site" });
            render(<App />);

            const closeButton = screen.getByTestId("close-site-details");
            await user.click(closeButton);

            expect(mockStore.setShowSiteDetails).toHaveBeenCalledWith(false);
        });

        it("does not show site details modal when no site is selected", () => {
            mockStore.showSiteDetails = true;
            mockStore.getSelectedSite.mockReturnValue(null);
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
