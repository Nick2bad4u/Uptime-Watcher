import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { SiteDetails } from "../components";
import { Site } from "../types";

// Define mock site data first (before mocks that use it)
const mockSite: Site = {
    identifier: "test-site-1",
    monitors: [
        {
            checkInterval: 300,
            history: [
                {
                    responseTime: 250,
                    status: "up",
                    timestamp: Date.now(),
                },
            ],
            id: "monitor-1",
            lastChecked: new Date("2024-01-01T00:00:00Z"),
            monitoring: true,
            port: 443,
            responseTime: 250,
            retryAttempts: 3,
            status: "up",
            timeout: 5000,
            type: "http",
            url: "https://example.com",
        },
    ],
    name: "Test Site",
    monitoring: false
};

// Mock Chart.js and plugins
vi.mock("chart.js", () => ({
    ArcElement: vi.fn(),
    BarElement: vi.fn(),
    CategoryScale: vi.fn(),
    Chart: {
        register: vi.fn(),
    },
    DoughnutController: vi.fn(),
    Filler: vi.fn(),
    Legend: vi.fn(),
    LinearScale: vi.fn(),
    LineElement: vi.fn(),
    PointElement: vi.fn(),
    TimeScale: vi.fn(),
    Title: vi.fn(),
    Tooltip: vi.fn(),
}));

vi.mock("chartjs-plugin-zoom", () => ({
    default: vi.fn(),
}));

vi.mock("chartjs-adapter-date-fns", () => ({}));

// Mock CSS file
vi.mock("../components/SiteDetails/SiteDetails.css", () => ({}));

// Mock all SiteDetails tab components
vi.mock("../components/SiteDetails/tabs", () => ({
    AnalyticsTab: () => <div data-testid="analytics-tab">Analytics Tab</div>,
    HistoryTab: () => <div data-testid="history-tab">History Tab</div>,
    OverviewTab: () => <div data-testid="overview-tab">Overview Tab</div>,
    SettingsTab: () => <div data-testid="settings-tab">Settings Tab</div>,
    SiteOverviewTab: () => <div data-testid="site-overview-tab">Site Overview Tab</div>,
}));

// Mock SiteDetails sub-components
vi.mock("../components/SiteDetails/SiteDetailsHeader", () => ({
    SiteDetailsHeader: ({ site }: { site: Site | null }) => (
        <div data-testid="site-details-header">
            <h1>{site?.name ?? "Unknown"}</h1>
            <span>Status: {site?.monitors && site.monitors.length > 0 ? site.monitors[0]?.status : "unknown"}</span>
        </div>
    ),
}));

vi.mock("../components/SiteDetails/SiteDetailsNavigation", () => ({
    SiteDetailsNavigation: () => (
        <div data-testid="site-details-navigation">
            <button>Overview</button>
            <button>Analytics</button>
            <button>History</button>
            <button>Settings</button>
        </div>
    ),
}));

// Mock hooks
vi.mock("../hooks/site/useSiteDetails", () => ({
    useSiteDetails: vi.fn((props) => {
        // Use the actual site passed as prop, fallback to mockSite
        const currentSite = props?.site ?? mockSite;
        return {
            // Add all the required properties from useSiteDetails
            activeSiteDetailsTab: "overview",
            analytics: {
                avgResponseTime: 250,
                downCount: 5,
                failedChecks: 5,
                filteredHistory: [
                    { responseTime: 200, status: "up", timestamp: Date.now() - 60000 },
                    { responseTime: 250, status: "up", timestamp: Date.now() - 30000 },
                    { responseTime: 300, status: "up", timestamp: Date.now() },
                ],
                totalChecks: 1000,
                upCount: 995,
                uptime: 99.5,
            },
            currentSite: currentSite,
            error: null,
            // Add all the required handlers
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
            history: [],
            intervalChanged: false,
            isLoading: false,
            isMonitoring: false,
            localCheckInterval: 300,
            localName: currentSite.name ?? "Test Site",
            localRetryAttempts: 3,
            localTimeout: 5000,
            refreshSiteData: vi.fn().mockResolvedValue(undefined),
            retryAttemptsChanged: false,
            selectedMonitor: currentSite.monitors?.[0] ?? mockSite.monitors[0],
            selectedMonitorId: currentSite.monitors?.[0]?.id ?? "monitor-1",
            setActiveSiteDetailsTab: vi.fn(),
            setLocalName: vi.fn(),
            setShowAdvancedMetrics: vi.fn(),
            setSiteDetailsChartTimeRange: vi.fn(),
            showAdvancedMetrics: false,
            site: currentSite,
            siteDetailsChartTimeRange: "24h",
            siteExists: true,
            timeoutChanged: false,
            updateSiteSettings: vi.fn().mockResolvedValue(undefined),
        };
    }),
}));

