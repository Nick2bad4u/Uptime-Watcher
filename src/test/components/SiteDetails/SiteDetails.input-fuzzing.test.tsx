/**
 * Property-based fuzzing tests for SiteDetails component navigation and data
 * handling.
 *
 * @remarks
 * These tests focus on the SiteDetails component's ability to handle various
 * site configurations, monitor data, tab navigation, and user interactions. The
 * SiteDetails component is a complex tabbed interface showing comprehensive
 * site monitoring information and controls.
 *
 * The SiteDetails component handles:
 *
 * - Site data display with various monitor configurations
 * - Tabbed navigation between overview, history, analytics, and settings
 * - Real-time monitoring controls and configuration changes
 * - Chart data visualization with different time ranges
 * - Monitor management (add, remove, configure)
 * - Performance analytics and historical data
 * - Responsive layout and theme adaptation
 *
 * Focus areas:
 *
 * - Site data handling with extreme monitor counts and configurations
 * - Tab navigation with various data states
 * - Monitor configuration changes and validation
 * - Chart rendering with large datasets and edge cases
 * - Real-time data updates and state transitions
 * - Error handling and recovery scenarios
 * - Performance with complex site data and rapid interactions
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { test as fcTest, fc } from "@fast-check/vitest";
import {
    render,
    screen,
    fireEvent,
    waitFor,
    act,
    cleanup,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import type {
    Site,
    Monitor,
    MonitorType,
    MonitorStatus,
} from "../../../../shared/types";
import { SiteDetails } from "../../../components/SiteDetails/SiteDetails";

// Mock state for site details
let mockSiteDetailsState = {
    activeSiteDetailsTab: "site-overview" as string,
    isHeaderCollapsed: false,
    isLoading: false,
    isMonitoring: true,
    selectedMonitorId: null as string | null,
    showAdvancedMetrics: false,
    siteDetailsChartTimeRange: "24h" as string,
};

// Mock analytics data
let mockAnalyticsState = {
    totalChecks: 100,
    upCount: 85,
    downCount: 15,
    uptime: "85.0",
    avgResponseTime: 250.5,
    fastestResponse: 150,
    slowestResponse: 500,
    filteredHistory: [] as any[],
};

// Mock site data
let mockSiteState: Site = {
    id: "test-site-1",
    name: "Test Site",
    monitors: [],
    createdAt: new Date(),
    updatedAt: new Date(),
};

// Mock functions
const mockOnClose = vi.fn();
const mockSetActiveSiteDetailsTab = vi.fn((tab: string) => {
    mockSiteDetailsState.activeSiteDetailsTab = tab;
});
const mockHandleCheckNow = vi.fn(async () => {});
const mockHandleRemoveMonitor = vi.fn(async () => {});
const mockHandleIntervalChange = vi.fn();
const mockHandleTimeoutChange = vi.fn();
const mockHandleSaveInterval = vi.fn(async () => {});
const mockHandleSaveTimeout = vi.fn(async () => {});

// Mock the useSiteDetails hook
vi.mock("../../../hooks/site/useSiteDetails", () => ({
    useSiteDetails: vi.fn(() => ({
        ...mockSiteDetailsState,
        analytics: mockAnalyticsState,
        selectedMonitor: mockSiteState.monitors?.[0] || null,
        handleCheckNow: mockHandleCheckNow,
        handleRemoveMonitor: mockHandleRemoveMonitor,
        handleIntervalChange: mockHandleIntervalChange,
        handleTimeoutChange: mockHandleTimeoutChange,
        handleSaveInterval: mockHandleSaveInterval,
        handleSaveTimeout: mockHandleSaveTimeout,
        setActiveSiteDetailsTab: mockSetActiveSiteDetailsTab,
        setLocalName: vi.fn(),
        setShowAdvancedMetrics: vi.fn(),
        setSiteDetailsChartTimeRange: vi.fn(),
        localName: mockSiteState.name,
        localCheckInterval: 300,
        localTimeout: 5000,
        localRetryAttempts: 3,
        intervalChanged: false,
        timeoutChanged: false,
        retryAttemptsChanged: false,
        siteExists: true,
    })),
}));

// Mock theme hook
vi.mock("../../../theme/useTheme", () => ({
    useTheme: vi.fn(() => ({
        theme: {
            name: "light",
            isDark: false,
            colors: {
                primary: { 500: "#3b82f6" },
                success: "#10b981",
                warning: "#f59e0b",
                error: "#ef4444",
            },
        },
        currentTheme: {
            colors: {
                primary: { 500: "#3b82f6" },
                success: "#10b981",
                warning: "#f59e0b",
                error: "#ef4444",
            },
        },
    })),
    useAvailabilityColors: vi.fn(() => ({
        getAvailabilityColor: (percentage: number) => {
            if (percentage >= 95) return "success";
            if (percentage >= 80) return "warning";
            return "error";
        },
    })),
}));

// Mock services
vi.mock("../../../services/chartConfig", () => ({
    ChartConfigService: vi.fn().mockImplementation(() => ({
        getLineChartConfig: () => ({ responsive: true }),
        getBarChartConfig: () => ({ responsive: true }),
        getDoughnutChartConfig: () => ({ responsive: true }),
    })),
}));

// Mock themed components
vi.mock("../../../theme/components/ThemedBox", () => ({
    ThemedBox: vi.fn(({ children, className, ...props }) => (
        <div className={className} data-testid="themed-box" {...props}>
            {children}
        </div>
    )),
}));

// Mock sub-components
vi.mock("../../../components/SiteDetails/SiteDetailsHeader", () => ({
    SiteDetailsHeader: vi.fn(({ site, onClose, onToggleCollapse }) => (
        <div data-testid="site-details-header">
            <h1>{site?.name || "Unnamed Site"}</h1>
            <button onClick={() => onClose?.()} data-testid="close-button">
                Close
            </button>
            <button onClick={() => onToggleCollapse?.()} data-testid="toggle-collapse">
                Toggle
            </button>
        </div>
    )),
}));

vi.mock("../../../components/SiteDetails/SiteDetailsNavigation", () => ({
    SiteDetailsNavigation: vi.fn(({ activeTab, onTabChange, monitors }) => (
        <nav data-testid="site-details-navigation">
            <button
                onClick={() => onTabChange?.("site-overview")}
                data-testid="tab-site-overview"
                data-active={activeTab === "site-overview"}
            >
                Site Overview
            </button>
            <button
                onClick={() => onTabChange?.("monitor-overview")}
                data-testid="tab-monitor-overview"
                data-active={activeTab === "monitor-overview"}
            >
                Monitor Overview
            </button>
            <button
                onClick={() => onTabChange?.("history")}
                data-testid="tab-history"
                data-active={activeTab === "history"}
            >
                History
            </button>
            <button
                onClick={() => onTabChange?.("analytics")}
                data-testid="tab-analytics"
                data-active={activeTab === "analytics"}
            >
                Analytics
            </button>
            <button
                onClick={() => onTabChange?.("settings")}
                data-testid="tab-settings"
                data-active={activeTab === "settings"}
            >
                Settings
            </button>
        </nav>
    )),
}));

vi.mock("../../../components/SiteDetails/tabs/SiteOverviewTab", () => ({
    SiteOverviewTab: vi.fn(() => (
        <div data-testid="site-overview-tab">Site Overview Content</div>
    )),
}));

vi.mock("../../../components/SiteDetails/tabs/OverviewTab", () => ({
    OverviewTab: vi.fn(() => (
        <div data-testid="overview-tab">Monitor Overview Content</div>
    )),
}));

vi.mock("../../../components/SiteDetails/tabs/HistoryTab", () => ({
    HistoryTab: vi.fn(() => (
        <div data-testid="history-tab">History Content</div>
    )),
}));

vi.mock("../../../components/SiteDetails/tabs/AnalyticsTab", () => ({
    AnalyticsTab: vi.fn(() => (
        <div data-testid="analytics-tab">Analytics Content</div>
    )),
}));

vi.mock("../../../components/SiteDetails/tabs/SettingsTab", () => ({
    SettingsTab: vi.fn(() => (
        <div data-testid="settings-tab">Settings Content</div>
    )),
}));

// Mock utility functions
vi.mock("../../../utils/monitoring/dataValidation", () => ({
    parseUptimeValue: vi.fn((value) => value?.toString() || "0"),
}));

vi.mock("../../../utils/status", () => ({
    formatStatusWithIcon: vi.fn((status) => `${status} 🔴`),
}));

vi.mock("../../../utils/time", () => ({
    formatDuration: vi.fn((ms) => `${ms}ms`),
    formatFullTimestamp: vi.fn((date) => date?.toISOString() || ""),
    formatResponseTime: vi.fn((ms) => `${ms}ms`),
}));

/**
 * Fast-check arbitraries for generating test data
 */

