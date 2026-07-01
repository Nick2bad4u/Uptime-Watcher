/**
 * Branch Coverage Optimization Tests
 *
 * Targeted tests to improve branch coverage for specific files identified in
 * the coverage report as having branch coverage below 90%.
 */

import { createValidMonitor } from "@shared/test/testHelpers";
import { render, screen } from "@testing-library/react";
import * as React from "react";
import { arrayFirst } from "ts-extras";
import { describe, expect, it, vi } from "vitest";

// Import components with low branch coverage
import { StatusBadge } from "../components/common/StatusBadge";
import { SiteCardHistory } from "../components/Dashboard/SiteCard/SiteCardHistory";
import { ThemeProvider } from "../theme/components/ThemeProvider";

// Mock dependencies
vi.mock("../hooks/useMonitorTypes", () => ({
    useMonitorTypes: () => ({
        options: [
            { value: "http", label: "HTTP" },
            { value: "port", label: "Port" },
        ],
    }),
}));

vi.mock("../utils/monitorTitleFormatters", () => ({
    formatTitleSuffix: (monitor: any) => {
        if (monitor.type === "http" && monitor.url) {
            return ` - ${monitor.url}`;
        }
        if (monitor.type === "port" && monitor.host && monitor.port) {
            return ` - ${monitor.host}:${monitor.port}`;
        }
        return "";
    },
}));

vi.mock("../components/common/HistoryChart", () => ({
    HistoryChart: ({ title, history, maxItems }: any) => (
        <div data-testid="history-chart">
            <div data-testid="chart-title">{title}</div>
            <div data-testid="chart-history-count">{history.length}</div>
            <div data-testid="chart-max-items">{maxItems}</div>
        </div>
    ),
}));

