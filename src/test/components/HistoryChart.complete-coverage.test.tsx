import type { StatusHistory } from "@shared/types";
import type { ReactElement } from "react";

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { HistoryChart } from "../../components/common/HistoryChart";
import { ThemeProvider } from "../../theme/components/ThemeProvider";

type MiniChartBarMockProperties = Readonly<{
    responseTime: number;
    status: StatusHistory["status"];
    timestamp: number;
}>;

vi.mock("../../theme/components/MiniChartBar", () => ({
    MiniChartBar: ({
        responseTime,
        status,
        timestamp,
    }: MiniChartBarMockProperties) => (
        <div
            data-response-time={responseTime}
            data-status={status}
            data-testid="mini-chart-bar"
            data-timestamp={timestamp}
        />
    ),
}));

const createHistoryRecord = (
    timestamp: number,
    status: StatusHistory["status"] = "up",
    responseTime = 100
): StatusHistory => ({
    responseTime,
    status,
    timestamp,
});

const renderWithTheme = (ui: ReactElement) =>
    render(<ThemeProvider>{ui}</ThemeProvider>);

const renderHistoryChart = (
    props: Partial<React.ComponentProps<typeof HistoryChart>> = {}
) =>
    renderWithTheme(
        <HistoryChart
            history={[
                createHistoryRecord(3000, "up", 300),
                createHistoryRecord(2000, "down", 0),
                createHistoryRecord(1000, "degraded", 150),
            ]}
            title="Recent status"
            {...props}
        />
    );

const renderedBars = () => screen.getAllByTestId("mini-chart-bar");

const renderedTimestamps = () =>
    renderedBars().map((bar) => Number(bar.dataset["timestamp"]));

describe("HistoryChart", () => {
    it("renders nothing when history is empty", () => {
        const { container } = renderHistoryChart({ history: [] });

        expect(container).toBeEmptyDOMElement();
    });

    it("renders an accessible chart region with the title and className", () => {
        renderHistoryChart({ className: "custom-chart" });

        const region = screen.getByRole("region", {
            name: "Recent status history chart",
        });

        expect(region).toHaveClass("mb-3", "w-full", "custom-chart");
        expect(screen.getByText("Recent status")).toBeInTheDocument();
        expect(renderedBars()).toHaveLength(3);
    });

    it("displays newest-first input in chronological order", () => {
        renderHistoryChart();

        expect(renderedTimestamps()).toEqual([
            1000,
            2000,
            3000,
        ]);
    });

    it("limits records before reversing them for display", () => {
        renderHistoryChart({
            maxItems: 2,
        });

        expect(renderedTimestamps()).toEqual([2000, 3000]);
    });

    it("uses the default 120 item limit", () => {
        const history = Array.from({ length: 130 }, (_, index) =>
            createHistoryRecord(130 - index)
        );

        renderHistoryChart({ history });

        expect(renderedBars()).toHaveLength(120);
        expect(renderedTimestamps()).toEqual(
            Array.from({ length: 120 }, (_, index) => 11 + index)
        );
    });

    it("forwards status, response time, and timestamp to each bar", () => {
        renderHistoryChart({
            history: [
                createHistoryRecord(20, "degraded", -1),
                createHistoryRecord(10, "down", 0),
            ],
        });

        const [oldest, newest] = renderedBars();

        expect(oldest).toHaveAttribute("data-status", "down");
        expect(oldest).toHaveAttribute("data-response-time", "0");
        expect(oldest).toHaveAttribute("data-timestamp", "10");
        expect(newest).toHaveAttribute("data-status", "degraded");
        expect(newest).toHaveAttribute("data-response-time", "-1");
        expect(newest).toHaveAttribute("data-timestamp", "20");
    });

    it("renders no bars when maxItems is zero", () => {
        renderHistoryChart({ maxItems: 0 });

        expect(screen.queryAllByTestId("mini-chart-bar")).toHaveLength(0);
    });
});