// Generate monitor status values
const monitorStatusArbitrary = fc.constantFrom(
    "up",
    "down",
    "pending",
    "paused"
) as fc.Arbitrary<MonitorStatus>;

// Generate monitor types
const monitorTypeArbitrary = fc.constantFrom(
    "http",
    "ping",
    "port",
    "dns"
) as fc.Arbitrary<MonitorType>;

// Generate realistic monitor data
const monitorArbitrary = fc.record({
    id: fc.string({ minLength: 1, maxLength: 50 }),
    siteId: fc.string({ minLength: 1, maxLength: 50 }),
    name: fc.string({ minLength: 1, maxLength: 100 }),
    type: monitorTypeArbitrary,
    status: monitorStatusArbitrary,
    url: fc.oneof(
        fc.webUrl(),
        fc.constant(""),
        fc.constant(null),
        fc.constant(undefined)
    ),
    host: fc.oneof(
        fc.domain(),
        fc.ipV4(),
        fc.ipV6(),
        fc.string({ minLength: 1, maxLength: 100 })
    ),
    port: fc.oneof(
        fc.integer({ min: 1, max: 65_535 }),
        fc.constant(null),
        fc.constant(undefined)
    ),
    checkInterval: fc.integer({ min: 30, max: 3600 }),
    timeout: fc.integer({ min: 1000, max: 30_000 }),
    retryAttempts: fc.integer({ min: 0, max: 10 }),
    createdAt: fc.date(),
    updatedAt: fc.date(),
}) as fc.Arbitrary<Monitor>;

