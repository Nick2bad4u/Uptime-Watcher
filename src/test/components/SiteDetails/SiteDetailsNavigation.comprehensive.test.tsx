/**
 * Comprehensive tests for SiteDetailsNavigation component
 */

import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { SiteDetailsNavigation } from "../../../components/SiteDetails/SiteDetailsNavigation";

// Mock BrowserRouter to avoid react-router-dom dependency
const MockBrowserRouter = ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
);

// Mock the logger
vi.mock("../../../services/logger", () => ({
    default: {
        user: {
            action: vi.fn(),
        },
    },
}));

// Mock the theme components
vi.mock("../../../theme/components", () => ({
    ThemedBox: vi.fn(({ children, ...props }) => (
        <div data-testid="themed-box" {...props}>
            {children}
        </div>
    )),
    ThemedButton: vi.fn(
        ({ children, onClick, variant, size, className, ...props }) => (
            <button
                onClick={onClick}
                data-variant={variant}
                data-size={size}
                className={className}
                {...props}
            >
                {children}
            </button>
        )
    ),
    ThemedSelect: vi.fn(({ children, onChange, value, ...props }) => (
        <select
            onChange={onChange}
            value={value}
            data-testid="monitor-select"
            {...props}
        >
            {children}
        </select>
    )),
    ThemedText: vi.fn(({ children, size, variant, ...props }) => (
        <span data-size={size} data-variant={variant} {...props}>
            {children}
        </span>
    )),
}));

// Mock the SiteMonitoringButton
vi.mock(
    "../../../components/common/SiteMonitoringButton/SiteMonitoringButton",
    () => ({
        SiteMonitoringButton: vi.fn(
            ({ isLoading, onStartSiteMonitoring, onStopSiteMonitoring }) => (
                <div data-testid="site-monitoring-button">
                    <button
                        data-testid="start-site-monitoring"
                        onClick={onStartSiteMonitoring}
                        disabled={isLoading}
                    >
                        Start Site
                    </button>
                    <button
                        data-testid="stop-site-monitoring"
                        onClick={onStopSiteMonitoring}
                        disabled={isLoading}
                    >
                        Stop Site
                    </button>
                </div>
            )
        ),
    })
);

const mockSite = {
    identifier: "test-site-1",
    name: "Test Site",
    monitoring: true,
    monitors: [
        {
            id: "monitor-1",
            type: "http" as const,
            url: "https://example.com",
            checkInterval: 300_000,
            timeout: 30_000,
            retryAttempts: 3,
            monitoring: true,
            history: [],
            responseTime: 150,
            status: "up" as const,
        },
        {
            id: "monitor-2",
            type: "port" as const,
            host: "localhost",
            port: 8080,
            checkInterval: 300_000,
            timeout: 30_000,
            retryAttempts: 3,
            monitoring: false,
            history: [],
            responseTime: 25,
            status: "down" as const,
        },
    ],
};

const defaultProps = {
    activeSiteDetailsTab: "site-overview",
    currentSite: mockSite,
    handleMonitorIdChange: vi.fn(),
    handleStartMonitoring: vi.fn(),
    handleStartSiteMonitoring: vi.fn(),
    handleStopMonitoring: vi.fn(),
    handleStopSiteMonitoring: vi.fn(),
    isLoading: false,
    isMonitoring: true,
    selectedMonitorId: "monitor-1",
    setActiveSiteDetailsTab: vi.fn(),
};

const renderSiteDetailsNavigation = (props = {}) => {
    const finalProps = { ...defaultProps, ...props };
    return render(
        <MockBrowserRouter>
            <SiteDetailsNavigation {...finalProps} />
        </MockBrowserRouter>
    );
};

