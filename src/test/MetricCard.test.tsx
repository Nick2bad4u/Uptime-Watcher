/**
 * Tests for MetricCard component.
 * Comprehensive tests to achieve 100% coverage.
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { MetricCard } from "../components/Dashboard/SiteCard/components/MetricCard";

// Mock themed components
vi.mock("../theme/components", () => ({
    ThemedText: ({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) => 
        React.createElement("span", { "data-testid": "themed-text", ...props }, children),
}));

describe("MetricCard", () => {
    describe("Basic Rendering", () => {
        it("should render with string value", () => {
            render(<MetricCard label="Uptime" value="98.5%" />);
            
            expect(screen.getByText("Uptime")).toBeInTheDocument();
            expect(screen.getByText("98.5%")).toBeInTheDocument();
        });

        it("should render with number value", () => {
            render(<MetricCard label="Response Time" value={150} />);
            
            expect(screen.getByText("Response Time")).toBeInTheDocument();
            expect(screen.getByText("150")).toBeInTheDocument();
        });

        it("should render with zero value", () => {
            render(<MetricCard label="Errors" value={0} />);
            
            expect(screen.getByText("Errors")).toBeInTheDocument();
            expect(screen.getByText("0")).toBeInTheDocument();
        });
    });

    describe("CSS Classes", () => {
        it("should apply default classes when no className provided", () => {
            const { container } = render(<MetricCard label="Test" value="test" />);
            const metricDiv = container.firstChild as HTMLElement;
            
            expect(metricDiv).toHaveClass("flex", "flex-col", "items-center", "text-center");
        });

        it("should apply custom className", () => {
            const { container } = render(<MetricCard label="Test" value="test" className="border-r custom-class" />);
            const metricDiv = container.firstChild as HTMLElement;
            
            expect(metricDiv).toHaveClass("flex", "flex-col", "items-center", "text-center", "border-r", "custom-class");
        });

        it("should handle empty className", () => {
            const { container } = render(<MetricCard label="Test" value="test" className="" />);
            const metricDiv = container.firstChild as HTMLElement;
            
            expect(metricDiv).toHaveClass("flex", "flex-col", "items-center", "text-center");
        });
    });

    describe("Text Components", () => {
        it("should render label with correct props", () => {
            render(<MetricCard label="CPU Usage" value="45%" />);
            
            const themedTexts = screen.getAllByTestId("themed-text");
            const labelElement = themedTexts[0];
            
            expect(labelElement).toHaveAttribute("data-testid", "themed-text");
            expect(labelElement).toHaveClass("block", "mb-1");
            expect(labelElement).toHaveTextContent("CPU Usage");
        });

        it("should render value with correct props", () => {
            render(<MetricCard label="Memory" value="2.1GB" />);
            
            const themedTexts = screen.getAllByTestId("themed-text");
            const valueElement = themedTexts[1];
            
            expect(valueElement).toHaveAttribute("data-testid", "themed-text");
            expect(valueElement).toHaveTextContent("2.1GB");
        });
    });

    describe("Edge Cases", () => {
        it("should handle empty string value", () => {
            render(<MetricCard label="Status" value="" />);
            
            expect(screen.getByText("Status")).toBeInTheDocument();
            // Empty value should still render the element
            const themedTexts = screen.getAllByTestId("themed-text");
            expect(themedTexts[1]).toBeInTheDocument();
        });

        it("should handle very long label", () => {
            const longLabel = "This is a very long label that might wrap to multiple lines";
            render(<MetricCard label={longLabel} value="test" />);
            
            expect(screen.getByText(longLabel)).toBeInTheDocument();
        });

        it("should handle very long value", () => {
            const longValue = "This is a very long value that might affect layout";
            render(<MetricCard label="Long Value Test" value={longValue} />);
            
            expect(screen.getByText(longValue)).toBeInTheDocument();
        });

        it("should handle negative numbers", () => {
            render(<MetricCard label="Temperature" value={-5} />);
            
            expect(screen.getByText("Temperature")).toBeInTheDocument();
            expect(screen.getByText("-5")).toBeInTheDocument();
        });

        it("should handle decimal numbers", () => {
            render(<MetricCard label="Average" value={98.75} />);
            
            expect(screen.getByText("Average")).toBeInTheDocument();
            expect(screen.getByText("98.75")).toBeInTheDocument();
        });
    });

    describe("Component Structure", () => {
        it("should have correct HTML structure", () => {
            const { container } = render(<MetricCard label="Test Label" value="Test Value" />);
            
            // Should have a div container
            const wrapper = container.firstChild as HTMLElement;
            expect(wrapper.tagName).toBe("DIV");
            
            // Should have two ThemedText components
            const themedTexts = screen.getAllByTestId("themed-text");
            expect(themedTexts).toHaveLength(2);
        });
    });

    describe("Memory Optimization", () => {
        it("should be wrapped with React.memo", () => {
            // This test verifies the component is wrapped with React.memo
            // MetricCard should have been memoized for performance
            expect(typeof MetricCard).toBe("object");
        });
    });
});