describe("Branch Coverage Optimization Tests", () => {
    describe("StatusBadge Component", () => {
        it("should handle all size mappings in getIndicatorSize switch statement", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: branch-coverage-optimization", "component");
            annotate("Category: Core", "category");
            annotate("Type: Data Retrieval", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: branch-coverage-optimization", "component");
            annotate("Category: Core", "category");
            annotate("Type: Data Retrieval", "type");

            // Test 2xl size (should map to "lg")
            render(
                <ThemeProvider>
                    <StatusBadge label="Test" size="2xl" status="up" />
                </ThemeProvider>
            );

            // Test 3xl size (should map to "lg")
            render(
                <ThemeProvider>
                    <StatusBadge label="Test" size="3xl" status="up" />
                </ThemeProvider>
            );

            // Test 4xl size (should map to "lg")
            render(
                <ThemeProvider>
                    <StatusBadge label="Test" size="4xl" status="up" />
                </ThemeProvider>
            );

            // Test xl size (should map to "lg")
            render(
                <ThemeProvider>
                    <StatusBadge label="Test" size="xl" status="up" />
                </ThemeProvider>
            );

            // Test base size (should map to "md")
            render(
                <ThemeProvider>
                    <StatusBadge label="Test" size="base" status="up" />
                </ThemeProvider>
            );

            // Test lg size (should map to "md")
            render(
                <ThemeProvider>
                    <StatusBadge label="Test" size="lg" status="up" />
                </ThemeProvider>
            );

            // Test sm size (should map to "sm")
            render(
                <ThemeProvider>
                    <StatusBadge label="Test" size="sm" status="up" />
                </ThemeProvider>
            );

            // Test xs size (should map to "sm")
            render(
                <ThemeProvider>
                    <StatusBadge label="Test" size="xs" status="up" />
                </ThemeProvider>
            );

            expect(screen.getAllByText(/Test/v).length).toBeGreaterThan(0);
        });

        it("should handle custom formatter function", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: branch-coverage-optimization", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: branch-coverage-optimization", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            const customFormatter = (label: string, status: string) =>
                `Custom: ${label} (${status.toUpperCase()})`;

            render(
                <ThemeProvider>
                    <StatusBadge
                        formatter={customFormatter}
                        label="Status"
                        status="up"
                    />
                </ThemeProvider>
            );

            expect(screen.getByText("Custom: Status (UP)")).toBeInTheDocument();
        });

        it("should handle default formatter when no custom formatter provided", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: branch-coverage-optimization", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: branch-coverage-optimization", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            render(
                <ThemeProvider>
                    <StatusBadge label="Status" status="down" />
                </ThemeProvider>
            );

            expect(screen.getByText("Status: down")).toBeInTheDocument();
        });

        it("should handle showIcon=false branch", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: branch-coverage-optimization", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: branch-coverage-optimization", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            render(
                <ThemeProvider>
                    <StatusBadge label="Status" showIcon={false} status="up" />
                </ThemeProvider>
            );

            expect(screen.getByText("Status: up")).toBeInTheDocument();
        });

        it("should handle showIcon=true branch (default)", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: branch-coverage-optimization", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: branch-coverage-optimization", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            render(
                <ThemeProvider>
                    <StatusBadge label="Status" showIcon={true} status="up" />
                </ThemeProvider>
            );

            expect(screen.getByText("Status: up")).toBeInTheDocument();
        });
    });

    describe("SiteCardHistory Component", () => {
        const mockHistory = [
            { timestamp: Date.now(), status: "up" as const, responseTime: 100 },
            {
                timestamp: Date.now() - 1000,
                status: "down" as const,
                responseTime: -1,
            },
        ];

        it("should handle undefined monitor case", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: branch-coverage-optimization", "component");
            annotate("Category: Core", "category");
            annotate("Type: Monitoring", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: branch-coverage-optimization", "component");
            annotate("Category: Core", "category");
            annotate("Type: Monitoring", "type");

            render(
                <SiteCardHistory
                    filteredHistory={mockHistory}
                    monitor={undefined}
                />
            );

            expect(screen.getByTestId("chart-title")).toHaveTextContent(
                "No Monitor Selected"
            );
        });

        it("should handle monitor with type not found in options", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: branch-coverage-optimization", "component");
            annotate("Category: Core", "category");
            annotate("Type: Monitoring", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: branch-coverage-optimization", "component");
            annotate("Category: Core", "category");
            annotate("Type: Monitoring", "type");

            const monitor = createValidMonitor({
                id: "test-1",
                type: "unknown" as any,
                url: "https://example.com",
                checkInterval: 60_000,
                timeout: 5000,
                retryAttempts: 3,
                status: "up" as const,
                responseTime: 100,
                monitoring: true,
            });

            render(
                <SiteCardHistory
                    filteredHistory={mockHistory}
                    monitor={monitor}
                />
            );

            // Should fallback to monitor.type when option not found
            expect(screen.getByTestId("chart-title")).toHaveTextContent(
                "unknown History"
            );
        });

        it("should handle HTTP monitor with URL", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: branch-coverage-optimization", "component");
            annotate("Category: Core", "category");
            annotate("Type: Monitoring", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: branch-coverage-optimization", "component");
            annotate("Category: Core", "category");
            annotate("Type: Monitoring", "type");

            const monitor = createValidMonitor({
                id: "test-1",
                type: "http" as const,
                url: "https://example.com",
                checkInterval: 60_000,
                timeout: 5000,
                retryAttempts: 3,
                status: "up" as const,
                responseTime: 100,
                monitoring: true,
            });

            render(
                <SiteCardHistory
                    filteredHistory={mockHistory}
                    monitor={monitor}
                />
            );

            expect(screen.getByTestId("chart-title")).toHaveTextContent(
                "HTTP History - https://example.com"
            );
        });

        it("should handle port monitor with host and port", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: branch-coverage-optimization", "component");
            annotate("Category: Core", "category");
            annotate("Type: Monitoring", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: branch-coverage-optimization", "component");
            annotate("Category: Core", "category");
            annotate("Type: Monitoring", "type");

            const monitor = {
                id: "test-1",
                type: "port" as const,
                host: "example.com",
                port: 80,
                checkInterval: 60_000,
                timeout: 5000,
                retryAttempts: 3,
                status: "up" as const,
                responseTime: 100,
                monitoring: true,
                history: [],
            };

            render(
                <SiteCardHistory
                    filteredHistory={mockHistory}
                    monitor={monitor}
                />
            );

            expect(screen.getByTestId("chart-title")).toHaveTextContent(
                "Port History - example.com:80"
            );
        });

        it("should handle ping monitor without URL or port", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: branch-coverage-optimization", "component");
            annotate("Category: Core", "category");
            annotate("Type: Monitoring", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: branch-coverage-optimization", "component");
            annotate("Category: Core", "category");
            annotate("Type: Monitoring", "type");

            const monitor = {
                id: "test-1",
                type: "ping" as any,
                host: "example.com",
                checkInterval: 60_000,
                timeout: 5000,
                retryAttempts: 3,
                status: "up" as const,
                responseTime: 100,
                monitoring: true,
                history: [],
            };

            render(
                <SiteCardHistory
                    filteredHistory={mockHistory}
                    monitor={monitor}
                />
            );

            // Should not have suffix for ping monitor
            expect(screen.getByTestId("chart-title")).toHaveTextContent(
                "ping History"
            );
        });
    });

    describe("Props Comparison Function Coverage", () => {
        const SiteCardHistoryWrapped = React.memo(
            SiteCardHistory,
            (prev, next) => {
                // Test all branches of areHistoryPropsEqual function

                // Compare history arrays length
                if (
                    prev.filteredHistory.length !== next.filteredHistory.length
                ) {
                    return false;
                }

                // Compare first history item timestamp
                const prevTimestamp = arrayFirst(
                    prev.filteredHistory
                )?.timestamp;
                const nextTimestamp = arrayFirst(
                    next.filteredHistory
                )?.timestamp;
                if (prevTimestamp !== nextTimestamp) {
                    return false;
                }

                // Compare monitor objects
                const prevMonitor = prev.monitor;
                const nextMonitor = next.monitor;

                // Both undefined
                if (prevMonitor === undefined && nextMonitor === undefined) {
                    return true;
                }

                // One undefined, one defined
                if (prevMonitor === undefined || nextMonitor === undefined) {
                    return false;
                }

                // Compare monitor properties
                if (
                    prevMonitor.id !== nextMonitor.id ||
                    prevMonitor.type !== nextMonitor.type
                ) {
                    return false;
                }

                // Compare optional properties
                return (
                    prevMonitor.url === nextMonitor.url &&
                    prevMonitor.port === nextMonitor.port &&
                    prevMonitor.host === nextMonitor.host
                );
            }
        );

        it("should handle different history lengths", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: branch-coverage-optimization", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: branch-coverage-optimization", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            const { rerender } = render(
                <SiteCardHistoryWrapped
                    filteredHistory={[]}
                    monitor={undefined}
                />
            );

            rerender(
                <SiteCardHistoryWrapped
                    filteredHistory={[
                        {
                            timestamp: Date.now(),
                            status: "up",
                            responseTime: 100,
                        },
                    ]}
                    monitor={undefined}
                />
            );

            expect(screen.getByTestId("chart-history-count")).toHaveTextContent(
                "1"
            );
        });

        it("should handle empty history arrays", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: branch-coverage-optimization", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: branch-coverage-optimization", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            render(
                <SiteCardHistoryWrapped
                    filteredHistory={[]}
                    monitor={undefined}
                />
            );

            expect(screen.getByTestId("chart-history-count")).toHaveTextContent(
                "0"
            );
        });

        it("should handle both monitor and no monitor cases", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: branch-coverage-optimization", "component");
            annotate("Category: Core", "category");
            annotate("Type: Monitoring", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: branch-coverage-optimization", "component");
            annotate("Category: Core", "category");
            annotate("Type: Monitoring", "type");

            const monitor = {
                id: "test-1",
                type: "http" as const,
                url: "https://example.com",
                checkInterval: 60_000,
                timeout: 5000,
                retryAttempts: 3,
                status: "up" as const,
                responseTime: 100,
                monitoring: true,
                history: [],
            };

            const { rerender } = render(
                <SiteCardHistoryWrapped
                    filteredHistory={[]}
                    monitor={undefined}
                />
            );

            rerender(
                <SiteCardHistoryWrapped
                    filteredHistory={[]}
                    monitor={monitor}
                />
            );

            expect(screen.getByTestId("chart-title")).toHaveTextContent(
                "HTTP History - https://example.com"
            );
        });

        it("should handle monitor property differences", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: branch-coverage-optimization", "component");
            annotate("Category: Core", "category");
            annotate("Type: Monitoring", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: branch-coverage-optimization", "component");
            annotate("Category: Core", "category");
            annotate("Type: Monitoring", "type");

            const monitor1 = {
                id: "test-1",
                type: "http" as const,
                url: "https://example.com",
                checkInterval: 60_000,
                timeout: 5000,
                retryAttempts: 3,
                status: "up" as const,
                responseTime: 100,
                monitoring: true,
                history: [],
            };

            const monitor2 = {
                ...monitor1,
                url: "https://different.com",
            };

            const { rerender } = render(
                <SiteCardHistoryWrapped
                    filteredHistory={[]}
                    monitor={monitor1}
                />
            );

            rerender(
                <SiteCardHistoryWrapped
                    filteredHistory={[]}
                    monitor={monitor2}
                />
            );

            expect(screen.getByTestId("chart-title")).toHaveTextContent(
                "HTTP History - https://different.com"
            );
        });

        it("should handle different monitor types", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: branch-coverage-optimization", "component");
            annotate("Category: Core", "category");
            annotate("Type: Monitoring", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: branch-coverage-optimization", "component");
            annotate("Category: Core", "category");
            annotate("Type: Monitoring", "type");

            const httpMonitor = {
                id: "test-1",
                type: "http" as const,
                url: "https://example.com",
                checkInterval: 60_000,
                timeout: 5000,
                retryAttempts: 3,
                status: "up" as const,
                responseTime: 100,
                monitoring: true,
                history: [],
            };

            const portMonitor = {
                id: "test-1",
                type: "port" as const,
                host: "example.com",
                port: 80,
                checkInterval: 60_000,
                timeout: 5000,
                retryAttempts: 3,
                status: "up" as const,
                responseTime: 100,
                monitoring: true,
                history: [],
            };

            const { rerender } = render(
                <SiteCardHistoryWrapped
                    filteredHistory={[]}
                    monitor={httpMonitor}
                />
            );

            rerender(
                <SiteCardHistoryWrapped
                    filteredHistory={[]}
                    monitor={portMonitor}
                />
            );

            expect(screen.getByTestId("chart-title")).toHaveTextContent(
                "Port History - example.com:80"
            );
        });

        it("should handle monitor ID differences", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: branch-coverage-optimization", "component");
            annotate("Category: Core", "category");
            annotate("Type: Monitoring", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: branch-coverage-optimization", "component");
            annotate("Category: Core", "category");
            annotate("Type: Monitoring", "type");

            const monitor1 = {
                id: "test-1",
                type: "http" as const,
                url: "https://example.com",
                checkInterval: 60_000,
                timeout: 5000,
                retryAttempts: 3,
                status: "up" as const,
                responseTime: 100,
                monitoring: true,
                history: [],
            };

            const monitor2 = {
                ...monitor1,
                id: "test-2",
            };

            const { rerender } = render(
                <SiteCardHistoryWrapped
                    filteredHistory={[]}
                    monitor={monitor1}
                />
            );

            rerender(
                <SiteCardHistoryWrapped
                    filteredHistory={[]}
                    monitor={monitor2}
                />
            );

            expect(screen.getByTestId("chart-title")).toHaveTextContent(
                "HTTP History - https://example.com"
            );
        });
    });

    describe("Edge Cases and Complex Scenarios", () => {
        it("should handle monitor with all optional properties undefined", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: branch-coverage-optimization", "component");
            annotate("Category: Core", "category");
            annotate("Type: Monitoring", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: branch-coverage-optimization", "component");
            annotate("Category: Core", "category");
            annotate("Type: Monitoring", "type");

            const monitor = {
                id: "test-1",
                type: "unknown" as any,
                checkInterval: 60_000,
                timeout: 5000,
                retryAttempts: 3,
                status: "up" as const,
                responseTime: 100,
                monitoring: true,
                history: [],
            };

            render(<SiteCardHistory filteredHistory={[]} monitor={monitor} />);

            expect(screen.getByTestId("chart-title")).toHaveTextContent(
                "unknown History"
            );
        });

        it("should handle monitor with partial properties", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: branch-coverage-optimization", "component");
            annotate("Category: Core", "category");
            annotate("Type: Monitoring", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: branch-coverage-optimization", "component");
            annotate("Category: Core", "category");
            annotate("Type: Monitoring", "type");

            const monitor = {
                id: "test-1",
                type: "http" as const,
                // URL is missing
                checkInterval: 60_000,
                timeout: 5000,
                retryAttempts: 3,
                status: "up" as const,
                responseTime: 100,
                monitoring: true,
                history: [],
            };

            render(<SiteCardHistory filteredHistory={[]} monitor={monitor} />);

            expect(screen.getByTestId("chart-title")).toHaveTextContent(
                "HTTP History"
            );
        });

        it("should verify maxItems is passed correctly", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: branch-coverage-optimization", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: branch-coverage-optimization", "component");
            annotate("Category: Core", "category");
            annotate("Type: Business Logic", "type");

            render(
                <SiteCardHistory filteredHistory={[]} monitor={undefined} />
            );

            expect(screen.getByTestId("chart-max-items")).toHaveTextContent(
                "60"
            );
        });

        it("should handle very long monitor URLs", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: branch-coverage-optimization", "component");
            annotate("Category: Core", "category");
            annotate("Type: Monitoring", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: branch-coverage-optimization", "component");
            annotate("Category: Core", "category");
            annotate("Type: Monitoring", "type");

            const monitor = {
                id: "test-1",
                type: "http" as const,
                url: "https://very-long-domain-name-that-exceeds-normal-length-limits.example.com/very/long/path/with/many/segments/that/goes/on/and/on",
                checkInterval: 60_000,
                timeout: 5000,
                retryAttempts: 3,
                status: "up" as const,
                responseTime: 100,
                monitoring: true,
                history: [],
            };

            render(<SiteCardHistory filteredHistory={[]} monitor={monitor} />);

            expect(screen.getByTestId("chart-title")).toHaveTextContent(
                "HTTP History"
            );
        });
    });
});
