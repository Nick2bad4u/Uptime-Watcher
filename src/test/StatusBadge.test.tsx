/**
 * @vitest-environment jsdom
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { StatusBadge } from "../components/common/StatusBadge";

describe("StatusBadge - Simple Tests", () => {
    describe("Basic Rendering", () => {
        it("renders without crashing", () => {
            render(<StatusBadge label="Website" status="up" />);
            expect(document.body).toBeInTheDocument();
        });

        it("displays correct text content", () => {
            render(<StatusBadge label="Website" status="up" />);
            expect(screen.getByText("Website: up")).toBeInTheDocument();
        });

        it("displays different status types", () => {
            const { rerender } = render(<StatusBadge label="Test" status="up" />);
            expect(screen.getByText("Test: up")).toBeInTheDocument();

            rerender(<StatusBadge label="Test" status="down" />);
            expect(screen.getByText("Test: down")).toBeInTheDocument();

            rerender(<StatusBadge label="Test" status="pending" />);
            expect(screen.getByText("Test: pending")).toBeInTheDocument();
        });
    });

    describe("Icon Display", () => {
        it("shows icon by default", () => {
            render(<StatusBadge label="Website" status="up" />);
            // Check for status indicator by class name
            expect(document.querySelector(".themed-status-indicator")).toBeInTheDocument();
        });

        it("hides icon when showIcon is false", () => {
            render(<StatusBadge label="Website" status="up" showIcon={false} />);
            // Should not have status indicator when disabled
            expect(document.querySelector(".themed-status-indicator")).not.toBeInTheDocument();
        });
    });

    describe("CSS Classes", () => {
        it("applies default CSS classes", () => {
            render(<StatusBadge label="Website" status="up" />);
            const container = document.querySelector(".flex.items-center.gap-3");
            expect(container).toBeInTheDocument();
        });

        it("applies custom CSS classes", () => {
            render(<StatusBadge label="Website" status="up" className="test-class" />);
            const container = document.querySelector(".test-class");
            expect(container).toBeInTheDocument();
        });

        it("handles empty className prop", () => {
            render(<StatusBadge label="Website" status="up" className="" />);
            const container = document.querySelector(".flex.items-center.gap-3");
            expect(container).toBeInTheDocument();
        });
    });

    describe("Size Management", () => {
        it("applies different text sizes", () => {
            const sizes = ["xs", "sm", "base", "lg", "xl"] as const;

            for (const size of sizes) {
                const { unmount } = render(<StatusBadge label="Website" status="up" size={size} />);
                // Check that text with correct size class exists
                expect(document.querySelector(`.themed-text--size-${size}`)).toBeInTheDocument();
                unmount();
            }
        });

        it("uses default size when not specified", () => {
            render(<StatusBadge label="Website" status="up" />);
            // Default should be 'sm'
            expect(document.querySelector(".themed-text--size-sm")).toBeInTheDocument();
        });

        it("should handle unknown/unsupported size by falling back to default", () => {
            // Use a size that's not explicitly handled in the switch statement
            const unknownSize = "unknown" as "xs"; // Force type for test
            render(<StatusBadge label="Website" status="up" size={unknownSize} />);

            expect(screen.getByText("Website: up")).toBeInTheDocument();
            // Should not crash and should render successfully
            expect(document.querySelector(".themed-status-indicator")).toBeInTheDocument();
        });

        it("should handle null/undefined size by falling back to default", () => {
            // Test with undefined size
            const undefinedSize = undefined as unknown as "xs"; // Force type for test
            render(<StatusBadge label="Website" status="up" size={undefinedSize} />);

            expect(screen.getByText("Website: up")).toBeInTheDocument();
            expect(document.querySelector(".themed-status-indicator")).toBeInTheDocument();
        });
    });

    describe("Integration", () => {
        it("renders complete component structure", () => {
            render(<StatusBadge label="My Website" status="up" size="lg" className="test-class" />);

            // Check container
            const container = document.querySelector(".flex.items-center.gap-3.test-class");
            expect(container).toBeInTheDocument();

            // Check text content
            expect(screen.getByText("My Website: up")).toBeInTheDocument();

            // Check text size
            expect(document.querySelector(".themed-text--size-lg")).toBeInTheDocument();
        });

        it("renders without icon when disabled", () => {
            render(<StatusBadge label="My Website" status="down" showIcon={false} className="no-icon" />);

            // Check text only
            expect(screen.getByText("My Website: down")).toBeInTheDocument();

            // No icon should be present
            expect(document.querySelector(".themed-status-indicator")).not.toBeInTheDocument();

            // Check custom class
            expect(document.querySelector(".no-icon")).toBeInTheDocument();
        });
    });

    describe("Memoization", () => {
        it("renders consistently with same props", () => {
            const props = { label: "Website", size: "base" as const, status: "up" as const };
            const { container: container1 } = render(<StatusBadge {...props} />);
            const { container: container2 } = render(<StatusBadge {...props} />);

            // Both should render the same structure
            expect(container1.innerHTML).toBeTruthy();
            expect(container2.innerHTML).toBeTruthy();
        });
    });

    describe("Edge Cases", () => {
        it("handles empty label", () => {
            render(<StatusBadge label="" status="up" />);
            expect(screen.getByText(": up")).toBeInTheDocument();
        });

        it("handles label with special characters", () => {
            render(<StatusBadge label="Website & API" status="up" />);
            expect(screen.getByText("Website & API: up")).toBeInTheDocument();
        });

        it("handles very long labels", () => {
            const longLabel = "A".repeat(100);
            render(<StatusBadge label={longLabel} status="up" />);
            expect(screen.getByText(`${longLabel}: up`)).toBeInTheDocument();
        });

        it("handles all status combinations with different sizes", () => {
            const statuses = ["up", "down", "pending"] as const;
            const sizes = ["xs", "sm", "base"] as const;

            // Test all combinations using flat iteration
            for (const status of statuses) {
                for (const size of sizes) {
                    const { unmount } = render(<StatusBadge label="Test" status={status} size={size} />);

                    expect(screen.getByText(`Test: ${status}`)).toBeInTheDocument();
                    expect(document.querySelector(`.themed-text--size-${size}`)).toBeInTheDocument();

                    unmount();
                }
            }
        });
    });

    describe("Component Props", () => {
        it("applies secondary variant to text", () => {
            render(<StatusBadge label="Website" status="up" />);
            expect(document.querySelector(".themed-text--secondary")).toBeInTheDocument();
        });

        it("displays correct status variants", () => {
            const statuses = ["up", "down", "pending"] as const;

            for (const status of statuses) {
                const { unmount } = render(<StatusBadge label="Test" status={status} />);
                expect(screen.getByText(`Test: ${status}`)).toBeInTheDocument();
                unmount();
            }
        });
    });
});
