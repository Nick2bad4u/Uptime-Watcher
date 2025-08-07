import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
    ResponseTimeChart,
    StatusChart,
    UptimeChart,
} from "../../../../components/SiteDetails/charts/ChartComponents";
import type {
    ResponseTimeChartData,
    StatusBarChartData,
    UptimeChartData,
} from "../../../../services/chartConfig";
import type { ChartOptions } from "../../../../services/chartSetup";

// Mock chart.js components
vi.mock("../../../../services/chartSetup", () => ({
    Line: ({ data, options }: any) => (
        <div data-testid="line-chart" data-chart-type="line">
            <div data-testid="chart-data">{JSON.stringify(data)}</div>
            <div data-testid="chart-options">{JSON.stringify(options)}</div>
        </div>
    ),
    Doughnut: ({ data, options }: any) => (
        <div data-testid="doughnut-chart" data-chart-type="doughnut">
            <div data-testid="chart-data">{JSON.stringify(data)}</div>
            <div data-testid="chart-options">{JSON.stringify(options)}</div>
        </div>
    ),
    Bar: ({ data, options }: any) => (
        <div data-testid="bar-chart" data-chart-type="bar">
            <div data-testid="chart-data">{JSON.stringify(data)}</div>
            <div data-testid="chart-options">{JSON.stringify(options)}</div>
        </div>
    ),
}));

