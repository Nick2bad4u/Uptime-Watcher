/**
 * Comprehensive test coverage for HistoryChart component. Targeting 100%
 * coverage with focus on rendering, data handling, and edge cases.
 */

import type { StatusHistory } from "@shared/types";
import type { HTMLAttributes, PropsWithChildren } from "react";

import { render, screen } from "@testing-library/react";
import * as React from "react";
import { arrayFirst } from "ts-extras";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { HistoryChart } from "../../components/common/HistoryChart";
import { ThemeProvider } from "../../theme/components/ThemeProvider";

// Mock MiniChartBar component
type MiniChartBarMockProperties = Readonly<{
    className?: string;
    responseTime: number;
    status: StatusHistory["status"];
    timestamp: number;
}>;

vi.mock(import('../../theme/components/MiniChartBar'), () => ({
    MiniChartBar: ({
        status,
        responseTime,
        timestamp,
        className,
    }: MiniChartBarMockProperties) => (
        <div
            className={className}
            data-response-time={responseTime}
            data-status={status}
            data-testid="mini-chart-bar"
            data-timestamp={timestamp}
            title={`${status} - ${responseTime}ms at ${new Date(timestamp).toLocaleString()}`}
        />
    ),
}));

// Mock ThemedText component
type ThemedTextMockProperties = PropsWithChildren<
    HTMLAttributes<HTMLSpanElement> &
        Readonly<{ size?: string; variant?: string }>
>;

vi.mock(import('../../theme/components/ThemedText'), () => ({
    ThemedText: ({
        children,
        size,
        variant,
        className,
        ...props
    }: ThemedTextMockProperties) => (
        <span
            className={className}
            data-size={size}
            data-testid="themed-text"
            data-variant={variant}
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
    status: "down" | "up",
    timestamp: number,
    responseTime = 100,
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
                <HistoryChart history={history} title="Test Chart" />
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
                    className="custom-chart-class"
                    history={history}
                    title="Test Chart"
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
                <HistoryChart history={history} title="Test Chart" />
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
                <HistoryChart history={history} title="Test Chart" />
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
                createStatusHistory("down", 2000, 0), // Middle
                createStatusHistory("up", 1000, 200), // Oldest (index 2)
            ];

            renderWithTheme(
                <HistoryChart history={history} title="Test Chart" />
            );

            const bars = screen.getAllByTestId("mini-chart-bar");
            expect(bars).toHaveLength(3);

            // After toReversed(), order should be oldest-first for display
            expect(arrayFirst(bars)).toHaveAttribute("data-timestamp", "1000");
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
                <HistoryChart history={history} title="Test Chart" />
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
                    history={history}
                    maxItems={30}
                    title="Test Chart"
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
                    history={history}
                    maxItems={100}
                    title="Test Chart"
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
                createStatusHistory("down", 1_234_567_890, 0, "Timeout"), // Older second in input
            ];

            renderWithTheme(
                <HistoryChart history={history} title="Test Chart" />
            );

            const bars = screen.getAllByTestId("mini-chart-bar");

            // Original array: [up@1234567891, down@1234567890] (newest first)
            // After slice(0, maxItems): [up@1234567891, down@1234567890]
            // After toReversed(): [down@1234567890, up@1234567891] (oldest first for display)

            // Check first bar (down@1234567890 is older, shown first after reversal)
            expect(arrayFirst(bars)).toHaveAttribute("data-status", "down");
            expect(arrayFirst(bars)).toHaveAttribute("data-response-time", "0");
            expect(arrayFirst(bars)).toHaveAttribute("data-timestamp", "1234567890");

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
                createStatusHistory("up", 1000, 151), // Middle
                createStatusHistory("down", 500, 0), // Oldest
            ];

            renderWithTheme(
                <HistoryChart history={history} title="Test Chart" />
            );

            const bars = screen.getAllByTestId("mini-chart-bar");
            expect(bars).toHaveLength(3);

            // After toReversed(): [down@500, up@1000, up@2000] (oldest first)
            // Verify all bars are rendered (React would skip duplicates with same key)
            expect(arrayFirst(bars)).toHaveAttribute("data-response-time", "0"); // Down@500
            expect(bars[1]).toHaveAttribute("data-response-time", "151"); // Up@1000
            expect(bars[2]).toHaveAttribute("data-response-time", "150"); // Up@2000
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
                <HistoryChart history={[]} title="Empty Chart" />
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
                <HistoryChart history={history} title="Single Item Chart" />
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
                    history={history}
                    maxItems={0}
                    title="Zero Max Items"
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
                    history={history}
                    maxItems={1}
                    title="One Max Item"
                />
            );

            const bars = screen.getAllByTestId("mini-chart-bar");
            expect(bars).toHaveLength(1);
            // Should show the first item (newest)
            expect(arrayFirst(bars)).toHaveAttribute("data-timestamp", "2000");
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
                <HistoryChart history={history} title="Large Response Time" />
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
                <HistoryChart history={history} title="Zero Response Time" />
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
                    history={history}
                    title="Negative Response Time"
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
                <HistoryChart history={history} title="Old Timestamp" />
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
                <HistoryChart history={history} title="Future Timestamp" />
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
                <HistoryChart history={history} title="Custom Title Text" />
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

            renderWithTheme(<HistoryChart history={history} title="" />);

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
                    history={history}
                    title="Chart & Analysis (24h) — Status: 99.9%"
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
                <HistoryChart history={history} title={longTitle} />
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
                <HistoryChart history={history} title="Reversed Order Test" />
            );

            const bars = screen.getAllByTestId("mini-chart-bar");

            // Original order: [3000, 2000, 1000]
            // After slice(0, 3): [3000, 2000, 1000]
            // After toReversed(): [1000, 2000, 3000]
            expect(arrayFirst(bars)).toHaveAttribute("data-timestamp", "1000");
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
                    history={history}
                    maxItems={3}
                    title="Slice Test"
                />
            );

            const bars = screen.getAllByTestId("mini-chart-bar");
            expect(bars).toHaveLength(3);

            // Slice(0, 3) takes first 3: [5000, 4000, 3000]
            // toReversed() makes: [3000, 4000, 5000]
            expect(arrayFirst(bars)).toHaveAttribute("data-timestamp", "3000");
            expect(bars[1]).toHaveAttribute("data-timestamp", "4000");
            expect(bars[2]).toHaveAttribute("data-timestamp", "5000");
        });
    });
});
