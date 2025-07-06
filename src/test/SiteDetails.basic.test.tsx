import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { SiteDetails } from "../components/SiteDetails/SiteDetails";
import { Site } from "../types";

// Define mock site data first (before mocks that use it)
const mockSite: Site = {
  identifier: "test-site-1",
  name: "Test Site",
  monitors: [
    {
      id: "monitor-1",
      type: "http",
      status: "up",
      url: "https://example.com",
      port: 443,
      responseTime: 250,
      lastChecked: new Date("2024-01-01T00:00:00Z"),
      history: [
        {
          timestamp: Date.now(),
          status: "up",
          responseTime: 250,
        },
      ],
      monitoring: true,
      checkInterval: 300,
      timeout: 5000,
      retryAttempts: 3,
    },
  ],
};

// Mock Chart.js and plugins
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
      <h1>{site?.name ?? 'Unknown'}</h1>
      <span>Status: {site?.monitors && site.monitors.length > 0 ? site.monitors[0]?.status : 'unknown'}</span>
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
      site: currentSite,
      siteExists: true,
      isLoading: false,
      error: null,
      history: [],
      analytics: {
        avgResponseTime: 250,
        uptime: 99.5,
        totalChecks: 1000,
        failedChecks: 5,
        upCount: 995,
        downCount: 5,
        filteredHistory: [
          { responseTime: 200, timestamp: Date.now() - 60000, status: "up" },
          { responseTime: 250, timestamp: Date.now() - 30000, status: "up" },
          { responseTime: 300, timestamp: Date.now(), status: "up" },
        ],
      },
      refreshSiteData: vi.fn().mockResolvedValue(undefined),
      updateSiteSettings: vi.fn().mockResolvedValue(undefined),
      // Add all the required properties from useSiteDetails
      activeSiteDetailsTab: "overview",
      currentSite: currentSite,
      selectedMonitor: currentSite.monitors?.[0] ?? mockSite.monitors[0],
      selectedMonitorId: currentSite.monitors?.[0]?.id ?? "monitor-1",
      localName: currentSite.name ?? "Test Site",
      localCheckInterval: 300,
      localTimeout: 5000,
      localRetryAttempts: 3,
      hasUnsavedChanges: false,
      intervalChanged: false,
      timeoutChanged: false,
      retryAttemptsChanged: false,
      isMonitoring: false,
      showAdvancedMetrics: false,
      siteDetailsChartTimeRange: "24h",
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
      setActiveSiteDetailsTab: vi.fn(),
      setLocalName: vi.fn(),
      setShowAdvancedMetrics: vi.fn(),
      setSiteDetailsChartTimeRange: vi.fn(),
    };
  }),
}));

// Mock theme
vi.mock("../theme/useTheme", () => ({
  useTheme: vi.fn(() => ({
    currentTheme: {
      colors: {
        primary: "#0066cc",
        secondary: "#6c757d",
        background: "#ffffff",
        text: "#333333",
      },
    },
    setTheme: vi.fn(),
  })),
}));

// Mock theme components
vi.mock("../theme/components", () => ({
  ThemedBox: ({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) => <div {...props}>{children}</div>,
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
    sites: [mockSite],
    getSiteById: vi.fn(() => mockSite),
    updateSite: vi.fn().mockResolvedValue(undefined),
    removeSite: vi.fn().mockResolvedValue(undefined),
    checkSiteNow: vi.fn().mockResolvedValue(undefined),
  })),
}));

vi.mock("../stores/settings/useSettingsStore", () => ({
  useSettingsStore: vi.fn(() => ({
    historyLimit: 100,
    theme: "light",
    setHistoryLimit: vi.fn(),
    settings: { historyLimit: 100 },
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
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
    app: {
      error: vi.fn(),
      performance: vi.fn(),
      started: vi.fn(),
      stopped: vi.fn(),
    },
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
    silly: vi.fn(),
    raw: {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    },
  },
}));

// Mock React Chart.js components
vi.mock("react-chartjs-2", () => ({
  Line: ({ ...props }: Record<string, unknown>) => <div data-testid="line-chart" {...props}>Line Chart</div>,
  Bar: ({ ...props }: Record<string, unknown>) => <div data-testid="bar-chart" {...props}>Bar Chart</div>,
  Doughnut: ({ ...props }: Record<string, unknown>) => <div data-testid="doughnut-chart" {...props}>Doughnut Chart</div>,
}));

// Mock services
vi.mock("../services/chartConfig", () => ({
  ChartConfigService: vi.fn().mockImplementation(() => ({
    getLineChartConfig: vi.fn(() => ({ responsive: true, maintainAspectRatio: false })),
    getDoughnutChartConfig: vi.fn(() => ({ responsive: true, maintainAspectRatio: false })),
    getBarChartConfig: vi.fn(() => ({ responsive: true, maintainAspectRatio: false })),
  })),
}));

// Mock utils
vi.mock("../utils/status", () => ({
  formatStatusWithIcon: vi.fn((status: string) => `${status}-icon`),
}));

vi.mock("../utils/time", () => ({
  formatResponseTime: vi.fn((time: number) => `${time}ms`),
  formatFullTimestamp: vi.fn((date: Date) => date.toLocaleDateString()),
  formatDuration: vi.fn((ms: number) => `${ms / 1000}s`),
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
      monitors: [{
        id: "monitor-1",
        type: "http",
        status: "down",
        url: "https://example.com",
        history: [],
      }]
    };
    const mockOnClose = vi.fn();
    render(<SiteDetails site={offlineSite} onClose={mockOnClose} />);
    
    expect(screen.getByText("Test Site")).toBeInTheDocument();
    expect(screen.getByTestId("site-details-header")).toBeInTheDocument();
  });

  it("should handle error status", () => {
    const errorSite: Site = { 
      ...mockSite, 
      monitors: [{
        id: "monitor-1",
        type: "http",
        status: "pending",
        url: "https://example.com",
        history: [],
      }]
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
          id: "monitor-2",
          type: "port",
          status: "down",
          host: "example.com",
          port: 80,
          history: [],
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
      monitors: [{
        id: "monitor-1",
        type: "http",
        status: "up",
        url: "https://very-long-url-that-should-be-handled-properly.example.com/path/to/resource",
        history: [],
      }]
    };
    const mockOnClose = vi.fn();
    render(<SiteDetails site={longUrlSite} onClose={mockOnClose} />);
    
    expect(screen.getByText("Test Site")).toBeInTheDocument();
  });

  it("should handle future dates", () => {
    const futureSite: Site = { 
      ...mockSite, 
      monitors: [{
        id: "monitor-1",
        type: "http",
        status: "up",
        url: "https://example.com",
        lastChecked: new Date("2030-01-01T00:00:00Z"),
        history: [],
      }]
    };
    const mockOnClose = vi.fn();
    render(<SiteDetails site={futureSite} onClose={mockOnClose} />);
    
    expect(screen.getByText("Test Site")).toBeInTheDocument();
  });

  it("should handle null/undefined fields gracefully", () => {
    const incompleteSite: Site = { 
      identifier: "test-site-2",
      name: "Incomplete Site",
      monitors: [],
    };
    const mockOnClose = vi.fn();
    render(<SiteDetails site={incompleteSite} onClose={mockOnClose} />);
    
    expect(screen.getByText("Incomplete Site")).toBeInTheDocument();
  });
});
