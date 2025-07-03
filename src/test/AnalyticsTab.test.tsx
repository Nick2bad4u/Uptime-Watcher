/**
 * @vitest-environment jsdom
 */

/* eslint-disable @typescript-eslint/no-unused-vars */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AnalyticsTab } from "../components/SiteDetails/tabs/AnalyticsTab";

// Mock Chart.js components
vi.mock("react-chartjs-2", () => ({
    Line: ({ data, options, ...props }: { data: unknown; options: unknown; [key: string]: unknown }) => (
        <div
            data-testid="line-chart"
            data-chart-data={JSON.stringify(data)}
            data-chart-options={JSON.stringify(options)}
            {...props}
        >
            Line Chart
        </div>
    ),
    Bar: ({ data, options, ...props }: { data: unknown; options: unknown; [key: string]: unknown }) => (
        <div
            data-testid="bar-chart"
            data-chart-data={JSON.stringify(data)}
            data-chart-options={JSON.stringify(options)}
            {...props}
        >
            Bar Chart
        </div>
    ),
    Doughnut: ({ data, options, ...props }: { data: unknown; options: unknown; [key: string]: unknown }) => (
        <div
            data-testid="doughnut-chart"
            data-chart-data={JSON.stringify(data)}
            data-chart-options={JSON.stringify(options)}
            {...props}
        >
            Doughnut Chart
        </div>
    ),
}));

