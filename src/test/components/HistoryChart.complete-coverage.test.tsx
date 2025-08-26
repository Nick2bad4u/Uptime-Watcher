/**
 * Comprehensive test coverage for HistoryChart component. Targeting 100%
 * coverage with focus on rendering, data handling, and edge cases.
 */

import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { HistoryChart } from "../../components/common/HistoryChart";
import type { StatusHistory } from "../../../shared/types";
import ThemeProvider from "../../theme/components/ThemeProvider";

// Mock MiniChartBar component
vi.mock("../../theme/components/MiniChartBar", () => ({
    default: ({ status, responseTime, timestamp, className }: any) => (
        <div
            data-testid="mini-chart-bar"
            data-status={status}
            data-response-time={responseTime}
            data-timestamp={timestamp}
            className={className}
            title={`${status} - ${responseTime}ms at ${new Date(timestamp).toLocaleString()}`}
        />
    ),
}));

// Mock ThemedText component
vi.mock("../../theme/components/ThemedText", () => ({
    default: ({ children, size, variant, className, ...props }: any) => (
        <span
            data-testid="themed-text"
            data-size={size}
            data-variant={variant}
            className={className}
            {...props}
        >
            {children}
        </span>
    ),
}));

/**
 * Helper function to create status history records
 */
const createStatusHistory = (
    status: "up" | "down",
    timestamp: number,
    responseTime: number = 100,
    details?: string
): StatusHistory => ({
    status,
    timestamp,
    responseTime,
    ...(details && { details }),
});

/**
 * Test wrapper with theme provider
 */
const renderWithTheme = (ui: React.ReactElement) =>
    render(<ThemeProvider>{ui}</ThemeProvider>);

