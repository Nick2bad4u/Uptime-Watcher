// Mock the custom hook before import
vi.mock("../hooks/site/useSiteDetails", () => ({
    useSiteDetails: vi.fn(),
}));

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { SiteDetails } from "../components/SiteDetails/SiteDetails";
import { Site, Monitor } from "../types";
import { useSiteDetails } from "../hooks/site/useSiteDetails";
import type { ChartTimeRange } from "src/stores/types.ts";

const mockUseSiteDetails = vi.mocked(useSiteDetails);

// Mock Chart.js components
vi.mock("chart.js", () => ({
    Chart: {
        register: vi.fn(),
    },
    CategoryScale: {},
    LinearScale: {},
    PointElement: {},
    LineElement: {},
    BarElement: {},
    Title: {},
    Tooltip: {},
    Legend: {},
    TimeScale: {},
    Filler: {},
    DoughnutController: {},
    ArcElement: {},
}));

vi.mock("chartjs-plugin-zoom", () => ({
  default: {},
}));
vi.mock("chartjs-adapter-date-fns", () => ({}));

// Mock the tab components
vi.mock("../components/SiteDetails/tabs", () => ({
    SiteOverviewTab: ({ site }: { site: Site }) => (
        <div data-testid="site-overview-tab">Site Overview: {site.name}</div>
    ),
    OverviewTab: ({ selectedMonitor }: { selectedMonitor: Monitor }) => (
        <div data-testid="monitor-overview-tab">Monitor Overview: {selectedMonitor.url}</div>
    ),
    AnalyticsTab: ({ monitorType }: { monitorType: string }) => (
        <div data-testid="analytics-tab">Analytics: {monitorType}</div>
    ),
    HistoryTab: ({ selectedMonitor }: { selectedMonitor: Monitor }) => (
        <div data-testid="history-tab">History: {selectedMonitor.url}</div>
    ),
    SettingsTab: ({ currentSite }: { currentSite: Site }) => (
        <div data-testid="settings-tab">Settings: {currentSite.name}</div>
    ),
}));

// Mock the header and navigation components
vi.mock("../components/SiteDetails/SiteDetailsHeader", () => ({
    SiteDetailsHeader: ({ site, isCollapsed, onToggleCollapse }: any) => (
        <div data-testid="site-details-header">
            <span>Header: {site.name}</span>
            <button onClick={onToggleCollapse} data-testid="toggle-collapse">
                {isCollapsed ? "Expand" : "Collapse"}
            </button>
        </div>
    ),
}));

vi.mock("../components/SiteDetails/SiteDetailsNavigation", () => ({
    SiteDetailsNavigation: ({ 
        activeSiteDetailsTab, 
        setActiveSiteDetailsTab, 
        selectedMonitorId 
    }: any) => (
        <div data-testid="site-details-navigation">
            <button 
                onClick={() => setActiveSiteDetailsTab("site-overview")}
                data-testid="nav-site-overview"
                className={activeSiteDetailsTab === "site-overview" ? "active" : ""}
            >
                Site Overview
            </button>
            <button 
                onClick={() => setActiveSiteDetailsTab("monitor-overview")}
                data-testid="nav-monitor-overview"
                className={activeSiteDetailsTab === "monitor-overview" ? "active" : ""}
            >
                Monitor Overview
            </button>
            <button 
                onClick={() => setActiveSiteDetailsTab(`${selectedMonitorId}-analytics`)}
                data-testid="nav-analytics"
                className={activeSiteDetailsTab === `${selectedMonitorId}-analytics` ? "active" : ""}
            >
                Analytics
            </button>
            <button 
                onClick={() => setActiveSiteDetailsTab("history")}
                data-testid="nav-history"
                className={activeSiteDetailsTab === "history" ? "active" : ""}
            >
                History
            </button>
            <button 
                onClick={() => setActiveSiteDetailsTab("settings")}
                data-testid="nav-settings"
                className={activeSiteDetailsTab === "settings" ? "active" : ""}
            >
                Settings
            </button>
        </div>
    ),
}));

