/**
 * Branch coverage tests for SiteCardHistory component. These tests specifically
 * target untested conditional branches to improve coverage metrics.
 */

import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";

import type { Monitor, StatusHistory } from "../../../shared/types";

import { SiteCardHistory } from "../../components/Dashboard/SiteCard/SiteCardHistory";

// Mock the dependencies
vi.mock("../../hooks/useMonitorTypes", () => ({
    useMonitorTypes: vi.fn(() => ({
        options: [
            { value: "http", label: "HTTP" },
            { value: "port", label: "Port" },
            { value: "ping", label: "Ping" },
        ],
    })),
}));

vi.mock("../../utils/monitorTitleFormatters", () => ({
    formatTitleSuffix: vi.fn((monitor: Monitor) => {
        if (monitor.url) return ` - ${monitor.url}`;
        if (monitor.host && monitor.port)
            return ` - ${monitor.host}:${monitor.port}`;
        return "";
    }),
}));

vi.mock("../../components/common/HistoryChart", () => ({
    HistoryChart: vi.fn(({ title, history, maxItems }) => (
        <div data-testid="history-chart">
            <div data-testid="chart-title">{title}</div>
            <div data-testid="chart-items">{history.length}</div>
            <div data-testid="chart-max-items">{maxItems}</div>
        </div>
    )),
}));

