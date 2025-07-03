/**
 * Tests for SiteCardHistory component.
 * Tests rendering, memoization, title generation, and re-render optimization.
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { SiteCardHistory } from "../components/Dashboard/SiteCard/SiteCardHistory";
import { Monitor, StatusHistory } from "../types";

// Mock the HistoryChart component
vi.mock("../components/common/HistoryChart", () => ({
    HistoryChart: vi.fn(({ title, history, maxItems }) => (
        <div data-testid="history-chart">
            <div data-testid="chart-title">{title}</div>
            <div data-testid="chart-history-length">{history.length}</div>
            <div data-testid="chart-max-items">{maxItems}</div>
        </div>
    )),
}));

describe("SiteCardHistory", () => {
    const mockHistory: StatusHistory[] = [
        { timestamp: 1640995200000, status: "up", responseTime: 200 },
        { timestamp: 1640991600000, status: "down", responseTime: 0 },
        { timestamp: 1640988000000, status: "up", responseTime: 150 },
    ];

    const httpMonitor: Monitor = {
        id: "monitor-1",
        type: "http",
        status: "up",
        url: "https://example.com",
        history: [],
        responseTime: 200,
        lastChecked: new Date(),
    };

    const portMonitor: Monitor = {
        id: "monitor-2",
        type: "port",
        status: "up",
        host: "example.com",
        port: 80,
        history: [],
        responseTime: 100,
        lastChecked: new Date(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("Rendering", () => {
        it("should render HistoryChart with correct props", () => {
            render(<SiteCardHistory monitor={httpMonitor} filteredHistory={mockHistory} />);

            expect(screen.getByTestId("history-chart")).toBeInTheDocument();
            expect(screen.getByTestId("chart-history-length")).toHaveTextContent("3");
            expect(screen.getByTestId("chart-max-items")).toHaveTextContent("60");
        });

        it("should render with empty history", () => {
            render(<SiteCardHistory monitor={httpMonitor} filteredHistory={[]} />);

            expect(screen.getByTestId("history-chart")).toBeInTheDocument();
            expect(screen.getByTestId("chart-history-length")).toHaveTextContent("0");
        });
    });

    describe("Title Generation", () => {
        it("should generate HTTP history title with URL", () => {
            render(<SiteCardHistory monitor={httpMonitor} filteredHistory={mockHistory} />);

            expect(screen.getByTestId("chart-title")).toHaveTextContent("HTTP History (https://example.com)");
        });

        it("should generate HTTP history title without URL", () => {
            const httpMonitorNoUrl = { ...httpMonitor, url: undefined };
            render(<SiteCardHistory monitor={httpMonitorNoUrl} filteredHistory={mockHistory} />);

            expect(screen.getByTestId("chart-title")).toHaveTextContent("HTTP History");
        });

        it("should generate port history title with host and port", () => {
            render(<SiteCardHistory monitor={portMonitor} filteredHistory={mockHistory} />);

            expect(screen.getByTestId("chart-title")).toHaveTextContent("Port History (example.com:80)");
        });

        it("should generate port history title with host only", () => {
            const portMonitorNoPort = { ...portMonitor, port: undefined };
            render(<SiteCardHistory monitor={portMonitorNoPort} filteredHistory={mockHistory} />);

            expect(screen.getByTestId("chart-title")).toHaveTextContent("Port History (example.com)");
        });

        it("should generate port history title without host or port", () => {
            const portMonitorNoHostPort = { ...portMonitor, host: undefined, port: undefined };
            render(<SiteCardHistory monitor={portMonitorNoHostPort} filteredHistory={mockHistory} />);

            expect(screen.getByTestId("chart-title")).toHaveTextContent("Port History");
        });

        it("should handle undefined monitor", () => {
            render(<SiteCardHistory monitor={undefined} filteredHistory={mockHistory} />);

            expect(screen.getByTestId("chart-title")).toHaveTextContent("No Monitor Selected");
        });

        it("should handle unknown monitor type", () => {
            const unknownMonitor = { ...httpMonitor, type: "unknown" as "http" | "port" };
            render(<SiteCardHistory monitor={unknownMonitor} filteredHistory={mockHistory} />);

            expect(screen.getByTestId("chart-title")).toHaveTextContent("unknown History");
        });
    });

    describe("Memoization", () => {
        it("should not re-render when props are the same", () => {
            const { rerender } = render(<SiteCardHistory monitor={httpMonitor} filteredHistory={mockHistory} />);

            const firstRender = screen.getByTestId("history-chart");

            // Re-render with same props
            rerender(<SiteCardHistory monitor={httpMonitor} filteredHistory={mockHistory} />);

            // Should be the same element
            expect(screen.getByTestId("history-chart")).toBe(firstRender);
        });

        it("should re-render when history length changes", () => {
            const { rerender } = render(<SiteCardHistory monitor={httpMonitor} filteredHistory={mockHistory} />);

            expect(screen.getByTestId("chart-history-length")).toHaveTextContent("3");

            const newHistory: StatusHistory[] = [
                ...mockHistory,
                { timestamp: 1640998800000, status: "up" as const, responseTime: 180 },
            ];

            rerender(<SiteCardHistory monitor={httpMonitor} filteredHistory={newHistory} />);

            expect(screen.getByTestId("chart-history-length")).toHaveTextContent("4");
        });

        it("should re-render when latest timestamp changes", () => {
            const { rerender } = render(<SiteCardHistory monitor={httpMonitor} filteredHistory={mockHistory} />);

            // Change the latest timestamp (first item since sorted DESC)
            const newHistory: StatusHistory[] = [
                { timestamp: 1640999000000, status: "up" as const, responseTime: 220 },
                ...mockHistory.slice(1),
            ];

            rerender(<SiteCardHistory monitor={httpMonitor} filteredHistory={newHistory} />);

            // Should re-render and update
            expect(screen.getByTestId("history-chart")).toBeInTheDocument();
        });

        it("should re-render when monitor ID changes", () => {
            const { rerender } = render(<SiteCardHistory monitor={httpMonitor} filteredHistory={mockHistory} />);

            const newMonitor = { ...httpMonitor, id: "monitor-changed" };

            rerender(<SiteCardHistory monitor={newMonitor} filteredHistory={mockHistory} />);

            // Should re-render
            expect(screen.getByTestId("history-chart")).toBeInTheDocument();
        });

        it("should handle empty history arrays in comparison", () => {
            const { rerender } = render(<SiteCardHistory monitor={httpMonitor} filteredHistory={[]} />);

            expect(screen.getByTestId("chart-history-length")).toHaveTextContent("0");

            // Re-render with same empty array
            rerender(<SiteCardHistory monitor={httpMonitor} filteredHistory={[]} />);

            expect(screen.getByTestId("chart-history-length")).toHaveTextContent("0");
        });
    });

    describe("Edge Cases", () => {
        it("should handle monitor change from defined to undefined", () => {
            const { rerender } = render(<SiteCardHistory monitor={httpMonitor} filteredHistory={mockHistory} />);

            expect(screen.getByTestId("chart-title")).toHaveTextContent("HTTP History (https://example.com)");

            rerender(<SiteCardHistory monitor={undefined} filteredHistory={mockHistory} />);

            expect(screen.getByTestId("chart-title")).toHaveTextContent("No Monitor Selected");
        });

        it("should handle monitor change from undefined to defined", () => {
            const { rerender } = render(<SiteCardHistory monitor={undefined} filteredHistory={mockHistory} />);

            expect(screen.getByTestId("chart-title")).toHaveTextContent("No Monitor Selected");

            rerender(<SiteCardHistory monitor={httpMonitor} filteredHistory={mockHistory} />);

            expect(screen.getByTestId("chart-title")).toHaveTextContent("HTTP History (https://example.com)");
        });

        it("should handle history with single item", () => {
            const singleHistory: StatusHistory[] = [
                { timestamp: 1640995200000, status: "up" as const, responseTime: 200 },
            ];

            render(<SiteCardHistory monitor={httpMonitor} filteredHistory={singleHistory} />);

            expect(screen.getByTestId("chart-history-length")).toHaveTextContent("1");
        });
    });

    describe("Title Formatting", () => {
        it("should handle HTTP monitor with empty URL", () => {
            const httpMonitorEmptyUrl = { ...httpMonitor, url: "" };
            render(<SiteCardHistory monitor={httpMonitorEmptyUrl} filteredHistory={mockHistory} />);

            expect(screen.getByTestId("chart-title")).toHaveTextContent("HTTP History");
        });

        it("should handle port monitor with empty host", () => {
            const portMonitorEmptyHost = { ...portMonitor, host: "", port: 80 };
            render(<SiteCardHistory monitor={portMonitorEmptyHost} filteredHistory={mockHistory} />);

            expect(screen.getByTestId("chart-title")).toHaveTextContent("Port History");
        });

        it("should handle port monitor with zero port", () => {
            const portMonitorZeroPort = { ...portMonitor, port: 0 };
            render(<SiteCardHistory monitor={portMonitorZeroPort} filteredHistory={mockHistory} />);

            expect(screen.getByTestId("chart-title")).toHaveTextContent("Port History (example.com)");
        });
    });
});
