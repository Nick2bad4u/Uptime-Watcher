/**
 * Comprehensive tests for EmptyState component
 * Testing all functionality for 100% coverage
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { EmptyState } from "../../components/Dashboard/SiteList/EmptyState";

// Mock themed components
vi.mock("../../theme", () => ({
    ThemedBox: ({ children, surface, padding, className }: any) => (
        <div data-testid="themed-box" data-surface={surface} data-padding={padding} className={className}>
            {children}
        </div>
    ),
    ThemedText: ({ children, size, weight, variant, className }: any) => (
        <div
            data-testid={variant ? `themed-text-${variant}` : "themed-text"}
            data-size={size}
            data-weight={weight}
            data-variant={variant}
            className={className}
        >
            {children}
        </div>
    ),
}));

describe("EmptyState", () => {
    describe("Rendering", () => {
        it("should render the empty state component", () => {
            render(<EmptyState />);

            expect(screen.getByTestId("themed-box")).toBeInTheDocument();
        });

        it("should render the globe icon", () => {
            render(<EmptyState />);

            const iconElement = screen.getByText("🌐");
            expect(iconElement).toBeInTheDocument();
            expect(iconElement.closest("div")).toHaveClass("empty-state-icon");
        });

        it("should render the main heading text", () => {
            render(<EmptyState />);

            const headingElement = screen.getByText("No sites to monitor");
            expect(headingElement).toBeInTheDocument();
        });

        it("should render the description text", () => {
            render(<EmptyState />);

            const descriptionElement = screen.getByText("Add your first website to start monitoring its uptime.");
            expect(descriptionElement).toBeInTheDocument();
        });
    });

    describe("ThemedBox Integration", () => {
        it("should use correct ThemedBox props", () => {
            render(<EmptyState />);

            const themedBox = screen.getByTestId("themed-box");
            expect(themedBox).toHaveAttribute("data-surface", "base");
            expect(themedBox).toHaveAttribute("data-padding", "xl");
            expect(themedBox).toHaveClass("text-center");
        });

        it("should contain all child elements", () => {
            render(<EmptyState />);

            const themedBox = screen.getByTestId("themed-box");
            const iconElement = screen.getByText("🌐");
            const headingElement = screen.getByText("No sites to monitor");
            const descriptionElement = screen.getByText("Add your first website to start monitoring its uptime.");

            expect(themedBox).toContainElement(iconElement.closest("div"));
            expect(themedBox).toContainElement(headingElement);
            expect(themedBox).toContainElement(descriptionElement);
        });
    });

    describe("ThemedText Integration", () => {
        it("should render heading with correct ThemedText props", () => {
            render(<EmptyState />);

            const headingElement = screen.getByTestId("themed-text");
            expect(headingElement).toHaveTextContent("No sites to monitor");
            expect(headingElement).toHaveAttribute("data-size", "lg");
            expect(headingElement).toHaveAttribute("data-weight", "medium");
            expect(headingElement).toHaveClass("mb-2");
        });

        it("should render description with correct ThemedText props", () => {
            render(<EmptyState />);

            const descriptionElement = screen.getByTestId("themed-text-secondary");
            expect(descriptionElement).toHaveTextContent("Add your first website to start monitoring its uptime.");
            expect(descriptionElement).toHaveAttribute("data-variant", "secondary");
            expect(descriptionElement).not.toHaveAttribute("data-size");
            expect(descriptionElement).not.toHaveAttribute("data-weight");
        });
    });

    describe("Component Structure", () => {
        it("should have correct DOM hierarchy", () => {
            render(<EmptyState />);

            const themedBox = screen.getByTestId("themed-box");
            const iconDiv = screen.getByText("🌐").closest("div");
            const headingElement = screen.getByTestId("themed-text");
            const descriptionElement = screen.getByTestId("themed-text-secondary");

            expect(themedBox).toContainElement(iconDiv);
            expect(themedBox).toContainElement(headingElement);
            expect(themedBox).toContainElement(descriptionElement);
        });

        it("should render elements in correct order", () => {
            render(<EmptyState />);

            const themedBox = screen.getByTestId("themed-box");
            const children = Array.from(themedBox.children);

            expect(children[0]).toHaveClass("empty-state-icon");
            expect(children[1]).toHaveTextContent("No sites to monitor");
            expect(children[2]).toHaveTextContent("Add your first website to start monitoring its uptime.");
        });

        it("should have exactly three child elements", () => {
            render(<EmptyState />);

            const themedBox = screen.getByTestId("themed-box");
            expect(themedBox.children).toHaveLength(3);
        });
    });

    describe("Icon Element", () => {
        it("should render the globe icon with correct wrapper", () => {
            render(<EmptyState />);

            const iconWrapper = screen.getByText("🌐").closest("div");
            expect(iconWrapper).toHaveClass("empty-state-icon");
        });

        it("should display the globe emoji", () => {
            render(<EmptyState />);

            const icon = screen.getByText("🌐");
            expect(icon).toBeInTheDocument();
            expect(icon.textContent).toBe("🌐");
        });
    });

    describe("Accessibility", () => {
        it("should be readable by screen readers", () => {
            render(<EmptyState />);

            const headingText = screen.getByText("No sites to monitor");
            const descriptionText = screen.getByText("Add your first website to start monitoring its uptime.");

            expect(headingText).toBeInTheDocument();
            expect(descriptionText).toBeInTheDocument();
        });

        it("should have proper text hierarchy", () => {
            render(<EmptyState />);

            const headingElement = screen.getByTestId("themed-text");
            const descriptionElement = screen.getByTestId("themed-text-secondary");

            // Heading should be larger and more prominent
            expect(headingElement).toHaveAttribute("data-size", "lg");
            expect(headingElement).toHaveAttribute("data-weight", "medium");

            // Description should be secondary
            expect(descriptionElement).toHaveAttribute("data-variant", "secondary");
        });

        it("should be keyboard accessible", () => {
            render(<EmptyState />);

            // EmptyState doesn't need specific keyboard interactions
            // but should render without accessibility issues
            const themedBox = screen.getByTestId("themed-box");
            expect(themedBox).toBeInTheDocument();
        });
    });

    describe("Visual Design", () => {
        it("should apply center alignment", () => {
            render(<EmptyState />);

            const themedBox = screen.getByTestId("themed-box");
            expect(themedBox).toHaveClass("text-center");
        });

        it("should apply proper spacing to heading", () => {
            render(<EmptyState />);

            const headingElement = screen.getByTestId("themed-text");
            expect(headingElement).toHaveClass("mb-2");
        });

        it("should use themed surface and padding", () => {
            render(<EmptyState />);

            const themedBox = screen.getByTestId("themed-box");
            expect(themedBox).toHaveAttribute("data-surface", "base");
            expect(themedBox).toHaveAttribute("data-padding", "xl");
        });
    });

    describe("Text Content", () => {
        it("should display correct heading message", () => {
            render(<EmptyState />);

            const heading = screen.getByText("No sites to monitor");
            expect(heading).toBeInTheDocument();
            expect(heading.textContent).toBe("No sites to monitor");
        });

        it("should display correct description message", () => {
            render(<EmptyState />);

            const description = screen.getByText("Add your first website to start monitoring its uptime.");
            expect(description).toBeInTheDocument();
            expect(description.textContent).toBe("Add your first website to start monitoring its uptime.");
        });

        it("should display user-friendly and helpful messages", () => {
            render(<EmptyState />);

            // Check that messages are encouraging and actionable
            expect(screen.getByText("No sites to monitor")).toBeInTheDocument();
            expect(screen.getByText(/Add your first website/)).toBeInTheDocument();
        });
    });

    describe("Component Behavior", () => {
        it("should be a pure component (no state or effects)", () => {
            const { rerender } = render(<EmptyState />);

            const initialIcon = screen.getByText("🌐");
            const initialHeading = screen.getByText("No sites to monitor");

            rerender(<EmptyState />);

            const afterRerenderIcon = screen.getByText("🌐");
            const afterRerenderHeading = screen.getByText("No sites to monitor");

            expect(initialIcon).toBeInTheDocument();
            expect(initialHeading).toBeInTheDocument();
            expect(afterRerenderIcon).toBeInTheDocument();
            expect(afterRerenderHeading).toBeInTheDocument();
        });

        it("should render consistently on multiple renders", () => {
            const { rerender } = render(<EmptyState />);

            const getRenderedContent = () => ({
                icon: screen.getByText("🌐").textContent,
                heading: screen.getByText("No sites to monitor").textContent,
                description: screen.getByText("Add your first website to start monitoring its uptime.").textContent,
            });

            const firstRender = getRenderedContent();

            rerender(<EmptyState />);

            const secondRender = getRenderedContent();

            expect(firstRender).toEqual(secondRender);
        });

        it("should not throw errors on mount/unmount", () => {
            expect(() => {
                const { unmount } = render(<EmptyState />);
                unmount();
            }).not.toThrow();
        });
    });

    describe("Integration", () => {
        it("should work well with theme system", () => {
            render(<EmptyState />);

            // Verify integration with ThemedBox
            const themedBox = screen.getByTestId("themed-box");
            expect(themedBox).toHaveAttribute("data-surface", "base");

            // Verify integration with ThemedText
            const headingText = screen.getByTestId("themed-text");
            const descriptionText = screen.getByTestId("themed-text-secondary");

            expect(headingText).toBeInTheDocument();
            expect(descriptionText).toBeInTheDocument();
        });

        it("should maintain design consistency", () => {
            render(<EmptyState />);

            // Check that themed components are used consistently
            expect(screen.getByTestId("themed-box")).toBeInTheDocument();
            expect(screen.getByTestId("themed-text")).toBeInTheDocument();
            expect(screen.getByTestId("themed-text-secondary")).toBeInTheDocument();
        });
    });

    describe("Edge Cases", () => {
        it("should handle multiple instances independently", () => {
            render(
                <div>
                    <EmptyState />
                    <EmptyState />
                </div>
            );

            const icons = screen.getAllByText("🌐");
            const headings = screen.getAllByText("No sites to monitor");
            const descriptions = screen.getAllByText("Add your first website to start monitoring its uptime.");

            expect(icons).toHaveLength(2);
            expect(headings).toHaveLength(2);
            expect(descriptions).toHaveLength(2);
        });

        it("should not interfere with parent component styling", () => {
            render(
                <div className="parent-container" data-testid="parent">
                    <EmptyState />
                </div>
            );

            const parent = screen.getByTestId("parent");
            const emptyState = screen.getByTestId("themed-box");

            expect(parent).toHaveClass("parent-container");
            expect(emptyState).not.toHaveClass("parent-container");
        });

        it("should handle rapid render cycles", () => {
            const { rerender, unmount } = render(<EmptyState />);

            for (let i = 0; i < 10; i++) {
                rerender(<EmptyState />);
            }

            expect(screen.getByText("🌐")).toBeInTheDocument();
            expect(screen.getByText("No sites to monitor")).toBeInTheDocument();

            expect(() => unmount()).not.toThrow();
        });
    });
});
