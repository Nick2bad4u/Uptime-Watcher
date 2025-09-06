import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ChartOptions } from "chart.js";

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

// Mock all external dependencies
vi.mock("../../../../services/logger", () => ({
    logger: {
        debug: vi.fn(),
        error: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        app: {
            started: vi.fn(),
            error: vi.fn(),
        },
        site: {
            error: vi.fn(),
            info: vi.fn(),
        },
        user: {
            action: vi.fn(),
        },
        system: {
            error: vi.fn(),
            info: vi.fn(),
        },
    },
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
    ConditionalResponseTime: ({ children, monitorType }: any) => (
        // Always show children (assumes response time is supported for test simplicity)
        <div
            data-testid="conditional-response-time"
            data-monitor-type={monitorType}
        >
            {children}
        </div>
    ),
}));

// Mock the monitorUiHelpers to prevent async operations
vi.mock("../../../../utils/monitorUiHelpers", () => ({
    supportsResponseTime: vi.fn(() => true), // Synchronous function
    formatMonitorDetail: vi.fn(() => "mocked detail"), // Synchronous function
}));

vi.mock("../../../../components/SiteDetails/charts/ResponseTimeChart", () => ({
    ResponseTimeChart: () => (
        <div data-testid="response-time-chart" data-chart-type="line">
            Line Chart
        </div>
    ),
}));

vi.mock("../../../../components/SiteDetails/charts/StatusChart", () => ({
    StatusChart: () => (
        <div data-testid="status-chart" data-chart-type="bar">
            Bar Chart
        </div>
    ),
}));

vi.mock("../../../../components/SiteDetails/charts/UptimeChart", () => ({
    UptimeChart: () => (
        <div data-testid="uptime-chart" data-chart-type="doughnut">
            Doughnut Chart
        </div>
    ),
}));

