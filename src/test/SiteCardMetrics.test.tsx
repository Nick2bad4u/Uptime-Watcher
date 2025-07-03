/**
 * Tests for SiteCardMetrics component.
 * Tests rendering, memoization, and metric formatting.
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import { SiteCardMetrics } from "../components/Dashboard/SiteCard/SiteCardMetrics";

// Mock the MetricCard component
vi.mock("../components/Dashboard/SiteCard/components/MetricCard", () => ({
    MetricCard: vi.fn(({ label, value }) => (
        <div data-testid={`metric-card-${label.toLowerCase()}`}>
            <span data-testid={`metric-label-${label.toLowerCase()}`}>{label}</span>
            <span data-testid={`metric-value-${label.toLowerCase()}`}>{value}</span>
        </div>
    )),
}));

describe("SiteCardMetrics", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("Rendering", () => {
        it("should render all four metric cards", () => {
            render(<SiteCardMetrics status="up" uptime={98.5} responseTime={250} checkCount={144} />);

            expect(screen.getByTestId("metric-card-status")).toBeInTheDocument();
            expect(screen.getByTestId("metric-card-uptime")).toBeInTheDocument();
            expect(screen.getByTestId("metric-card-response")).toBeInTheDocument();
            expect(screen.getByTestId("metric-card-checks")).toBeInTheDocument();
        });

        it("should render with grid layout", () => {
            const { container } = render(
                <SiteCardMetrics status="up" uptime={98.5} responseTime={250} checkCount={144} />
            );

            const gridElement = container.firstChild as HTMLElement;
            expect(gridElement).toHaveClass("grid", "grid-cols-4", "gap-4", "mb-4");
        });
    });

    describe("Metric Values", () => {
        it("should display correct status value (uppercase)", () => {
            render(<SiteCardMetrics status="up" uptime={98.5} responseTime={250} checkCount={144} />);

            expect(screen.getByTestId("metric-label-status")).toHaveTextContent("Status");
            expect(screen.getByTestId("metric-value-status")).toHaveTextContent("UP");
        });

        it("should display correct uptime percentage", () => {
            render(<SiteCardMetrics status="up" uptime={98.5} responseTime={250} checkCount={144} />);

            expect(screen.getByTestId("metric-label-uptime")).toHaveTextContent("Uptime");
            expect(screen.getByTestId("metric-value-uptime")).toHaveTextContent("98.5%");
        });

        it("should display response time with units", () => {
            render(<SiteCardMetrics status="up" uptime={98.5} responseTime={250} checkCount={144} />);

            expect(screen.getByTestId("metric-label-response")).toHaveTextContent("Response");
            expect(screen.getByTestId("metric-value-response")).toHaveTextContent("250 ms");
        });

        it("should display check count", () => {
            render(<SiteCardMetrics status="up" uptime={98.5} responseTime={250} checkCount={144} />);

            expect(screen.getByTestId("metric-label-checks")).toHaveTextContent("Checks");
            expect(screen.getByTestId("metric-value-checks")).toHaveTextContent("144");
        });
    });

    describe("Edge Cases", () => {
        it("should handle undefined response time", () => {
            render(<SiteCardMetrics status="up" uptime={98.5} responseTime={undefined} checkCount={144} />);

            expect(screen.getByTestId("metric-value-response")).toHaveTextContent("-");
        });

        it("should handle zero response time", () => {
            render(<SiteCardMetrics status="down" uptime={95.0} responseTime={0} checkCount={100} />);

            expect(screen.getByTestId("metric-value-response")).toHaveTextContent("0 ms");
        });

        it("should handle undefined status", () => {
            render(
                <SiteCardMetrics
                    status={undefined as unknown as string}
                    uptime={98.5}
                    responseTime={250}
                    checkCount={144}
                />
            );

            expect(screen.getByTestId("metric-value-status")).toHaveTextContent("UNKNOWN");
        });

        it("should handle empty status", () => {
            render(<SiteCardMetrics status="" uptime={98.5} responseTime={250} checkCount={144} />);

            expect(screen.getByTestId("metric-value-status")).toHaveTextContent("UNKNOWN");
        });

        it("should handle zero uptime", () => {
            render(<SiteCardMetrics status="down" uptime={0} responseTime={undefined} checkCount={50} />);

            expect(screen.getByTestId("metric-value-uptime")).toHaveTextContent("0%");
        });

        it("should handle zero check count", () => {
            render(<SiteCardMetrics status="pending" uptime={0} responseTime={undefined} checkCount={0} />);

            expect(screen.getByTestId("metric-value-checks")).toHaveTextContent("0");
        });
    });

    describe("Status Formatting", () => {
        it("should handle different status values", () => {
            const statuses = ["up", "down", "pending"];

            statuses.forEach((status) => {
                const { rerender } = render(
                    <SiteCardMetrics status={status} uptime={98.5} responseTime={250} checkCount={144} />
                );

                expect(screen.getByTestId("metric-value-status")).toHaveTextContent(status.toUpperCase());

                rerender(<div />); // Clear render
            });
        });

        it("should handle mixed case status", () => {
            render(<SiteCardMetrics status="DoWn" uptime={85.2} responseTime={500} checkCount={88} />);

            expect(screen.getByTestId("metric-value-status")).toHaveTextContent("DOWN");
        });
    });

    describe("Numeric Edge Cases", () => {
        it("should handle decimal uptime values", () => {
            render(<SiteCardMetrics status="up" uptime={99.999} responseTime={250} checkCount={144} />);

            expect(screen.getByTestId("metric-value-uptime")).toHaveTextContent("99.999%");
        });

        it("should handle large response times", () => {
            render(<SiteCardMetrics status="up" uptime={98.5} responseTime={5000} checkCount={144} />);

            expect(screen.getByTestId("metric-value-response")).toHaveTextContent("5000 ms");
        });

        it("should handle large check counts", () => {
            render(<SiteCardMetrics status="up" uptime={98.5} responseTime={250} checkCount={999999} />);

            expect(screen.getByTestId("metric-value-checks")).toHaveTextContent("999999");
        });
    });

    describe("Component Memoization", () => {
        it("should not re-render when props are the same", () => {
            const { rerender } = render(
                <SiteCardMetrics status="up" uptime={98.5} responseTime={250} checkCount={144} />
            );

            const firstRender = screen.getByTestId("metric-card-status");

            // Re-render with same props
            rerender(<SiteCardMetrics status="up" uptime={98.5} responseTime={250} checkCount={144} />);

            // Should be the same element reference due to memoization
            expect(screen.getByTestId("metric-card-status")).toBe(firstRender);
        });

        it("should re-render when status changes", () => {
            const { rerender } = render(
                <SiteCardMetrics status="up" uptime={98.5} responseTime={250} checkCount={144} />
            );

            expect(screen.getByTestId("metric-value-status")).toHaveTextContent("UP");

            rerender(<SiteCardMetrics status="down" uptime={98.5} responseTime={250} checkCount={144} />);

            expect(screen.getByTestId("metric-value-status")).toHaveTextContent("DOWN");
        });

        it("should re-render when uptime changes", () => {
            const { rerender } = render(
                <SiteCardMetrics status="up" uptime={98.5} responseTime={250} checkCount={144} />
            );

            expect(screen.getByTestId("metric-value-uptime")).toHaveTextContent("98.5%");

            rerender(<SiteCardMetrics status="up" uptime={97.2} responseTime={250} checkCount={144} />);

            expect(screen.getByTestId("metric-value-uptime")).toHaveTextContent("97.2%");
        });

        it("should re-render when response time changes", () => {
            const { rerender } = render(
                <SiteCardMetrics status="up" uptime={98.5} responseTime={250} checkCount={144} />
            );

            expect(screen.getByTestId("metric-value-response")).toHaveTextContent("250 ms");

            rerender(<SiteCardMetrics status="up" uptime={98.5} responseTime={300} checkCount={144} />);

            expect(screen.getByTestId("metric-value-response")).toHaveTextContent("300 ms");
        });

        it("should re-render when check count changes", () => {
            const { rerender } = render(
                <SiteCardMetrics status="up" uptime={98.5} responseTime={250} checkCount={144} />
            );

            expect(screen.getByTestId("metric-value-checks")).toHaveTextContent("144");

            rerender(<SiteCardMetrics status="up" uptime={98.5} responseTime={250} checkCount={145} />);

            expect(screen.getByTestId("metric-value-checks")).toHaveTextContent("145");
        });
    });
});