// Generate site data with various monitor configurations
const siteArbitrary = fc.record({
    id: fc.string({ minLength: 1, maxLength: 50 }),
    name: fc.string({ minLength: 1, maxLength: 100 }),
    monitors: fc.oneof(
        fc.array(monitorArbitrary, { minLength: 0, maxLength: 20 }),
        fc.constant([]),
        fc.constant(null),
        fc.constant(undefined)
    ),
    createdAt: fc.date(),
    updatedAt: fc.date(),
}) as fc.Arbitrary<Site>;

// Generate extreme site configurations
const extremeSiteArbitrary = fc.record({
    id: fc.oneof(fc.string(), fc.constant(""), fc.constant(null)),
    name: fc.oneof(
        fc.string({ minLength: 0, maxLength: 1000 }),
        fc.constant(""),
        fc.constant(null)
    ),
    monitors: fc.oneof(
        fc.array(monitorArbitrary, { minLength: 0, maxLength: 100 }), // Very large arrays
        fc.array(fc.anything(), { minLength: 0, maxLength: 10 }), // Malformed data
        fc.constant([]),
        fc.constant(null),
        fc.constant(undefined)
    ),
    createdAt: fc.oneof(fc.date(), fc.constant(null)),
    updatedAt: fc.oneof(fc.date(), fc.constant(null)),
});

// Generate tab names
const tabNameArbitrary = fc.constantFrom(
    "site-overview",
    "monitor-overview",
    "history",
    "analytics",
    "settings"
);

// Generate analytics data scenarios
const analyticsArbitrary = fc.record({
    totalChecks: fc.integer({ min: 0, max: 10_000 }),
    upCount: fc.integer({ min: 0, max: 10_000 }),
    downCount: fc.integer({ min: 0, max: 10_000 }),
    uptime: fc.float({ min: 0, max: 100 }).map((n) => n.toFixed(1)),
    avgResponseTime: fc.float({ min: 0, max: 10_000 }),
    fastestResponse: fc.integer({ min: 1, max: 1000 }),
    slowestResponse: fc.integer({ min: 1, max: 10_000 }),
    filteredHistory: fc.array(
        fc.record({
            responseTime: fc.integer({ min: 1, max: 5000 }),
            status: monitorStatusArbitrary,
            timestamp: fc.date(),
        }),
        { minLength: 0, maxLength: 1000 }
    ),
});

