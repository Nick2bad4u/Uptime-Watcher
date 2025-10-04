import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import {
    createMockSite,
    createMockMonitor,
} from "../../../utils/mockFactories";

// Mock theme components
vi.mock("../../../../theme/components", async (importOriginal) => {
    const actual = (await importOriginal()) as any;
    return {
        ...actual,
        ThemedBox: ({ children, ...props }: any) => (
            <div data-testid="themed-box" {...props}>
                {children}
            </div>
        ),
        ThemedText: ({ children, ...props }: any) => (
            <span data-testid="themed-text" {...props}>
                {children}
            </span>
        ),
    };
});

// Mock the SiteCard components
vi.mock("../SiteCardHeader", () => ({
    SiteCardHeader: () => <div data-testid="site-card-header">Site Header</div>,
}));

vi.mock("../SiteCardStatus", () => ({
    SiteCardStatus: () => <div data-testid="site-card-status">Site Status</div>,
}));

vi.mock("../SiteCardHistory", () => ({
    SiteCardHistory: () => (
        <div data-testid="site-card-history">Site History</div>
    ),
}));

vi.mock("../SiteCardMetrics", () => ({
    SiteCardMetrics: () => (
        <div data-testid="site-card-metrics-content">Site Metrics</div>
    ),
}));

vi.mock("../SiteCardFooter", () => ({
    SiteCardFooter: () => <div data-testid="site-card-footer">Site Footer</div>,
}));

// Mock the hooks
vi.mock("../../../../hooks/site/useSite", () => ({
    useSite: vi.fn(() => {
        const mockSite = createMockSite({
            identifier: "test-site-1",
            name: "Test Site",
            monitoring: true,
            monitors: [
                createMockMonitor({
                    id: "monitor-1",
                    type: "http",
                    url: "https://example.com",
                    status: "up",
                    responseTime: 200,
                    monitoring: true,
                    checkInterval: 30_000,
                    timeout: 5000,
                    retryAttempts: 3,
                }),
            ],
        });

        return {
            // Site data
            site: mockSite,
            latestSite: mockSite, // This is what was missing!

            // Monitor data
            monitor: {
                id: "monitor-1",
                type: "http",
                url: "https://example.com",
                status: "up",
                responseTime: 200,
                monitoring: true,
                checkInterval: 30_000,
                timeout: 5000,
                retryAttempts: 3,
                history: [],
                activeOperations: [],
            },
            selectedMonitorId: "monitor-1",

            // Status and metrics
            status: "up",
            uptime: 99.5,
            responseTime: 200,
            checkCount: 100,
            filteredHistory: [],

            // UI state
            isLoading: false,
            isMonitoring: true,

            // Event handlers (mocked)
            handleStartMonitoring: vi.fn(),
            handleStartSiteMonitoring: vi.fn(),
            handleStopMonitoring: vi.fn(),
            handleStopSiteMonitoring: vi.fn(),
        };
    }),
}));

// Import the component after mocks
import { SiteCard } from "../../../../components/Dashboard/SiteCard/SiteCard";

describe("SiteCard Component", () => {
    const mockSite = createMockSite({
        identifier: "test-site-1",
        name: "Test Site",
        monitoring: true,
        monitors: [
            createMockMonitor({
                id: "monitor-1",
                type: "http",
                url: "https://example.com",
                status: "up",
                responseTime: 200,
                monitoring: true,
                checkInterval: 30_000,
                timeout: 5000,
                retryAttempts: 3,
            }),
        ],
    });

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should render without crashing", ({ task, annotate }) => {
        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: SiteCard", "component");
        annotate("Category: Component", "category");
        annotate("Type: Business Logic", "type");

        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: SiteCard", "component");
        annotate("Category: Component", "category");
        annotate("Type: Business Logic", "type");

        render(<SiteCard site={mockSite} />);

        // Check for site name instead of generic themed-box
        expect(screen.getByText("Test Site")).toBeInTheDocument();
        // Check for monitor selector
        expect(screen.getByRole("combobox")).toBeInTheDocument();
        // Check for action buttons
        expect(screen.getByLabelText("Check Now")).toBeInTheDocument();
        // Check for metrics grid
        expect(screen.getByText("Status")).toBeInTheDocument();
        expect(screen.getByText("Uptime")).toBeInTheDocument();
    });

    it("should handle site with no monitors", ({ task, annotate }) => {
        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: SiteCard", "component");
        annotate("Category: Component", "category");
        annotate("Type: Monitoring", "type");

        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: SiteCard", "component");
        annotate("Category: Component", "category");
        annotate("Type: Monitoring", "type");

        const siteWithoutMonitors = {
            ...mockSite,
            monitors: [],
        };

        render(<SiteCard site={siteWithoutMonitors} />);

        expect(screen.getByText("Test Site")).toBeInTheDocument();
    });

    it("should handle site with multiple monitors", ({ task, annotate }) => {
        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: SiteCard", "component");
        annotate("Category: Component", "category");
        annotate("Type: Monitoring", "type");

        annotate(`Testing: ${task.name}`, "functional");
        annotate("Component: SiteCard", "component");
        annotate("Category: Component", "category");
        annotate("Type: Monitoring", "type");

        const siteWithMultipleMonitors = createMockSite({
            ...mockSite,
            monitors: [
                mockSite.monitors![0]!,
                createMockMonitor({
                    id: "monitor-2",
                    type: "http" as const,
                    url: "https://api.example.com",
                    status: "down" as const,
                    responseTime: 5000,
                    monitoring: false,
                    timeout: 10_000,
                    retryAttempts: 3,
                }),
            ],
        });

        render(<SiteCard site={siteWithMultipleMonitors} />);

        expect(screen.getByText("Test Site")).toBeInTheDocument();
    });
});
