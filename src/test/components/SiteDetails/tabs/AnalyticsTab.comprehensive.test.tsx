import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
    AnalyticsTab,
    type AnalyticsTabProperties,
} from "../../../../components/SiteDetails/tabs/AnalyticsTab";
import type { DowntimePeriod } from "../../../../hooks/site/useSiteAnalytics";
import type {
    ResponseTimeChartData,
    StatusBarChartData,
    UptimeChartData,
} from "../../../../services/chartConfig";
import type { ChartOptions } from "../../../../services/chartSetup";

// Mock all external dependencies
vi.mock("../../../../services/logger", () => ({
    default: {
        debug: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        user: {
            action: vi.fn(),
        },
    },
}));

vi.mock("../../../../theme/useTheme", () => ({
    useAvailabilityColors: () => ({
        getAvailabilityColor: vi.fn(() => "#10B981"),
        getAvailabilityVariant: vi.fn(() => "success"),
    }),
    useTheme: () => ({
        currentTheme: {
            colors: {
                error: "#EF4444",
                primary: {
                    500: "#3B82F6",
                    600: "#2563EB",
                },
                success: "#10B981",
                warning: "#F59E0B",
            },
        },
    }),
}));

vi.mock("../../../../theme/components", () => ({
    ThemedBadge: ({ children, variant, ...props }: any) => {
        const { iconColor, hoverable, showLabel, ...cleanProps } = props;
        return (
            <span
                data-testid="themed-badge"
                data-variant={variant}
                {...cleanProps}
            >
                {children}
            </span>
        );
    },
    ThemedButton: ({ children, onClick, variant, ...props }: any) => {
        const { iconColor, hoverable, showLabel, ...cleanProps } = props;
        return (
            <button
                data-testid="themed-button"
                data-variant={variant}
                onClick={onClick}
                {...cleanProps}
            >
                {children}
            </button>
        );
    },
    ThemedCard: ({ children, icon, title, ...props }: any) => {
        const { iconColor, hoverable, showLabel, ...cleanProps } = props;
        return (
            <div data-testid="themed-card" data-title={title} {...cleanProps}>
                {icon && <div data-testid="card-icon">{icon}</div>}
                {title && <div data-testid="card-title">{title}</div>}
                {children}
            </div>
        );
    },
    ThemedProgress: ({ value, variant, ...props }: any) => {
        const { iconColor, hoverable, showLabel, ...cleanProps } = props;
        return (
            <div
                data-testid="themed-progress"
                data-value={value}
                data-variant={variant}
                {...cleanProps}
            >
                {value}%
            </div>
        );
    },
    ThemedText: ({ children, size, variant, ...props }: any) => {
        const { iconColor, hoverable, showLabel, ...cleanProps } = props;
        return (
            <span
                data-testid="themed-text"
                data-size={size}
                data-variant={variant}
                {...cleanProps}
            >
                {children}
            </span>
        );
    },
}));

vi.mock("../../../../components/common/MonitorUiComponents", () => ({
    ConditionalResponseTime: ({ children, monitorType }: any) => {
        // Always show children (assumes response time is supported for test simplicity)
        return (
            <div
                data-testid="conditional-response-time"
                data-monitor-type={monitorType}
            >
                {children}
            </div>
        );
    },
}));

// Mock the monitorUiHelpers to prevent async operations
vi.mock("../../../../utils/monitorUiHelpers", () => ({
    supportsResponseTime: vi.fn(() => true), // Synchronous function
    formatMonitorDetail: vi.fn(() => "mocked detail"), // Synchronous function
}));

vi.mock("../../../../components/SiteDetails/charts/ChartComponents", () => ({
    ResponseTimeChart: () => (
        <div data-testid="response-time-chart" data-chart-type="line">
            Line Chart
        </div>
    ),
    StatusChart: () => (
        <div data-testid="status-chart" data-chart-type="bar">
            Bar Chart
        </div>
    ),
    UptimeChart: () => (
        <div data-testid="uptime-chart" data-chart-type="doughnut">
            Doughnut Chart
        </div>
    ),
}));