// Mock themed components
vi.mock("../theme/components", () => ({
    ThemedBox: ({
        children,
        border,
        ...props
    }: {
        children?: React.ReactNode;
        border?: boolean;
        [key: string]: unknown;
    }) => {
        return (
            <div data-testid="themed-box" {...props}>
                {children}
            </div>
        );
    },
    ThemedText: ({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) => (
        <span data-testid="themed-text" {...props}>
            {children}
        </span>
    ),
    ThemedButton: ({
        children,
        onClick,
        ...props
    }: {
        children?: React.ReactNode;
        onClick?: () => void;
        [key: string]: unknown;
    }) => (
        <button data-testid="themed-button" onClick={onClick} {...props}>
            {children}
        </button>
    ),
}));

// Mock logger
vi.mock("../services/logger", () => ({
    default: {
        info: vi.fn(),
        error: vi.fn(),
        warn: vi.fn(),
        debug: vi.fn(),
        user: {
            action: vi.fn(),
        },
    },
}));

describe("AnalyticsTab", () => {
    const mockDowntimePeriods = [
        {
            start: new Date("2024-01-01T10:00:00Z").getTime(),
            end: new Date("2024-01-01T10:30:00Z").getTime(),
            duration: 1800000,
        },
        {
            start: new Date("2024-01-02T15:00:00Z").getTime(),
            end: new Date("2024-01-02T15:15:00Z").getTime(),
            duration: 900000,
        },
    ];

    const defaultProps = {
        avgResponseTime: 250,
        barChartData: { labels: ["Success", "Error"], datasets: [{ data: [95, 5] }] },
        barChartOptions: { responsive: true, maintainAspectRatio: false },
        chartTimeRange: "24h",
        doughnutOptions: { responsive: true, maintainAspectRatio: false },
        downCount: 5,
        downtimePeriods: mockDowntimePeriods,
        formatDuration: vi.fn().mockImplementation((ms: number) => `${Math.round(ms / 60000)}m`),
        formatResponseTime: vi.fn().mockImplementation((time: number) => `${time}ms`),
        getAvailabilityColor: vi.fn().mockReturnValue("#10b981"),
        getAvailabilityDescription: vi.fn().mockReturnValue("Excellent availability"),
        getAvailabilityVariant: vi.fn().mockReturnValue("success" as const),
        lineChartData: { labels: [], datasets: [] },
        lineChartOptions: { responsive: true, maintainAspectRatio: false },
        monitorType: "http" as const,
        mttr: 300000,
        p50: 200,
        p95: 400,
        p99: 500,
        setShowAdvancedMetrics: vi.fn(),
        showAdvancedMetrics: false,
        totalChecks: 100,
        totalDowntime: 2700000,
        upCount: 95,
        uptime: "95.5",
        uptimeChartData: { labels: ["Up", "Down"], datasets: [{ data: [95.5, 4.5] }] },
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("Basic Rendering", () => {
        it("should render analytics tab with all main sections", () => {
            render(<AnalyticsTab {...defaultProps} />);

            // Should render analytics summary
            expect(screen.getByText("Availability (24h)")).toBeInTheDocument();
            expect(screen.getByText("95.5%")).toBeInTheDocument();
            expect(screen.getByText("95 up / 5 down")).toBeInTheDocument();
            expect(screen.getByText("Excellent availability")).toBeInTheDocument();

            // Should render avg response time for http monitors
            expect(screen.getByText("Avg Response Time")).toBeInTheDocument();
            expect(screen.getByText("250ms")).toBeInTheDocument();
            expect(screen.getByText("Based on 100 checks")).toBeInTheDocument();

            // Should render total downtime
            expect(screen.getByText("Total Downtime")).toBeInTheDocument();
            expect(screen.getByText("45m")).toBeInTheDocument();
            expect(screen.getByText("2 incidents")).toBeInTheDocument();
        });

        it("should render charts for http monitor", () => {
            render(<AnalyticsTab {...defaultProps} />);

            // Should render all three chart types
            expect(screen.getByTestId("line-chart")).toBeInTheDocument();
            expect(screen.getByTestId("doughnut-chart")).toBeInTheDocument();
            expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
        });

        it("should render response time analysis section", () => {
            render(<AnalyticsTab {...defaultProps} />);

            expect(screen.getByText("Response Time Analysis")).toBeInTheDocument();
            expect(screen.getByText("Show Advanced")).toBeInTheDocument();
        });
    });

    describe("Monitor Type Handling", () => {
        it("should show response time sections for port monitor", () => {
            render(<AnalyticsTab {...defaultProps} monitorType="port" />);

            // Should still show availability
            expect(screen.getByText("Availability (24h)")).toBeInTheDocument();

            // Should show avg response time for port monitors (based on code)
            expect(screen.getByText("Avg Response Time")).toBeInTheDocument();

            // Should show response time analysis for port monitors
            expect(screen.getByText("Response Time Analysis")).toBeInTheDocument();
        });

        it("should handle different monitor types appropriately", () => {
            // Test port monitor first
            const { rerender } = render(<AnalyticsTab {...defaultProps} monitorType="port" />);

            // For port monitor, should show response time sections (based on actual code behavior)
            expect(screen.getByText("Avg Response Time")).toBeInTheDocument();
            expect(screen.getByText("Response Time Analysis")).toBeInTheDocument();
            expect(screen.getByTestId("line-chart")).toBeInTheDocument();

            // Should still show availability and downtime
            expect(screen.getByText("Availability (24h)")).toBeInTheDocument();
            expect(screen.getByText("Total Downtime")).toBeInTheDocument();

            // Should show doughnut and bar charts
            expect(screen.getByTestId("doughnut-chart")).toBeInTheDocument();
            expect(screen.getByTestId("bar-chart")).toBeInTheDocument();

            // Test http monitor - should also show response time sections
            rerender(<AnalyticsTab {...defaultProps} monitorType="http" />);
            expect(screen.getByText("Avg Response Time")).toBeInTheDocument();
            expect(screen.getByText("Response Time Analysis")).toBeInTheDocument();
            expect(screen.getByTestId("line-chart")).toBeInTheDocument();
        });
    });

    describe("Advanced Metrics Toggle", () => {
        it("should call setShowAdvancedMetrics when toggle button is clicked", async () => {
            const user = userEvent.setup();
            render(<AnalyticsTab {...defaultProps} />);

            const toggleButton = screen.getByText("Show Advanced");
            await user.click(toggleButton);

            expect(defaultProps.setShowAdvancedMetrics).toHaveBeenCalledWith(true);
        });

        it("should show advanced metrics when showAdvancedMetrics is true", () => {
            render(<AnalyticsTab {...defaultProps} showAdvancedMetrics={true} />);

            // Should show percentile metrics (these are always shown for http/port monitors)
            expect(screen.getByText("P50")).toBeInTheDocument();
            expect(screen.getByText("200ms")).toBeInTheDocument();
            expect(screen.getByText("P95")).toBeInTheDocument();
            expect(screen.getByText("400ms")).toBeInTheDocument();
            expect(screen.getByText("P99")).toBeInTheDocument();
            expect(screen.getByText("500ms")).toBeInTheDocument();

            // Should show MTTR (conditional advanced metrics)
            expect(screen.getByText("Mean Time To Recovery")).toBeInTheDocument();
            expect(screen.getByText("5m")).toBeInTheDocument();

            // Should show incidents count (conditional advanced metrics)
            expect(screen.getByText("Incidents")).toBeInTheDocument();
            expect(screen.getByText("2")).toBeInTheDocument();

            // Button should say "Hide Advanced"
            expect(screen.getByText("Hide Advanced")).toBeInTheDocument();
        });

        it("should hide advanced metrics when showAdvancedMetrics is false", () => {
            render(<AnalyticsTab {...defaultProps} showAdvancedMetrics={false} />);

            // Percentile metrics are always shown for http/port monitors, not conditional
            expect(screen.getByText("P50")).toBeInTheDocument();
            expect(screen.getByText("P95")).toBeInTheDocument();
            expect(screen.getByText("P99")).toBeInTheDocument();

            // These advanced metrics should NOT be shown when showAdvancedMetrics is false
            expect(screen.queryByText("Mean Time To Recovery")).not.toBeInTheDocument();
            expect(screen.queryByText("Incidents")).not.toBeInTheDocument();

            // Button should say "Show Advanced"
            expect(screen.getByText("Show Advanced")).toBeInTheDocument();
        });
    });

    describe("Formatting Functions", () => {
        it("should call formatResponseTime for response time values", () => {
            render(<AnalyticsTab {...defaultProps} />);

            expect(defaultProps.formatResponseTime).toHaveBeenCalledWith(250);
        });

        it("should call formatDuration for duration values", () => {
            render(<AnalyticsTab {...defaultProps} />);

            expect(defaultProps.formatDuration).toHaveBeenCalledWith(2700000);
        });

        it("should call availability functions with uptime percentage", () => {
            render(<AnalyticsTab {...defaultProps} />);

            expect(defaultProps.getAvailabilityColor).toHaveBeenCalledWith(95.5);
            expect(defaultProps.getAvailabilityDescription).toHaveBeenCalledWith(95.5);
            expect(defaultProps.getAvailabilityVariant).toHaveBeenCalledWith(95.5);
        });
    });

    describe("Chart Integration", () => {
        it("should pass correct data to line chart", () => {
            const customLineData = { labels: ["1h", "2h"], datasets: [{ data: [200, 300] }] };
            render(<AnalyticsTab {...defaultProps} lineChartData={customLineData} />);

            const lineChart = screen.getByTestId("line-chart");
            expect(lineChart).toHaveAttribute("data-chart-data", JSON.stringify(customLineData));
        });

        it("should pass correct data to bar chart", () => {
            const customBarData = { labels: ["Success", "Error"], datasets: [{ data: [90, 10] }] };
            render(<AnalyticsTab {...defaultProps} barChartData={customBarData} />);

            const barChart = screen.getByTestId("bar-chart");
            expect(barChart).toHaveAttribute("data-chart-data", JSON.stringify(customBarData));
        });

        it("should pass correct data to doughnut chart", () => {
            const customDoughnutData = { labels: ["Up", "Down"], datasets: [{ data: [98, 2] }] };
            render(<AnalyticsTab {...defaultProps} uptimeChartData={customDoughnutData} />);

            const doughnutChart = screen.getByTestId("doughnut-chart");
            expect(doughnutChart).toHaveAttribute("data-chart-data", JSON.stringify(customDoughnutData));
        });
    });

    describe("Edge Cases", () => {
        it("should handle zero downtime periods", () => {
            render(<AnalyticsTab {...defaultProps} downtimePeriods={[]} downCount={0} totalDowntime={0} />);

            expect(screen.getByText("0 incidents")).toBeInTheDocument();
            expect(screen.getByText("0m")).toBeInTheDocument();
        });

        it("should handle zero checks", () => {
            render(<AnalyticsTab {...defaultProps} totalChecks={0} upCount={0} downCount={0} />);

            expect(screen.getByText("0 up / 0 down")).toBeInTheDocument();
            expect(screen.getByText("Based on 0 checks")).toBeInTheDocument();
        });

        it("should handle very high uptime values", () => {
            render(<AnalyticsTab {...defaultProps} uptime="99.99" />);

            expect(defaultProps.getAvailabilityColor).toHaveBeenCalledWith(99.99);
            expect(defaultProps.getAvailabilityDescription).toHaveBeenCalledWith(99.99);
            expect(defaultProps.getAvailabilityVariant).toHaveBeenCalledWith(99.99);
            expect(screen.getByText("99.99%")).toBeInTheDocument();
        });

        it("should handle very low uptime values", () => {
            render(<AnalyticsTab {...defaultProps} uptime="50.0" />);

            expect(defaultProps.getAvailabilityColor).toHaveBeenCalledWith(50.0);
            expect(defaultProps.getAvailabilityDescription).toHaveBeenCalledWith(50.0);
            expect(defaultProps.getAvailabilityVariant).toHaveBeenCalledWith(50.0);
            expect(screen.getByText("50.0%")).toBeInTheDocument();
        });

        it("should handle large response time values", () => {
            const largeResponseTime = 5000;
            render(<AnalyticsTab {...defaultProps} avgResponseTime={largeResponseTime} />);

            expect(defaultProps.formatResponseTime).toHaveBeenCalledWith(largeResponseTime);
        });
    });

    describe("Chart Time Range", () => {
        it("should display different time ranges correctly", () => {
            const { rerender } = render(<AnalyticsTab {...defaultProps} chartTimeRange="7d" />);
            expect(screen.getByText("Availability (7d)")).toBeInTheDocument();

            rerender(<AnalyticsTab {...defaultProps} chartTimeRange="30d" />);
            expect(screen.getByText("Availability (30d)")).toBeInTheDocument();

            rerender(<AnalyticsTab {...defaultProps} chartTimeRange="1h" />);
            expect(screen.getByText("Availability (1h)")).toBeInTheDocument();
        });
    });

    describe("Percentile Values", () => {
        it("should display percentile values correctly when advanced metrics are shown", () => {
            render(<AnalyticsTab {...defaultProps} showAdvancedMetrics={true} p50={150} p95={450} p99={550} />);

            expect(screen.getByText("150ms")).toBeInTheDocument();
            expect(screen.getByText("450ms")).toBeInTheDocument();
            expect(screen.getByText("550ms")).toBeInTheDocument();
        });

        it("should format percentile values using formatResponseTime", () => {
            render(<AnalyticsTab {...defaultProps} showAdvancedMetrics={true} />);

            expect(defaultProps.formatResponseTime).toHaveBeenCalledWith(200); // p50
            expect(defaultProps.formatResponseTime).toHaveBeenCalledWith(400); // p95
            expect(defaultProps.formatResponseTime).toHaveBeenCalledWith(500); // p99
        });
    });

    describe("MTTR Display", () => {
        it("should display MTTR correctly when advanced metrics are shown", () => {
            render(<AnalyticsTab {...defaultProps} showAdvancedMetrics={true} mttr={600000} />);

            expect(defaultProps.formatDuration).toHaveBeenCalledWith(600000);
            expect(screen.getByText("10m")).toBeInTheDocument();
        });
    });
});