describe("HistoryChart - Complete Coverage", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("Basic Rendering", () => {
        it("should render with required props", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryChart.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryChart.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const history: StatusHistory[] = [
                createStatusHistory("up", Date.now(), 150),
                createStatusHistory("down", Date.now() - 60_000, 0),
            ];

            renderWithTheme(
                <HistoryChart title="Test Chart" history={history} />
            );

            expect(screen.getByTestId("themed-text")).toHaveTextContent(
                "Test Chart"
            );
            expect(screen.getAllByTestId("mini-chart-bar")).toHaveLength(2);
        });

        it("should render with custom className", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryChart.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryChart.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const history: StatusHistory[] = [
                createStatusHistory("up", Date.now(), 150),
            ];

            renderWithTheme(
                <HistoryChart
                    title="Test Chart"
                    history={history}
                    className="custom-chart-class"
                />
            );

            const chartContainer = screen.getByRole("region");
            expect(chartContainer).toHaveClass("custom-chart-class");
        });

        it("should render with default className when not provided", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryChart.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryChart.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const history: StatusHistory[] = [
                createStatusHistory("up", Date.now(), 150),
            ];

            renderWithTheme(
                <HistoryChart title="Test Chart" history={history} />
            );

            const chartContainer = screen.getByRole("region");
            expect(chartContainer).toBeInTheDocument();
        });

        it("should apply proper CSS classes for layout", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryChart.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryChart.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const history: StatusHistory[] = [
                createStatusHistory("up", Date.now(), 150),
            ];

            renderWithTheme(
                <HistoryChart title="Test Chart" history={history} />
            );

            // Check main container exists
            const mainContainer = screen.getByRole("region");
            expect(mainContainer).toBeInTheDocument();

            // Check title exists
            const titleElement = screen.getByText("Test Chart");
            expect(titleElement).toBeInTheDocument();

            // Check chart bars exist
            const chartBars = screen.getAllByTestId("mini-chart-bar");
            expect(chartBars).toHaveLength(1);
        });
    });

    describe("Data Handling", () => {
        it("should display history items in chronological order (oldest first)", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryChart.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryChart.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const history: StatusHistory[] = [
                createStatusHistory("up", 3000, 150), // newest (index 0)
                createStatusHistory("down", 2000, 0), // middle
                createStatusHistory("up", 1000, 200), // oldest (index 2)
            ];

            renderWithTheme(
                <HistoryChart title="Test Chart" history={history} />
            );

            const bars = screen.getAllByTestId("mini-chart-bar");
            expect(bars).toHaveLength(3);

            // After toReversed(), order should be oldest-first for display
            expect(bars[0]).toHaveAttribute("data-timestamp", "1000");
            expect(bars[1]).toHaveAttribute("data-timestamp", "2000");
            expect(bars[2]).toHaveAttribute("data-timestamp", "3000");
        });

        it("should handle maximum items limit (default 120)", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryChart.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Configuration", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryChart.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Configuration", "type");

            // Create 150 history items
            const history: StatusHistory[] = Array.from(
                { length: 150 },
                (_, i) => createStatusHistory("up", 1000 + i, 100 + i)
            );

            renderWithTheme(
                <HistoryChart title="Test Chart" history={history} />
            );

            const bars = screen.getAllByTestId("mini-chart-bar");
            expect(bars).toHaveLength(120); // Should be limited to default maxItems
        });

        it("should handle custom maximum items limit", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryChart.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Configuration", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryChart.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Configuration", "type");

            // Create 50 history items
            const history: StatusHistory[] = Array.from(
                { length: 50 },
                (_, i) => createStatusHistory("up", 1000 + i, 100 + i)
            );

            renderWithTheme(
                <HistoryChart
                    title="Test Chart"
                    history={history}
                    maxItems={30}
                />
            );

            const bars = screen.getAllByTestId("mini-chart-bar");
            expect(bars).toHaveLength(30); // Should be limited to custom maxItems
        });

        it("should handle maxItems greater than history length", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryChart.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryChart.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const history: StatusHistory[] = [
                createStatusHistory("up", 1000, 150),
                createStatusHistory("down", 2000, 0),
            ];

            renderWithTheme(
                <HistoryChart
                    title="Test Chart"
                    history={history}
                    maxItems={100}
                />
            );

            const bars = screen.getAllByTestId("mini-chart-bar");
            expect(bars).toHaveLength(2); // Should show all available items
        });

        it("should pass correct props to MiniChartBar components", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryChart.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryChart.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const history: StatusHistory[] = [
                createStatusHistory("up", 1_234_567_891, 250, "Success"), // newer first in input
                createStatusHistory("down", 1_234_567_890, 0, "Timeout"), // older second in input
            ];

            renderWithTheme(
                <HistoryChart title="Test Chart" history={history} />
            );

            const bars = screen.getAllByTestId("mini-chart-bar");

            // Original array: [up@1234567891, down@1234567890] (newest first)
            // After slice(0, maxItems): [up@1234567891, down@1234567890]
            // After toReversed(): [down@1234567890, up@1234567891] (oldest first for display)

            // Check first bar (down@1234567890 is older, shown first after reversal)
            expect(bars[0]).toHaveAttribute("data-status", "down");
            expect(bars[0]).toHaveAttribute("data-response-time", "0");
            expect(bars[0]).toHaveAttribute("data-timestamp", "1234567890");

            // Check second bar (up@1234567891 is newer, shown second after reversal)
            expect(bars[1]).toHaveAttribute("data-status", "up");
            expect(bars[1]).toHaveAttribute("data-response-time", "250");
            expect(bars[1]).toHaveAttribute("data-timestamp", "1234567891");
        });

        it("should generate unique keys for each MiniChartBar", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryChart.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryChart.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const history: StatusHistory[] = [
                createStatusHistory("up", 2000, 150), // newest first
                createStatusHistory("up", 1000, 151), // middle
                createStatusHistory("down", 500, 0), // oldest
            ];

            renderWithTheme(
                <HistoryChart title="Test Chart" history={history} />
            );

            const bars = screen.getAllByTestId("mini-chart-bar");
            expect(bars).toHaveLength(3);

            // After toReversed(): [down@500, up@1000, up@2000] (oldest first)
            // Verify all bars are rendered (React would skip duplicates with same key)
            expect(bars[0]).toHaveAttribute("data-response-time", "0"); // down@500
            expect(bars[1]).toHaveAttribute("data-response-time", "151"); // up@1000
            expect(bars[2]).toHaveAttribute("data-response-time", "150"); // up@2000
        });
    });

    describe("Edge Cases", () => {
        it("should return null for empty history array", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryChart.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryChart.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const { container } = renderWithTheme(
                <HistoryChart title="Empty Chart" history={[]} />
            );

            expect(container.firstChild).toBeNull();
        });

        it("should handle single history item", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryChart.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryChart.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const history: StatusHistory[] = [
                createStatusHistory("up", Date.now(), 123),
            ];

            renderWithTheme(
                <HistoryChart title="Single Item Chart" history={history} />
            );

            expect(screen.getByTestId("themed-text")).toHaveTextContent(
                "Single Item Chart"
            );
            expect(screen.getAllByTestId("mini-chart-bar")).toHaveLength(1);
        });

        it("should handle maxItems of 0", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryChart.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryChart.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const history: StatusHistory[] = [
                createStatusHistory("up", Date.now(), 150),
                createStatusHistory("down", Date.now() - 1000, 0),
            ];

            renderWithTheme(
                <HistoryChart
                    title="Zero Max Items"
                    history={history}
                    maxItems={0}
                />
            );

            const bars = screen.queryAllByTestId("mini-chart-bar");
            expect(bars).toHaveLength(0); // No bars should be displayed
        });

        it("should handle maxItems of 1", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryChart.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryChart.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const history: StatusHistory[] = [
                createStatusHistory("up", 2000, 150),
                createStatusHistory("down", 1000, 0),
            ];

            renderWithTheme(
                <HistoryChart
                    title="One Max Item"
                    history={history}
                    maxItems={1}
                />
            );

            const bars = screen.getAllByTestId("mini-chart-bar");
            expect(bars).toHaveLength(1);
            // Should show the first item (newest)
            expect(bars[0]).toHaveAttribute("data-timestamp", "2000");
        });

        it("should handle very large responseTime values", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryChart.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryChart.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const history: StatusHistory[] = [
                createStatusHistory("up", Date.now(), 999_999),
            ];

            renderWithTheme(
                <HistoryChart title="Large Response Time" history={history} />
            );

            const bar = screen.getByTestId("mini-chart-bar");
            expect(bar).toHaveAttribute("data-response-time", "999999");
        });

        it("should handle zero responseTime", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryChart.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryChart.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const history: StatusHistory[] = [
                createStatusHistory("down", Date.now(), 0),
            ];

            renderWithTheme(
                <HistoryChart title="Zero Response Time" history={history} />
            );

            const bar = screen.getByTestId("mini-chart-bar");
            expect(bar).toHaveAttribute("data-response-time", "0");
            expect(bar).toHaveAttribute("data-status", "down");
        });

        it("should handle negative responseTime", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryChart.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryChart.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const history: StatusHistory[] = [
                createStatusHistory("down", Date.now(), -1),
            ];

            renderWithTheme(
                <HistoryChart
                    title="Negative Response Time"
                    history={history}
                />
            );

            const bar = screen.getByTestId("mini-chart-bar");
            expect(bar).toHaveAttribute("data-response-time", "-1");
        });

        it("should handle very old timestamps", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryChart.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryChart.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const history: StatusHistory[] = [
                createStatusHistory("up", 1, 150), // January 1, 1970
            ];

            renderWithTheme(
                <HistoryChart title="Old Timestamp" history={history} />
            );

            const bar = screen.getByTestId("mini-chart-bar");
            expect(bar).toHaveAttribute("data-timestamp", "1");
        });

        it("should handle future timestamps", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryChart.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryChart.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const futureTimestamp = Date.now() + 365 * 24 * 60 * 60 * 1000; // 1 year from now
            const history: StatusHistory[] = [
                createStatusHistory("up", futureTimestamp, 150),
            ];

            renderWithTheme(
                <HistoryChart title="Future Timestamp" history={history} />
            );

            const bar = screen.getByTestId("mini-chart-bar");
            expect(bar).toHaveAttribute(
                "data-timestamp",
                String(futureTimestamp)
            );
        });
    });

    describe("Title Rendering", () => {
        it("should render title with correct themed text props", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryChart.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryChart.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const history: StatusHistory[] = [
                createStatusHistory("up", Date.now(), 150),
            ];

            renderWithTheme(
                <HistoryChart title="Custom Title Text" history={history} />
            );

            const titleElement = screen.getByTestId("themed-text");
            expect(titleElement).toHaveTextContent("Custom Title Text");
            expect(titleElement).toHaveAttribute("data-size", "xs");
            expect(titleElement).toHaveAttribute("data-variant", "secondary");
        });

        it("should handle empty title string", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryChart.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryChart.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const history: StatusHistory[] = [
                createStatusHistory("up", Date.now(), 150),
            ];

            renderWithTheme(<HistoryChart title="" history={history} />);

            const titleElement = screen.getByTestId("themed-text");
            expect(titleElement).toHaveTextContent("");
        });

        it("should handle title with special characters", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryChart.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryChart.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const history: StatusHistory[] = [
                createStatusHistory("up", Date.now(), 150),
            ];

            renderWithTheme(
                <HistoryChart
                    title="Chart & Analysis (24h) — Status: 99.9%"
                    history={history}
                />
            );

            const titleElement = screen.getByTestId("themed-text");
            expect(titleElement).toHaveTextContent(
                "Chart & Analysis (24h) — Status: 99.9%"
            );
        });

        it("should handle very long title", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryChart.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryChart.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const longTitle = "A".repeat(200);
            const history: StatusHistory[] = [
                createStatusHistory("up", Date.now(), 150),
            ];

            renderWithTheme(
                <HistoryChart title={longTitle} history={history} />
            );

            const titleElement = screen.getByTestId("themed-text");
            expect(titleElement).toHaveTextContent(longTitle);
        });
    });

    describe("React.memo Performance", () => {
        it("should be a memoized component", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryChart.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryChart.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            expect(typeof HistoryChart).toBe("object");
            expect(HistoryChart).toBeDefined();
            // Check that it's a React.memo component
            expect(HistoryChart.$$typeof).toBe(Symbol.for("react.memo"));
        });

        it("should have proper component structure", ({ task, annotate }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryChart.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryChart.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            // React.memo components don't automatically have displayName
            expect(HistoryChart).toBeDefined();
            expect(typeof HistoryChart).toBe("object");
        });
    });

    describe("Array Methods", () => {
        it("should handle toReversed() method correctly", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryChart.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryChart.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const history: StatusHistory[] = [
                createStatusHistory("up", 3000, 150),
                createStatusHistory("down", 2000, 0),
                createStatusHistory("up", 1000, 200),
            ];

            renderWithTheme(
                <HistoryChart title="Reversed Order Test" history={history} />
            );

            const bars = screen.getAllByTestId("mini-chart-bar");

            // Original order: [3000, 2000, 1000]
            // After slice(0, 3): [3000, 2000, 1000]
            // After toReversed(): [1000, 2000, 3000]
            expect(bars[0]).toHaveAttribute("data-timestamp", "1000");
            expect(bars[1]).toHaveAttribute("data-timestamp", "2000");
            expect(bars[2]).toHaveAttribute("data-timestamp", "3000");
        });

        it("should handle slice() with maxItems correctly", ({
            task,
            annotate,
        }) => {
            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryChart.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            annotate(`Testing: ${task.name}`, "functional");
            annotate("Component: HistoryChart.complete-coverage", "component");
            annotate("Category: Component", "category");
            annotate("Type: Business Logic", "type");

            const history: StatusHistory[] = [
                createStatusHistory("up", 5000, 150),
                createStatusHistory("down", 4000, 0),
                createStatusHistory("up", 3000, 200),
                createStatusHistory("down", 2000, 0),
                createStatusHistory("up", 1000, 250),
            ];

            renderWithTheme(
                <HistoryChart
                    title="Slice Test"
                    history={history}
                    maxItems={3}
                />
            );

            const bars = screen.getAllByTestId("mini-chart-bar");
            expect(bars).toHaveLength(3);

            // slice(0, 3) takes first 3: [5000, 4000, 3000]
            // toReversed() makes: [3000, 4000, 5000]
            expect(bars[0]).toHaveAttribute("data-timestamp", "3000");
            expect(bars[1]).toHaveAttribute("data-timestamp", "4000");
            expect(bars[2]).toHaveAttribute("data-timestamp", "5000");
        });
    });
});