describe("SiteCardHistory - Branch Coverage Tests", () => {
    const mockHistory: StatusHistory[] = [
        {
            status: "up",
            responseTime: 200,
            timestamp: Date.now(),
        },
        {
            status: "down",
            responseTime: 0,
            timestamp: Date.now() - 3_600_000, // 1 hour ago
        },
    ];

    describe("Monitor Presence Branches", () => {
        it("should display 'No Monitor Selected' when monitor is undefined", () => {
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

        it("should process monitor when monitor is defined", () => {
            const monitor: Monitor = {
                id: "mon1",
                type: "http",
                url: "https://example.com",
                checkInterval: 60_000,
                monitoring: true,
                status: "up",
                lastChecked: new Date(),
                responseTime: 200,
                retryAttempts: 3,
                timeout: 5000,
                history: [],
            };

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
    });

    describe("Monitor Type Option Finding Branches", () => {
        it("should use monitor type label when option is found", () => {
            const monitor: Monitor = {
                id: "mon1",
                type: "http",
                url: "https://example.com",
                checkInterval: 60_000,
                monitoring: true,
                status: "up",
                lastChecked: new Date(),
                responseTime: 200,
                retryAttempts: 3,
                timeout: 5000,
                history: [],
            };

            render(
                <SiteCardHistory
                    filteredHistory={mockHistory}
                    monitor={monitor}
                />
            );

            expect(screen.getByTestId("chart-title")).toHaveTextContent(
                "HTTP History"
            );
        });

        it("should fallback to monitor.type when option is not found", () => {
            const monitor: Monitor = {
                id: "mon1",
                type: "unknown_type" as any,
                url: "https://example.com",
                checkInterval: 60_000,
                monitoring: true,
                status: "up",
                lastChecked: new Date(),
                responseTime: 200,
                retryAttempts: 3,
                timeout: 5000,
                history: [],
            };

            render(
                <SiteCardHistory
                    filteredHistory={mockHistory}
                    monitor={monitor}
                />
            );

            expect(screen.getByTestId("chart-title")).toHaveTextContent(
                "unknown_type History"
            );
        });
    });

    describe("Monitor Type Specific Branches", () => {
        it("should handle HTTP monitor with URL", () => {
            const monitor: Monitor = {
                id: "mon1",
                type: "http",
                url: "https://api.example.com/health",
                checkInterval: 30_000,
                monitoring: true,
                status: "up",
                lastChecked: new Date(),
                responseTime: 150,
                retryAttempts: 3,
                timeout: 5000,
                history: [],
            };

            render(
                <SiteCardHistory
                    filteredHistory={mockHistory}
                    monitor={monitor}
                />
            );

            expect(screen.getByTestId("chart-title")).toHaveTextContent(
                "HTTP History - https://api.example.com/health"
            );
        });

        it("should handle port monitor with host and port", () => {
            const monitor: Monitor = {
                id: "mon1",
                type: "port",
                host: "database.example.com",
                port: 5432,
                checkInterval: 120_000,
                monitoring: true,
                status: "up",
                lastChecked: new Date(),
                responseTime: 5,
                retryAttempts: 3,
                timeout: 5000,
                history: [],
            };

            render(
                <SiteCardHistory
                    filteredHistory={mockHistory}
                    monitor={monitor}
                />
            );

            expect(screen.getByTestId("chart-title")).toHaveTextContent(
                "Port History - database.example.com:5432"
            );
        });

        it("should handle ping monitor without URL or port", () => {
            const monitor: Monitor = {
                id: "mon1",
                type: "ping",
                host: "server.example.com",
                checkInterval: 60_000,
                monitoring: true,
                status: "up",
                lastChecked: new Date(),
                responseTime: 25,
                retryAttempts: 3,
                timeout: 5000,
                history: [],
            };

            render(
                <SiteCardHistory
                    filteredHistory={mockHistory}
                    monitor={monitor}
                />
            );

            expect(screen.getByTestId("chart-title")).toHaveTextContent(
                "Ping History"
            );
        });
    });

    describe("Props Comparison Function Branches", () => {
        it("should handle different history lengths", () => {
            const monitor: Monitor = {
                id: "mon1",
                type: "http",
                url: "https://example.com",
                checkInterval: 60_000,
                monitoring: true,
                status: "up",
                lastChecked: new Date(),
                responseTime: 200,
                retryAttempts: 3,
                timeout: 5000,
                history: [],
            };

            const shortHistory = mockHistory.slice(0, 1);

            render(
                <SiteCardHistory
                    filteredHistory={shortHistory}
                    monitor={monitor}
                />
            );

            expect(screen.getByTestId("chart-items")).toHaveTextContent("1");
        });

        it("should handle empty history arrays", () => {
            const monitor: Monitor = {
                id: "mon1",
                type: "http",
                url: "https://example.com",
                checkInterval: 60_000,
                monitoring: true,
                status: "up",
                lastChecked: new Date(),
                responseTime: 200,
                retryAttempts: 3,
                timeout: 5000,
                history: [],
            };

            render(<SiteCardHistory filteredHistory={[]} monitor={monitor} />);

            expect(screen.getByTestId("chart-items")).toHaveTextContent("0");
        });

        it("should handle both monitor and no monitor cases", () => {
            // Test the case where both monitors are undefined
            render(
                <SiteCardHistory filteredHistory={[]} monitor={undefined} />
            );

            expect(screen.getByTestId("chart-title")).toHaveTextContent(
                "No Monitor Selected"
            );
        });

        it("should handle monitor property differences", () => {
            const monitor1: Monitor = {
                id: "mon1",
                type: "http",
                url: "https://example1.com",
                checkInterval: 60_000,
                monitoring: true,
                status: "up",
                lastChecked: new Date(),
                responseTime: 200,
                retryAttempts: 3,
                timeout: 5000,
                history: [],
            };

            render(
                <SiteCardHistory
                    filteredHistory={mockHistory}
                    monitor={monitor1}
                />
            );

            expect(screen.getByTestId("chart-title")).toHaveTextContent(
                "HTTP History - https://example1.com"
            );
        });

        it("should handle different monitor types", () => {
            const portMonitor: Monitor = {
                id: "mon2",
                type: "port",
                host: "localhost",
                port: 8080,
                checkInterval: 60_000,
                monitoring: true,
                status: "up",
                lastChecked: new Date(),
                responseTime: 10,
                retryAttempts: 3,
                timeout: 5000,
                history: [],
            };

            render(
                <SiteCardHistory
                    filteredHistory={mockHistory}
                    monitor={portMonitor}
                />
            );

            expect(screen.getByTestId("chart-title")).toHaveTextContent(
                "Port History - localhost:8080"
            );
        });

        it("should handle monitor ID differences", () => {
            const monitor: Monitor = {
                id: "different-id",
                type: "http",
                url: "https://example.com",
                checkInterval: 60_000,
                monitoring: true,
                status: "up",
                lastChecked: new Date(),
                responseTime: 200,
                retryAttempts: 3,
                timeout: 5000,
                history: [],
            };

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
    });

    describe("Edge Cases and Complex Scenarios", () => {
        it("should handle monitor with all optional properties undefined", () => {
            const monitor: Monitor = {
                id: "mon1",
                type: "ping",
                checkInterval: 60_000,
                monitoring: true,
                status: "up",
                lastChecked: new Date(),
                responseTime: 50,
                retryAttempts: 3,
                timeout: 5000,
                history: [],
            };

            render(
                <SiteCardHistory
                    filteredHistory={mockHistory}
                    monitor={monitor}
                />
            );

            expect(screen.getByTestId("chart-title")).toHaveTextContent(
                "Ping History"
            );
        });

        it("should handle monitor with partial properties", () => {
            const monitor: Monitor = {
                id: "mon1",
                type: "port",
                host: "incomplete.example.com",
                // port is missing, should fallback to empty suffix
                checkInterval: 60_000,
                monitoring: true,
                status: "up",
                lastChecked: new Date(),
                responseTime: 50,
                retryAttempts: 3,
                timeout: 5000,
                history: [],
            };

            render(
                <SiteCardHistory
                    filteredHistory={mockHistory}
                    monitor={monitor}
                />
            );

            expect(screen.getByTestId("chart-title")).toHaveTextContent(
                "Port History"
            );
        });

        it("should verify maxItems is passed correctly", () => {
            const monitor: Monitor = {
                id: "mon1",
                type: "http",
                url: "https://example.com",
                checkInterval: 60_000,
                monitoring: true,
                status: "up",
                lastChecked: new Date(),
                responseTime: 200,
                retryAttempts: 3,
                timeout: 5000,
                history: [],
            };

            render(
                <SiteCardHistory
                    filteredHistory={mockHistory}
                    monitor={monitor}
                />
            );

            expect(screen.getByTestId("chart-max-items")).toHaveTextContent(
                "60"
            );
        });

        it("should handle very long monitor URLs", () => {
            const monitor: Monitor = {
                id: "mon1",
                type: "http",
                url: "https://very-long-subdomain.extremely-long-domain-name.example.com/very/long/path/with/many/segments/api/v1/health/check",
                checkInterval: 60_000,
                monitoring: true,
                status: "up",
                lastChecked: new Date(),
                responseTime: 200,
                retryAttempts: 3,
                timeout: 5000,
                history: [],
            };

            render(
                <SiteCardHistory
                    filteredHistory={mockHistory}
                    monitor={monitor}
                />
            );

            expect(screen.getByTestId("chart-title")).toHaveTextContent(
                "HTTP History - https://very-long-subdomain.extremely-long-domain-name.example.com/very/long/path/with/many/segments/api/v1/health/check"
            );
        });
    });
});