describe("SiteDetails Component - Property-Based Fuzzing", () => {
    beforeEach(() => {
        // Reset mocks
        vi.clearAllMocks();

        // Reset mock state
        mockSiteDetailsState = {
            activeSiteDetailsTab: "site-overview",
            isHeaderCollapsed: false,
            isLoading: false,
            isMonitoring: true,
            selectedMonitorId: null,
            showAdvancedMetrics: false,
            siteDetailsChartTimeRange: "24h",
        };

        mockAnalyticsState = {
            totalChecks: 100,
            upCount: 85,
            downCount: 15,
            uptime: "85.0",
            avgResponseTime: 250.5,
            fastestResponse: 150,
            slowestResponse: 500,
            filteredHistory: [],
        };

        mockSiteState = {
            id: "test-site-1",
            name: "Test Site",
            monitors: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        };
    });

    afterEach(() => {
        vi.clearAllMocks();
        cleanup();
    });

    describe("Site Data Handling Fuzzing", () => {
        fcTest.prop([siteArbitrary], {
            numRuns: 100,
            timeout: 10_000,
        })(
            "should handle arbitrary site configurations without crashing",
            async (site) => {
                let renderResult: any;
                expect(() => {
                    renderResult = render(<SiteDetails site={site} onClose={mockOnClose} />);
                }).not.toThrow();

                try {
                    // Verify component renders basic structure
                    expect(
                        screen.getByTestId("site-details-header")
                    ).toBeInTheDocument();
                    expect(
                        screen.getByTestId("site-details-navigation")
                    ).toBeInTheDocument();
                } finally {
                    // Clean up after each property-based test iteration
                    if (renderResult) {
                        renderResult.unmount();
                    }
                    cleanup();
                }
            }
        );

        fcTest.prop([extremeSiteArbitrary], {
            numRuns: 50,
            timeout: 15_000,
        })(
            "should handle extreme site configurations gracefully",
            async (extremeSite) => {
                // Cast to Site for testing error handling
                const site = extremeSite as Site;

                expect(() => {
                    render(<SiteDetails site={site} onClose={mockOnClose} />);
                }).not.toThrow();

                // Component should still render with defensive programming
                expect(
                    screen.getByTestId("site-details-header")
                ).toBeInTheDocument();
            }
        );

        fcTest.prop(
            [fc.array(monitorArbitrary, { minLength: 1, maxLength: 50 })],
            {
                numRuns: 50,
                timeout: 15_000,
            }
        )(
            "should handle sites with various monitor configurations",
            async (monitors) => {
                const site: Site = {
                    id: "test-site",
                    name: "Test Site",
                    monitors,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };

                render(<SiteDetails site={site} onClose={mockOnClose} />);

                // Verify site name is displayed
                expect(screen.getByText("Test Site")).toBeInTheDocument();

                // Verify navigation is present
                expect(
                    screen.getByTestId("site-details-navigation")
                ).toBeInTheDocument();
            }
        );
    });

    describe("Tab Navigation Fuzzing", () => {
        fcTest.prop([tabNameArbitrary], {
            numRuns: 50,
            timeout: 5000,
        })("should handle tab navigation correctly", async (tabName) => {
            mockSiteDetailsState.activeSiteDetailsTab = tabName;

            const site: Site = {
                id: "test-site",
                name: "Test Site",
                monitors: [
                    {
                        id: "monitor-1",
                        siteId: "test-site",
                        name: "Test Monitor",
                        type: "http",
                        status: "up",
                    } as Monitor,
                ],
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            render(<SiteDetails site={site} onClose={mockOnClose} />);

            const tabButton = screen.getByTestId(`tab-${tabName}`);

             fireEvent.click(tabButton);


            expect(mockSetActiveSiteDetailsTab).toHaveBeenCalledWith(tabName);
        });

        fcTest.prop([fc.integer({ min: 1, max: 20 })], {
            numRuns: 30,
            timeout: 15_000,
        })("should handle rapid tab switching", async (switchCount) => {
            const site: Site = {
                id: "test-site",
                name: "Test Site",
                monitors: [
                    {
                        id: "monitor-1",
                        siteId: "test-site",
                        name: "Test Monitor",
                        type: "http",
                        status: "up",
                    } as Monitor,
                ],
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            render(<SiteDetails site={site} onClose={mockOnClose} />);

            const tabs = [
                "site-overview",
                "monitor-overview",
                "history",
                "analytics",
                "settings",
            ];

            for (let i = 0; i < switchCount; i++) {
                const tabName = tabs[i % tabs.length];
                const tabButton = screen.getByTestId(`tab-${tabName}`);

                 fireEvent.click(tabButton);

            }

            expect(mockSetActiveSiteDetailsTab).toHaveBeenCalledTimes(
                switchCount
            );
        });
    });

    describe("Analytics Data Fuzzing", () => {
        fcTest.prop([analyticsArbitrary], {
            numRuns: 100,
            timeout: 10_000,
        })(
            "should handle arbitrary analytics data configurations",
            async (analytics) => {
                mockAnalyticsState = analytics;

                const site: Site = {
                    id: "test-site",
                    name: "Test Site",
                    monitors: [],
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };

                expect(() => {
                    render(<SiteDetails site={site} onClose={mockOnClose} />);
                }).not.toThrow();

                // Verify component renders with analytics data
                expect(
                    screen.getByTestId("site-details-header")
                ).toBeInTheDocument();
            }
        );

        fcTest.prop(
            [
                fc.record({
                    totalChecks: fc.oneof(
                        fc.integer({ min: 0, max: 1_000_000 }),
                        fc.constant(0),
                        fc.constant(-1),
                        fc.constant(Number.NaN),
                        fc.constant(Infinity)
                    ),
                    upCount: fc.oneof(
                        fc.integer({ min: 0, max: 1_000_000 }),
                        fc.constant(-1),
                        fc.constant(Number.NaN)
                    ),
                    downCount: fc.oneof(
                        fc.integer({ min: 0, max: 1_000_000 }),
                        fc.constant(-1),
                        fc.constant(Number.NaN)
                    ),
                }),
            ],
            {
                numRuns: 50,
                timeout: 10_000,
            }
        )(
            "should handle extreme analytics values gracefully",
            async (extremeAnalytics) => {
                mockAnalyticsState = {
                    ...mockAnalyticsState,
                    ...extremeAnalytics,
                };

                const site: Site = {
                    id: "test-site",
                    name: "Test Site",
                    monitors: [],
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };

                expect(() => {
                    render(<SiteDetails site={site} onClose={mockOnClose} />);
                }).not.toThrow();
            }
        );
    });

    describe("Monitor Actions Fuzzing", () => {
        fcTest.prop([fc.boolean()], {
            numRuns: 50,
            timeout: 10_000,
        })("should handle check now action", async (shouldFail) => {
            if (shouldFail) {
                mockHandleCheckNow.mockRejectedValueOnce(
                    new Error("Check failed")
                );
            } else {
                mockHandleCheckNow.mockResolvedValueOnce(undefined);
            }

            const site: Site = {
                id: "test-site",
                name: "Test Site",
                monitors: [
                    {
                        id: "monitor-1",
                        siteId: "test-site",
                        name: "Test Monitor",
                        type: "http",
                        status: "up",
                    } as Monitor,
                ],
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            // Set to monitor overview tab to show check now button
            mockSiteDetailsState.activeSiteDetailsTab = "monitor-overview";

            render(<SiteDetails site={site} onClose={mockOnClose} />);

            // Component should render without error regardless of action outcome
            expect(
                screen.getByTestId("site-details-header")
            ).toBeInTheDocument();
        });

        fcTest.prop(
            [
                fc.record({
                    checkInterval: fc.integer({ min: 30, max: 3600 }),
                    timeout: fc.integer({ min: 1000, max: 30_000 }),
                    retryAttempts: fc.integer({ min: 0, max: 10 }),
                }),
            ],
            {
                numRuns: 50,
                timeout: 5000,
            }
        )("should handle monitor configuration changes", async (config) => {
            const site: Site = {
                id: "test-site",
                name: "Test Site",
                monitors: [
                    {
                        id: "monitor-1",
                        siteId: "test-site",
                        name: "Test Monitor",
                        type: "http",
                        status: "up",
                        checkInterval: config.checkInterval,
                        timeout: config.timeout,
                        retryAttempts: config.retryAttempts,
                    } as Monitor,
                ],
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            render(<SiteDetails site={site} onClose={mockOnClose} />);

            // Verify component handles configuration without issues
            expect(
                screen.getByTestId("site-details-header")
            ).toBeInTheDocument();
        });
    });

    describe("UI Interaction Fuzzing", () => {
        fcTest.prop([fc.integer({ min: 1, max: 10 })], {
            numRuns: 30,
            timeout: 10_000,
        })("should handle close button interactions", async (clickCount) => {
            const site: Site = {
                id: "test-site",
                name: "Test Site",
                monitors: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            render(<SiteDetails site={site} onClose={mockOnClose} />);

            const closeButton = screen.getByTestId("close-button");

            for (let i = 0; i < clickCount; i++) {
                 fireEvent.click(closeButton);

            }

            expect(mockOnClose).toHaveBeenCalledTimes(clickCount);
        });

        fcTest.prop([fc.integer({ min: 1, max: 5 })], {
            numRuns: 30,
            timeout: 10_000,
        })("should handle header collapse toggle", async (toggleCount) => {
            const site: Site = {
                id: "test-site",
                name: "Test Site",
                monitors: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            render(<SiteDetails site={site} onClose={mockOnClose} />);

            const toggleButton = screen.getByTestId("toggle-collapse");

            for (let i = 0; i < toggleCount; i++) {
                 fireEvent.click(toggleButton);

            }

            // Should handle toggles without crashing
            expect(
                screen.getByTestId("site-details-header")
            ).toBeInTheDocument();
        });
    });

    describe("Performance Fuzzing", () => {
        fcTest.prop(
            [
                fc.record({
                    monitorCount: fc.integer({ min: 10, max: 100 }),
                    historyCount: fc.integer({ min: 100, max: 1000 }),
                }),
            ],
            {
                numRuns: 20,
                timeout: 30_000,
            }
        )("should handle large datasets efficiently", async (scenario) => {
            // Create large monitor array
            const monitors: Monitor[] = [];
            for (let i = 0; i < scenario.monitorCount; i++) {
                monitors.push({
                    id: `monitor-${i}`,
                    siteId: "test-site",
                    name: `Monitor ${i}`,
                    type: "http",
                    status:
                        i % 3 === 0 ? "up" : i % 3 === 1 ? "down" : "pending",
                    checkInterval: 300,
                    timeout: 5000,
                    retryAttempts: 3,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                } as Monitor);
            }

            // Create large history array
            const filteredHistory = [];
            for (let i = 0; i < scenario.historyCount; i++) {
                filteredHistory.push({
                    responseTime: Math.floor(Math.random() * 1000) + 100,
                    status: [
                        "up",
                        "down",
                        "pending",
                    ][i % 3],
                    timestamp: new Date(Date.now() - i * 60_000),
                });
            }

            mockAnalyticsState.filteredHistory = filteredHistory;

            const site: Site = {
                id: "test-site",
                name: "Test Site",
                monitors,
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            const startTime = performance.now();

            render(<SiteDetails site={site} onClose={mockOnClose} />);

            const endTime = performance.now();
            const renderTime = endTime - startTime;

            // Should render within reasonable time even with large data
            expect(renderTime).toBeLessThan(5000); // 5 seconds max
            expect(
                screen.getByTestId("site-details-header")
            ).toBeInTheDocument();
        });
    });

    describe("Error Boundary Fuzzing", () => {
        fcTest.prop([fc.anything()], {
            numRuns: 30,
            timeout: 5000,
        })("should not crash with invalid site data", async (invalidData) => {
            // Test with completely invalid site data
            const invalidSite = invalidData as Site;

            expect(() => {
                render(
                    <SiteDetails site={invalidSite} onClose={mockOnClose} />
                );
            }).not.toThrow();
        });
    });

    describe("Accessibility Fuzzing", () => {
        fcTest.prop([siteArbitrary], {
            numRuns: 50,
            timeout: 10_000,
        })(
            "should maintain accessibility structure under all conditions",
            async (site) => {
                render(<SiteDetails site={site} onClose={mockOnClose} />);

                // Verify essential interactive elements are present
                const closeButton = screen.getByTestId("close-button");
                const navigation = screen.getByTestId(
                    "site-details-navigation"
                );

                expect(closeButton).toBeInTheDocument();
                expect(navigation).toBeInTheDocument();

                // Verify buttons are focusable
                expect(closeButton).not.toHaveAttribute("tabindex", "-1");
            }
        );
    });
});