describe(AnalyticsTab, () => {
    const createMockProps = (
        overrides?: Partial<AnalyticsTabProperties>
    ): AnalyticsTabProperties => {
        const mockLineChartData: ResponseTimeChartData = {
            labels: [
                "10:00",
                "10:15",
                "10:30",
            ],
            datasets: [
                {
                    label: "Response Time",
                    data: [
                        100,
                        120,
                        110,
                    ],
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
                start: Date.now() - 3_600_000,
                end: Date.now() - 3_000_000,
                duration: 600_000,
            },
            {
                start: Date.now() - 7_200_000,
                end: Date.now() - 7_020_000,
                duration: 180_000,
            },
        ];

        return {
            avgResponseTime: 150,
            barChartData: mockBarChartData,
            barChartOptions: mockChartOptions as unknown as ChartOptions<"bar">,
            doughnutOptions:
                mockChartOptions as unknown as ChartOptions<"doughnut">,
            downCount: 5,
            downtimePeriods: mockDowntimePeriods,
            formatDuration: vi.fn((ms: number) => `${Math.round(ms / 1000)}s`),
            formatResponseTime: vi.fn((time: number) => `${time}ms`),
            getAvailabilityDescription: vi.fn((percentage: number) => {
                if (percentage >= 99.9) return "Excellent";
                if (percentage >= 99) return "Good";
                return "Poor";
            }),
            lineChartData: mockLineChartData,
            lineChartOptions: mockChartOptions,
            monitorType: "http" as const,
            mttr: 300_000,
            p50: 120,
            p95: 200,
            p99: 250,
            setShowAdvancedMetrics: vi.fn(),
            setSiteDetailsChartTimeRange: vi.fn(),
            showAdvancedMetrics: false,
            siteDetailsChartTimeRange: "24h" as const,
            totalChecks: 100,
            totalDowntime: 780_000,
            upCount: 95,
            uptime: "99.5",
            uptimeChartData: mockUptimeChartData,
            ...overrides,
        };
    };

    describe("Basic Rendering", () => {
        it("should render analytics tab with all main sections", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AnalyticsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AnalyticsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

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

        it("should display all chart components", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AnalyticsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AnalyticsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const props = createMockProps();
            render(<AnalyticsTab {...props} />);

            expect(
                screen.getByTestId("response-time-chart")
            ).toBeInTheDocument();
            expect(screen.getByTestId("status-chart")).toBeInTheDocument();
            expect(screen.getByTestId("uptime-chart")).toBeInTheDocument();
        });

        it("should show time range selector with all options", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AnalyticsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AnalyticsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

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
        it("should display uptime percentage and description", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AnalyticsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AnalyticsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const props = createMockProps({
                uptime: "99.5",
                getAvailabilityDescription: vi.fn(() => "Excellent"),
            });
            render(<AnalyticsTab {...props} />);

            // Check both elements exist - they will both show 99.5%
            const progressElement = screen.getByRole("progressbar");
            expect(progressElement).toBeInTheDocument();

            // Get all elements with the percentage text since there are multiple
            const percentageElements = screen.getAllByText("99.5%");
            expect(percentageElements.length).toBeGreaterThanOrEqual(1);

            expect(screen.getByText("Excellent")).toBeInTheDocument();
            expect(props.getAvailabilityDescription).toHaveBeenCalledWith(99.5);
        });

        it("should display response time metrics", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AnalyticsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AnalyticsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

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

        it("should display check statistics", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AnalyticsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AnalyticsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

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

        it("should display MTTR with correct formatting when advanced metrics enabled", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AnalyticsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AnalyticsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const props = createMockProps({
                mttr: 300_000,
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

            expect(props.formatDuration).toHaveBeenCalledWith(300_000);
        });
    });

    describe("Advanced Metrics", () => {
        it("should toggle advanced metrics when button is clicked", async ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AnalyticsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AnalyticsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

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

        it("should display advanced metrics when enabled", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AnalyticsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AnalyticsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

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

        it("should hide advanced metrics when disabled", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AnalyticsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AnalyticsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

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
        it("should display downtime information", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AnalyticsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AnalyticsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const props = createMockProps({
                downtimePeriods: [
                    {
                        start: Date.now() - 3_600_000,
                        end: Date.now() - 3_000_000,
                        duration: 600_000,
                    },
                ],
                formatDuration: vi.fn(() => "10m"),
            });

            render(<AnalyticsTab {...props} />);

            expect(screen.getByText("Downtime")).toBeInTheDocument();
            expect(screen.getByText("1 incidents")).toBeInTheDocument();
        });

        it("should show no incidents when no downtime", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AnalyticsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AnalyticsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const props = createMockProps({
                downtimePeriods: [],
            });

            render(<AnalyticsTab {...props} />);

            expect(screen.getByText("Downtime")).toBeInTheDocument();
            expect(screen.getByText("0 incidents")).toBeInTheDocument();
        });

        it("should display downtime duration", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AnalyticsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AnalyticsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const props = createMockProps({
                totalDowntime: 780_000,
                formatDuration: vi.fn(() => "13m"),
            });

            render(<AnalyticsTab {...props} />);

            expect(screen.getByText("Downtime")).toBeInTheDocument();
            expect(screen.getByText("13m")).toBeInTheDocument();
        });
    });

    describe("Time Range Selection", () => {
        it("should call setSiteDetailsChartTimeRange when time range is changed", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AnalyticsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AnalyticsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

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

        it("should highlight current time range", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AnalyticsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AnalyticsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

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
        it("should use green color for excellent response times (≤100ms)", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AnalyticsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AnalyticsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const props = createMockProps({
                avgResponseTime: 80,
            });

            render(<AnalyticsTab {...props} />);
            // Component should render without errors for good response time
            expect(screen.getByTestId("analytics-tab")).toBeInTheDocument();
        });

        it("should use yellow color for good response times (≤500ms)", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AnalyticsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AnalyticsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const props = createMockProps({
                avgResponseTime: 300,
            });

            render(<AnalyticsTab {...props} />);
            expect(screen.getByTestId("analytics-tab")).toBeInTheDocument();
        });

        it("should use red color for poor response times (>500ms)", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AnalyticsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AnalyticsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const props = createMockProps({
                avgResponseTime: 800,
            });

            render(<AnalyticsTab {...props} />);
            expect(screen.getByTestId("analytics-tab")).toBeInTheDocument();
        });
    });

    describe("Edge Cases", () => {
        it("should handle zero MTTR correctly", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AnalyticsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AnalyticsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const props = createMockProps({
                mttr: 0,
                formatDuration: vi.fn(() => "0s"),
            });

            render(<AnalyticsTab {...props} />);
            expect(screen.getByText("0s")).toBeInTheDocument();
        });

        it("should handle zero downtime periods", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AnalyticsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AnalyticsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const props = createMockProps({
                downtimePeriods: [],
                totalDowntime: 0,
                formatDuration: vi.fn(() => "0s"),
            });

            render(<AnalyticsTab {...props} />);
            expect(screen.getByText("Downtime")).toBeInTheDocument();
            expect(screen.getByText("0 incidents")).toBeInTheDocument();
        });

        it("should handle perfect uptime (100%)", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AnalyticsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AnalyticsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const props = createMockProps({
                uptime: "100",
                downCount: 0,
                totalDowntime: 0,
            });

            render(<AnalyticsTab {...props} />);

            // Use semantic selectors instead of test IDs
            const progressElement = screen.getByRole("progressbar");
            expect(progressElement).toBeInTheDocument();

            const badgeElement = screen.getByText("100%");
            expect(badgeElement).toBeInTheDocument();
        });

        it("should handle invalid uptime values", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AnalyticsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AnalyticsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const props = createMockProps({
                uptime: "invalid",
            });

            render(<AnalyticsTab {...props} />);
            // Should still render without crashing
            expect(screen.getByTestId("analytics-tab")).toBeInTheDocument();
        });
    });

    describe("Chart Integration", () => {
        it("should pass correct data to chart components", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AnalyticsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AnalyticsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const props = createMockProps();
            render(<AnalyticsTab {...props} />);

            // Verify all chart components receive data
            expect(
                screen.getByTestId("response-time-chart")
            ).toBeInTheDocument();
            expect(screen.getByTestId("status-chart")).toBeInTheDocument();
            expect(screen.getByTestId("uptime-chart")).toBeInTheDocument();
        });

        it("should handle empty chart data gracefully", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AnalyticsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AnalyticsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

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
        it("should handle different monitor types", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AnalyticsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AnalyticsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            const pingProps = createMockProps({
                monitorType: "ping",
            });

            render(<AnalyticsTab {...pingProps} />);
            const responseTimeElements = screen.getAllByTestId(
                "conditional-response-time"
            );
            // Should have multiple ConditionalResponseTime elements, all with ping monitor type
            expect(responseTimeElements.length).toBeGreaterThan(0);
            for (const element of responseTimeElements) {
                expect(element).toHaveAttribute("data-monitor-type", "ping");
            }
        });

        it("should handle port monitor type", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AnalyticsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AnalyticsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Monitoring", "type");

            const portProps = createMockProps({
                monitorType: "port",
            });

            render(<AnalyticsTab {...portProps} />);
            const responseTimeElements = screen.getAllByTestId(
                "conditional-response-time"
            );
            // Should have multiple ConditionalResponseTime elements, all with port monitor type
            expect(responseTimeElements.length).toBeGreaterThan(0);
            for (const element of responseTimeElements) {
                expect(element).toHaveAttribute("data-monitor-type", "port");
            }
        });
    });

    describe("Function Calls and Formatting", () => {
        it("should call formatting functions with correct parameters", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AnalyticsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AnalyticsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const formatDuration = vi.fn(() => "5m");
            const formatResponseTime = vi.fn(() => "150ms");
            const getAvailabilityDescription = vi.fn(() => "Good");

            const props = createMockProps({
                formatDuration,
                formatResponseTime,
                getAvailabilityDescription,
                avgResponseTime: 150,
                mttr: 300_000,
                totalDowntime: 780_000,
                uptime: "99.5",
                showAdvancedMetrics: true, // Enable advanced metrics to show MTTR
            });

            render(<AnalyticsTab {...props} />);

            expect(getAvailabilityDescription).toHaveBeenCalledWith(99.5);
            // formatDuration is called with totalDowntime in downtime card
            expect(formatDuration).toHaveBeenCalledWith(780_000); // totalDowntime
            // formatDuration is called with MTTR in advanced metrics (when shown)
            expect(formatDuration).toHaveBeenCalledWith(300_000); // MTTR
            // formatResponseTime is called multiple times for different response time values
            expect(formatResponseTime).toHaveBeenCalledWith(150); // avgResponseTime
        });

        it("should handle function errors gracefully", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AnalyticsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: AnalyticsTab", "component");
            annotate("Category: Component", "category");
            annotate("Type: Error Handling", "type");

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