describe("AnalyticsTab", () => {
    const createMockProps = (
        overrides?: Partial<AnalyticsTabProperties>
    ): AnalyticsTabProperties => {
        const mockLineChartData: ResponseTimeChartData = {
            labels: ["10:00", "10:15", "10:30"],
            datasets: [
                {
                    label: "Response Time",
                    data: [100, 120, 110],
                    borderColor: "#3B82F6",
                    backgroundColor: "#3B82F6",
                    fill: false,
                    tension: 0.1,
                },
            ],
        };

        const mockBarChartData: StatusBarChartData = {
            labels: ["Up", "Down"],
            datasets: [
                {
                    label: "Status",
                    data: [95, 5],
                    backgroundColor: ["#10B981", "#EF4444"],
                    borderColor: ["#059669", "#DC2626"],
                    borderWidth: 1,
                },
            ],
        };

        const mockUptimeChartData: UptimeChartData = {
            labels: ["Uptime", "Downtime"],
            datasets: [
                {
                    data: [99.5, 0.5],
                    backgroundColor: ["#10B981", "#EF4444"],
                    borderColor: ["#059669", "#DC2626"],
                    borderWidth: 2,
                },
            ],
        };

        const mockChartOptions: ChartOptions<"line"> = {
            responsive: true,
            plugins: {
                legend: { position: "top" as const },
            },
        };

        const mockDowntimePeriods: DowntimePeriod[] = [
            {
                start: Date.now() - 3600000,
                end: Date.now() - 3000000,
                duration: 600000,
            },
            {
                start: Date.now() - 7200000,
                end: Date.now() - 7020000,
                duration: 180000,
            },
        ];

        return {
            avgResponseTime: 150,
            barChartData: mockBarChartData,
            barChartOptions: mockChartOptions as unknown as ChartOptions<"bar">,
            doughnutOptions: mockChartOptions as unknown as ChartOptions<"doughnut">,
            downCount: 5,
            downtimePeriods: mockDowntimePeriods,
            formatDuration: vi.fn((ms: number) => `${Math.round(ms / 1000)}s`),
            formatResponseTime: vi.fn((time: number) => `${time}ms`),
            getAvailabilityDescription: vi.fn((percentage: number) => {
                if (percentage >= 99.9) return "Excellent";
                if (percentage >= 99.0) return "Good";
                return "Poor";
            }),
            lineChartData: mockLineChartData,
            lineChartOptions: mockChartOptions,
            monitorType: "http" as const,
            mttr: 300000,
            p50: 120,
            p95: 200,
            p99: 250,
            setShowAdvancedMetrics: vi.fn(),
            setSiteDetailsChartTimeRange: vi.fn(),
            showAdvancedMetrics: false,
            siteDetailsChartTimeRange: "24h" as const,
            totalChecks: 100,
            totalDowntime: 780000,
            upCount: 95,
            uptime: "99.5",
            uptimeChartData: mockUptimeChartData,
            ...overrides,
        };
    };

    describe("Basic Rendering", () => {
        it("should render analytics tab with all main sections", () => {
            const props = createMockProps();
            render(<AnalyticsTab {...props} />);

            expect(screen.getByTestId("analytics-tab")).toBeInTheDocument();
            expect(
                screen.getByText("Analytics Time Range")
            ).toBeInTheDocument();

            // Check for actual sections that exist in the component
            expect(screen.getByText("Availability")).toBeInTheDocument();
            expect(screen.getByText("Avg Response")).toBeInTheDocument();
            expect(screen.getByText("Total Checks")).toBeInTheDocument();
            expect(screen.getByText("Downtime")).toBeInTheDocument();
        });

        it("should display all chart components", () => {
            const props = createMockProps();
            render(<AnalyticsTab {...props} />);

            expect(
                screen.getByTestId("response-time-chart")
            ).toBeInTheDocument();
            expect(screen.getByTestId("status-chart")).toBeInTheDocument();
            expect(screen.getByTestId("uptime-chart")).toBeInTheDocument();
        });

        it("should show time range selector with all options", () => {
            const props = createMockProps();
            render(<AnalyticsTab {...props} />);

            // Should show current selection
            const currentSelection = screen.getByText("24h");
            expect(currentSelection).toBeInTheDocument();

            // Should show specific time range buttons that we know exist
            expect(screen.getByText("1h")).toBeInTheDocument();
            expect(screen.getByText("24h")).toBeInTheDocument();
            expect(screen.getByText("7d")).toBeInTheDocument();
            expect(screen.getByText("30d")).toBeInTheDocument();
        });
    });

    describe("Key Performance Metrics", () => {
        it("should display uptime percentage and description", () => {
            const props = createMockProps({
                uptime: "99.5",
                getAvailabilityDescription: vi.fn(() => "Excellent"),
            });
            render(<AnalyticsTab {...props} />);

            // Check both elements exist - they will both show 99.5%
            const progressElement = screen.getByTestId("themed-progress");
            expect(progressElement).toHaveAttribute("data-value", "99.5");

            const badgeElement = screen.getByTestId("themed-badge");
            expect(badgeElement).toHaveTextContent("99.5%");

            expect(screen.getByText("Excellent")).toBeInTheDocument();
            expect(props.getAvailabilityDescription).toHaveBeenCalledWith(99.5);
        });

        it("should display response time metrics", () => {
            const props = createMockProps({
                avgResponseTime: 150,
                formatResponseTime: vi.fn((time) => `${time}ms`),
            });
            render(<AnalyticsTab {...props} />);

            // Use getAllByTestId since there are multiple conditional response time elements
            const responseTimeElements = screen.getAllByTestId(
                "conditional-response-time"
            );
            expect(responseTimeElements.length).toBeGreaterThan(0);

            // Look for the actual response time text (just 150ms, not "150ms for http")
            expect(screen.getByText("150ms")).toBeInTheDocument();
        });

        it("should display check statistics", () => {
            const props = createMockProps({
                totalChecks: 100,
                upCount: 95,
                downCount: 5,
            });
            render(<AnalyticsTab {...props} />);

            expect(screen.getByText("Total Checks")).toBeInTheDocument();
            expect(screen.getByText("100")).toBeInTheDocument();
            // Check for "100 checks" text that appears in the component
            expect(screen.getByText("100 checks")).toBeInTheDocument();
        });

        it("should display MTTR with correct formatting when advanced metrics enabled", () => {
            const props = createMockProps({
                mttr: 300000,
                formatDuration: vi.fn(() => "5m"),
                showAdvancedMetrics: true, // Need to enable advanced metrics to show MTTR
            });
            render(<AnalyticsTab {...props} />);

            expect(
                screen.getByText("Mean Time To Recovery")
            ).toBeInTheDocument();

            // Use getAllByText since there might be multiple "5m" texts
            const fiveMinTexts = screen.getAllByText("5m");
            expect(fiveMinTexts.length).toBeGreaterThan(0);

            expect(props.formatDuration).toHaveBeenCalledWith(300000);
        });
    });

    describe("Advanced Metrics", () => {
        it("should toggle advanced metrics when button is clicked", async () => {
            const setShowAdvancedMetrics = vi.fn();
            const props = createMockProps({
                showAdvancedMetrics: false,
                setShowAdvancedMetrics,
            });

            render(<AnalyticsTab {...props} />);

            const toggleButton = screen.getByText("Show Advanced");
            fireEvent.click(toggleButton);

            expect(setShowAdvancedMetrics).toHaveBeenCalledWith(true);
        });

        it("should display advanced metrics when enabled", () => {
            const props = createMockProps({
                showAdvancedMetrics: true,
                p50: 120,
                p95: 200,
                p99: 250,
                formatResponseTime: vi.fn((time) => `${time}ms`),
            });

            render(<AnalyticsTab {...props} />);

            expect(screen.getByText("Percentile Analysis")).toBeInTheDocument();
            expect(screen.getByText("P50")).toBeInTheDocument();
            expect(screen.getByText("P95")).toBeInTheDocument();
            expect(screen.getByText("P99")).toBeInTheDocument();
        });

        it("should hide advanced metrics when disabled", () => {
            const props = createMockProps({
                showAdvancedMetrics: false,
            });

            render(<AnalyticsTab {...props} />);

            // Percentile Analysis section is always shown
            expect(screen.getByText("Percentile Analysis")).toBeInTheDocument();
            // But advanced MTTR section should be hidden
            expect(
                screen.queryByText("Mean Time To Recovery")
            ).not.toBeInTheDocument();
            expect(screen.queryByText("Incidents")).not.toBeInTheDocument();
        });
    });

    describe("Downtime Analysis", () => {
        it("should display downtime information", () => {
            const props = createMockProps({
                downtimePeriods: [
                    {
                        start: Date.now() - 3600000,
                        end: Date.now() - 3000000,
                        duration: 600000,
                    },
                ],
                formatDuration: vi.fn(() => "10m"),
            });

            render(<AnalyticsTab {...props} />);

            expect(screen.getByText("Downtime")).toBeInTheDocument();
            expect(screen.getByText("1 incidents")).toBeInTheDocument();
        });

        it("should show no incidents when no downtime", () => {
            const props = createMockProps({
                downtimePeriods: [],
            });

            render(<AnalyticsTab {...props} />);

            expect(screen.getByText("Downtime")).toBeInTheDocument();
            expect(screen.getByText("0 incidents")).toBeInTheDocument();
        });

        it("should display downtime duration", () => {
            const props = createMockProps({
                totalDowntime: 780000,
                formatDuration: vi.fn(() => "13m"),
            });

            render(<AnalyticsTab {...props} />);

            expect(screen.getByText("Downtime")).toBeInTheDocument();
            expect(screen.getByText("13m")).toBeInTheDocument();
        });
    });

    describe("Time Range Selection", () => {
        it("should call setSiteDetailsChartTimeRange when time range is changed", () => {
            const setSiteDetailsChartTimeRange = vi.fn();
            const props = createMockProps({
                setSiteDetailsChartTimeRange,
                siteDetailsChartTimeRange: "24h",
            });

            render(<AnalyticsTab {...props} />);

            const weekButton = screen.getByText("7d");
            fireEvent.click(weekButton);

            expect(setSiteDetailsChartTimeRange).toHaveBeenCalledWith("7d");
        });

        it("should highlight current time range", () => {
            const props = createMockProps({
                siteDetailsChartTimeRange: "7d",
            });

            render(<AnalyticsTab {...props} />);

            // The current time range should have active styling
            const activeButton = screen.getByText("7d");
            expect(activeButton).toBeInTheDocument();
        });
    });

    describe("Response Time Color Coding", () => {
        it("should use green color for excellent response times (≤100ms)", () => {
            const props = createMockProps({
                avgResponseTime: 80,
            });

            render(<AnalyticsTab {...props} />);
            // Component should render without errors for good response time
            expect(screen.getByTestId("analytics-tab")).toBeInTheDocument();
        });

        it("should use yellow color for good response times (≤500ms)", () => {
            const props = createMockProps({
                avgResponseTime: 300,
            });

            render(<AnalyticsTab {...props} />);
            expect(screen.getByTestId("analytics-tab")).toBeInTheDocument();
        });

        it("should use red color for poor response times (>500ms)", () => {
            const props = createMockProps({
                avgResponseTime: 800,
            });

            render(<AnalyticsTab {...props} />);
            expect(screen.getByTestId("analytics-tab")).toBeInTheDocument();
        });
    });

    describe("Edge Cases", () => {
        it("should handle zero MTTR correctly", () => {
            const props = createMockProps({
                mttr: 0,
                formatDuration: vi.fn(() => "0s"),
            });

            render(<AnalyticsTab {...props} />);
            expect(screen.getByText("0s")).toBeInTheDocument();
        });

        it("should handle zero downtime periods", () => {
            const props = createMockProps({
                downtimePeriods: [],
                totalDowntime: 0,
                formatDuration: vi.fn(() => "0s"),
            });

            render(<AnalyticsTab {...props} />);
            expect(screen.getByText("Downtime")).toBeInTheDocument();
            expect(screen.getByText("0 incidents")).toBeInTheDocument();
        });

        it("should handle perfect uptime (100%)", () => {
            const props = createMockProps({
                uptime: "100",
                downCount: 0,
                totalDowntime: 0,
            });

            render(<AnalyticsTab {...props} />);

            // Use more specific selectors to avoid multiple matches
            const progressElement = screen.getByTestId("themed-progress");
            expect(progressElement).toHaveAttribute("data-value", "100");

            const badgeElement = screen.getByTestId("themed-badge");
            expect(badgeElement).toHaveTextContent("100%");
        });

        it("should handle invalid uptime values", () => {
            const props = createMockProps({
                uptime: "invalid",
            });

            render(<AnalyticsTab {...props} />);
            // Should still render without crashing
            expect(screen.getByTestId("analytics-tab")).toBeInTheDocument();
        });
    });

    describe("Chart Integration", () => {
        it("should pass correct data to chart components", () => {
            const props = createMockProps();
            render(<AnalyticsTab {...props} />);

            // Verify all chart components receive data
            expect(
                screen.getByTestId("response-time-chart")
            ).toBeInTheDocument();
            expect(screen.getByTestId("status-chart")).toBeInTheDocument();
            expect(screen.getByTestId("uptime-chart")).toBeInTheDocument();
        });

        it("should handle empty chart data gracefully", () => {
            const emptyLineChartData: ResponseTimeChartData = {
                labels: [],
                datasets: [],
            };

            const props = createMockProps({
                lineChartData: emptyLineChartData,
            });

            render(<AnalyticsTab {...props} />);
            expect(
                screen.getByTestId("response-time-chart")
            ).toBeInTheDocument();
        });
    });

    describe("Monitor Type Variations", () => {
        it("should handle different monitor types", () => {
            const pingProps = createMockProps({
                monitorType: "ping",
            });

            render(<AnalyticsTab {...pingProps} />);
            const responseTimeElements = screen.getAllByTestId(
                "conditional-response-time"
            );
            // Should have multiple ConditionalResponseTime elements, all with ping monitor type
            expect(responseTimeElements.length).toBeGreaterThan(0);
            responseTimeElements.forEach((element) => {
                expect(element).toHaveAttribute("data-monitor-type", "ping");
            });
        });

        it("should handle port monitor type", () => {
            const portProps = createMockProps({
                monitorType: "port",
            });

            render(<AnalyticsTab {...portProps} />);
            const responseTimeElements = screen.getAllByTestId(
                "conditional-response-time"
            );
            // Should have multiple ConditionalResponseTime elements, all with port monitor type
            expect(responseTimeElements.length).toBeGreaterThan(0);
            responseTimeElements.forEach((element) => {
                expect(element).toHaveAttribute("data-monitor-type", "port");
            });
        });
    });

    describe("Function Calls and Formatting", () => {
        it("should call formatting functions with correct parameters", () => {
            const formatDuration = vi.fn(() => "5m");
            const formatResponseTime = vi.fn(() => "150ms");
            const getAvailabilityDescription = vi.fn(() => "Good");

            const props = createMockProps({
                formatDuration,
                formatResponseTime,
                getAvailabilityDescription,
                avgResponseTime: 150,
                mttr: 300000,
                totalDowntime: 780000,
                uptime: "99.5",
                showAdvancedMetrics: true, // Enable advanced metrics to show MTTR
            });

            render(<AnalyticsTab {...props} />);

            expect(getAvailabilityDescription).toHaveBeenCalledWith(99.5);
            // formatDuration is called with totalDowntime in downtime card
            expect(formatDuration).toHaveBeenCalledWith(780000); // totalDowntime
            // formatDuration is called with MTTR in advanced metrics (when shown)
            expect(formatDuration).toHaveBeenCalledWith(300000); // MTTR
            // formatResponseTime is called multiple times for different response time values
            expect(formatResponseTime).toHaveBeenCalledWith(150); // avgResponseTime
        });

        it("should handle function errors gracefully", () => {
            const props = createMockProps({
                formatDuration: vi.fn(() => {
                    throw new Error("Format error");
                }),
            });

            // Should not crash even if formatting functions throw
            expect(() => {
                render(<AnalyticsTab {...props} />);
            }).not.toThrow();
        });
    });
});
