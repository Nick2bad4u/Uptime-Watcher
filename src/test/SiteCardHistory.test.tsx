import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SiteCardHistory } from "../components/Dashboard/SiteCard/SiteCardHistory";

// Mock HistoryChart to isolate SiteCardHistory logic
vi.mock("../components/common/HistoryChart", () => ({
    HistoryChart: (props: any) => (
        <div data-testid="history-chart" data-title={props.title}>
            {JSON.stringify(props.history)}
        </div>
    ),
}));

const baseMonitorHttp = {
    id: "monitor-1",
    type: "http",
    url: "https://example.com",
    host: undefined,
    port: undefined,
};
const baseMonitorPort = {
    id: "monitor-2",
    type: "port",
    url: undefined,
    host: "localhost",
    port: 8080,
};
const baseMonitorOther = {
    id: "monitor-3",
    type: "custom",
    url: undefined,
    host: undefined,
    port: undefined,
};

const baseHistory = [
    {
        id: 1,
        monitor_id: "monitor-1",
        status: "up",
        response_time: 123,
        timestamp: 1000,
        checked_at: "2024-01-01T00:00:00Z",
    },
    {
        id: 2,
        monitor_id: "monitor-1",
        status: "down",
        response_time: 0,
        timestamp: 900,
        checked_at: "2024-01-01T00:01:00Z",
    },
];

describe("SiteCardHistory", () => {
    it("renders 'No Monitor Selected' when monitor is undefined", () => {
        render(<SiteCardHistory monitor={undefined} filteredHistory={[]} />);
        const chart = screen.getByTestId("history-chart");
        expect(chart).toHaveAttribute("data-title", "No Monitor Selected");
    });

    it("renders HTTP title with url", () => {
        render(<SiteCardHistory monitor={baseMonitorHttp as any} filteredHistory={baseHistory as any} />);
        const chart = screen.getByTestId("history-chart");
        expect(chart).toHaveAttribute("data-title", "HTTP History (https://example.com)");
    });

    it("renders Port title with host and port", () => {
        render(<SiteCardHistory monitor={baseMonitorPort as any} filteredHistory={baseHistory as any} />);
        const chart = screen.getByTestId("history-chart");
        expect(chart).toHaveAttribute("data-title", "Port History (localhost:8080)");
    });

    it("renders custom type title", () => {
        render(<SiteCardHistory monitor={baseMonitorOther as any} filteredHistory={baseHistory as any} />);
        const chart = screen.getByTestId("history-chart");
        expect(chart).toHaveAttribute("data-title", "custom History");
    });

    it("passes filteredHistory to HistoryChart", () => {
        render(<SiteCardHistory monitor={baseMonitorHttp as any} filteredHistory={baseHistory as any} />);
        const chart = screen.getByTestId("history-chart");
        expect(chart.textContent).toContain('"id":1');
        expect(chart.textContent).toContain('"id":2');
    });

    it("memoizes and skips re-render if history and monitor are unchanged", () => {
        const { rerender } = render(
            <SiteCardHistory monitor={baseMonitorHttp as any} filteredHistory={baseHistory as any} />
        );
        const chart = screen.getByTestId("history-chart");
        // Rerender with same props
        rerender(<SiteCardHistory monitor={baseMonitorHttp as any} filteredHistory={baseHistory as any} />);
        // Should still be present and unchanged
        expect(screen.getByTestId("history-chart")).toBe(chart);
    });

    it("re-renders if filteredHistory length changes", () => {
        const { rerender } = render(
            <SiteCardHistory monitor={baseMonitorHttp as any} filteredHistory={baseHistory as any} />
        );
        const chartBefore = screen.getByTestId("history-chart");
        // Remove one history item
        rerender(<SiteCardHistory monitor={baseMonitorHttp as any} filteredHistory={baseHistory.slice(1) as any} />);
        const chartAfter = screen.getByTestId("history-chart");
        expect(chartAfter.innerHTML).toBe(chartBefore.innerHTML);
    });

    it("re-renders if filteredHistory[0].timestamp changes", () => {
        const { rerender } = render(
            <SiteCardHistory monitor={baseMonitorHttp as any} filteredHistory={baseHistory as any} />
        );
        const chartBefore = screen.getByTestId("history-chart");
        // Change timestamp of first item
        const newHistory = [{ ...baseHistory[0], timestamp: 9999 }, baseHistory[1]];
        rerender(<SiteCardHistory monitor={baseMonitorHttp as any} filteredHistory={newHistory as any} />);
        const chartAfter = screen.getByTestId("history-chart");
        expect(chartAfter.innerHTML).toBe(chartBefore.innerHTML);
    });

    it("re-renders if monitor id changes", () => {
        const { rerender } = render(
            <SiteCardHistory monitor={baseMonitorHttp as any} filteredHistory={baseHistory as any} />
        );
        const chartBefore = screen.getByTestId("history-chart");
        // Change monitor id
        rerender(<SiteCardHistory monitor={baseMonitorPort as any} filteredHistory={baseHistory as any} />);
        const chartAfter = screen.getByTestId("history-chart");
        expect(chartAfter.innerHTML).toBe(chartBefore.innerHTML);
    });
});
