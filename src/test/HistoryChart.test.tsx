/**
 * Test suite for HistoryChart component
 * Tests basic rendering, props handling, and edge cases
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HistoryChart } from "../components/common/HistoryChart";
import { StatusHistory } from "../types";

// Mock the theme components
vi.mock("../theme/components", () => ({
    MiniChartBar: ({ status, timestamp }: { status: string; timestamp: number }) => (
        <div data-testid="mini-chart-bar" data-status={status} data-timestamp={timestamp}>
            Bar-{status}
        </div>
    ),
    ThemedText: ({ children, size, variant }: { children: React.ReactNode; size?: string; variant?: string }) => (
        <div data-testid="themed-text" data-size={size} data-variant={variant}>
            {children}
        </div>
    ),
}));

describe("HistoryChart Component", () => {
    const mockHistory: StatusHistory[] = [
        {
            timestamp: 1000,
            status: "up",
            responseTime: 200,
        },
        {
            timestamp: 2000,
            status: "down",
            responseTime: 0,
        },
        {
            timestamp: 3000,
            status: "up",
            responseTime: 150,
        },
    ];

    describe("Basic Rendering", () => {
        it("renders with valid history data", () => {
            render(<HistoryChart history={mockHistory} title="Test Chart" />);
            
            expect(screen.getByText("Test Chart")).toBeInTheDocument();
            expect(screen.getAllByTestId("mini-chart-bar")).toHaveLength(3);
        });

        it("displays bars in reverse chronological order (most recent first)", () => {
            render(<HistoryChart history={mockHistory} title="Test Chart" />);
            
            const bars = screen.getAllByTestId("mini-chart-bar");
            
            // Should be reversed: 3000, 2000, 1000
            expect(bars[0]).toHaveAttribute("data-timestamp", "3000");
            expect(bars[1]).toHaveAttribute("data-timestamp", "2000");
            expect(bars[2]).toHaveAttribute("data-timestamp", "1000");
        });

        it("passes correct props to MiniChartBar components", () => {
            render(<HistoryChart history={mockHistory} title="Test Chart" />);
            
            const bars = screen.getAllByTestId("mini-chart-bar");
            
            expect(bars[0]).toHaveAttribute("data-status", "up");
            expect(bars[1]).toHaveAttribute("data-status", "down");
            expect(bars[2]).toHaveAttribute("data-status", "up");
        });

        it("applies custom className", () => {
            const { container } = render(
                <HistoryChart history={mockHistory} title="Test Chart" className="custom-class" />
            );
            
            expect(container.firstChild).toHaveClass("custom-class");
        });
    });

    describe("Edge Cases", () => {
        it("returns null for empty history", () => {
            const { container } = render(<HistoryChart history={[]} title="Empty Chart" />);
            
            expect(container.firstChild).toBeNull();
        });

        it("handles single history item", () => {
            const singleHistory: StatusHistory[] = [
                {
                    timestamp: 1000,
                    status: "up",
                    responseTime: 200,
                },
            ];
            
            render(<HistoryChart history={singleHistory} title="Single Item" />);
            
            expect(screen.getByText("Single Item")).toBeInTheDocument();
            expect(screen.getAllByTestId("mini-chart-bar")).toHaveLength(1);
        });
    });

    describe("MaxItems Prop", () => {
        it("respects maxItems prop when history exceeds limit", () => {
            const largeHistory: StatusHistory[] = Array.from({ length: 200 }, (_, i) => ({
                timestamp: i * 1000,
                status: i % 2 === 0 ? "up" : "down",
                responseTime: i % 2 === 0 ? 200 : 0,
            }));
            
            render(<HistoryChart history={largeHistory} title="Large Chart" maxItems={50} />);
            
            expect(screen.getAllByTestId("mini-chart-bar")).toHaveLength(50);
        });

        it("defaults to 120 items when maxItems not specified", () => {
            const largeHistory: StatusHistory[] = Array.from({ length: 200 }, (_, i) => ({
                timestamp: i * 1000,
                status: i % 2 === 0 ? "up" : "down",
                responseTime: i % 2 === 0 ? 200 : 0,
            }));
            
            render(<HistoryChart history={largeHistory} title="Default Max" />);
            
            expect(screen.getAllByTestId("mini-chart-bar")).toHaveLength(120);
        });

        it("shows all items when history is smaller than maxItems", () => {
            render(<HistoryChart history={mockHistory} title="Small Chart" maxItems={100} />);
            
            expect(screen.getAllByTestId("mini-chart-bar")).toHaveLength(3);
        });
    });

    describe("Component Structure", () => {
        it("has correct CSS classes and structure", () => {
            const { container } = render(<HistoryChart history={mockHistory} title="Structure Test" />);
            
            const chartContainer = container.firstChild as HTMLElement;
            expect(chartContainer).toHaveClass("mb-3", "w-full");
            
            const titleContainer = chartContainer.querySelector(".flex.items-center.justify-end.mb-2");
            expect(titleContainer).toBeInTheDocument();
            
            const barsContainer = chartContainer.querySelector(".flex.items-center.justify-end.flex-shrink.min-w-0.gap-1.overflow-hidden");
            expect(barsContainer).toBeInTheDocument();
        });

        it("renders ThemedText with correct props", () => {
            render(<HistoryChart history={mockHistory} title="Theme Test" />);
            
            const themedText = screen.getByTestId("themed-text");
            expect(themedText).toHaveAttribute("data-size", "xs");
            expect(themedText).toHaveAttribute("data-variant", "secondary");
            expect(themedText).toHaveTextContent("Theme Test");
        });
    });

    describe("Memoization", () => {
        it("component is memoized", () => {
            // The component should be wrapped with React.memo
            expect(typeof HistoryChart).toBe("object");
            expect(HistoryChart.$$typeof).toBeTruthy(); // React component marker
        });
    });
});