describe("SiteDetailsNavigation Navigation Tests", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("Basic Rendering", () => {
        it("should render navigation container", () => {
            renderSiteDetailsNavigation();

            // Use CSS class selector instead of data-testid
            expect(document.querySelector(".themed-box")).toBeInTheDocument();
        });

        it("should render site overview tab", () => {
            renderSiteDetailsNavigation();

            expect(screen.getByText(/Site Overview/)).toBeInTheDocument();
        });

        it("should render monitor overview tab", () => {
            renderSiteDetailsNavigation();

            expect(screen.getByText(/Monitor Overview/)).toBeInTheDocument();
        });

        it("should render settings tab", () => {
            renderSiteDetailsNavigation();

            expect(screen.getByText(/Settings/)).toBeInTheDocument();
        });

        it("should render history tab", () => {
            renderSiteDetailsNavigation();

            expect(screen.getByText(/History/)).toBeInTheDocument();
        });

        it("should render analytics tab", () => {
            renderSiteDetailsNavigation();

            expect(screen.getByText(/HTTP Analytics/)).toBeInTheDocument();
        });
    });

    describe("Monitor Selection", () => {
        it("should render monitor selector", () => {
            renderSiteDetailsNavigation();

            // Use CSS class selector instead of data-testid
            expect(
                document.querySelector(".themed-select")
            ).toBeInTheDocument();
        });

        it("should show selected monitor in selector", () => {
            renderSiteDetailsNavigation();

            // Use CSS class selector and getByRole for semantic selection
            const selector = document.querySelector(
                ".themed-select"
            ) as HTMLSelectElement;
            expect(selector).toHaveValue("monitor-1");
        });

        it("should display all monitors in selector", () => {
            renderSiteDetailsNavigation();

            expect(screen.getByText("HTTP")).toBeInTheDocument();
            expect(screen.getByText("PORT")).toBeInTheDocument();
        });

        it("should handle monitor change", () => {
            const handleMonitorIdChange = vi.fn();
            renderSiteDetailsNavigation({
                handleMonitorIdChange,
            });

            // Use CSS class selector instead of data-testid
            const selector = document.querySelector(
                ".themed-select"
            ) as HTMLSelectElement;
            fireEvent.change(selector, { target: { value: "monitor-2" } });

            expect(handleMonitorIdChange).toHaveBeenCalled();
        });
    });

    describe("Tab Click Handlers", () => {
        it("should call setActiveSiteDetailsTab when site overview clicked", () => {
            const setActiveSiteDetailsTab = vi.fn();
            renderSiteDetailsNavigation({
                setActiveSiteDetailsTab,
            });

            fireEvent.click(screen.getByText(/Site Overview/));

            expect(setActiveSiteDetailsTab).toHaveBeenCalledWith(
                "site-overview"
            );
        });

        it("should call setActiveSiteDetailsTab when monitor overview clicked", () => {
            const setActiveSiteDetailsTab = vi.fn();
            renderSiteDetailsNavigation({
                setActiveSiteDetailsTab,
            });

            fireEvent.click(screen.getByText(/Monitor Overview/));

            expect(setActiveSiteDetailsTab).toHaveBeenCalledWith(
                "monitor-overview"
            );
        });

        it("should call setActiveSiteDetailsTab when settings clicked", () => {
            const setActiveSiteDetailsTab = vi.fn();
            renderSiteDetailsNavigation({
                setActiveSiteDetailsTab,
            });

            fireEvent.click(screen.getByText(/Settings/));

            expect(setActiveSiteDetailsTab).toHaveBeenCalledWith("settings");
        });

        it("should call setActiveSiteDetailsTab when history clicked", () => {
            const setActiveSiteDetailsTab = vi.fn();
            renderSiteDetailsNavigation({
                setActiveSiteDetailsTab,
            });

            fireEvent.click(screen.getByText(/History/));

            expect(setActiveSiteDetailsTab).toHaveBeenCalledWith("history");
        });

        it("should call setActiveSiteDetailsTab when analytics tab clicked", () => {
            const setActiveSiteDetailsTab = vi.fn();
            renderSiteDetailsNavigation({
                setActiveSiteDetailsTab,
            });

            fireEvent.click(screen.getByText(/HTTP Analytics/));

            expect(setActiveSiteDetailsTab).toHaveBeenCalledWith(
                "monitor-1-analytics"
            );
        });
    });

    describe("Active Tab Highlighting", () => {
        it("should highlight site overview tab when active", () => {
            renderSiteDetailsNavigation({
                activeSiteDetailsTab: "site-overview",
            });

            const siteOverviewButton = screen.getByText(/Site Overview/);
            // Check for CSS class instead of data attribute
            expect(siteOverviewButton).toHaveClass("themed-button--primary");
        });

        it("should highlight settings tab when active", () => {
            renderSiteDetailsNavigation({
                activeSiteDetailsTab: "settings",
            });

            const settingsButton = screen.getByText(/Settings/);
            expect(settingsButton).toHaveClass("themed-button--primary");
        });

        it("should highlight history tab when active", () => {
            renderSiteDetailsNavigation({
                activeSiteDetailsTab: "history",
            });

            const historyButton = screen.getByText(/History/);
            expect(historyButton).toHaveClass("themed-button--primary");
        });

        it("should highlight monitor analytics tab when active", () => {
            renderSiteDetailsNavigation({
                activeSiteDetailsTab: "monitor-1-analytics",
            });

            const monitorButton = screen.getByText(/HTTP Analytics/);
            expect(monitorButton).toHaveClass("themed-button--primary");
        });
    });

    describe("Monitoring Controls", () => {
        it("should render site monitoring button", () => {
            renderSiteDetailsNavigation();

            expect(
                screen.getByTestId("site-monitoring-button")
            ).toBeInTheDocument();
        });

        it("should show stop button when monitoring", () => {
            renderSiteDetailsNavigation({
                isMonitoring: true,
            });

            expect(
                screen.getByLabelText(/Stop Monitoring/)
            ).toBeInTheDocument();
        });

        it("should show start button when not monitoring", () => {
            renderSiteDetailsNavigation({
                isMonitoring: false,
            });

            expect(
                screen.getByLabelText(/Start Monitoring/)
            ).toBeInTheDocument();
        });

        it("should handle start monitoring click", () => {
            const handleStartMonitoring = vi.fn();
            renderSiteDetailsNavigation({
                handleStartMonitoring,
                isMonitoring: false,
            });

            fireEvent.click(screen.getByLabelText(/Start Monitoring/));

            expect(handleStartMonitoring).toHaveBeenCalled();
        });

        it("should handle stop monitoring click", () => {
            const handleStopMonitoring = vi.fn();
            renderSiteDetailsNavigation({
                handleStopMonitoring,
                isMonitoring: true,
            });

            fireEvent.click(screen.getByLabelText(/Stop Monitoring/));

            expect(handleStopMonitoring).toHaveBeenCalled();
        });
    });

    describe("Edge Cases", () => {
        it("should handle site with no monitors", () => {
            const siteWithNoMonitors = {
                ...mockSite,
                monitors: [],
            };

            renderSiteDetailsNavigation({
                currentSite: siteWithNoMonitors,
                selectedMonitorId: "",
            });

            // Should still render basic tabs
            expect(screen.getByText(/Site Overview/)).toBeInTheDocument();
            expect(screen.getByText(/Settings/)).toBeInTheDocument();
            expect(screen.getByText(/History/)).toBeInTheDocument();
        });

        it("should handle loading state", () => {
            renderSiteDetailsNavigation({
                isLoading: true,
            });

            const startSiteButton = screen.getByTestId("start-site-monitoring");
            expect(startSiteButton).toBeDisabled();
        });

        it("should handle different monitor types", () => {
            const siteWithPingMonitor = {
                ...mockSite,
                monitors: [
                    {
                        id: "ping-monitor",
                        type: "ping" as const,
                        host: "google.com",
                        interval: 300_000,
                        timeout: 30_000,
                        retryAttempts: 3,
                        isEnabled: true,
                        monitoring: true,
                    },
                ],
            };

            renderSiteDetailsNavigation({
                currentSite: siteWithPingMonitor,
                selectedMonitorId: "ping-monitor",
            });

            expect(screen.getByText(/PING Analytics/)).toBeInTheDocument();
        });

        it("should handle missing selected monitor", () => {
            renderSiteDetailsNavigation({
                selectedMonitorId: "non-existent-monitor",
            });

            // Should still render navigation with fallback label
            expect(screen.getByText(/ANALYTICS Analytics/)).toBeInTheDocument();
        });
    });

    describe("Site-Level Monitoring", () => {
        it("should calculate all monitors running correctly", () => {
            const siteWithAllMonitorsRunning = {
                ...mockSite,
                monitors: mockSite.monitors.map((m) => ({
                    ...m,
                    monitoring: true,
                })),
            };

            renderSiteDetailsNavigation({
                currentSite: siteWithAllMonitorsRunning,
            });

            expect(
                screen.getByTestId("site-monitoring-button")
            ).toBeInTheDocument();
        });

        it("should handle site monitoring start", () => {
            const handleStartSiteMonitoring = vi
                .fn()
                .mockResolvedValue(undefined);
            renderSiteDetailsNavigation({
                handleStartSiteMonitoring,
            });

            fireEvent.click(screen.getByTestId("start-site-monitoring"));

            expect(handleStartSiteMonitoring).toHaveBeenCalled();
        });

        it("should handle site monitoring stop", () => {
            const handleStopSiteMonitoring = vi
                .fn()
                .mockResolvedValue(undefined);
            renderSiteDetailsNavigation({
                handleStopSiteMonitoring,
            });

            fireEvent.click(screen.getByTestId("stop-site-monitoring"));

            expect(handleStopSiteMonitoring).toHaveBeenCalled();
        });
    });
});