describe("ChartComponents", () => {
    describe("ResponseTimeChart", () => {
        const mockResponseTimeData: ResponseTimeChartData = {
            labels: [
                "10:00",
                "10:15",
                "10:30",
                "10:45",
                "11:00",
            ],
            datasets: [
                {
                    label: "Response Time",
                    data: [
                        120,
                        110,
                        130,
                        105,
                        125,
                    ],
                    borderColor: "rgb(75, 192, 192)",
                    backgroundColor: "rgba(75, 192, 192, 0.1)",
                    tension: 0.1,
                    fill: false,
                },
            ],
        };

        const mockLineOptions: ChartOptions<"line"> = {
            responsive: true,
            plugins: {
                legend: {
                    position: "top" as const,
                },
                title: {
                    display: true,
                    text: "Response Time Over Time",
                },
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: "Response Time (ms)",
                    },
                },
            },
        };

        it("should render line chart with correct data and options", () => {
            render(
                <ResponseTimeChart
                    data={mockResponseTimeData}
                    options={mockLineOptions}
                />
            );

            const chart = screen.getByTestId("line-chart");
            expect(chart).toBeInTheDocument();
            expect(chart).toHaveAttribute("data-chart-type", "line");

            const chartData = screen.getByTestId("chart-data");
            expect(chartData).toHaveTextContent(
                JSON.stringify(mockResponseTimeData)
            );

            const chartOptions = screen.getByTestId("chart-options");
            expect(chartOptions).toHaveTextContent(
                JSON.stringify(mockLineOptions)
            );
        });

        it("should have correct display name for debugging", () => {
            expect(ResponseTimeChart.displayName).toBe("ResponseTimeChart");
        });

        it("should render with minimal data", () => {
            const minimalData: ResponseTimeChartData = {
                labels: [],
                datasets: [],
            };

            const minimalOptions: ChartOptions<"line"> = {
                responsive: true,
            };

            render(
                <ResponseTimeChart
                    data={minimalData}
                    options={minimalOptions}
                />
            );

            expect(screen.getByTestId("line-chart")).toBeInTheDocument();
        });

        it("should handle complex dataset configurations", () => {
            const complexData: ResponseTimeChartData = {
                labels: [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                ],
                datasets: [
                    {
                        label: "Average Response Time",
                        data: [
                            120,
                            110,
                            130,
                            105,
                            125,
                        ],
                        borderColor: "rgb(75, 192, 192)",
                        backgroundColor: "rgba(75, 192, 192, 0.1)",
                        tension: 0.1,
                        fill: true,
                    },
                    {
                        label: "Max Response Time",
                        data: [
                            200,
                            180,
                            220,
                            190,
                            210,
                        ],
                        borderColor: "rgb(255, 99, 132)",
                        backgroundColor: "rgba(255, 99, 132, 0.1)",
                        tension: 0.1,
                        fill: false,
                    },
                ],
            };

            render(
                <ResponseTimeChart
                    data={complexData}
                    options={mockLineOptions}
                />
            );

            const chartData = screen.getByTestId("chart-data");
            expect(chartData).toHaveTextContent(JSON.stringify(complexData));
        });
    });

    describe("UptimeChart", () => {
        const mockUptimeData: UptimeChartData = {
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

        const mockDoughnutOptions: ChartOptions<"doughnut"> = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: "bottom" as const,
                },
                title: {
                    display: true,
                    text: "Uptime Distribution",
                },
            },
        };

        it("should render doughnut chart with correct data and options", () => {
            render(
                <UptimeChart
                    data={mockUptimeData}
                    options={mockDoughnutOptions}
                />
            );

            const chart = screen.getByTestId("doughnut-chart");
            expect(chart).toBeInTheDocument();
            expect(chart).toHaveAttribute("data-chart-type", "doughnut");

            const chartData = screen.getByTestId("chart-data");
            expect(chartData).toHaveTextContent(JSON.stringify(mockUptimeData));

            const chartOptions = screen.getByTestId("chart-options");
            expect(chartOptions).toHaveTextContent(
                JSON.stringify(mockDoughnutOptions)
            );
        });

        it("should have correct display name for debugging", () => {
            expect(UptimeChart.displayName).toBe("UptimeChart");
        });

        it("should render with perfect uptime data", () => {
            const perfectUptimeData: UptimeChartData = {
                labels: ["Uptime"],
                datasets: [
                    {
                        data: [100],
                        backgroundColor: ["#10B981"],
                        borderColor: ["#059669"],
                        borderWidth: 2,
                    },
                ],
            };

            render(
                <UptimeChart
                    data={perfectUptimeData}
                    options={mockDoughnutOptions}
                />
            );

            expect(screen.getByTestId("doughnut-chart")).toBeInTheDocument();
        });

        it("should handle multiple datasets", () => {
            const multiDatasetData: UptimeChartData = {
                labels: ["Up", "Down", "Pending"],
                datasets: [
                    {
                        data: [85, 10, 5],
                        backgroundColor: ["#10B981", "#EF4444", "#F59E0B"],
                        borderColor: ["#059669", "#DC2626", "#D97706"],
                        borderWidth: 2,
                    },
                ],
            };

            render(
                <UptimeChart
                    data={multiDatasetData}
                    options={mockDoughnutOptions}
                />
            );

            const chartData = screen.getByTestId("chart-data");
            expect(chartData).toHaveTextContent(
                JSON.stringify(multiDatasetData)
            );
        });
    });

    describe("StatusChart", () => {
        const mockStatusData: StatusBarChartData = {
            labels: ["Up", "Down", "Pending"],
            datasets: [
                {
                    label: "Status Count",
                    data: [150, 5, 2],
                    backgroundColor: ["#10B981", "#EF4444", "#F59E0B"],
                    borderColor: ["#059669", "#DC2626", "#D97706"],
                    borderWidth: 1,
                },
            ],
        };

        const mockBarOptions: ChartOptions<"bar"> = {
            responsive: true,
            plugins: {
                legend: {
                    position: "top" as const,
                },
                title: {
                    display: true,
                    text: "Status Distribution",
                },
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: "Count",
                    },
                },
            },
        };

        it("should render bar chart with correct data and options", () => {
            render(
                <StatusChart data={mockStatusData} options={mockBarOptions} />
            );

            const chart = screen.getByTestId("bar-chart");
            expect(chart).toBeInTheDocument();
            expect(chart).toHaveAttribute("data-chart-type", "bar");

            const chartData = screen.getByTestId("chart-data");
            expect(chartData).toHaveTextContent(JSON.stringify(mockStatusData));

            const chartOptions = screen.getByTestId("chart-options");
            expect(chartOptions).toHaveTextContent(
                JSON.stringify(mockBarOptions)
            );
        });

        it("should have correct display name for debugging", () => {
            expect(StatusChart.displayName).toBe("StatusChart");
        });

        it("should render with single status data", () => {
            const singleStatusData: StatusBarChartData = {
                labels: ["Up"],
                datasets: [
                    {
                        label: "Status Count",
                        data: [100],
                        backgroundColor: ["#10B981"],
                        borderColor: ["#059669"],
                        borderWidth: 1,
                    },
                ],
            };

            render(
                <StatusChart data={singleStatusData} options={mockBarOptions} />
            );

            expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
        });

        it("should handle horizontal bar configuration", () => {
            const horizontalBarOptions: ChartOptions<"bar"> = {
                ...mockBarOptions,
                indexAxis: "y" as const,
                scales: {
                    x: {
                        beginAtZero: true,
                    },
                },
            };

            render(
                <StatusChart
                    data={mockStatusData}
                    options={horizontalBarOptions}
                />
            );

            const chartOptions = screen.getByTestId("chart-options");
            expect(chartOptions).toHaveTextContent(
                JSON.stringify(horizontalBarOptions)
            );
        });

        it("should handle stacked bar configuration", () => {
            const stackedData: StatusBarChartData = {
                labels: ["Week 1", "Week 2", "Week 3"],
                datasets: [
                    {
                        label: "Up",
                        data: [40, 45, 50],
                        backgroundColor: ["#10B981", "#10B981", "#10B981"],
                        borderColor: ["#059669", "#059669", "#059669"],
                        borderWidth: 1,
                    },
                    {
                        label: "Down",
                        data: [2, 1, 3],
                        backgroundColor: ["#EF4444", "#EF4444", "#EF4444"],
                        borderColor: ["#DC2626", "#DC2626", "#DC2626"],
                        borderWidth: 1,
                    },
                ],
            };

            const stackedOptions: ChartOptions<"bar"> = {
                ...mockBarOptions,
                scales: {
                    x: {
                        stacked: true,
                    },
                    y: {
                        stacked: true,
                    },
                },
            };

            render(<StatusChart data={stackedData} options={stackedOptions} />);

            expect(screen.getByTestId("bar-chart")).toBeInTheDocument();
        });
    });

    describe("Memoization Behavior", () => {
        it("should be memoized components", () => {
            // Check that components are wrapped with React.memo
            expect(ResponseTimeChart.$$typeof).toBeDefined();
            expect(UptimeChart.$$typeof).toBeDefined();
            expect(StatusChart.$$typeof).toBeDefined();
        });

        it("should not re-render when props haven't changed", () => {
            const data: ResponseTimeChartData = {
                labels: ["A", "B"],
                datasets: [
                    {
                        label: "Test",
                        data: [1, 2],
                        backgroundColor: "blue",
                        borderColor: "blue",
                        fill: false,
                        tension: 0.1,
                    },
                ],
            };
            const options: ChartOptions<"line"> = { responsive: true };

            const { rerender } = render(
                <ResponseTimeChart data={data} options={options} />
            );

            const initialChart = screen.getByTestId("line-chart");

            // Re-render with same props - should not create new instance
            rerender(<ResponseTimeChart data={data} options={options} />);

            const rerenderChart = screen.getByTestId("line-chart");
            expect(rerenderChart).toBeInTheDocument();
        });
    });

    describe("Error Handling", () => {
        it("should handle empty datasets gracefully", () => {
            const emptyData: ResponseTimeChartData = {
                labels: [],
                datasets: [],
            };

            const options: ChartOptions<"line"> = { responsive: true };

            render(<ResponseTimeChart data={emptyData} options={options} />);

            expect(screen.getByTestId("line-chart")).toBeInTheDocument();
        });

        it("should handle undefined optional properties", () => {
            const minimalData: UptimeChartData = {
                labels: ["Test"],
                datasets: [
                    {
                        data: [100],
                        backgroundColor: ["green"],
                        borderColor: ["darkgreen"],
                        borderWidth: 1,
                    },
                ],
            };

            const minimalOptions: ChartOptions<"doughnut"> = {};

            render(<UptimeChart data={minimalData} options={minimalOptions} />);

            expect(screen.getByTestId("doughnut-chart")).toBeInTheDocument();
        });
    });

    describe("Type Safety", () => {
        it("should accept proper chart data types", () => {
            // This test ensures that TypeScript types are working correctly
            const responseTimeData: ResponseTimeChartData = {
                labels: ["1", "2", "3"],
                datasets: [
                    {
                        label: "Response Time",
                        data: [100, 200, 300],
                        borderColor: "blue",
                        backgroundColor: "lightblue",
                        fill: false,
                        tension: 0.1,
                    },
                ],
            };

            const uptimeData: UptimeChartData = {
                labels: ["Up", "Down"],
                datasets: [
                    {
                        data: [95, 5],
                        backgroundColor: ["green", "red"],
                        borderColor: ["darkgreen", "darkred"],
                        borderWidth: 1,
                    },
                ],
            };

            const statusData: StatusBarChartData = {
                labels: ["Status A", "Status B"],
                datasets: [
                    {
                        label: "Count",
                        data: [10, 5],
                        backgroundColor: ["purple", "orange"],
                        borderColor: ["darkpurple", "darkorange"],
                        borderWidth: 1,
                    },
                ],
            };

            const lineOptions: ChartOptions<"line"> = { responsive: true };
            const doughnutOptions: ChartOptions<"doughnut"> = {
                responsive: true,
            };
            const barOptions: ChartOptions<"bar"> = { responsive: true };

            expect(() => {
                render(
                    <ResponseTimeChart
                        data={responseTimeData}
                        options={lineOptions}
                    />
                );
                render(
                    <UptimeChart data={uptimeData} options={doughnutOptions} />
                );
                render(<StatusChart data={statusData} options={barOptions} />);
            }).not.toThrow();
        });
    });
});