// Mock theme
vi.mock("../theme/useTheme", () => ({
    useTheme: vi.fn(() => ({
        currentTheme: {
            colors: {
                background: "#ffffff",
                primary: "#0066cc",
                secondary: "#6c757d",
                text: "#333333",
            },
        },
        setTheme: vi.fn(),
    })),
}));

// Mock theme components
vi.mock("../theme/components", () => ({
    ThemedBox: ({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) => (
        <div {...props}>{children}</div>
    ),
}));

// Mock stores
vi.mock("../stores/ui/useUiStore", () => ({
    useUiStore: vi.fn(() => ({
        selectedSiteId: "test-site-1",
        setSelectedSiteId: vi.fn(),
    })),
}));

vi.mock("../stores/sites/useSitesStore", () => ({
    useSitesStore: vi.fn(() => ({
        checkSiteNow: vi.fn().mockResolvedValue(undefined),
        getSiteById: vi.fn(() => mockSite),
        removeSite: vi.fn().mockResolvedValue(undefined),
        sites: [mockSite],
        updateSite: vi.fn().mockResolvedValue(undefined),
    })),
}));

vi.mock("../stores/settings/useSettingsStore", () => ({
    useSettingsStore: vi.fn(() => ({
        historyLimit: 100,
        setHistoryLimit: vi.fn(),
        settings: { historyLimit: 100 },
        theme: "light",
    })),
}));

vi.mock("../stores/error/useErrorStore", () => ({
    useErrorStore: vi.fn(() => ({
        addError: vi.fn(),
    })),
}));

// Mock logger
vi.mock("../services/logger", () => ({
    default: {
        app: {
            error: vi.fn(),
            performance: vi.fn(),
            started: vi.fn(),
            stopped: vi.fn(),
        },
        debug: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
        raw: {
            debug: vi.fn(),
            error: vi.fn(),
            info: vi.fn(),
            warn: vi.fn(),
        },
        silly: vi.fn(),
        site: {
            added: vi.fn(),
            check: vi.fn(),
            error: vi.fn(),
            removed: vi.fn(),
            statusChange: vi.fn(),
        },
        system: {
            notification: vi.fn(),
            tray: vi.fn(),
            window: vi.fn(),
        },
        user: {
            action: vi.fn(),
            settingsChange: vi.fn(),
        },
        verbose: vi.fn(),
        warn: vi.fn(),
    },
}));

// Mock React Chart.js components
vi.mock("react-chartjs-2", () => ({
    Bar: ({ ...props }: Record<string, unknown>) => (
        <div data-testid="bar-chart" {...props}>
            Bar Chart
        </div>
    ),
    Doughnut: ({ ...props }: Record<string, unknown>) => (
        <div data-testid="doughnut-chart" {...props}>
            Doughnut Chart
        </div>
    ),
    Line: ({ ...props }: Record<string, unknown>) => (
        <div data-testid="line-chart" {...props}>
            Line Chart
        </div>
    ),
}));

// Mock services
vi.mock("../services/chartConfig", () => ({
    ChartConfigService: vi.fn().mockImplementation(() => ({
        getBarChartConfig: vi.fn(() => ({ maintainAspectRatio: false, responsive: true })),
        getDoughnutChartConfig: vi.fn(() => ({ maintainAspectRatio: false, responsive: true })),
        getLineChartConfig: vi.fn(() => ({ maintainAspectRatio: false, responsive: true })),
    })),
}));

// Mock utils
vi.mock("../utils/status", () => ({
    formatStatusWithIcon: vi.fn((status: string) => `${status}-icon`),
}));

vi.mock("../utils/time", () => ({
    formatDuration: vi.fn((ms: number) => `${ms / 1000}s`),
    formatFullTimestamp: vi.fn((date: Date) => date.toLocaleDateString()),
    formatResponseTime: vi.fn((time: number) => `${time}ms`),
}));

beforeEach(() => {
    vi.clearAllMocks();
});

describe("SiteDetails Basic Coverage", () => {
    it("should render SiteDetails component with basic props", () => {
        const mockOnClose = vi.fn();
        render(<SiteDetails site={mockSite} onClose={mockOnClose} />);

        expect(screen.getByTestId("site-details-header")).toBeInTheDocument();
        expect(screen.getByText("Test Site")).toBeInTheDocument();
        expect(screen.getByText("Status: up")).toBeInTheDocument();
    });

    it("should render navigation", () => {
        const mockOnClose = vi.fn();
        render(<SiteDetails site={mockSite} onClose={mockOnClose} />);

        expect(screen.getByTestId("site-details-navigation")).toBeInTheDocument();
        expect(screen.getByText("Overview")).toBeInTheDocument();
        expect(screen.getByText("Analytics")).toBeInTheDocument();
        expect(screen.getByText("History")).toBeInTheDocument();
        expect(screen.getByText("Settings")).toBeInTheDocument();
    });

    it("should handle different site statuses", () => {
        const offlineSite: Site = {
            ...mockSite,
            monitors: [
                {
                    history: [],
                    id: "monitor-1",
                    status: "down",
                    type: "http",
                    url: "https://example.com",
                    responseTime: 0,
                    monitoring: false,
                    checkInterval: 0,
                    timeout: 0,
                    retryAttempts: 0
                },
            ],
        };
        const mockOnClose = vi.fn();
        render(<SiteDetails site={offlineSite} onClose={mockOnClose} />);

        expect(screen.getByText("Test Site")).toBeInTheDocument();
        expect(screen.getByTestId("site-details-header")).toBeInTheDocument();
    });

    it("should handle error status", () => {
        const errorSite: Site = {
            ...mockSite,
            monitors: [
                {
                    history: [],
                    id: "monitor-1",
                    status: "pending",
                    type: "http",
                    url: "https://example.com",
                    responseTime: 0,
                    monitoring: false,
                    checkInterval: 0,
                    timeout: 0,
                    retryAttempts: 0
                },
            ],
        };
        const mockOnClose = vi.fn();
        render(<SiteDetails site={errorSite} onClose={mockOnClose} />);

        expect(screen.getByText("Test Site")).toBeInTheDocument();
        expect(screen.getByTestId("site-details-header")).toBeInTheDocument();
    });

    it("should handle unknown status", () => {
        const unknownSite = { ...mockSite, monitors: [] };
        const mockOnClose = vi.fn();
        render(<SiteDetails site={unknownSite} onClose={mockOnClose} />);

        expect(screen.getByText("Test Site")).toBeInTheDocument();
        expect(screen.getByTestId("site-details-header")).toBeInTheDocument();
    });

    it("should handle sites without monitors", () => {
        const siteWithoutMonitors = { ...mockSite, monitors: [] };
        const mockOnClose = vi.fn();
        render(<SiteDetails site={siteWithoutMonitors} onClose={mockOnClose} />);

        expect(screen.getByText("Test Site")).toBeInTheDocument();
    });

    it("should handle sites with multiple monitors", () => {
        const siteWithMultipleMonitors: Site = {
            ...mockSite,
            monitors: [
                ...mockSite.monitors,
                {
                    history: [],
                    host: "example.com",
                    id: "monitor-2",
                    port: 80,
                    status: "down",
                    type: "port",
                    responseTime: 0,
                    monitoring: false,
                    checkInterval: 0,
                    timeout: 0,
                    retryAttempts: 0
                },
            ],
        };
        const mockOnClose = vi.fn();
        render(<SiteDetails site={siteWithMultipleMonitors} onClose={mockOnClose} />);

        expect(screen.getByText("Test Site")).toBeInTheDocument();
    });

    it("should handle sites with special characters in name", () => {
        const specialSite: Site = { ...mockSite, name: "Test Site! @#$%^&*()" };
        const mockOnClose = vi.fn();
        render(<SiteDetails site={specialSite} onClose={mockOnClose} />);

        expect(screen.getByText("Test Site! @#$%^&*()")).toBeInTheDocument();
    });

    it("should handle sites with long URLs", () => {
        const longUrlSite: Site = {
            ...mockSite,
            monitors: [
                {
                    history: [],
                    id: "monitor-1",
                    status: "up",
                    type: "http",
                    url: "https://very-long-url-that-should-be-handled-properly.example.com/path/to/resource",
                    responseTime: 0,
                    monitoring: false,
                    checkInterval: 0,
                    timeout: 0,
                    retryAttempts: 0
                },
            ],
        };
        const mockOnClose = vi.fn();
        render(<SiteDetails site={longUrlSite} onClose={mockOnClose} />);

        expect(screen.getByText("Test Site")).toBeInTheDocument();
    });

    it("should handle future dates", () => {
        const futureSite: Site = {
            ...mockSite,
            monitors: [
                {
                    history: [],
                    id: "monitor-1",
                    lastChecked: new Date("2030-01-01T00:00:00Z"),
                    status: "up",
                    type: "http",
                    url: "https://example.com",
                    responseTime: 0,
                    monitoring: false,
                    checkInterval: 0,
                    timeout: 0,
                    retryAttempts: 0
                },
            ],
        };
        const mockOnClose = vi.fn();
        render(<SiteDetails site={futureSite} onClose={mockOnClose} />);

        expect(screen.getByText("Test Site")).toBeInTheDocument();
    });

    it("should handle null/undefined fields gracefully", () => {
        const incompleteSite: Site = {
            identifier: "test-site-2",
            monitors: [],
            name: "Incomplete Site",
            monitoring: false
        };
        const mockOnClose = vi.fn();
        render(<SiteDetails site={incompleteSite} onClose={mockOnClose} />);

        expect(screen.getByText("Incomplete Site")).toBeInTheDocument();
    });
});
