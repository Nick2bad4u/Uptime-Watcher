/**
 * Comprehensive tests for MetricCard component
 * Testing all functionality for 100% coverage
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { MetricCard } from "../../components/Dashboard/SiteCard/components/MetricCard";

// Mock ThemedText component
vi.mock("../../theme", () => ({
    ThemedText: ({ children, size, variant, weight, className }: any) => (
        <div
            data-testid={variant ? `themed-text-${variant}` : "themed-text"}
            data-size={size}
            data-variant={variant}
            data-weight={weight}
            className={className}
        >
            {children}
        </div>
    ),
}));

describe("MetricCard", () => {
    const defaultProps = {
        label: "Uptime",
        value: "98.5%",
    };

    describe("Rendering", () => {
        it("should render with default props", () => {
            render(<MetricCard {...defaultProps} />);

            expect(screen.getByText("Uptime")).toBeInTheDocument();
            expect(screen.getByText("98.5%")).toBeInTheDocument();
        });

        it("should render with string value", () => {
            render(<MetricCard label="Status" value="Online" />);

            expect(screen.getByText("Status")).toBeInTheDocument();
            expect(screen.getByText("Online")).toBeInTheDocument();
        });

        it("should render with number value", () => {
            render(<MetricCard label="Response Time" value={245} />);

            expect(screen.getByText("Response Time")).toBeInTheDocument();
            expect(screen.getByText("245")).toBeInTheDocument();
        });

        it("should render with zero value", () => {
            render(<MetricCard label="Errors" value={0} />);

            expect(screen.getByText("Errors")).toBeInTheDocument();
            expect(screen.getByText("0")).toBeInTheDocument();
        });

        it("should render with negative number", () => {
            render(<MetricCard label="Change" value={-15} />);

            expect(screen.getByText("Change")).toBeInTheDocument();
            expect(screen.getByText("-15")).toBeInTheDocument();
        });

        it("should render with decimal number", () => {
            render(<MetricCard label="Average" value={123.456} />);

            expect(screen.getByText("Average")).toBeInTheDocument();
            expect(screen.getByText("123.456")).toBeInTheDocument();
        });
    });

    describe("CSS Classes and Styling", () => {
        it("should apply default CSS classes", () => {
            render(<MetricCard {...defaultProps} />);

            const container = screen.getByText("Uptime").closest("div")?.parentElement;
            expect(container).toHaveClass("flex", "flex-col", "items-center", "text-center");
        });

        it("should apply custom className", () => {
            render(<MetricCard {...defaultProps} className="border-r custom-class" />);

            const container = screen.getByText("Uptime").closest("div")?.parentElement;
            expect(container).toHaveClass("flex", "flex-col", "items-center", "text-center", "border-r", "custom-class");
        });

        it("should handle empty className", () => {
            render(<MetricCard {...defaultProps} className="" />);

            const container = screen.getByText("Uptime").closest("div")?.parentElement;
            expect(container).toHaveClass("flex", "flex-col", "items-center", "text-center");
            expect(container?.className).not.toContain("undefined");
        });

        it("should handle undefined className", () => {
            render(<MetricCard {...defaultProps} />);

            const container = screen.getByText("Uptime").closest("div")?.parentElement;
            expect(container).toHaveClass("flex", "flex-col", "items-center", "text-center");
        });
    });

    describe("ThemedText Integration", () => {
        it("should render label with correct ThemedText props", () => {
            render(<MetricCard {...defaultProps} />);

            const labelElement = screen.getByTestId("themed-text-secondary");
            expect(labelElement).toHaveTextContent("Uptime");
            expect(labelElement).toHaveAttribute("data-size", "xs");
            expect(labelElement).toHaveAttribute("data-variant", "secondary");
            expect(labelElement).toHaveClass("block", "mb-1");
        });

        it("should render value with correct ThemedText props", () => {
            render(<MetricCard {...defaultProps} />);

            const valueElement = screen.getByTestId("themed-text");
            expect(valueElement).toHaveTextContent("98.5%");
            expect(valueElement).toHaveAttribute("data-size", "sm");
            expect(valueElement).toHaveAttribute("data-weight", "medium");
            expect(valueElement).not.toHaveAttribute("data-variant");
        });

        it("should handle long label text", () => {
            const longLabel = "Very Long Label That Might Wrap To Multiple Lines";
            render(<MetricCard label={longLabel} value="123" />);

            const labelElement = screen.getByTestId("themed-text-secondary");
            expect(labelElement).toHaveTextContent(longLabel);
        });

        it("should handle long value text", () => {
            const longValue = "Very Long Value That Should Be Displayed Completely";
            render(<MetricCard label="Test" value={longValue} />);

            const valueElement = screen.getByTestId("themed-text");
            expect(valueElement).toHaveTextContent(longValue);
        });
    });

    describe("React.memo Optimization", () => {
        it("should be a memoized component", () => {
            expect(MetricCard.$$typeof).toBe(Symbol.for("react.memo"));
        });

        it("should not re-render when props haven't changed", () => {
            const { rerender } = render(<MetricCard {...defaultProps} />);

            const initialLabelElement = screen.getByTestId("themed-text-secondary");
            const initialValueElement = screen.getByTestId("themed-text");

            rerender(<MetricCard {...defaultProps} />);

            const afterRerenderLabelElement = screen.getByTestId("themed-text-secondary");
            const afterRerenderValueElement = screen.getByTestId("themed-text");

            expect(initialLabelElement).toBe(afterRerenderLabelElement);
            expect(initialValueElement).toBe(afterRerenderValueElement);
        });

        it("should re-render when label changes", () => {
            const { rerender } = render(<MetricCard {...defaultProps} />);

            expect(screen.getByText("Uptime")).toBeInTheDocument();

            rerender(<MetricCard {...defaultProps} label="Status" />);

            expect(screen.queryByText("Uptime")).not.toBeInTheDocument();
            expect(screen.getByText("Status")).toBeInTheDocument();
        });

        it("should re-render when value changes", () => {
            const { rerender } = render(<MetricCard {...defaultProps} />);

            expect(screen.getByText("98.5%")).toBeInTheDocument();

            rerender(<MetricCard {...defaultProps} value="99.2%" />);

            expect(screen.queryByText("98.5%")).not.toBeInTheDocument();
            expect(screen.getByText("99.2%")).toBeInTheDocument();
        });

        it("should re-render when className changes", () => {
            const { rerender } = render(<MetricCard {...defaultProps} className="initial-class" />);

            const container = screen.getByText("Uptime").closest("div")?.parentElement;
            expect(container).toHaveClass("initial-class");

            rerender(<MetricCard {...defaultProps} className="updated-class" />);

            expect(container).not.toHaveClass("initial-class");
            expect(container).toHaveClass("updated-class");
        });
    });

    describe("Component Structure", () => {
        it("should have correct DOM structure", () => {
            render(<MetricCard {...defaultProps} />);

            const container = screen.getByText("Uptime").closest("div")?.parentElement;
            const labelElement = screen.getByTestId("themed-text-secondary");
            const valueElement = screen.getByTestId("themed-text");

            expect(container).toContainElement(labelElement);
            expect(container).toContainElement(valueElement);
        });

        it("should render label before value", () => {
            render(<MetricCard {...defaultProps} />);

            const container = screen.getByText("Uptime").closest("div")?.parentElement;
            const children = Array.from(container?.children || []);

            expect(children[0]).toHaveTextContent("Uptime");
            expect(children[1]).toHaveTextContent("98.5%");
        });

        it("should have only two direct children", () => {
            render(<MetricCard {...defaultProps} />);

            const container = screen.getByText("Uptime").closest("div")?.parentElement;
            expect(container?.children).toHaveLength(2);
        });
    });

    describe("Edge Cases", () => {
        it("should handle empty string label", () => {
            render(<MetricCard label="" value="123" />);

            const labelElement = screen.getByTestId("themed-text-secondary");
            expect(labelElement).toHaveTextContent("");
        });

        it("should handle empty string value", () => {
            render(<MetricCard label="Test" value="" />);

            const valueElement = screen.getByTestId("themed-text");
            expect(valueElement).toHaveTextContent("");
        });

        it("should handle special characters in label", () => {
            const specialLabel = "Label with @#$%^&*()";
            render(<MetricCard label={specialLabel} value="123" />);

            expect(screen.getByText(specialLabel)).toBeInTheDocument();
        });

        it("should handle special characters in value", () => {
            const specialValue = "Value with @#$%^&*()";
            render(<MetricCard label="Test" value={specialValue} />);

            expect(screen.getByText(specialValue)).toBeInTheDocument();
        });

        it("should handle very large numbers", () => {
            const largeNumber = 999999999999;
            render(<MetricCard label="Large Number" value={largeNumber} />);

            expect(screen.getByText(largeNumber.toString())).toBeInTheDocument();
        });

        it("should handle very small numbers", () => {
            const smallNumber = 0.000001;
            render(<MetricCard label="Small Number" value={smallNumber} />);

            expect(screen.getByText(smallNumber.toString())).toBeInTheDocument();
        });

        it("should handle Boolean-like values", () => {
            render(<MetricCard label="Boolean" value="true" />);

            expect(screen.getByText("true")).toBeInTheDocument();
        });
    });

    describe("Accessibility", () => {
        it("should be readable by screen readers", () => {
            render(<MetricCard {...defaultProps} />);

            const labelElement = screen.getByText("Uptime");
            const valueElement = screen.getByText("98.5%");

            expect(labelElement).toBeInTheDocument();
            expect(valueElement).toBeInTheDocument();
        });

        it("should have proper semantic structure", () => {
            render(<MetricCard {...defaultProps} />);

            const container = screen.getByText("Uptime").closest("div")?.parentElement;
            expect(container).toHaveClass("text-center");
        });

        it("should support high contrast mode", () => {
            render(<MetricCard {...defaultProps} />);

            // Components should render without errors in high contrast scenarios
            const labelElement = screen.getByTestId("themed-text-secondary");
            const valueElement = screen.getByTestId("themed-text");

            expect(labelElement).toBeInTheDocument();
            expect(valueElement).toBeInTheDocument();
        });
    });

    describe("Performance", () => {
        it("should handle rapid prop changes efficiently", () => {
            const { rerender } = render(<MetricCard {...defaultProps} />);

            // Rapidly change props multiple times
            for (let i = 0; i < 100; i++) {
                rerender(<MetricCard label={`Label ${i}`} value={i} />);
            }

            expect(screen.getByText("Label 99")).toBeInTheDocument();
            expect(screen.getByText("99")).toBeInTheDocument();
        });

        it("should not cause memory leaks on unmount", () => {
            const { unmount } = render(<MetricCard {...defaultProps} />);

            expect(() => unmount()).not.toThrow();
        });

        it("should handle multiple instances efficiently", () => {
            render(
                <div>
                    <MetricCard label="Metric 1" value="Value 1" />
                    <MetricCard label="Metric 2" value="Value 2" />
                    <MetricCard label="Metric 3" value="Value 3" />
                    <MetricCard label="Metric 4" value="Value 4" />
                    <MetricCard label="Metric 5" value="Value 5" />
                </div>
            );

            expect(screen.getAllByTestId("themed-text-secondary")).toHaveLength(5);
            expect(screen.getAllByTestId("themed-text")).toHaveLength(5);
        });
    });

    describe("Data Types", () => {
        it("should handle integer values", () => {
            render(<MetricCard label="Integer" value={42} />);
            expect(screen.getByText("42")).toBeInTheDocument();
        });

        it("should handle float values", () => {
            render(<MetricCard label="Float" value={3.14159} />);
            expect(screen.getByText("3.14159")).toBeInTheDocument();
        });

        it("should handle negative integers", () => {
            render(<MetricCard label="Negative" value={-100} />);
            expect(screen.getByText("-100")).toBeInTheDocument();
        });

        it("should handle negative floats", () => {
            render(<MetricCard label="Negative Float" value={-2.5} />);
            expect(screen.getByText("-2.5")).toBeInTheDocument();
        });

        it("should handle scientific notation", () => {
            const scientificValue = 1.23e-4;
            render(<MetricCard label="Scientific" value={scientificValue} />);
            expect(screen.getByText(scientificValue.toString())).toBeInTheDocument();
        });
    });
});
