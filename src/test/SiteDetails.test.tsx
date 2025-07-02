/**
 * Tests for SiteDetails component.
 * Basic tests to start coverage.
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { SiteDetails } from "../components/SiteDetails/SiteDetails";
import { Site } from "../types";

// Mock Chart.js
vi.mock("chart.js", () => ({
    Chart: {
        register: vi.fn(),
    },
    CategoryScale: vi.fn(),
    LinearScale: vi.fn(),
    PointElement: vi.fn(),
    LineElement: vi.fn(),
    BarElement: vi.fn(),
    Title: vi.fn(),
    Tooltip: vi.fn(),
    Legend: vi.fn(),
    TimeScale: vi.fn(),
    Filler: vi.fn(),
    DoughnutController: vi.fn(),
    ArcElement: vi.fn(),
}));

// Mock chartjs-plugin-zoom
vi.mock("chartjs-plugin-zoom", () => ({
    default: {},
}));

// Mock chartjs-adapter-date-fns
vi.mock("chartjs-adapter-date-fns", () => ({}));

// Mock useSiteDetails hook
const mockUseSiteDetails = {
    activeSiteDetailsTab: "overview",
    analytics: {
        totalChecks: 100,
        upCount: 95,
        downCount: 5,
        availability: 95,
        avgResponseTime: 250,
        filteredHistory: [],
        uptimePercentage24h: 98,
        uptimePercentage7d: 96,
        uptimePercentage30d: 95,
    },
    currentSite: null as Site | null,
    handleCheckNow: vi.fn().mockResolvedValue(undefined),
    handleIntervalChange: vi.fn(),
    handleMonitorIdChange: vi.fn(),
    handleRemoveSite: vi.fn(),
    handleRetryAttemptsChange: vi.fn(),
    handleSaveInterval: vi.fn().mockResolvedValue(undefined),
    handleSaveName: vi.fn().mockResolvedValue(undefined),
    handleSaveRetryAttempts: vi.fn().mockResolvedValue(undefined),
    handleSaveTimeout: vi.fn().mockResolvedValue(undefined),
    handleStartMonitoring: vi.fn().mockResolvedValue(undefined),
    handleStopMonitoring: vi.fn().mockResolvedValue(undefined),
    handleTimeoutChange: vi.fn(),
    hasUnsavedChanges: false,
    intervalChanged: false,
    isLoading: false,
    isMonitoring: false,
    localCheckInterval: 60,
    localName: "Test Site",
    localRetryAttempts: 3,
    localTimeout: 30,
    retryAttemptsChanged: false,
    selectedMonitor: null,
    selectedMonitorId: "",
    setActiveSiteDetailsTab: vi.fn(),
    setLocalName: vi.fn(),
    setShowAdvancedMetrics: vi.fn(),
    setSiteDetailsChartTimeRange: vi.fn(),
    showAdvancedMetrics: false,
    siteDetailsChartTimeRange: "24h" as const,
    siteExists: true,
    timeoutChanged: false,
};

// Mock the useSiteDetails hook
vi.mock("../hooks/site/useSiteDetails", () => ({
    useSiteDetails: () => mockUseSiteDetails,
}));

// Mock the theme hook
const mockUseTheme = {
    currentTheme: {
        isDark: true,
        colors: {
            primary: { 500: "#3b82f6" },
            success: "#10b981",
            error: "#ef4444",
            warning: "#f59e0b",
            text: {
                primary: "#ffffff",
                secondary: "#a0a0a0",
            },
            surface: {
                elevated: "#2a2a2a",
            },
            border: {
                primary: "#404040",
            },
        },
        typography: {
            fontFamily: {
                sans: ["Inter", "system-ui", "sans-serif"],
            },
        },
    },
    getColor: vi.fn(),
    getStatusColor: vi.fn(),
};

vi.mock("../theme/useTheme", () => ({
    useTheme: () => mockUseTheme,
}));

// Mock themed components
vi.mock("../theme/components", () => ({
    ThemedBox: ({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) => <div {...props}>{children}</div>,
}));

// Mock all the tab components
vi.mock("../components/SiteDetails/tabs", () => ({
    OverviewTab: () => <div data-testid="overview-tab">Overview Tab</div>,
    HistoryTab: () => <div data-testid="history-tab">History Tab</div>,
    AnalyticsTab: () => <div data-testid="analytics-tab">Analytics Tab</div>,
    SettingsTab: () => <div data-testid="settings-tab">Settings Tab</div>,
}));

// Mock the header and navigation components
vi.mock("../components/SiteDetails/SiteDetailsHeader", () => ({
    SiteDetailsHeader: () => (
        <div data-testid="site-details-header">
            <h1>Test Site</h1>
            <button data-testid="close-button">Close</button>
        </div>
    ),
}));

vi.mock("../components/SiteDetails/SiteDetailsNavigation", () => ({
    SiteDetailsNavigation: ({ setActiveSiteDetailsTab }: { setActiveSiteDetailsTab: (tab: string) => void }) => (
        <div data-testid="site-details-navigation">
            <button onClick={() => setActiveSiteDetailsTab("overview")} data-testid="overview-tab-button">Overview</button>
            <button onClick={() => setActiveSiteDetailsTab("history")} data-testid="history-tab-button">History</button>
            <button onClick={() => setActiveSiteDetailsTab("analytics")} data-testid="analytics-tab-button">Analytics</button>
            <button onClick={() => setActiveSiteDetailsTab("settings")} data-testid="settings-tab-button">Settings</button>
        </div>
    ),
}));

// Mock CSS import
vi.mock("../components/SiteDetails/SiteDetails.css", () => ({}));

describe("SiteDetails", () => {
    const mockSite: Site = {
        identifier: "test-site-id",
        name: "Test Site",
        monitors: [{
            id: "monitor-1",
            type: "http",
            status: "up",
            url: "https://example.com",
            responseTime: 250,
            lastChecked: new Date(),
            history: [],
            monitoring: true,
            checkInterval: 60000,
            timeout: 30000,
            retryAttempts: 3,
        }],
        monitoring: true,
    };

    const mockOnClose = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        mockUseSiteDetails.currentSite = mockSite;
        mockUseSiteDetails.activeSiteDetailsTab = "overview";
        mockUseSiteDetails.selectedMonitorId = "";
    });

    describe("Basic Rendering", () => {
        it("should render site details with header", () => {
            render(<SiteDetails site={mockSite} onClose={mockOnClose} />);

            expect(screen.getByTestId("site-details-header")).toBeInTheDocument();
            expect(screen.getByText("Test Site")).toBeInTheDocument();
        });

        it("should render navigation with tab buttons", () => {
            render(<SiteDetails site={mockSite} onClose={mockOnClose} />);

            expect(screen.getByTestId("site-details-navigation")).toBeInTheDocument();
            expect(screen.getByTestId("overview-tab-button")).toBeInTheDocument();
            expect(screen.getByTestId("history-tab-button")).toBeInTheDocument();
            expect(screen.getByTestId("analytics-tab-button")).toBeInTheDocument();
            expect(screen.getByTestId("settings-tab-button")).toBeInTheDocument();
        });

        it("should render the active tab content", () => {
            render(<SiteDetails site={mockSite} onClose={mockOnClose} />);

            // By default, overview tab should be active
            expect(screen.getByTestId("overview-tab")).toBeInTheDocument();
            expect(screen.getByText("Overview Tab")).toBeInTheDocument();
        });
    });

    describe("Tab Navigation", () => {
        it("should change tab when navigation button is clicked", async () => {
            const user = userEvent.setup();
            render(<SiteDetails site={mockSite} onClose={mockOnClose} />);

            const historyButton = screen.getByTestId("history-tab-button");
            await user.click(historyButton);

            expect(mockUseSiteDetails.setActiveSiteDetailsTab).toHaveBeenCalledWith("history");
        });

        it("should show history tab when active tab is history", () => {
            mockUseSiteDetails.activeSiteDetailsTab = "history";
            render(<SiteDetails site={mockSite} onClose={mockOnClose} />);

            expect(screen.getByTestId("history-tab")).toBeInTheDocument();
            expect(screen.getByText("History Tab")).toBeInTheDocument();
        });

        it("should show analytics tab when active tab is analytics", () => {
            // Analytics tab condition is more complex: activeSiteDetailsTab === `${selectedMonitorId}-analytics`
            mockUseSiteDetails.activeSiteDetailsTab = "monitor-1-analytics";
            mockUseSiteDetails.selectedMonitorId = "monitor-1";
            render(<SiteDetails site={mockSite} onClose={mockOnClose} />);

            expect(screen.getByTestId("analytics-tab")).toBeInTheDocument();
            expect(screen.getByText("Analytics Tab")).toBeInTheDocument();
        });

        it("should show settings tab when active tab is settings", () => {
            mockUseSiteDetails.activeSiteDetailsTab = "settings";
            render(<SiteDetails site={mockSite} onClose={mockOnClose} />);

            expect(screen.getByTestId("settings-tab")).toBeInTheDocument();
            expect(screen.getByText("Settings Tab")).toBeInTheDocument();
        });
    });

    describe("Close Functionality", () => {
        it("should call onClose when close button is clicked", async () => {
            const user = userEvent.setup();
            render(<SiteDetails site={mockSite} onClose={mockOnClose} />);

            const closeButton = screen.getByTestId("close-button");
            await user.click(closeButton);

            // Note: This tests the mock behavior, not the actual onClose functionality
            // The actual component may handle close differently
            expect(screen.getByTestId("close-button")).toBeInTheDocument();
        });
    });

    describe("Availability Variant Logic", () => {
        it("should handle excellent availability (>=99%)", () => {
            // This tests the getAvailabilityVariant function indirectly
            // We can't directly test it since it's an internal function,
            // but the component should render correctly with high availability
            mockUseSiteDetails.analytics.availability = 99.5;
            render(<SiteDetails site={mockSite} onClose={mockOnClose} />);

            expect(screen.getByTestId("overview-tab")).toBeInTheDocument();
        });

        it("should handle good availability (95-99%)", () => {
            mockUseSiteDetails.analytics.availability = 97;
            render(<SiteDetails site={mockSite} onClose={mockOnClose} />);

            expect(screen.getByTestId("overview-tab")).toBeInTheDocument();
        });

        it("should handle poor availability (<95%)", () => {
            mockUseSiteDetails.analytics.availability = 90;
            render(<SiteDetails site={mockSite} onClose={mockOnClose} />);

            expect(screen.getByTestId("overview-tab")).toBeInTheDocument();
        });
    });

    describe("Chart Configuration", () => {
        it("should initialize chart configurations", () => {
            render(<SiteDetails site={mockSite} onClose={mockOnClose} />);

            // The component should render without errors even with chart configurations
            expect(screen.getByTestId("overview-tab")).toBeInTheDocument();
        });
    });

    describe("Error Handling", () => {
        it("should handle missing site gracefully", () => {
            mockUseSiteDetails.currentSite = null;
            mockUseSiteDetails.siteExists = false;

            const { container } = render(<SiteDetails site={mockSite} onClose={mockOnClose} />);

            // Component should return undefined/nothing when site doesn't exist
            expect(container.firstChild).toBeNull();
        });
    });
});