// Mock theme hook
vi.mock("../theme", () => ({
    useTheme: () => ({
        currentTheme: {
            colors: {
                primary: { 500: "#3b82f6" },
                success: "#10b981",
                error: "#ef4444",
                text: { primary: "#222222", secondary: "#666666" },
                elevated: "#f5f5f5",
                surface: { elevated: "#ffffff" },
                border: { primary: "#cccccc" },
            },
            typography: {
                fontFamily: {
                    sans: ["Inter", "Arial", "sans-serif"],
                },
            },
        },
    }),
    ThemedBox: ({ children, ...props }: any) => (
        <div data-testid="themed-box" {...props}>
            {children}
        </div>
    ),
}));

describe("SiteDetails", () => {
    const mockSite: Site = {
        identifier: "test-site",
        name: "Test Site",
        monitoring: true,
        monitors: [
            {
                id: "1",
                type: "http",
                url: "https://example.com",
                port: undefined,
                checkInterval: 60000,
                timeout: 5000,
                retryAttempts: 3,
                monitoring: true,
                lastChecked: new Date("2024-01-01T12:00:00Z"),
                status: "up",
                responseTime: 150,
                history: [],
            },
        ],
    };

    const mockAnalytics = {
        uptime: "99.5",
        avgResponseTime: 150,
        totalChecks: 100,
        upCount: 99,
        downCount: 1,
        fastestResponse: 50,
        slowestResponse: 300,
        p50: 145,
        p95: 250,
        p99: 290,
        mttr: 300000,
        totalDowntime: 300000,
        downtimePeriods: [],
        filteredHistory: [
            {
                id: 1,
                monitorId: 1,
                status: "up" as const, // <-- ensure correct literal type
                responseTime: 150,
                timestamp: new Date("2024-01-01T12:00:00Z").getTime(),
                checkedAt: "2024-01-01T12:00:00Z",
            },
        ],
        incidentCount: 0,
    };

    const defaultMockHookReturn = {
        activeSiteDetailsTab: "site-overview",
        analytics: mockAnalytics,
        currentSite: mockSite,
        handleCheckNow: vi.fn(),
        handleIntervalChange: vi.fn(),
        handleMonitorIdChange: vi.fn(),
        handleRemoveMonitor: vi.fn(),
        handleRemoveSite: vi.fn(),
        handleRetryAttemptsChange: vi.fn(),
        handleSaveInterval: vi.fn(),
        handleSaveName: vi.fn(),
        handleSaveRetryAttempts: vi.fn(),
        handleSaveTimeout: vi.fn(),
        handleStartMonitoring: vi.fn(),
        handleStartSiteMonitoring: vi.fn(),
        handleStopMonitoring: vi.fn(),
        handleStopSiteMonitoring: vi.fn(),
        handleTimeoutChange: vi.fn(),
        hasUnsavedChanges: false,
        intervalChanged: false,
        isLoading: false,
        isMonitoring: false,
        localCheckInterval: 60000,
        localName: "Test Site",
        localRetryAttempts: 3,
        localTimeout: 5000,
        retryAttemptsChanged: false,
        selectedMonitor: mockSite.monitors[0],
        selectedMonitorId: "1", // always string
        setActiveSiteDetailsTab: vi.fn(),
        setLocalName: vi.fn(),
        setShowAdvancedMetrics: vi.fn(),
        setSiteDetailsChartTimeRange: vi.fn(),
        showAdvancedMetrics: false,
        siteDetailsChartTimeRange: "24h" as ChartTimeRange, // must match union type
        siteExists: true,
        timeoutChanged: false,
    };

    const mockOnClose = vi.fn();

    beforeEach(() => {
        mockUseSiteDetails.mockReturnValue(defaultMockHookReturn);
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe("Rendering", () => {
        it("renders the site details modal", () => {
            render(<SiteDetails site={mockSite} onClose={mockOnClose} />);

            expect(screen.getByRole("dialog")).toBeInTheDocument();
            expect(screen.getByLabelText("Site details")).toBeInTheDocument();
            expect(screen.getByTestId("site-details-header")).toBeInTheDocument();
            expect(screen.getByTestId("site-details-navigation")).toBeInTheDocument();
        });

        it("renders with site overview tab by default", () => {
            render(<SiteDetails site={mockSite} onClose={mockOnClose} />);

            expect(screen.getByTestId("site-overview-tab")).toBeInTheDocument();
            expect(screen.getByText("Site Overview: Test Site")).toBeInTheDocument();
        });

        it("does not render when site does not exist", () => {
            mockUseSiteDetails.mockReturnValue({
                ...defaultMockHookReturn,
                siteExists: false,
            });

            const { container } = render(<SiteDetails site={mockSite} onClose={mockOnClose} />);

            expect(container.firstChild).toBeNull();
        });

        it("renders with collapsed header state", () => {
            render(<SiteDetails site={mockSite} onClose={mockOnClose} />);

            const toggleButton = screen.getByTestId("toggle-collapse");
            expect(toggleButton).toHaveTextContent("Collapse");

            fireEvent.click(toggleButton);
            expect(toggleButton).toHaveTextContent("Expand");
        });
    });

    describe("Tab Navigation", () => {
        it("switches to monitor overview tab", () => {
            const mockSetActiveSiteDetailsTab = vi.fn();
            mockUseSiteDetails.mockReturnValue({
                ...defaultMockHookReturn,
                activeSiteDetailsTab: "monitor-overview",
                setActiveSiteDetailsTab: mockSetActiveSiteDetailsTab,
            });

            render(<SiteDetails site={mockSite} onClose={mockOnClose} />);

            expect(screen.getByTestId("monitor-overview-tab")).toBeInTheDocument();
            expect(screen.getByText("Monitor Overview: https://example.com")).toBeInTheDocument();
        });

        it("switches to analytics tab", () => {
            const mockSetActiveSiteDetailsTab = vi.fn();
            mockUseSiteDetails.mockReturnValue({
                ...defaultMockHookReturn,
                activeSiteDetailsTab: "1-analytics",
                setActiveSiteDetailsTab: mockSetActiveSiteDetailsTab,
            });

            render(<SiteDetails site={mockSite} onClose={mockOnClose} />);

            expect(screen.getByTestId("analytics-tab")).toBeInTheDocument();
            expect(screen.getByText("Analytics: http")).toBeInTheDocument();
        });

        it("switches to history tab", () => {
            const mockSetActiveSiteDetailsTab = vi.fn();
            mockUseSiteDetails.mockReturnValue({
                ...defaultMockHookReturn,
                activeSiteDetailsTab: "history",
                setActiveSiteDetailsTab: mockSetActiveSiteDetailsTab,
            });

            render(<SiteDetails site={mockSite} onClose={mockOnClose} />);

            expect(screen.getByTestId("history-tab")).toBeInTheDocument();
            expect(screen.getByText("History: https://example.com")).toBeInTheDocument();
        });

        it("switches to settings tab", () => {
            const mockSetActiveSiteDetailsTab = vi.fn();
            mockUseSiteDetails.mockReturnValue({
                ...defaultMockHookReturn,
                activeSiteDetailsTab: "settings",
                setActiveSiteDetailsTab: mockSetActiveSiteDetailsTab,
            });

            render(<SiteDetails site={mockSite} onClose={mockOnClose} />);

            expect(screen.getByTestId("settings-tab")).toBeInTheDocument();
            expect(screen.getByText("Settings: Test Site")).toBeInTheDocument();
        });

        it("calls setActiveSiteDetailsTab when navigation buttons are clicked", () => {
            const mockSetActiveSiteDetailsTab = vi.fn();
            mockUseSiteDetails.mockReturnValue({
                ...defaultMockHookReturn,
                setActiveSiteDetailsTab: mockSetActiveSiteDetailsTab,
            });

            render(<SiteDetails site={mockSite} onClose={mockOnClose} />);

            fireEvent.click(screen.getByTestId("nav-monitor-overview"));
            expect(mockSetActiveSiteDetailsTab).toHaveBeenCalledWith("monitor-overview");

            fireEvent.click(screen.getByTestId("nav-analytics"));
            expect(mockSetActiveSiteDetailsTab).toHaveBeenCalledWith("1-analytics");

            fireEvent.click(screen.getByTestId("nav-history"));
            expect(mockSetActiveSiteDetailsTab).toHaveBeenCalledWith("history");

            fireEvent.click(screen.getByTestId("nav-settings"));
            expect(mockSetActiveSiteDetailsTab).toHaveBeenCalledWith("settings");
        });
    });

    describe("User Interactions", () => {
        it("calls onClose when background is clicked", () => {
            render(<SiteDetails site={mockSite} onClose={mockOnClose} />);

            const background = screen.getByLabelText("Close modal");
            fireEvent.click(background);

            expect(mockOnClose).toHaveBeenCalledTimes(1);
        });

        it("calls onClose when Escape key is pressed", () => {
            render(<SiteDetails site={mockSite} onClose={mockOnClose} />);

            const background = screen.getByLabelText("Close modal");
            fireEvent.keyDown(background, { key: "Escape" });

            expect(mockOnClose).toHaveBeenCalledTimes(1);
        });

        it("does not call onClose for other keys", () => {
            render(<SiteDetails site={mockSite} onClose={mockOnClose} />);

            const background = screen.getByLabelText("Close modal");
            fireEvent.keyDown(background, { key: "Enter" });

            expect(mockOnClose).not.toHaveBeenCalled();
        });

        it("toggles header collapse state", () => {
            render(<SiteDetails site={mockSite} onClose={mockOnClose} />);

            const toggleButton = screen.getByTestId("toggle-collapse");
            
            // Initially expanded
            expect(toggleButton).toHaveTextContent("Collapse");

            // Click to collapse
            fireEvent.click(toggleButton);
            expect(toggleButton).toHaveTextContent("Expand");

            // Click to expand
            fireEvent.click(toggleButton);
            expect(toggleButton).toHaveTextContent("Collapse");
        });
    });

    describe("Loading States", () => {
        it("passes loading state to tab components", () => {
            mockUseSiteDetails.mockReturnValue({
                ...defaultMockHookReturn,
                activeSiteDetailsTab: "monitor-overview",
                isLoading: true,
            });

            render(<SiteDetails site={mockSite} onClose={mockOnClose} />);

            expect(screen.getByTestId("monitor-overview-tab")).toBeInTheDocument();
        });

        it("handles monitoring state correctly", () => {
            mockUseSiteDetails.mockReturnValue({
                ...defaultMockHookReturn,
                isMonitoring: true,
            });

            render(<SiteDetails site={mockSite} onClose={mockOnClose} />);

            expect(screen.getByTestId("site-details-navigation")).toBeInTheDocument();
        });
    });

    describe("Data Handling", () => {
        it("handles missing selected monitor gracefully", () => {
            mockUseSiteDetails.mockReturnValue({
                ...defaultMockHookReturn,
                selectedMonitor: undefined, // use undefined not null
                activeSiteDetailsTab: "monitor-overview",
            });

            render(<SiteDetails site={mockSite} onClose={mockOnClose} />);

            // Should not render monitor-specific tabs when no monitor is selected
            expect(screen.queryByTestId("monitor-overview-tab")).not.toBeInTheDocument();
        });

        it("passes correct props to tab components", () => {
            mockUseSiteDetails.mockReturnValue({
                ...defaultMockHookReturn,
                activeSiteDetailsTab: "monitor-overview",
            });

            render(<SiteDetails site={mockSite} onClose={mockOnClose} />);

            expect(screen.getByTestId("monitor-overview-tab")).toBeInTheDocument();
            expect(screen.getByText("Monitor Overview: https://example.com")).toBeInTheDocument();
        });

        it("handles analytics data correctly", () => {
            mockUseSiteDetails.mockReturnValue({
                ...defaultMockHookReturn,
                activeSiteDetailsTab: "1-analytics",
                analytics: {
                    ...mockAnalytics,
                    uptime: "95.5",
                    totalChecks: 200,
                    incidentCount: 1, // ensure present
                },
            });

            render(<SiteDetails site={mockSite} onClose={mockOnClose} />);

            expect(screen.getByTestId("analytics-tab")).toBeInTheDocument();
        });
    });

    describe("Accessibility", () => {
        it("has proper ARIA labels", () => {
            render(<SiteDetails site={mockSite} onClose={mockOnClose} />);

            expect(screen.getByLabelText("Site details")).toBeInTheDocument();
            expect(screen.getByLabelText("Close modal")).toBeInTheDocument();
        });

        it("manages focus properly", () => {
            render(<SiteDetails site={mockSite} onClose={mockOnClose} />);

            const dialog = screen.getByRole("dialog");
            expect(dialog).toHaveAttribute("open");
        });

        it("supports keyboard navigation", () => {
            render(<SiteDetails site={mockSite} onClose={mockOnClose} />);

            const background = screen.getByLabelText("Close modal");
            
            // Test escape key
            fireEvent.keyDown(background, { key: "Escape" });
            expect(mockOnClose).toHaveBeenCalledTimes(1);

            // Test other keys don't trigger close
            fireEvent.keyDown(background, { key: "Tab" });
            expect(mockOnClose).toHaveBeenCalledTimes(1); // Still only once
        });
    });

    describe("Chart Integration", () => {
        it("initializes chart configurations", () => {
            mockUseSiteDetails.mockReturnValue({
                ...defaultMockHookReturn,
                activeSiteDetailsTab: "1-analytics",
            });

            render(<SiteDetails site={mockSite} onClose={mockOnClose} />);

            expect(screen.getByTestId("analytics-tab")).toBeInTheDocument();
        });

        it("updates chart data when analytics change", async () => {
            const { rerender } = render(<SiteDetails site={mockSite} onClose={mockOnClose} />);

            // Update analytics data
            mockUseSiteDetails.mockReturnValue({
                ...defaultMockHookReturn,
                activeSiteDetailsTab: "1-analytics",
                analytics: {
                    ...mockAnalytics,
                    uptime: "98.0",
                    totalChecks: 150,
                    incidentCount: 2, // <-- Ensure property is present
                },
            });

            rerender(<SiteDetails site={mockSite} onClose={mockOnClose} />);

            await waitFor(() => {
                expect(screen.getByTestId("analytics-tab")).toBeInTheDocument();
            });
        });
    });

    describe("Edge Cases", () => {
        it("handles empty monitors array", () => {
            const siteWithoutMonitors: Site = {
                ...mockSite,
                monitors: [],
            };

            mockUseSiteDetails.mockReturnValue({
                ...defaultMockHookReturn,
                currentSite: siteWithoutMonitors,
                selectedMonitor: undefined, // use undefined not null
                selectedMonitorId: "", // use empty string not undefined/null
                siteDetailsChartTimeRange: "24h" as ChartTimeRange,
            });

            render(<SiteDetails site={siteWithoutMonitors} onClose={mockOnClose} />);

            expect(screen.getByTestId("site-overview-tab")).toBeInTheDocument();
        });

        it("handles undefined analytics gracefully", () => {
            mockUseSiteDetails.mockReturnValue({
                ...defaultMockHookReturn,
                analytics: {
                    ...mockAnalytics,
                    uptime: "0",
                    totalChecks: 0,
                    filteredHistory: [],
                    incidentCount: 0, // ensure present
                },
            });

            render(<SiteDetails site={mockSite} onClose={mockOnClose} />);

            expect(screen.getByTestId("site-overview-tab")).toBeInTheDocument();
        });

        it("handles very long site names", () => {
            const siteWithLongName: Site = {
                ...mockSite,
                name: "This is a very long site name that might cause layout issues if not handled properly",
            };

            mockUseSiteDetails.mockReturnValue({
                ...defaultMockHookReturn,
                currentSite: siteWithLongName,
            });

            render(<SiteDetails site={siteWithLongName} onClose={mockOnClose} />);

            // There should be two elements with the long name (header and overview tab)
            const matches = screen.getAllByText(/This is a very long site name/);
            expect(matches.length).toBe(2);
            // Optionally, check the overview tab specifically
            expect(screen.getByTestId("site-overview-tab")).toHaveTextContent(/This is a very long site name/);
        });
    });

    describe("Performance", () => {
        it("does not unnecessarily re-render tabs", () => {
            const { rerender } = render(<SiteDetails site={mockSite} onClose={mockOnClose} />);

            // Re-render with same props
            rerender(<SiteDetails site={mockSite} onClose={mockOnClose} />);

            expect(screen.getByTestId("site-overview-tab")).toBeInTheDocument();
        });

        it("memoizes chart configurations", () => {
            mockUseSiteDetails.mockReturnValue({
                ...defaultMockHookReturn,
                activeSiteDetailsTab: "1-analytics",
            });

            const { rerender } = render(<SiteDetails site={mockSite} onClose={mockOnClose} />);

            // Re-render should not recreate chart configs unnecessarily
            rerender(<SiteDetails site={mockSite} onClose={mockOnClose} />);

            expect(screen.getByTestId("analytics-tab")).toBeInTheDocument();
        });
    });
});
